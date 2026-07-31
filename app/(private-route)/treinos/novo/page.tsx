import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Page } from '@/components/page'
import { WorkoutTemplateBuilder } from '@/components/workouts/workout-template-builder'
import { createWorkoutTemplate } from '@/lib/actions/workout-templates'
import { listExerciseOptions } from '@/lib/exercises'
import { listUserPlanOptions } from '@/lib/workout-plans'
import { privateRoutes } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Novo treino',
}

export default async function NovoTreinoPage({
  searchParams,
}: {
  searchParams: Promise<{ plano?: string }>
}) {
  const [{ plano }, exerciseOptions, plans] = await Promise.all([
    searchParams,
    listExerciseOptions(),
    listUserPlanOptions(),
  ])

  // não existe treino avulso: sem nenhum plano, o primeiro passo é criá-lo
  if (plans.length === 0) {
    redirect(`${privateRoutes.plans}/novo?next=treino`)
  }

  const defaultPlanId =
    plans.find((plan) => plan.id === plano)?.id ?? plans[0].id

  return (
    <Page>
      <div>
        <h1 className="text-2xl font-bold">Novo treino</h1>
        <p className="text-sm text-muted-foreground">
          Escolha o plano, dê um nome, adicione exercícios e defina séries e
          reps alvo.
        </p>
      </div>
      <WorkoutTemplateBuilder
        action={createWorkoutTemplate}
        exerciseOptions={exerciseOptions}
        plans={plans}
        defaultPlanId={defaultPlanId}
      />
    </Page>
  )
}
