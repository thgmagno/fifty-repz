import type { Metadata } from 'next'
import { WorkoutTemplateBuilder } from '@/components/workouts/workout-template-builder'
import { createWorkoutTemplate } from '@/lib/actions/workout-templates'
import { listExerciseOptions } from '@/lib/exercises'

export const metadata: Metadata = {
  title: 'Novo treino',
}

export default async function NovoTreinoPage() {
  const exerciseOptions = await listExerciseOptions()

  return (
    <main className="flex flex-col gap-6 py-4">
      <div>
        <h1 className="text-2xl font-bold">Novo treino</h1>
        <p className="text-sm text-muted-foreground">
          Dê um nome, adicione exercícios e defina séries e reps alvo.
        </p>
      </div>
      <WorkoutTemplateBuilder
        action={createWorkoutTemplate}
        exerciseOptions={exerciseOptions}
      />
    </main>
  )
}
