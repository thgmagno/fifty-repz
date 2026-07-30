'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import { canAccessSession } from '@/lib/workout-sessions'
import { privateRoutes } from '@/lib/config'

export async function toggleLike(formData: FormData): Promise<void> {
  const { userId } = await verifySession()

  const sessionId = formData.get('sessionId')
  if (typeof sessionId !== 'string' || !sessionId) return

  if (!(await canAccessSession(sessionId))) return

  const existing = await prisma.like.findUnique({
    where: { userId_sessionId: { userId, sessionId } },
  })

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } })
  } else {
    // upsert: idempotente mesmo se duas requisições concorrentes tentarem
    // criar o mesmo like (a constraint única nunca duplica)
    await prisma.like.upsert({
      where: { userId_sessionId: { userId, sessionId } },
      create: { userId, sessionId },
      update: {},
    })
  }

  revalidatePath(privateRoutes.feed)
  revalidatePath(`${privateRoutes.sessions}/${sessionId}`)
}
