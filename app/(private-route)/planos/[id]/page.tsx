import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { Page } from '@/components/page'
import { Button, buttonVariants } from '@/components/ui/button'
import { DeletePlanDialog } from '@/components/plans/delete-plan-dialog'
import { InProgressSessionBanner } from '@/components/workouts/in-progress-session-banner'
import { WorkoutTemplateCard } from '@/components/workouts/workout-template-card'
import { getUserPlan } from '@/lib/workout-plans'
import { getInProgressWorkoutSession } from '@/lib/workout-sessions'
import { privateRoutes } from '@/lib/config'

interface PlanoPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: PlanoPageProps): Promise<Metadata> {
  const { id } = await params
  const plan = await getUserPlan(id)
  return { title: plan?.name ?? 'Plano de treino' }
}

export default async function PlanoPage({ params }: PlanoPageProps) {
  const { id } = await params
  const [plan, inProgressSession] = await Promise.all([
    getUserPlan(id),
    getInProgressWorkoutSession(),
  ])

  if (!plan) {
    notFound()
  }

  return (
    <Page>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href={privateRoutes.plans} className="hover:underline">
              Planos de treino
            </Link>
          </p>
          <h1 className="text-2xl font-bold">{plan.name}</h1>
          {plan.description && (
            <p className="text-sm text-muted-foreground">{plan.description}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`${privateRoutes.plans}/${plan.id}/editar`}
            className={buttonVariants({ variant: 'secondary', size: 'sm' })}
          >
            <PencilIcon />
            Editar plano
          </Link>
          <DeletePlanDialog
            planId={plan.id}
            planName={plan.name}
            templateCount={plan.templates.length}
            trigger={
              <Button variant="destructive" size="sm">
                <Trash2Icon />
                Excluir plano
              </Button>
            }
          />
        </div>
      </div>

      {inProgressSession && (
        <InProgressSessionBanner session={inProgressSession} />
      )}

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Treinos do plano</h2>
            <p className="text-sm text-muted-foreground">
              Cada treino é um conjunto de exercícios, com séries e repetições
              alvo.
            </p>
          </div>
          <Link
            href={`${privateRoutes.workouts}/novo?plano=${plan.id}`}
            className={buttonVariants()}
          >
            <PlusIcon />
            Novo treino
          </Link>
        </div>

        {plan.templates.length === 0 ? (
          <p className="rounded-md border border-dashed py-12 text-center text-muted-foreground">
            Este plano ainda não tem treinos. Monte o primeiro!
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plan.templates.map((template) => (
              <WorkoutTemplateCard key={template.id} template={template} />
            ))}
          </div>
        )}
      </section>
    </Page>
  )
}
