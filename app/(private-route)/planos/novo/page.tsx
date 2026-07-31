import type { Metadata } from 'next'
import { Page } from '@/components/page'
import { PlanForm } from '@/components/plans/plan-form'
import { createWorkoutPlan } from '@/lib/actions/workout-plans'

export const metadata: Metadata = {
  title: 'Novo plano de treino',
}

export default async function NovoPlanoPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams

  return (
    <Page>
      <div>
        <h1 className="text-2xl font-bold">Novo plano de treino</h1>
        <p className="text-sm text-muted-foreground">
          O plano é o pacote que guarda seus treinos — por exemplo, um ABC de
          academia. Depois de criá-lo, você monta os treinos dentro dele.
        </p>
      </div>
      <PlanForm
        action={createWorkoutPlan}
        next={next === 'treino' ? 'treino' : undefined}
        submitLabel="Criar plano"
      />
    </Page>
  )
}
