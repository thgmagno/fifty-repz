import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'

// Conta os treinos concluídos do nível: qualquer treino dele conta, e só
// entram as sessões com pelo menos uma série registrada — sessão em branco
// não é treino e não avança a progressão.
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

// Última vez que o usuário concluiu cada treino, numa consulta só: a mais
// recente de cada template. Mesma regra da contagem do nível — sessão sem
// série registrada não vale.
async function getLastDoneByTemplate(userId: string, templateIds: string[]) {
  if (templateIds.length === 0) return new Map<string, Date>()

  const sessions = await prisma.workoutSession.findMany({
    where: {
      userId,
      status: 'COMPLETED',
      templateId: { in: templateIds },
      exercises: { some: { sets: { some: {} } } },
    },
    orderBy: { completedAt: 'desc' },
    distinct: ['templateId'],
    select: { templateId: true, completedAt: true },
  })

  return new Map(
    sessions.flatMap((session) =>
      session.templateId && session.completedAt
        ? [[session.templateId, session.completedAt] as const]
        : [],
    ),
  )
}

// O treino sugerido é o seguinte ao último concluído, em ciclo (A -> B ->
// C -> A). Quem nunca treinou no nível começa pelo primeiro.
function suggestNextTemplateId(
  templates: { id: string; lastCompletedAt: Date | null }[],
) {
  if (templates.length === 0) return null

  let lastIndex = -1
  templates.forEach((template, index) => {
    const current = template.lastCompletedAt
    if (!current) return
    const latest = templates[lastIndex]?.lastCompletedAt
    if (!latest || current > latest) lastIndex = index
  })

  if (lastIndex === -1) return templates[0].id
  return templates[(lastIndex + 1) % templates.length].id
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
              // exercícios completos: dá para ver o que tem dentro do
              // treino antes de iniciar a sessão
              exercises: {
                orderBy: { position: 'asc' },
                select: {
                  id: true,
                  targetSets: true,
                  targetReps: true,
                  targetRepsMax: true,
                  exercise: {
                    select: {
                      name: true,
                      muscleGroup: true,
                      equipment: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  const lastDoneByTemplate = await getLastDoneByTemplate(
    userId,
    programs.flatMap((program) =>
      program.levels.flatMap((level) =>
        level.templates.map((template) => template.id),
      ),
    ),
  )

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

        const templates = level.templates.map((template) => ({
          ...template,
          lastCompletedAt: lastDoneByTemplate.get(template.id) ?? null,
        }))

        return {
          ...level,
          templates,
          completions,
          unlocked,
          suggestedTemplateId: suggestNextTemplateId(templates),
        }
      })

      return { ...program, levels }
    }),
  )
}

export type ProgramWithProgress = Awaited<
  ReturnType<typeof listProgramsWithProgress>
>[number]
export type ProgramLevel = ProgramWithProgress['levels'][number]
export type ProgramTemplate = ProgramLevel['templates'][number]
