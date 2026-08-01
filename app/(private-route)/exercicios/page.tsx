import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from 'lucide-react'
import { Page } from '@/components/page'
import { Button, buttonVariants } from '@/components/ui/button'
import { ExerciseCard } from '@/components/exercises/exercise-card'
import { ExerciseFilters } from '@/components/exercises/exercise-filters'
import { ExerciseFormDialog } from '@/components/exercises/exercise-form-dialog'
import { EXERCISES_PAGE_SIZE, listExercises } from '@/lib/exercises'
import { privateRoutes } from '@/lib/config'
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
  searchParams: Promise<{ q?: string; grupo?: string; p?: string }>
}) {
  const { q, grupo, p } = await searchParams
  const muscleGroup = parseMuscleGroup(grupo)
  const { exercises, total, page, pageCount } = await listExercises({
    query: q,
    muscleGroup,
    page: Number(p) || 1,
  })

  function pageHref(target: number) {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (muscleGroup) params.set('grupo', muscleGroup)
    if (target > 1) params.set('p', String(target))
    const search = params.toString()
    return search
      ? `${privateRoutes.exercises}?${search}`
      : privateRoutes.exercises
  }

  const firstShown = (page - 1) * EXERCISES_PAGE_SIZE + 1
  const lastShown = firstShown + exercises.length - 1

  return (
    <Page>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 id="topo" className="text-2xl font-bold">
            Exercícios
          </h1>
          <p className="text-sm text-muted-foreground">
            O catálogo do app mais os exercícios que você criou.
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

      <ExerciseFilters query={q} muscleGroup={muscleGroup} />

      {exercises.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">
          Nenhum exercício encontrado. Ajuste a busca ou crie o seu.
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {total === 1
              ? '1 exercício encontrado'
              : `${total} exercícios encontrados`}
            {pageCount > 1 && ` · mostrando ${firstShown} a ${lastShown}`}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {exercises.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>

          {pageCount > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              {page > 1 ? (
                /* scroll={false}: os controles ficam no fim da lista, e subir
                   ao topo a cada página tiraria o próximo clique do lugar */
                <Link
                  href={pageHref(page - 1)}
                  scroll={false}
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  <ChevronLeftIcon />
                  Anterior
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeftIcon />
                  Anterior
                </Button>
              )}

              <span className="text-sm text-muted-foreground">
                Página {page} de {pageCount}
              </span>

              {page < pageCount ? (
                <Link
                  href={pageHref(page + 1)}
                  scroll={false}
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  Próxima
                  <ChevronRightIcon />
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Próxima
                  <ChevronRightIcon />
                </Button>
              )}

              {/* rolar 30 cards e ter que subir na mão era o outro lado do
                  problema da lista sem fim */}
              <a
                href="#topo"
                className={buttonVariants({ variant: 'ghost', size: 'sm' })}
              >
                <ArrowUpIcon />
                Voltar ao topo
              </a>
            </div>
          )}
        </>
      )}
    </Page>
  )
}
