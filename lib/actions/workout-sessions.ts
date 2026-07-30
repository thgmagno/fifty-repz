'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import { privateRoutes } from '@/lib/config'
import { countLevelCompletions } from '@/lib/workout-programs'

export interface LogSetFormState {
  success?: boolean
  loggedAt?: number
  errors?: {
    weightKg?: string[]
    reps?: string[]
    form?: string[]
  }
}

function sessionPath(sessionId: string) {
  return `${privateRoutes.sessions}/${sessionId}`
}

export async function startWorkoutSession(formData: FormData): Promise<void> {
  const { userId } = await verifySession()

  const templateId = formData.get('templateId')
  if (typeof templateId !== 'string' || !templateId) {
    return
  }

  // já existe treino em andamento? retoma em vez de abrir outro
  const inProgress = await prisma.workoutSession.findFirst({
    where: { userId, status: 'IN_PROGRESS' },
    select: { id: true },
  })
  if (inProgress) {
    redirect(sessionPath(inProgress.id))
  }

  // dono do template (custom) ou treino oficial de um programa
  const template = await prisma.workoutTemplate.findFirst({
    where: { id: templateId, OR: [{ ownerId: userId }, { ownerId: null }] },
    select: {
      id: true,
      name: true,
      programLevel: { select: { level: true, programId: true } },
      exercises: {
        orderBy: { position: 'asc' },
        select: {
          exerciseId: true,
          position: true,
          targetSets: true,
          targetReps: true,
          targetRepsMax: true,
          exercise: { select: { name: true } },
        },
      },
    },
  })

  if (!template || template.exercises.length === 0) {
    return
  }

  // treino de programa oficial: nível precisa estar desbloqueado (defesa
  // além da UI, que já esconde o botão de iniciar nos níveis bloqueados)
  if (template.programLevel && template.programLevel.level > 1) {
    const previousLevel = await prisma.workoutProgramLevel.findUnique({
      where: {
        programId_level: {
          programId: template.programLevel.programId,
          level: template.programLevel.level - 1,
        },
      },
      select: { id: true, unlockThreshold: true },
    })

    const completions = previousLevel
      ? await countLevelCompletions(userId, previousLevel.id)
      : 0

    if (!previousLevel || completions < previousLevel.unlockThreshold) {
      return
    }
  }

  // snapshot do template no momento do início
  const session = await prisma.workoutSession.create({
    data: {
      userId,
      templateId: template.id,
      templateName: template.name,
      exercises: {
        create: template.exercises.map((item) => ({
          exerciseId: item.exerciseId,
          exerciseName: item.exercise.name,
          position: item.position,
          targetSets: item.targetSets,
          targetReps: item.targetReps,
          targetRepsMax: item.targetRepsMax,
        })),
      },
    },
    select: { id: true },
  })

  redirect(sessionPath(session.id))
}

const logSetSchema = z.object({
  weightKg: z
    .number()
    .min(0, 'O peso não pode ser negativo.')
    .max(1000, 'Peso máximo: 1000 kg.')
    .nullable(),
  reps: z
    .int('Informe as repetições.')
    .min(1, 'Mínimo de 1 repetição.')
    .max(200, 'Máximo de 200 repetições.'),
})

export async function logSet(
  _prevState: LogSetFormState,
  formData: FormData,
): Promise<LogSetFormState> {
  const { userId } = await verifySession()

  const sessionExerciseId = formData.get('sessionExerciseId')
  if (typeof sessionExerciseId !== 'string' || !sessionExerciseId) {
    return { errors: { form: ['Exercício inválido.'] } }
  }

  // id gerado no client ao registrar (inclusive offline): usado como o
  // próprio id do SessionSet, tornando a sincronização idempotente —
  // reenviar a mesma série (ex.: retry após reconectar) nunca duplica
  const rawLocalId = formData.get('localId')
  const localId =
    typeof rawLocalId === 'string' && rawLocalId ? rawLocalId : undefined

  const rawWeight = String(formData.get('weightKg') ?? '').replace(',', '.')
  const rawReps = String(formData.get('reps') ?? '')

  const parsed = logSetSchema.safeParse({
    weightKg: rawWeight === '' ? null : Number(rawWeight),
    reps: rawReps === '' ? NaN : Number(rawReps),
  })

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  if (localId) {
    const alreadySynced = await prisma.sessionSet.findUnique({
      where: { id: localId },
      select: { id: true },
    })
    if (alreadySynced) {
      return { success: true, loggedAt: Date.now() }
    }
  }

  // ownership + sessão precisa estar em andamento
  const sessionExercise = await prisma.workoutSessionExercise.findFirst({
    where: {
      id: sessionExerciseId,
      session: { userId, status: 'IN_PROGRESS' },
    },
    select: { sessionId: true, sets: { select: { id: true } } },
  })

  if (!sessionExercise) {
    return { errors: { form: ['Sessão inválida ou já finalizada.'] } }
  }

  await prisma.$transaction([
    prisma.sessionSet.create({
      data: {
        ...(localId ? { id: localId } : {}),
        sessionExerciseId,
        setNumber: sessionExercise.sets.length + 1,
        weightKg: parsed.data.weightKg,
        reps: parsed.data.reps,
      },
    }),
    // registrar série desmarca "pulado", se for o caso
    prisma.workoutSessionExercise.update({
      where: { id: sessionExerciseId },
      data: { skipped: false },
    }),
  ])

  revalidatePath(sessionPath(sessionExercise.sessionId))
  return { success: true, loggedAt: Date.now() }
}

export async function deleteSet(formData: FormData): Promise<void> {
  const { userId } = await verifySession()

  const setId = formData.get('setId')
  if (typeof setId !== 'string' || !setId) {
    return
  }

  const set = await prisma.sessionSet.findFirst({
    where: {
      id: setId,
      sessionExercise: { session: { userId, status: 'IN_PROGRESS' } },
    },
    select: {
      sessionExerciseId: true,
      setNumber: true,
      sessionExercise: { select: { sessionId: true } },
    },
  })

  if (!set) {
    return
  }

  await prisma.$transaction([
    prisma.sessionSet.delete({ where: { id: setId } }),
    // renumera as séries seguintes para manter a sequência
    prisma.sessionSet.updateMany({
      where: {
        sessionExerciseId: set.sessionExerciseId,
        setNumber: { gt: set.setNumber },
      },
      data: { setNumber: { decrement: 1 } },
    }),
  ])

  revalidatePath(sessionPath(set.sessionExercise.sessionId))
}

export async function toggleSkipExercise(formData: FormData): Promise<void> {
  const { userId } = await verifySession()

  const sessionExerciseId = formData.get('sessionExerciseId')
  if (typeof sessionExerciseId !== 'string' || !sessionExerciseId) {
    return
  }

  const sessionExercise = await prisma.workoutSessionExercise.findFirst({
    where: {
      id: sessionExerciseId,
      session: { userId, status: 'IN_PROGRESS' },
    },
    select: { sessionId: true, skipped: true },
  })

  if (!sessionExercise) {
    return
  }

  await prisma.workoutSessionExercise.update({
    where: { id: sessionExerciseId },
    data: { skipped: !sessionExercise.skipped },
  })

  revalidatePath(sessionPath(sessionExercise.sessionId))
}

export async function finishSession(formData: FormData): Promise<void> {
  const { userId } = await verifySession()

  const sessionId = formData.get('sessionId')
  if (typeof sessionId !== 'string' || !sessionId) {
    return
  }

  const session = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId, status: 'IN_PROGRESS' },
    select: { startedAt: true },
  })

  if (!session) {
    return
  }

  const completedAt = new Date()
  await prisma.workoutSession.update({
    where: { id: sessionId },
    data: {
      status: 'COMPLETED',
      completedAt,
      durationSeconds: Math.max(
        0,
        Math.round(
          (completedAt.getTime() - session.startedAt.getTime()) / 1000,
        ),
      ),
    },
  })

  revalidatePath(sessionPath(sessionId))
  revalidatePath(privateRoutes.workouts)
}
