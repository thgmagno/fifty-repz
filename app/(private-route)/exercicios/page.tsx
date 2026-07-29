import type { Metadata } from 'next'
import { PlusIcon, SearchIcon } from 'lucide-react'
import { Page } from '@/components/page'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { ExerciseCard } from '@/components/exercises/exercise-card'
import { ExerciseFormDialog } from '@/components/exercises/exercise-form-dialog'
import { listExercises } from '@/lib/exercises'
import { muscleGroupLabels } from '@/lib/exercise-labels'
import { MuscleGroup } from '@/lib/generated/prisma/enums'

export const metadata: Metadata = {
  title: 'Exercícios',
}

function parseMuscleGroup(value: string | undefined) {
  return value && value in MuscleGroup ? (value as MuscleGroup) : undefined
}

export default async function ExerciciosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; grupo?: string }>
}) {
  const { q, grupo } = await searchParams
  const muscleGroup = parseMuscleGroup(grupo)
  const exercises = await listExercises({ query: q, muscleGroup })

  return (
    <Page>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Exercícios</h1>
          <p className="text-sm text-muted-foreground">
            Catálogo padronizado + seus exercícios custom.
          </p>
        </div>
        <ExerciseFormDialog
          trigger={
            <Button>
              <PlusIcon />
              Novo exercício
            </Button>
          }
        />
      </div>

      <form className="flex flex-wrap gap-2" action="/exercicios">
        <div className="min-w-48 flex-1">
          <Input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar exercício…"
            aria-label="Buscar exercício"
          />
        </div>
        <div className="w-56">
          <NativeSelect
            name="grupo"
            defaultValue={muscleGroup ?? ''}
            aria-label="Filtrar por grupo muscular"
          >
            <option value="">Todos os grupos</option>
            {Object.values(MuscleGroup).map((group) => (
              <option key={group} value={group}>
                {muscleGroupLabels[group]}
              </option>
            ))}
          </NativeSelect>
        </div>
        <Button type="submit" variant="outline">
          <SearchIcon />
          Buscar
        </Button>
      </form>

      {exercises.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">
          Nenhum exercício encontrado. Ajuste a busca ou crie um exercício
          custom.
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {exercises.length}{' '}
            {exercises.length === 1
              ? 'exercício encontrado'
              : 'exercícios encontrados'}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {exercises.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
        </>
      )}
    </Page>
  )
}
