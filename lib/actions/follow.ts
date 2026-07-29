'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import { privateRoutes } from '@/lib/config'

function readFollowTarget(formData: FormData) {
  const targetUserId = formData.get('userId')
  const username = formData.get('username')

  if (
    typeof targetUserId !== 'string' ||
    !targetUserId ||
    typeof username !== 'string' ||
    !username
  ) {
    return null
  }

  return { targetUserId, username }
}

export async function followUser(formData: FormData): Promise<void> {
  const { userId } = await verifySession()
  const target = readFollowTarget(formData)

  // idempotente (upsert) e bloqueia seguir a si mesmo
  if (!target || target.targetUserId === userId) {
    return
  }

  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: userId,
        followingId: target.targetUserId,
      },
    },
    create: { followerId: userId, followingId: target.targetUserId },
    update: {},
  })

  revalidatePath(`${privateRoutes.profile}/${target.username}`)
}

export async function unfollowUser(formData: FormData): Promise<void> {
  const { userId } = await verifySession()
  const target = readFollowTarget(formData)

  if (!target) {
    return
  }

  // deleteMany é idempotente: nenhuma linha afetada se já não seguia
  await prisma.follow.deleteMany({
    where: { followerId: userId, followingId: target.targetUserId },
  })

  revalidatePath(`${privateRoutes.profile}/${target.username}`)
}
