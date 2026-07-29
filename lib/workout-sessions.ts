import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'

export async function getWorkoutSession(id: string) {
  const { userId } = await verifySession()

  return prisma.workoutSession.findFirst({
    where: { id, userId },
    select: {
      id: true,
      templateName: true,
      status: true,
      startedAt: true,
      completedAt: true,
      durationSeconds: true,
      exercises: {
        orderBy: { position: 'asc' },
        select: {
          id: true,
          exerciseName: true,
          position: true,
          targetSets: true,
          targetReps: true,
          targetRepsMax: true,
          skipped: true,
          sets: {
            orderBy: { setNumber: 'asc' },
            select: {
              id: true,
              setNumber: true,
              weightKg: true,
              reps: true,
            },
          },
        },
      },
    },
  })
}

export async function getInProgressWorkoutSession() {
  const { userId } = await verifySession()

  return prisma.workoutSession.findFirst({
    where: { userId, status: 'IN_PROGRESS' },
    orderBy: { startedAt: 'desc' },
    select: { id: true, templateName: true, startedAt: true },
  })
}

export async function listCompletedWorkoutSessions() {
  const { userId } = await verifySession()

  return prisma.workoutSession.findMany({
    where: { userId, status: 'COMPLETED' },
    orderBy: { completedAt: 'desc' },
    select: {
      id: true,
      templateName: true,
      completedAt: true,
      durationSeconds: true,
      exercises: { select: { id: true } },
    },
  })
}

export type WorkoutSessionDetail = NonNullable<
  Awaited<ReturnType<typeof getWorkoutSession>>
>

export type WorkoutSessionExerciseDetail =
  WorkoutSessionDetail['exercises'][number]

export type WorkoutSessionListItem = Awaited<
  ReturnType<typeof listCompletedWorkoutSessions>
>[number]
