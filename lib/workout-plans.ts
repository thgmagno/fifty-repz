import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'

// Planos criados pelo usuário (os oficiais, sem dono, vivem em
// lib/workout-programs.ts, porque têm níveis e progressão própria).
const planTemplatesSelect = {
  id: true,
  name: true,
  updatedAt: true,
  exercises: {
    orderBy: { position: 'asc' },
    select: {
      id: true,
      targetSets: true,
      targetReps: true,
      targetRepsMax: true,
      exercise: { select: { name: true, muscleGroup: true } },
    },
  },
} as const

export async function listUserPlans() {
  const { userId } = await verifySession()

  return prisma.workoutProgram.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      templates: {
        orderBy: { createdAt: 'asc' },
        select: planTemplatesSelect,
      },
    },
  })
}

export async function getUserPlan(id: string) {
  const { userId } = await verifySession()

  return prisma.workoutProgram.findFirst({
    where: { id, ownerId: userId },
    select: {
      id: true,
      name: true,
      description: true,
      templates: {
        orderBy: { createdAt: 'asc' },
        select: planTemplatesSelect,
      },
    },
  })
}

// Usado para decidir se o usuário já pode montar um treino: sem plano não
// existe treino avulso.
export async function countUserPlans() {
  const { userId } = await verifySession()

  return prisma.workoutProgram.count({ where: { ownerId: userId } })
}

export async function listUserPlanOptions() {
  const { userId } = await verifySession()

  return prisma.workoutProgram.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true },
  })
}

export type UserPlan = Awaited<ReturnType<typeof listUserPlans>>[number]
export type UserPlanTemplate = UserPlan['templates'][number]
export type UserPlanOption = Awaited<
  ReturnType<typeof listUserPlanOptions>
>[number]
