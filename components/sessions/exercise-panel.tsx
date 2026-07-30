'use client'

import * as React from 'react'
import { SkipForwardIcon, Trash2Icon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deleteSet, toggleSkipExercise } from '@/lib/actions/workout-sessions'
import type { WorkoutSessionExerciseDetail } from '@/lib/workout-sessions'
import type { PendingSetEntry } from '@/lib/offline-db'
import { cn, formatRepTarget } from '@/lib/utils'

interface ExercisePanelProps {
  exercise: WorkoutSessionExerciseDetail
  index: number
  onSetLogged: () => void
  pendingSets: PendingSetEntry[]
  onLogSet: (input: {
    sessionExerciseId: string
    weightKg: number | null
    reps: number
  }) => void
}

export function ExercisePanel({
  exercise,
  index,
  onSetLogged,
  pendingSets,
  onLogSet,
}: ExercisePanelProps) {
  const formRef = React.useRef<HTMLFormElement>(null)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [pendingExtraSet, setPendingExtraSet] = React.useState<{
    weightKg: number | null
    reps: number
  } | null>(null)

  const setsDone = exercise.sets.length + pendingSets.length
  const isComplete = setsDone >= exercise.targetSets

  function logSet(input: { weightKg: number | null; reps: number }) {
    onLogSet({ sessionExerciseId: exercise.id, ...input })
    onSetLogged()
    formRef.current?.reset()
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const formData = new FormData(event.currentTarget)
    const rawReps = String(formData.get('reps') ?? '')
    const reps = Number(rawReps)
    if (!Number.isInteger(reps) || reps < 1 || reps > 200) {
      setFormError('Informe repetições entre 1 e 200.')
      return
    }

    const rawWeight = String(formData.get('weightKg') ?? '').replace(',', '.')
    let weightKg: number | null = null
    if (rawWeight !== '') {
      weightKg = Number(rawWeight)
      if (Number.isNaN(weightKg) || weightKg < 0 || weightKg > 1000) {
        setFormError('Peso precisa estar entre 0 e 1000 kg.')
        return
      }
    }

    if (isComplete) {
      setPendingExtraSet({ weightKg, reps })
      return
    }

    logSet({ weightKg, reps })
  }

  const confirmExtraSet = () => {
    if (!pendingExtraSet) return
    logSet(pendingExtraSet)
    setPendingExtraSet(null)
  }

  const handleExtraSetDialogOpenChange = (open: boolean) => {
    if (!open) setPendingExtraSet(null)
  }

  return (
    <li
      className={cn(
        'flex flex-col gap-3 rounded-md border p-3',
        !exercise.skipped && isComplete && 'border-primary/30 bg-primary/5',
      )}
      data-skipped={exercise.skipped}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-medium">
            {index + 1}. {exercise.exerciseName}
          </h3>
          <p className="text-xs text-muted-foreground">
            Alvo:{' '}
            {formatRepTarget(
              exercise.targetSets,
              exercise.targetReps,
              exercise.targetRepsMax,
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {exercise.skipped && <Badge variant="secondary">Pulado</Badge>}
          {!exercise.skipped && isComplete && (
            <Badge>
              {setsDone}/{exercise.targetSets} séries
            </Badge>
          )}
          {!exercise.skipped && !isComplete && setsDone > 0 && (
            <Badge variant="outline">
              {setsDone}/{exercise.targetSets} séries
            </Badge>
          )}
          <form action={toggleSkipExercise}>
            <input type="hidden" name="sessionExerciseId" value={exercise.id} />
            <Button type="submit" variant="ghost" size="sm">
              <SkipForwardIcon />
              {exercise.skipped ? 'Cancelar pular' : 'Pular'}
            </Button>
          </form>
        </div>
      </div>

      {(exercise.sets.length > 0 || pendingSets.length > 0) && (
        <ul className="flex flex-col gap-1">
          {exercise.sets.map((set) => (
            <li
              key={set.id}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <span>
                Série {set.setNumber}:{' '}
                {set.weightKg ? `${set.weightKg}kg × ` : ''}
                {set.reps} reps
              </span>
              <form action={deleteSet}>
                <input type="hidden" name="setId" value={set.id} />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Excluir série ${set.setNumber}`}
                >
                  <Trash2Icon className="text-destructive" />
                </Button>
              </form>
            </li>
          ))}
          {pendingSets.map((entry, pendingIndex) => (
            <li
              key={entry.localId}
              className="flex items-center justify-between gap-2 text-sm text-muted-foreground"
            >
              <span>
                Série {exercise.sets.length + pendingIndex + 1}:{' '}
                {entry.weightKg ? `${entry.weightKg}kg × ` : ''}
                {entry.reps} reps
              </span>
              <Badge variant="outline">Sincronizando…</Badge>
            </li>
          ))}
        </ul>
      )}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-wrap items-end gap-2"
      >
        <div className="flex flex-col gap-1">
          <label
            htmlFor={`weight-${exercise.id}`}
            className="text-xs text-muted-foreground"
          >
            Peso (kg)
          </label>
          <Input
            id={`weight-${exercise.id}`}
            name="weightKg"
            type="number"
            step="0.5"
            min="0"
            placeholder="—"
            className="h-8 w-20"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor={`reps-${exercise.id}`}
            className="text-xs text-muted-foreground"
          >
            Reps
          </label>
          <Input
            id={`reps-${exercise.id}`}
            name="reps"
            type="number"
            min="1"
            max="200"
            defaultValue={exercise.targetReps}
            required
            className="h-8 w-16"
          />
        </div>
        <Button type="submit" size="sm">
          Registrar série
        </Button>
      </form>
      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <AlertDialog
        open={pendingExtraSet !== null}
        onOpenChange={handleExtraSetDialogOpenChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Meta já atingida</AlertDialogTitle>
            <AlertDialogDescription>
              Você já registrou {setsDone} de {exercise.targetSets} séries deste
              exercício. Quer registrar essa série extra mesmo assim?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose render={<Button variant="outline" />}>
              Cancelar
            </AlertDialogClose>
            <Button onClick={confirmExtraSet}>Registrar mesmo assim</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  )
}
