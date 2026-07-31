'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import { privateRoutes } from '@/lib/config'

export interface WorkoutPlanFormState {
  errors?: {
    name?: string[]
    description?: string[]
    form?: string[]
  }
}

const planSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'O nome precisa ter pelo menos 2 caracteres.')
    .max(80, 'O nome pode ter no máximo 80 caracteres.'),
  description: z
    .string()
    .trim()
    .max(280, 'A descrição pode ter no máximo 280 caracteres.')
    .optional(),
})

function parsePlanForm(formData: FormData) {
  const description = formData.get('description')

  return planSchema.safeParse({
    name: formData.get('name'),
    description:
      typeof description === 'string' && description.trim() === ''
        ? undefined
        : description,
  })
}

export async function createWorkoutPlan(
  _prevState: WorkoutPlanFormState,
  formData: FormData,
): Promise<WorkoutPlanFormState> {
  const { userId } = await verifySession()

  const parsed = parsePlanForm(formData)
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  const plan = await prisma.workoutProgram.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      ownerId: userId,
    },
    select: { id: true },
  })

  revalidatePath(privateRoutes.plans)
  revalidatePath(privateRoutes.workouts)

  // vindo de "quero montar um treino", o próximo passo é o treino em si
  const next = formData.get('next')
  if (next === 'treino') {
    return redirect(`${privateRoutes.workouts}/novo?plano=${plan.id}`)
  }

  return redirect(`${privateRoutes.plans}/${plan.id}`)
}

export async function updateWorkoutPlan(
  _prevState: WorkoutPlanFormState,
  formData: FormData,
): Promise<WorkoutPlanFormState> {
  const { userId } = await verifySession()

  const id = formData.get('id')
  if (typeof id !== 'string' || !id) {
    return { errors: { form: ['Plano inválido.'] } }
  }

  const parsed = parsePlanForm(formData)
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  // ownership: planos oficiais (sem dono) nunca podem ser editados aqui
  const { count } = await prisma.workoutProgram.updateMany({
    where: { id, ownerId: userId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
    },
  })

  if (count === 0) {
    return { errors: { form: ['Você só pode editar seus próprios planos.'] } }
  }

  revalidatePath(privateRoutes.plans)
  revalidatePath(`${privateRoutes.plans}/${id}`)
  revalidatePath(privateRoutes.workouts)
  return redirect(`${privateRoutes.plans}/${id}`)
}

export async function deleteWorkoutPlan(formData: FormData): Promise<void> {
  const { userId } = await verifySession()

  const id = formData.get('id')
  if (typeof id !== 'string' || !id) {
    return
  }

  // ownership garantido na própria query; os treinos do plano vão junto
  // (onDelete: Cascade)
  await prisma.workoutProgram.deleteMany({ where: { id, ownerId: userId } })

  revalidatePath(privateRoutes.plans)
  revalidatePath(privateRoutes.workouts)
  redirect(privateRoutes.plans)
}
