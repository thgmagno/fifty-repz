import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'

// A contagem do nível soma as sessões concluídas de qualquer treino que
// pertença a ele — não é preciso repetir a sequência (A, B, C) inteira.
// Só entram sessões com pelo menos uma série registrada: finalizar um treino
// sem registrar nada não é treino e não deve empurrar a progressão.
// Exportado para reuso na checagem de bloqueio em startWorkoutSession.
export async function countLevelCompletions(userId: string, levelId: string) {
  return prisma.workoutSession.count({
    where: {
      userId,
      status: 'COMPLETED',
      template: { programLevelId: levelId },
      exercises: { some: { sets: { some: {} } } },
    },
  })
}

// Planos oficiais do app: sem dono, organizados em níveis com progressão.
// Os planos criados por usuários ficam em lib/workout-plans.ts.
export async function listProgramsWithProgress() {
  const { userId } = await verifySession()

  const programs = await prisma.workoutProgram.findMany({
    where: { ownerId: null },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      levels: {
        orderBy: { level: 'asc' },
        select: {
          id: true,
          level: true,
          name: true,
          description: true,
          unlockThreshold: true,
          templates: {
            orderBy: { planOrder: 'asc' },
            select: {
              id: true,
              name: true,
              exercises: { select: { id: true } },
            },
          },
        },
      },
    },
  })

  return Promise.all(
    programs.map(async (program) => {
      // as contagens de conclusão de cada nível são independentes entre si,
      // então são buscadas em paralelo
      const completionsByLevel = await Promise.all(
        program.levels.map((level) => countLevelCompletions(userId, level.id)),
      )

      // já o desbloqueio é sequencial: o primeiro nível é sempre livre, os
      // seguintes exigem N conclusões do nível anterior
      let previousUnlocked = true
      const levels = program.levels.map((level, index) => {
        const completions = completionsByLevel[index]
        const unlocked = previousUnlocked
        previousUnlocked = unlocked && completions >= level.unlockThreshold
        return { ...level, completions, unlocked }
      })

      return { ...program, levels }
    }),
  )
}

export type ProgramWithProgress = Awaited<
  ReturnType<typeof listProgramsWithProgress>
>[number]
