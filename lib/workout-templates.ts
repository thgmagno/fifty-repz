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

export async function listWorkoutTemplates() {
  const { userId } = await verifySession()

  return prisma.workoutTemplate.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      updatedAt: true,
      exercises: {
        orderBy: { position: 'asc' },
        select: {
          id: true,
          targetSets: true,
          targetReps: true,
          targetRepsMax: true,
          exercise: { select: { name: true, muscleGroup: true } },
        },
      },
    },
  })
}

export async function getWorkoutTemplate(id: string) {
  const { userId } = await verifySession()

  return prisma.workoutTemplate.findFirst({
    where: { id, ownerId: userId },
    select: {
      id: true,
      name: true,
      ...templateExerciseInclude,
    },
  })
}

export type WorkoutTemplateListItem = Awaited<
  ReturnType<typeof listWorkoutTemplates>
>[number]

export type WorkoutTemplateDetail = NonNullable<
  Awaited<ReturnType<typeof getWorkoutTemplate>>
>
