import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import { getWeekStartKey } from '@/lib/utils'
import { MuscleGroup } from '@/lib/generated/prisma/enums'

const MUSCLE_VOLUME_WINDOW_DAYS = 90
const TREND_WEEKS = 8

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

function calculateSetsVolume(
  sets: { weightKg: number | null; reps: number }[],
) {
  return sets.reduce((sum, set) => sum + (set.weightKg ?? 0) * set.reps, 0)
}

// Volume por grupo muscular nos últimos 90 dias. Agregado aqui (em memória
// no servidor, nunca enviado bruto ao client) a partir de uma consulta já
// filtrada por usuário/período — evita o groupBy do Prisma, que não
// atravessa relações (WorkoutSessionExercise -> Exercise.muscleGroup).
export async function getMuscleGroupVolume() {
  const { userId } = await verifySession()

  const sessionExercises = await prisma.workoutSessionExercise.findMany({
    where: {
      exerciseId: { not: null },
      session: {
        userId,
        status: 'COMPLETED',
        completedAt: { gte: daysAgo(MUSCLE_VOLUME_WINDOW_DAYS) },
      },
    },
    select: {
      exercise: { select: { muscleGroup: true } },
      sets: { select: { weightKg: true, reps: true } },
    },
  })

  const totals = new Map<MuscleGroup, number>()
  sessionExercises.forEach((item) => {
    if (!item.exercise) return
    const volume = calculateSetsVolume(item.sets)
    totals.set(
      item.exercise.muscleGroup,
      (totals.get(item.exercise.muscleGroup) ?? 0) + volume,
    )
  })

  return Object.values(MuscleGroup)
    .map((muscleGroup) => ({
      muscleGroup,
      volume: totals.get(muscleGroup) ?? 0,
    }))
    .filter((entry) => entry.volume > 0)
    .sort((a, b) => b.volume - a.volume)
}

export type MuscleGroupVolume = Awaited<
  ReturnType<typeof getMuscleGroupVolume>
>[number]

// Volume total por semana (todas as sessões, independente de grupo
// muscular) nas últimas 8 semanas, preenchendo com 0 semanas sem treino
// para o gráfico não "pular" períodos.
export async function getWeeklyVolumeTrend() {
  const { userId } = await verifySession()

  const sessions = await prisma.workoutSession.findMany({
    where: {
      userId,
      status: 'COMPLETED',
      completedAt: { gte: daysAgo(TREND_WEEKS * 7) },
    },
    select: {
      completedAt: true,
      exercises: {
        select: { sets: { select: { weightKg: true, reps: true } } },
      },
    },
  })

  const totals = new Map<string, number>()
  sessions.forEach((session) => {
    if (!session.completedAt) return
    const weekKey = getWeekStartKey(session.completedAt)
    const volume = session.exercises.reduce(
      (sum, exercise) => sum + calculateSetsVolume(exercise.sets),
      0,
    )
    totals.set(weekKey, (totals.get(weekKey) ?? 0) + volume)
  })

  const currentWeekStart = getWeekStartKey(new Date())
  const [year, month, day] = currentWeekStart.split('-').map(Number)
  const cursor = new Date(Date.UTC(year, month - 1, day))

  const weeks: { week: string; volume: number }[] = []
  for (let i = TREND_WEEKS - 1; i >= 0; i -= 1) {
    const weekDate = new Date(cursor)
    weekDate.setUTCDate(weekDate.getUTCDate() - i * 7)
    const weekKey = weekDate.toISOString().slice(0, 10)
    weeks.push({ week: weekKey, volume: totals.get(weekKey) ?? 0 })
  }

  return weeks
}

export type WeeklyVolume = Awaited<
  ReturnType<typeof getWeeklyVolumeTrend>
>[number]

// PR = maior peso já levantado por exercício (critério mais simples e
// comum; evita fórmulas de 1RM estimado, fora de escopo aqui). Agrupado
// por exerciseName (não exerciseId) para sobreviver a exercícios do
// catálogo removidos depois.
export async function getPersonalRecords() {
  const { userId } = await verifySession()

  const sessionExercises = await prisma.workoutSessionExercise.findMany({
    where: { session: { userId, status: 'COMPLETED' } },
    select: {
      exerciseName: true,
      sets: { select: { weightKg: true, reps: true, completedAt: true } },
    },
  })

  const records = new Map<
    string,
    { weightKg: number; reps: number; achievedAt: Date }
  >()

  sessionExercises.forEach((exercise) => {
    exercise.sets.forEach((set) => {
      if (set.weightKg === null) return
      const current = records.get(exercise.exerciseName)
      if (!current || set.weightKg > current.weightKg) {
        records.set(exercise.exerciseName, {
          weightKg: set.weightKg,
          reps: set.reps,
          achievedAt: set.completedAt,
        })
      }
    })
  })

  return Array.from(records.entries())
    .map(([exerciseName, record]) => ({ exerciseName, ...record }))
    .sort((a, b) => b.weightKg - a.weightKg)
}

export type PersonalRecord = Awaited<
  ReturnType<typeof getPersonalRecords>
>[number]
