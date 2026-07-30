import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'

export async function listComments(sessionId: string) {
  const { userId } = await verifySession()

  const comments = await prisma.comment.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      body: true,
      createdAt: true,
      userId: true,
      user: { select: { username: true, name: true, image: true } },
    },
  })

  return comments.map((comment) => ({
    ...comment,
    isOwn: comment.userId === userId,
  }))
}

export type CommentItem = Awaited<ReturnType<typeof listComments>>[number]
