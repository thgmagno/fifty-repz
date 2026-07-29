'use client'

import * as React from 'react'
import { useActionState } from 'react'
import { SkipForwardIcon, Trash2Icon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  logSet,
  deleteSet,
  toggleSkipExercise,
  type LogSetFormState,
} from '@/lib/actions/workout-sessions'
import type { WorkoutSessionExerciseDetail } from '@/lib/workout-sessions'
import { formatRepTarget } from '@/lib/utils'

interface ExercisePanelProps {
  exercise: WorkoutSessionExerciseDetail
  index: number
  onSetLogged: () => void
}

const logSetInitialState: LogSetFormState = {}

export function ExercisePanel({
  exercise,
  index,
  onSetLogged,
}: ExercisePanelProps) {
  const formRef = React.useRef<HTMLFormElement>(null)
  const [state, formAction, pending] = useActionState(
    logSet,
    logSetInitialState,
  )

  React.useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
      onSetLogged()
    }
    // onSetLogged é estável o suficiente aqui: só precisa disparar por novo log
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.loggedAt])

  const setsDone = exercise.sets.length
  const isComplete = setsDone >= exercise.targetSets

  return (
    <li
      className="flex flex-col gap-3 rounded-md border p-3"
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

      {exercise.sets.length > 0 && (
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
        </ul>
      )}

      <form
        ref={formRef}
        action={formAction}
        className="flex flex-wrap items-end gap-2"
      >
        <input type="hidden" name="sessionExerciseId" value={exercise.id} />
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
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? 'Registrando…' : 'Registrar série'}
        </Button>
      </form>
      {state.errors?.weightKg && (
        <p className="text-sm text-destructive">{state.errors.weightKg[0]}</p>
      )}
      {state.errors?.reps && (
        <p className="text-sm text-destructive">{state.errors.reps[0]}</p>
      )}
      {state.errors?.form && (
        <p className="text-sm text-destructive">{state.errors.form[0]}</p>
      )}
    </li>
  )
}
