'use client'

import * as React from 'react'
import { useActionState } from 'react'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { WorkoutTemplateFormState } from '@/lib/actions/workout-templates'
import type { ExerciseOption } from '@/lib/exercises'
import { muscleGroupLabels } from '@/lib/exercise-labels'

interface BuilderItem {
  exerciseId: string
  name: string
  muscleGroup: ExerciseOption['muscleGroup']
  targetSets: number
  targetReps: number
}

interface BuilderRow extends BuilderItem {
  uid: string
}

interface WorkoutTemplateBuilderProps {
  action: (
    prevState: WorkoutTemplateFormState,
    formData: FormData,
  ) => Promise<WorkoutTemplateFormState>
  exerciseOptions: ExerciseOption[]
  template?: {
    id: string
    name: string
    items: BuilderItem[]
  }
}

const initialState: WorkoutTemplateFormState = {}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function ExercisePicker({
  exerciseOptions,
  onPick,
}: {
  exerciseOptions: ExerciseOption[]
  onPick: (option: ExerciseOption) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const filtered = React.useMemo(() => {
    const term = normalize(search.trim())
    if (!term) return exerciseOptions
    return exerciseOptions.filter((option) =>
      normalize(option.name).includes(term),
    )
  }, [exerciseOptions, search])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" variant="outline">
            <PlusIcon />
            Adicionar exercício
          </Button>
        }
      />
      <DialogContent className="max-h-[80svh]">
        <DialogHeader>
          <DialogTitle>Adicionar exercício</DialogTitle>
          <DialogDescription>
            Busque no catálogo e nos seus exercícios custom.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar exercício…"
            className="pl-8"
            autoFocus
          />
        </div>
        <ul className="-mx-1 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-1">
          {filtered.length === 0 && (
            <li className="py-6 text-center text-muted-foreground">
              Nenhum exercício encontrado.
            </li>
          )}
          {filtered.slice(0, 50).map((option) => (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => {
                  onPick(option)
                  setOpen(false)
                  setSearch('')
                }}
                className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
              >
                <span className="min-w-0 truncate">
                  {option.name}
                  {option.isCustom && (
                    <Badge className="ml-1.5 align-middle">Custom</Badge>
                  )}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {muscleGroupLabels[option.muscleGroup]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}

export function WorkoutTemplateBuilder({
  action,
  exerciseOptions,
  template,
}: WorkoutTemplateBuilderProps) {
  const [items, setItems] = React.useState<BuilderRow[]>(() =>
    (template?.items ?? []).map((item) => ({
      ...item,
      uid: crypto.randomUUID(),
    })),
  )
  const [state, formAction, pending] = useActionState(action, initialState)

  const addItem = (option: ExerciseOption) => {
    setItems((prev) => [
      ...prev,
      {
        uid: crypto.randomUUID(),
        exerciseId: option.id,
        name: option.name,
        muscleGroup: option.muscleGroup,
        targetSets: 3,
        targetReps: 10,
      },
    ])
  }

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const moveItem = (index: number, direction: -1 | 1) => {
    setItems((prev) => {
      const target = index + direction
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const updateItem = (
    index: number,
    field: 'targetSets' | 'targetReps',
    value: number,
  ) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    )
  }

  const itemsPayload = JSON.stringify(
    items.map(({ exerciseId, targetSets, targetReps }) => ({
      exerciseId,
      targetSets,
      targetReps,
    })),
  )

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      {template && <input type="hidden" name="id" value={template.id} />}
      <input type="hidden" name="items" value={itemsPayload} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="template-name">Nome do treino</Label>
        <Input
          id="template-name"
          name="name"
          defaultValue={template?.name}
          placeholder="Ex.: Treino A — Peito e tríceps"
          required
          maxLength={80}
        />
        {state.errors?.name && (
          <p className="text-sm text-destructive">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-medium">Exercícios</h2>
          <ExercisePicker exerciseOptions={exerciseOptions} onPick={addItem} />
        </div>

        {items.length === 0 && (
          <p className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
            Nenhum exercício ainda. Adicione o primeiro.
          </p>
        )}

        <ol className="flex flex-col gap-2">
          {items.map((item, index) => (
            <li
              key={item.uid}
              className="flex flex-wrap items-center gap-2 rounded-md border p-2"
            >
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">
                  {index + 1}. {item.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {muscleGroupLabels[item.muscleGroup]}
                </span>
              </div>
              <label className="flex items-center gap-1 text-xs text-muted-foreground">
                Séries
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={item.targetSets}
                  onChange={(event) =>
                    updateItem(index, 'targetSets', Number(event.target.value))
                  }
                  className="h-8 w-16"
                  aria-label={`Séries alvo de ${item.name}`}
                />
              </label>
              <label className="flex items-center gap-1 text-xs text-muted-foreground">
                Reps
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={item.targetReps}
                  onChange={(event) =>
                    updateItem(index, 'targetReps', Number(event.target.value))
                  }
                  className="h-8 w-16"
                  aria-label={`Repetições alvo de ${item.name}`}
                />
              </label>
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={index === 0}
                  onClick={() => moveItem(index, -1)}
                  aria-label={`Mover ${item.name} para cima`}
                >
                  <ArrowUpIcon />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={index === items.length - 1}
                  onClick={() => moveItem(index, 1)}
                  aria-label={`Mover ${item.name} para baixo`}
                >
                  <ArrowDownIcon />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeItem(index)}
                  aria-label={`Remover ${item.name}`}
                >
                  <Trash2Icon className="text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ol>

        {state.errors?.items && (
          <p className="text-sm text-destructive">{state.errors.items[0]}</p>
        )}
        {state.errors?.form && (
          <p className="text-sm text-destructive">{state.errors.form[0]}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Salvando…' : 'Salvar treino'}
        </Button>
      </div>
    </form>
  )
}
