import type { Metadata } from 'next'
import { Page } from '@/components/page'
import { InProgressSessionBanner } from '@/components/workouts/in-progress-session-banner'
import { ProgramLevelCard } from '@/components/programs/program-level-card'
import { listProgramsWithProgress } from '@/lib/workout-programs'
import { getInProgressWorkoutSession } from '@/lib/workout-sessions'

export const metadata: Metadata = {
  title: 'Programas de treino',
}

export default async function ProgramasPage() {
  const [programs, inProgressSession] = await Promise.all([
    listProgramsWithProgress(),
    getInProgressWorkoutSession(),
  ])

  return (
    <Page>
      <div>
        <h1 className="text-2xl font-bold">Programas de treino</h1>
        <p className="text-sm text-muted-foreground">
          Jornadas oficiais com progressão por níveis. Complete um nível 50
          vezes para liberar o próximo.
        </p>
      </div>

      {inProgressSession && (
        <InProgressSessionBanner session={inProgressSession} />
      )}

      {programs.map((program) => (
        <section key={program.id} className="flex flex-col gap-3">
          <div>
            <h2 className="text-xl font-bold">{program.name}</h2>
            {program.description && (
              <p className="text-sm text-muted-foreground">
                {program.description}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {program.levels.map((level, index) => (
              <ProgramLevelCard
                key={level.id}
                level={level}
                unlockRequirement={
                  index > 0 ? program.levels[index - 1].unlockThreshold : null
                }
              />
            ))}
          </div>
        </section>
      ))}
    </Page>
  )
}
