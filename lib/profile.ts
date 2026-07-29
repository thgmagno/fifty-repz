import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import { getLocalDateKey } from '@/lib/utils'

// Janela do heatmap de frequência exibido no perfil
const HEATMAP_DAYS = 365

function buildHeatmap(frequencyByDay: Map<string, number>) {
  const days: { date: string; count: number }[] = []
  const today = new Date()

  for (let offset = HEATMAP_DAYS - 1; offset >= 0; offset -= 1) {
    const day = new Date(today)
    day.setDate(day.getDate() - offset)
    const dateKey = getLocalDateKey(day)
    days.push({ date: dateKey, count: frequencyByDay.get(dateKey) ?? 0 })
  }

  return days
}

export async function getUserProfile(username: string) {
  await verifySession()

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      bio: true,
      createdAt: true,
    },
  })

  if (!user) return null

  const completedSessions = await prisma.workoutSession.findMany({
    where: { userId: user.id, status: 'COMPLETED' },
    select: { completedAt: true, durationSeconds: true },
  })

  const totalDurationSeconds = completedSessions.reduce(
    (sum, session) => sum + (session.durationSeconds ?? 0),
    0,
  )

  const frequencyByDay = new Map<string, number>()
  completedSessions.forEach((session) => {
    if (!session.completedAt) return
    const dateKey = getLocalDateKey(session.completedAt)
    frequencyByDay.set(dateKey, (frequencyByDay.get(dateKey) ?? 0) + 1)
  })

  return {
    ...user,
    stats: {
      completedSessionsCount: completedSessions.length,
      totalDurationSeconds,
    },
    heatmap: buildHeatmap(frequencyByDay),
  }
}

export type UserProfile = NonNullable<
  Awaited<ReturnType<typeof getUserProfile>>
>
