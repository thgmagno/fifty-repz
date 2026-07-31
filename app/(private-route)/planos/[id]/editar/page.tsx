import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Page } from '@/components/page'
import { PlanForm } from '@/components/plans/plan-form'
import { updateWorkoutPlan } from '@/lib/actions/workout-plans'
import { getUserPlan } from '@/lib/workout-plans'

export const metadata: Metadata = {
  title: 'Editar plano de treino',
}

export default async function EditarPlanoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const plan = await getUserPlan(id)

  if (!plan) {
    notFound()
  }

  return (
    <Page>
      <div>
        <h1 className="text-2xl font-bold">Editar plano</h1>
        <p className="text-sm text-muted-foreground">
          Ajuste o nome e a descrição do plano. Os treinos continuam os mesmos.
        </p>
      </div>
      <PlanForm
        action={updateWorkoutPlan}
        plan={{
          id: plan.id,
          name: plan.name,
          description: plan.description,
        }}
        submitLabel="Salvar plano"
      />
    </Page>
  )
}
