import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { decrypt, SESSION_COOKIE } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { publicRoutes } from '@/lib/config'

export const verifySession = cache(async () => {
  const cookieStore = await cookies()
  const session = await decrypt(cookieStore.get(SESSION_COOKIE)?.value)

  if (!session?.userId) {
    redirect(publicRoutes.login)
  }

  return { isAuth: true as const, userId: session.userId }
})

export const getUser = cache(async () => {
  const { userId } = await verifySession()

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      username: true,
      bio: true,
      trainingMode: true,
      onboardedAt: true,
    },
  })

  if (!user) {
    redirect(publicRoutes.login)
  }

  return user
})
