import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'

// peso nulo (exercício de peso corporal) conta como 0 no volume, nunca quebra
// a soma
export function calculateSessionVolume(
  exercises: { sets: { weightKg: number | null; reps: number }[] }[],
) {
  return exercises.reduce(
    (total, exercise) =>
      total +
      exercise.sets.reduce(
        (sum, set) => sum + (set.weightKg ?? 0) * set.reps,
        0,
      ),
    0,
  )
}

// sessão em andamento é sempre restrita ao dono; concluída fica visível
// também para quem segue o dono
async function isSessionVisibleTo(
  session: { userId: string; status: 'IN_PROGRESS' | 'COMPLETED' },
  viewerId: string,
) {
  if (session.userId === viewerId) return true
  if (session.status !== 'COMPLETED') return false

  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: viewerId,
        followingId: session.userId,
      },
    },
  })
  return Boolean(follow)
}

// checagem leve de visibilidade, para uso em ações (curtir/comentar) sem
// precisar carregar exercícios/séries
export async function canAccessSession(sessionId: string) {
  const { userId } = await verifySession()

  const session = await prisma.workoutSession.findUnique({
    where: { id: sessionId },
    select: { userId: true, status: true },
  })

  if (!session) return false
  return isSessionVisibleTo(session, userId)
}

interface PreviousSet {
  weightKg: number | null
  reps: number
}

// Última série registrada em cada exercício, de treinos já concluídos: é com
// ela que o formulário nasce preenchido, para não obrigar a redigitar o
// mesmo peso a cada série. Uma consulta por exercício (são poucos por
// treino), todas em paralelo.
async function getLastSetByExercise(userId: string, exerciseIds: string[]) {
  const entries = await Promise.all(
    exerciseIds.map(async (exerciseId) => {
      const set = await prisma.sessionSet.findFirst({
        where: {
          sessionExercise: {
            exerciseId,
            session: { userId, status: 'COMPLETED' },
          },
        },
        orderBy: { completedAt: 'desc' },
        select: { weightKg: true, reps: true },
      })
      return [exerciseId, set] as const
    }),
  )

  return new Map(
    entries.flatMap(([exerciseId, set]) =>
      set ? [[exerciseId, set] as const] : [],
    ),
  )
}

export async function getWorkoutSession(id: string) {
  const { userId } = await verifySession()

  const session = await prisma.workoutSession.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      user: { select: { username: true, name: true, image: true } },
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
          exerciseId: true,
          exercise: { select: { imageUrls: true } },
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

  if (!session) return null

  const isOwner = session.userId === userId
  if (!isOwner && !(await isSessionVisibleTo(session, userId))) return null

  // o peso da última vez só serve para preencher o formulário de quem está
  // treinando agora — sessão concluída (ou de outra pessoa) não precisa
  const lastSets =
    isOwner && session.status === 'IN_PROGRESS'
      ? await getLastSetByExercise(
          userId,
          session.exercises.flatMap((item) =>
            item.exerciseId ? [item.exerciseId] : [],
          ),
        )
      : new Map<string, PreviousSet>()

  return {
    ...session,
    exercises: session.exercises.map((item) => ({
      ...item,
      previousSet: item.exerciseId
        ? (lastSets.get(item.exerciseId) ?? null)
        : null,
    })),
    isOwner,
  }
}

export async function getInProgressWorkoutSession() {
  const { userId } = await verifySession()

  const session = await prisma.workoutSession.findFirst({
    where: { userId, status: 'IN_PROGRESS' },
    orderBy: { startedAt: 'desc' },
    // templateId identifica de qual treino é a sessão: os botões "Iniciar"
    // desse treino viram "Continuar", e os dos outros avisam antes de trocar
    select: { id: true, templateId: true, templateName: true, startedAt: true },
  })

  if (!session) return null

  // quantas séries o descarte apagaria — o banner avisa antes de confirmar
  const loggedSets = await prisma.sessionSet.count({
    where: { sessionExercise: { sessionId: session.id } },
  })

  return { ...session, loggedSets }
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

export type InProgressSession = NonNullable<
  Awaited<ReturnType<typeof getInProgressWorkoutSession>>
>

export type WorkoutSessionDetail = NonNullable<
  Awaited<ReturnType<typeof getWorkoutSession>>
>

export type WorkoutSessionExerciseDetail =
  WorkoutSessionDetail['exercises'][number]

export type WorkoutSessionListItem = Awaited<
  ReturnType<typeof listCompletedWorkoutSessions>
>[number]
