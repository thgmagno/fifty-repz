'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { muscleGroupLabels } from '@/lib/exercise-labels'
import { privateRoutes } from '@/lib/config'
import { MuscleGroup } from '@/lib/generated/prisma/enums'

const DEBOUNCE_MS = 300

// Filtrar é o caminho principal do catálogo: a busca acontece enquanto se
// digita, sem depender de um clique. O <form> continua de pé para quem está
// sem JavaScript.
export function ExerciseFilters({
  query,
  muscleGroup,
}: {
  query?: string
  muscleGroup?: MuscleGroup
}) {
  const router = useRouter()
  const [text, setText] = React.useState(query ?? '')
  const [isPending, startTransition] = React.useTransition()

  const apply = React.useCallback(
    (next: { q: string; grupo: string }) => {
      const params = new URLSearchParams()
      if (next.q) params.set('q', next.q)
      if (next.grupo) params.set('grupo', next.grupo)
      // filtro novo recomeça da primeira página: o "p" antigo fica de fora
      const search = params.toString()
      startTransition(() => {
        router.replace(
          search
            ? `${privateRoutes.exercises}?${search}`
            : privateRoutes.exercises,
        )
      })
    },
    [router],
  )

  // uma navegação por pausa na digitação, não uma por tecla
  React.useEffect(() => {
    if (text === (query ?? '')) return undefined

    const timer = setTimeout(
      () => apply({ q: text, grupo: muscleGroup ?? '' }),
      DEBOUNCE_MS,
    )
    return () => clearTimeout(timer)
  }, [text, query, muscleGroup, apply])

  return (
    <form className="flex flex-wrap items-center gap-2" action="/exercicios">
      <div className="min-w-48 flex-1">
        <Input
          type="search"
          name="q"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Buscar exercício…"
          aria-label="Buscar exercício"
        />
      </div>
      <div className="w-56">
        <Select
          name="grupo"
          value={muscleGroup ?? ''}
          onValueChange={(value) =>
            apply({ q: text, grupo: typeof value === 'string' ? value : '' })
          }
          items={{ '': 'Todos os grupos', ...muscleGroupLabels }}
        >
          <SelectTrigger aria-label="Filtrar por grupo muscular">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os grupos</SelectItem>
            {Object.values(MuscleGroup).map((group) => (
              <SelectItem key={group} value={group}>
                {muscleGroupLabels[group]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* sem JavaScript, este botão é o que envia o formulário */}
      <Button type="submit" variant="outline" size="icon" aria-label="Buscar">
        <SearchIcon />
      </Button>
      {isPending && (
        <span className="text-sm text-muted-foreground">Buscando…</span>
      )}
    </form>
  )
}
