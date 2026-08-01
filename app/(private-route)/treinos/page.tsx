import type { Metadata } from 'next'
import Link from 'next/link'
import { LayersIcon, PlusIcon } from 'lucide-react'
import { Page } from '@/components/page'
import { buttonVariants } from '@/components/ui/button'
import { InProgressSessionBanner } from '@/components/workouts/in-progress-session-banner'
import { ProgramTemplateRow } from '@/components/workouts/program-template-row'
import { WorkoutTemplateCard } from '@/components/workouts/workout-template-card'
import { listUserPlans } from '@/lib/workout-plans'
import { listProgramsWithProgress } from '@/lib/workout-programs'
import { getInProgressWorkoutSession } from '@/lib/workout-sessions'
import { privateRoutes } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Treinos',
}

export default async function TreinosPage() {
  const [userPlans, officialPlans, inProgressSession] = await Promise.all([
    listUserPlans(),
    listProgramsWithProgress(),
    getInProgressWorkoutSession(),
  ])

  const userPlansWithTemplates = userPlans.filter(
    (plan) => plan.templates.length > 0,
  )

  return (
    <Page>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Treinos</h1>
          <p className="text-sm text-muted-foreground">
            Seus treinos, agrupados pelo plano a que pertencem. Escolha um e
            comece.
          </p>
        </div>
        {/* treino nasce dentro de um plano, então o atalho leva para lá */}
        <Link
          href={privateRoutes.plans}
          className={buttonVariants({ variant: 'secondary' })}
        >
          <LayersIcon />
          Planos de treino
        </Link>
      </div>

      {inProgressSession && (
        <InProgressSessionBanner session={inProgressSession} />
      )}

      {officialPlans.map((plan) =>
        plan.levels
          .filter((level) => level.unlocked && level.templates.length > 0)
          .map((level) => (
            <section key={level.id} className="flex flex-col gap-3">
              <div>
                <h2 className="text-xl font-bold">
                  {plan.name} · {level.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Treinos do plano oficial. Para ver os níveis e o progresso,
                  abra{' '}
                  <Link href={privateRoutes.plans} className="underline">
                    Planos de treino
                  </Link>
                  .
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {level.templates.map((template) => (
                  <ProgramTemplateRow key={template.id} template={template} />
                ))}
              </div>
            </section>
          )),
      )}

      {userPlansWithTemplates.map((plan) => (
        <section key={plan.id} className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold">{plan.name}</h2>
            <Link
              href={`${privateRoutes.plans}/${plan.id}`}
              className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            >
              Abrir plano
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plan.templates.map((template) => (
              <WorkoutTemplateCard key={template.id} template={template} />
            ))}
          </div>
        </section>
      ))}

      {userPlansWithTemplates.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed py-10 text-center">
          <p className="max-w-sm text-sm text-muted-foreground">
            Você ainda não montou treinos próprios. Todo treino pertence a um
            plano — comece criando um.
          </p>
          <Link
            href={`${privateRoutes.plans}/novo?next=treino`}
            className={buttonVariants()}
          >
            <PlusIcon />
            Criar plano e montar treino
          </Link>
        </div>
      )}
    </Page>
  )
}
