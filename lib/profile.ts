import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import { getFollowStats } from '@/lib/follow'
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

  const [completedSessions, followStats] = await Promise.all([
    prisma.workoutSession.findMany({
      where: { userId: user.id, status: 'COMPLETED' },
      select: { completedAt: true, durationSeconds: true },
    }),
    getFollowStats(user.id),
  ])

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
      followersCount: followStats.followersCount,
      followingCount: followStats.followingCount,
    },
    isFollowing: followStats.isFollowing,
    heatmap: buildHeatmap(frequencyByDay),
  }
}

export type UserProfile = NonNullable<
  Awaited<ReturnType<typeof getUserProfile>>
>

// O que o usuário perde ao excluir a conta. Serve para a confirmação dizer
// números concretos em vez de "todos os seus dados" — quem tem 80 treinos
// registrados merece ver isso antes de confirmar.
export async function getAccountDeletionSummary() {
  const { userId } = await verifySession()

  const [completedSessions, workoutTemplates, customExercises, followers] =
    await Promise.all([
      prisma.workoutSession.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.workoutTemplate.count({ where: { ownerId: userId } }),
      prisma.exercise.count({ where: { ownerId: userId } }),
      prisma.follow.count({ where: { followingId: userId } }),
    ])

  return { completedSessions, workoutTemplates, customExercises, followers }
}

export type AccountDeletionSummary = Awaited<
  ReturnType<typeof getAccountDeletionSummary>
>
