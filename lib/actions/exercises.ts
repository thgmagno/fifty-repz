'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import { Equipment, MuscleGroup } from '@/lib/generated/prisma/enums'
import { privateRoutes } from '@/lib/config'

export interface ExerciseFormState {
  success?: boolean
  errors?: {
    name?: string[]
    muscleGroup?: string[]
    equipment?: string[]
    form?: string[]
  }
}

const exerciseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'O nome precisa ter pelo menos 2 caracteres.')
    .max(80, 'O nome pode ter no máximo 80 caracteres.'),
  muscleGroup: z.enum(MuscleGroup, {
    error: 'Selecione um grupo muscular válido.',
  }),
  equipment: z.enum(Equipment, {
    error: 'Selecione um equipamento válido.',
  }),
})

function parseExerciseForm(formData: FormData) {
  return exerciseSchema.safeParse({
    name: formData.get('name'),
    muscleGroup: formData.get('muscleGroup'),
    equipment: formData.get('equipment'),
  })
}

export async function createExercise(
  _prevState: ExerciseFormState,
  formData: FormData,
): Promise<ExerciseFormState> {
  const { userId } = await verifySession()

  const parsed = parseExerciseForm(formData)
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  await prisma.exercise.create({
    data: {
      ...parsed.data,
      slug: `custom-${crypto.randomUUID()}`,
      isCustom: true,
      ownerId: userId,
    },
  })

  revalidatePath(privateRoutes.exercises)
  return { success: true }
}

export async function updateExercise(
  _prevState: ExerciseFormState,
  formData: FormData,
): Promise<ExerciseFormState> {
  const { userId } = await verifySession()

  const id = formData.get('id')
  if (typeof id !== 'string' || !id) {
    return { errors: { form: ['Exercício inválido.'] } }
  }

  const parsed = parseExerciseForm(formData)
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  // ownership garantido na própria query: só atualiza custom do usuário
  const { count } = await prisma.exercise.updateMany({
    where: { id, ownerId: userId, isCustom: true },
    data: parsed.data,
  })

  if (count === 0) {
    return {
      errors: { form: ['Você só pode editar seus próprios exercícios.'] },
    }
  }

  revalidatePath(privateRoutes.exercises)
  return { success: true }
}

export async function deleteExercise(formData: FormData): Promise<void> {
  const { userId } = await verifySession()

  const id = formData.get('id')
  if (typeof id !== 'string' || !id) {
    return
  }

  // ownership garantido na própria query: só exclui custom do usuário
  await prisma.exercise.deleteMany({
    where: { id, ownerId: userId, isCustom: true },
  })

  revalidatePath(privateRoutes.exercises)
}
