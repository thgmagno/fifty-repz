import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'

const followUserSelect = {
  id: true,
  username: true,
  name: true,
  image: true,
} as const

export async function getFollowStats(profileUserId: string) {
  const { userId } = await verifySession()

  const [followersCount, followingCount, followEdge] = await Promise.all([
    prisma.follow.count({ where: { followingId: profileUserId } }),
    prisma.follow.count({ where: { followerId: profileUserId } }),
    profileUserId === userId
      ? null
      : prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: userId,
              followingId: profileUserId,
            },
          },
        }),
  ])

  return {
    followersCount,
    followingCount,
    isFollowing: Boolean(followEdge),
  }
}

export async function listFollowers(userId: string) {
  await verifySession()

  const follows = await prisma.follow.findMany({
    where: { followingId: userId },
    orderBy: { createdAt: 'desc' },
    select: { follower: { select: followUserSelect } },
  })

  return follows.map((follow) => follow.follower)
}

export async function listFollowing(userId: string) {
  await verifySession()

  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    orderBy: { createdAt: 'desc' },
    select: { following: { select: followUserSelect } },
  })

  return follows.map((follow) => follow.following)
}

export type FollowListItem = Awaited<ReturnType<typeof listFollowers>>[number]
