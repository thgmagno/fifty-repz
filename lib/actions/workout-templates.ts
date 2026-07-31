'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import { privateRoutes } from '@/lib/config'

export interface WorkoutTemplateFormState {
  errors?: {
    name?: string[]
    planId?: string[]
    items?: string[]
    form?: string[]
  }
}

const itemSchema = z
  .object({
    exerciseId: z.uuid(),
    targetSets: z.int().min(1, 'Mínimo de 1 série.').max(20),
    targetReps: z.int().min(1, 'Mínimo de 1 repetição.').max(100),
    targetRepsMax: z.int().min(1).max(100).nullable(),
  })
  .refine(
    (item) =>
      item.targetRepsMax === null || item.targetRepsMax >= item.targetReps,
    'O máximo de reps precisa ser maior ou igual ao mínimo.',
  )

const templateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'O nome precisa ter pelo menos 2 caracteres.')
    .max(80, 'O nome pode ter no máximo 80 caracteres.'),
  // todo treino pertence a um plano: não existe treino avulso
  planId: z.uuid('Escolha um plano de treino.'),
  items: z
    .array(itemSchema)
    .min(1, 'Adicione pelo menos um exercício ao treino.')
    .max(30, 'Um treino pode ter no máximo 30 exercícios.'),
})

async function parseTemplateForm(userId: string, formData: FormData) {
  let rawItems: unknown
  try {
    rawItems = JSON.parse(String(formData.get('items') ?? '[]'))
  } catch {
    rawItems = []
  }

  const parsed = templateSchema.safeParse({
    name: formData.get('name'),
    planId: formData.get('planId'),
    items: rawItems,
  })

  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error)
    return {
      ok: false as const,
      errors: {
        name: fieldErrors.name,
        planId: fieldErrors.planId,
        items: fieldErrors.items,
      },
    }
  }

  // o plano precisa ser do próprio usuário
  const plan = await prisma.workoutProgram.findFirst({
    where: { id: parsed.data.planId, ownerId: userId },
    select: { id: true },
  })

  if (!plan) {
    return {
      ok: false as const,
      errors: { planId: ['Escolha um plano de treino seu.'] },
    }
  }

  // todos os exercícios precisam ser visíveis ao usuário
  // (catálogo ou custom dele)
  const exerciseIds = parsed.data.items.map((item) => item.exerciseId)
  const visibleCount = await prisma.exercise.count({
    where: {
      id: { in: exerciseIds },
      OR: [{ ownerId: null }, { ownerId: userId }],
    },
  })

  if (visibleCount !== new Set(exerciseIds).size) {
    return {
      ok: false as const,
      errors: { items: ['Algum exercício selecionado é inválido.'] },
    }
  }

  return { ok: true as const, data: parsed.data }
}

export async function createWorkoutTemplate(
  _prevState: WorkoutTemplateFormState,
  formData: FormData,
): Promise<WorkoutTemplateFormState> {
  const { userId } = await verifySession()

  const parsed = await parseTemplateForm(userId, formData)
  if (!parsed.ok) {
    return { errors: parsed.errors }
  }

  await prisma.workoutTemplate.create({
    data: {
      name: parsed.data.name,
      ownerId: userId,
      programId: parsed.data.planId,
      exercises: {
        create: parsed.data.items.map((item, index) => ({
          exerciseId: item.exerciseId,
          position: index,
          targetSets: item.targetSets,
          targetReps: item.targetReps,
          targetRepsMax: item.targetRepsMax,
        })),
      },
    },
  })

  revalidatePath(privateRoutes.workouts)
  revalidatePath(`${privateRoutes.plans}/${parsed.data.planId}`)
  // o treino vive dentro do plano, então é para lá que o fluxo volta
  return redirect(`${privateRoutes.plans}/${parsed.data.planId}`)
}

export async function updateWorkoutTemplate(
  _prevState: WorkoutTemplateFormState,
  formData: FormData,
): Promise<WorkoutTemplateFormState> {
  const { userId } = await verifySession()

  const id = formData.get('id')
  if (typeof id !== 'string' || !id) {
    return { errors: { form: ['Treino inválido.'] } }
  }

  // ownership: o template precisa ser do usuário
  const template = await prisma.workoutTemplate.findFirst({
    where: { id, ownerId: userId },
    select: { id: true },
  })

  if (!template) {
    return { errors: { form: ['Você só pode editar seus próprios treinos.'] } }
  }

  const parsed = await parseTemplateForm(userId, formData)
  if (!parsed.ok) {
    return { errors: parsed.errors }
  }

  // substitui a lista inteira: cobre adicionar/remover/reordenar num passo só
  await prisma.$transaction([
    prisma.workoutTemplateExercise.deleteMany({ where: { templateId: id } }),
    prisma.workoutTemplate.update({
      where: { id },
      data: {
        name: parsed.data.name,
        // o treino pode ser movido para outro plano do usuário
        programId: parsed.data.planId,
        exercises: {
          create: parsed.data.items.map((item, index) => ({
            exerciseId: item.exerciseId,
            position: index,
            targetSets: item.targetSets,
            targetReps: item.targetReps,
            targetRepsMax: item.targetRepsMax,
          })),
        },
      },
    }),
  ])

  revalidatePath(privateRoutes.workouts)
  revalidatePath(`${privateRoutes.plans}/${parsed.data.planId}`)
  // o treino vive dentro do plano, então é para lá que o fluxo volta
  return redirect(`${privateRoutes.plans}/${parsed.data.planId}`)
}

export async function deleteWorkoutTemplate(formData: FormData): Promise<void> {
  const { userId } = await verifySession()

  const id = formData.get('id')
  if (typeof id !== 'string' || !id) {
    return
  }

  // ownership garantido na própria query
  const template = await prisma.workoutTemplate.findFirst({
    where: { id, ownerId: userId },
    select: { programId: true },
  })

  if (!template) {
    return
  }

  await prisma.workoutTemplate.delete({ where: { id } })

  revalidatePath(privateRoutes.workouts)
  if (template.programId) {
    revalidatePath(`${privateRoutes.plans}/${template.programId}`)
  }
}
