import type { Metadata } from 'next'
import Link from 'next/link'
import { PlusIcon } from 'lucide-react'
import { Page } from '@/components/page'
import { buttonVariants } from '@/components/ui/button'
import { InProgressSessionBanner } from '@/components/workouts/in-progress-session-banner'
import { PlanLevelCard } from '@/components/plans/plan-level-card'
import { UserPlanCard } from '@/components/plans/user-plan-card'
import { listProgramsWithProgress } from '@/lib/workout-programs'
import { listUserPlans } from '@/lib/workout-plans'
import { getInProgressWorkoutSession } from '@/lib/workout-sessions'
import { privateRoutes } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Planos de treino',
}

export default async function PlanosPage() {
  const [officialPlans, userPlans, inProgressSession] = await Promise.all([
    listProgramsWithProgress(),
    listUserPlans(),
    getInProgressWorkoutSession(),
  ])

  return (
    <Page>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Planos de treino</h1>
          <p className="text-sm text-muted-foreground">
            Um plano reúne treinos, e cada treino reúne exercícios. Siga o plano
            oficial ou monte o seu.
          </p>
        </div>
        <Link
          href={`${privateRoutes.plans}/novo`}
          className={buttonVariants({ variant: 'secondary' })}
        >
          <PlusIcon />
          Novo plano
        </Link>
      </div>

      {inProgressSession && (
        <InProgressSessionBanner session={inProgressSession} />
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">Meus planos</h2>

        {userPlans.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-md border border-dashed py-10 text-center">
            <p className="max-w-sm text-sm text-muted-foreground">
              Você ainda não tem planos. Crie um para poder montar seus treinos
              dentro dele.
            </p>
            <Link
              href={`${privateRoutes.plans}/novo`}
              className={buttonVariants()}
            >
              <PlusIcon />
              Criar meu primeiro plano
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {userPlans.map((plan) => (
              <UserPlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </section>

      {officialPlans.map((plan) => (
        <section key={plan.id} className="flex flex-col gap-3">
          <div>
            <h2 className="text-xl font-bold">{plan.name}</h2>
            {/* a descrição do plano oficial já enuncia a regra de
                desbloqueio; a linha genérica é só fallback */}
            <p className="text-sm text-muted-foreground">
              {plan.description ?? 'Plano oficial, organizado em níveis.'}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {plan.levels.map((level, index) => (
              <PlanLevelCard
                key={level.id}
                level={level}
                unlockRequirement={
                  index > 0 ? plan.levels[index - 1].unlockThreshold : null
                }
              />
            ))}
          </div>
        </section>
      ))}
    </Page>
  )
}
