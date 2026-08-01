import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import type { MuscleGroup, Prisma } from '@/lib/generated/prisma/client'

// 307 exercícios com imagem numa página só deixam a rolagem infinita e
// baixam centenas de fotos que ninguém vai ver
export const EXERCISES_PAGE_SIZE = 30

export interface ListExercisesFilters {
  query?: string
  muscleGroup?: MuscleGroup
  page?: number
}

export async function listExercises({
  query,
  muscleGroup,
  page = 1,
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

  const total = await prisma.exercise.count({ where })
  const pageCount = Math.max(1, Math.ceil(total / EXERCISES_PAGE_SIZE))
  // página fora do intervalo (link antigo, filtro que encolheu o resultado)
  // cai na última existente em vez de numa lista vazia
  const currentPage = Math.min(Math.max(1, Math.trunc(page) || 1), pageCount)

  const exercises = await prisma.exercise.findMany({
    where,
    orderBy: [{ isCustom: 'desc' }, { name: 'asc' }],
    skip: (currentPage - 1) * EXERCISES_PAGE_SIZE,
    take: EXERCISES_PAGE_SIZE,
    select: {
      id: true,
      slug: true,
      name: true,
      nameEn: true,
      muscleGroup: true,
      secondaryMuscles: true,
      equipment: true,
      imageUrls: true,
      instructions: true,
      isCustom: true,
      ownerId: true,
    },
  })

  return { exercises, total, page: currentPage, pageCount }
}

export type ExerciseListItem = Awaited<
  ReturnType<typeof listExercises>
>['exercises'][number]

// lista enxuta (sem imagens) para pickers no client
export async function listExerciseOptions() {
  const { userId } = await verifySession()

  return prisma.exercise.findMany({
    where: { OR: [{ ownerId: null }, { ownerId: userId }] },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      muscleGroup: true,
      equipment: true,
      isCustom: true,
    },
  })
}

export type ExerciseOption = Awaited<
  ReturnType<typeof listExerciseOptions>
>[number]
