import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'

const SEARCH_RESULTS_LIMIT = 20

export async function searchUsers(query: string) {
  const { userId } = await verifySession()

  const trimmed = query.trim()
  if (!trimmed) return []

  return prisma.user.findMany({
    where: {
      id: { not: userId },
      OR: [
        { name: { contains: trimmed, mode: 'insensitive' } },
        { username: { contains: trimmed, mode: 'insensitive' } },
      ],
    },
    orderBy: { username: 'asc' },
    take: SEARCH_RESULTS_LIMIT,
    select: { id: true, username: true, name: true, image: true },
  })
}

export type UserSearchResult = Awaited<ReturnType<typeof searchUsers>>[number]
