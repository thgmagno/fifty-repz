import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'

const templateExerciseInclude = {
  exercises: {
    orderBy: { position: 'asc' },
    select: {
      id: true,
      position: true,
      targetSets: true,
      targetReps: true,
      targetRepsMax: true,
      exercise: {
        select: {
          id: true,
          name: true,
          muscleGroup: true,
          equipment: true,
          imageUrls: true,
        },
      },
    },
  },
} as const

export async function getWorkoutTemplate(id: string) {
  const { userId } = await verifySession()

  return prisma.workoutTemplate.findFirst({
    where: { id, ownerId: userId },
    select: {
      id: true,
      name: true,
      // plano ao qual o treino pertence (usado no seletor de plano do editor)
      programId: true,
      ...templateExerciseInclude,
    },
  })
}

export type WorkoutTemplateDetail = NonNullable<
  Awaited<ReturnType<typeof getWorkoutTemplate>>
>
