import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Page } from '@/components/page'
import { WorkoutTemplateBuilder } from '@/components/workouts/workout-template-builder'
import { updateWorkoutTemplate } from '@/lib/actions/workout-templates'
import { listExerciseOptions } from '@/lib/exercises'
import { listUserPlanOptions } from '@/lib/workout-plans'
import { getWorkoutTemplate } from '@/lib/workout-templates'

export const metadata: Metadata = {
  title: 'Editar treino',
}

export default async function EditarTreinoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [template, exerciseOptions, plans] = await Promise.all([
    getWorkoutTemplate(id),
    listExerciseOptions(),
    listUserPlanOptions(),
  ])

  if (!template || plans.length === 0) {
    notFound()
  }

  return (
    <Page>
      <div>
        <h1 className="text-2xl font-bold">Editar treino</h1>
        <p className="text-sm text-muted-foreground">
          Ajuste nome, exercícios, ordem e metas de séries/reps.
        </p>
      </div>
      <WorkoutTemplateBuilder
        action={updateWorkoutTemplate}
        exerciseOptions={exerciseOptions}
        plans={plans}
        defaultPlanId={
          plans.find((plan) => plan.id === template.programId)?.id ??
          plans[0].id
        }
        template={{
          id: template.id,
          name: template.name,
          items: template.exercises.map((item) => ({
            exerciseId: item.exercise.id,
            name: item.exercise.name,
            muscleGroup: item.exercise.muscleGroup,
            targetSets: item.targetSets,
            targetReps: item.targetReps,
            targetRepsMax: item.targetRepsMax,
          })),
        }}
      />
    </Page>
  )
}
