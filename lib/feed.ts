import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import { calculateSessionVolume } from '@/lib/workout-sessions'

const FEED_PAGE_SIZE = 15

export async function listFeedSessions(cursor?: string) {
  const { userId } = await verifySession()

  const sessions = await prisma.workoutSession.findMany({
    where: {
      status: 'COMPLETED',
      user: { followers: { some: { followerId: userId } } },
    },
    orderBy: { completedAt: 'desc' },
    take: FEED_PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      templateName: true,
      completedAt: true,
      durationSeconds: true,
      user: { select: { username: true, name: true, image: true } },
      exercises: {
        select: { sets: { select: { weightKg: true, reps: true } } },
      },
    },
  })

  const hasMore = sessions.length > FEED_PAGE_SIZE
  const page = hasMore ? sessions.slice(0, FEED_PAGE_SIZE) : sessions

  const items = page.map((session) => ({
    id: session.id,
    templateName: session.templateName,
    completedAt: session.completedAt,
    durationSeconds: session.durationSeconds,
    user: session.user,
    totalVolume: calculateSessionVolume(session.exercises),
  }))

  return {
    items,
    nextCursor: hasMore ? page[page.length - 1].id : null,
  }
}

export type FeedItem = Awaited<
  ReturnType<typeof listFeedSessions>
>['items'][number]

export async function hasAnyFollowing() {
  const { userId } = await verifySession()

  const count = await prisma.follow.count({ where: { followerId: userId } })
  return count > 0
}
