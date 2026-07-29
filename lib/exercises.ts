import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import type { MuscleGroup, Prisma } from '@/lib/generated/prisma/client'

export interface ListExercisesFilters {
  query?: string
  muscleGroup?: MuscleGroup
}

export async function listExercises({
  query,
  muscleGroup,
}: ListExercisesFilters = {}) {
  const { userId } = await verifySession()

  const where: Prisma.ExerciseWhereInput = {
    // catálogo (sem dono) + exercícios custom do próprio usuário
    OR: [{ ownerId: null }, { ownerId: userId }],
  }

  if (query) {
    where.AND = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { nameEn: { contains: query, mode: 'insensitive' } },
      ],
    }
  }

  if (muscleGroup) {
    where.muscleGroup = muscleGroup
  }

  return prisma.exercise.findMany({
    where,
    orderBy: [{ isCustom: 'desc' }, { name: 'asc' }],
    select: {
      id: true,
      slug: true,
      name: true,
      nameEn: true,
      muscleGroup: true,
      secondaryMuscles: true,
      equipment: true,
      imageUrls: true,
      isCustom: true,
      ownerId: true,
    },
  })
}

export type ExerciseListItem = Awaited<ReturnType<typeof listExercises>>[number]
