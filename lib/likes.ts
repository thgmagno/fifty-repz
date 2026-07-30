import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'

export async function getLikeState(sessionId: string) {
  const { userId } = await verifySession()

  const [likeCount, likedByMe] = await Promise.all([
    prisma.like.count({ where: { sessionId } }),
    prisma.like.findUnique({
      where: { userId_sessionId: { userId, sessionId } },
    }),
  ])

  return { likeCount, likedByMe: Boolean(likedByMe) }
}
