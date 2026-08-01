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
import { ExerciseHowToDialog } from '@/components/sessions/exercise-how-to-dialog'
import type { WorkoutSessionExerciseDetail } from '@/lib/workout-sessions'
import type { PendingSetEntry } from '@/lib/offline-db'
import { cn, formatRepTargetLong } from '@/lib/utils'

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
  const [formError, setFormError] = React.useState<string | null>(null)
  const [pendingExtraSet, setPendingExtraSet] = React.useState<{
    weightKg: number | null
    reps: number
  } | null>(null)

  const setsDone = exercise.sets.length + pendingSets.length
  const isComplete = setsDone >= exercise.targetSets

  // valores iniciais do formulário, na ordem em que fazem sentido: a última
  // série desta sessão, a última vez que este exercício foi feito, e por fim
  // a meta do treino
  const lastSet =
    pendingSets[pendingSets.length - 1] ??
    exercise.sets[exercise.sets.length - 1] ??
    exercise.previousSet
  const defaultWeight = lastSet?.weightKg ?? ''
  const defaultReps = lastSet?.reps ?? exercise.targetReps

  // sem série anterior nenhuma: é a primeira vez que a pessoa faz este
  // exercício, e "quanto peso eu coloco?" não tem resposta em lugar nenhum
  const isFirstTime = !lastSet

  // sem reset: o peso e as repetições da série que acabou de ser registrada
  // continuam no formulário, porque quase sempre se repetem na próxima
  function logSet(input: { weightKg: number | null; reps: number }) {
    onLogSet({ sessionExerciseId: exercise.id, ...input })
    onSetLogged()
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
        !exercise.skipped &&
        isComplete &&
        'border-green-500/60 bg-green-500/10 dark:border-green-400/50 dark:bg-green-400/10',
      )}
      data-skipped={exercise.skipped}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-medium">
            {index + 1}. {exercise.exerciseName}
          </h3>
          <p className="text-xs text-muted-foreground">
            Meta:{' '}
            {formatRepTargetLong(
              exercise.targetSets,
              exercise.targetReps,
              exercise.targetRepsMax,
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {exercise.skipped && (
            <Badge variant="secondary">Não feito hoje</Badge>
          )}
          {/* aparece desde 0/3: antes da primeira série também é preciso
              saber quantas faltam */}
          {!exercise.skipped && (
            <Badge variant={isComplete ? 'default' : 'outline'}>
              {setsDone}/{exercise.targetSets} séries
            </Badge>
          )}
          {exercise.exercise && (
            <ExerciseHowToDialog
              exerciseName={exercise.exerciseName}
              imageUrls={exercise.exercise.imageUrls}
              instructions={exercise.exercise.instructions}
            />
          )}
          <form action={toggleSkipExercise}>
            <input type="hidden" name="sessionExerciseId" value={exercise.id} />
            <Button type="submit" variant="ghost" size="sm">
              <SkipForwardIcon />
              {exercise.skipped ? 'Voltar a fazer' : 'Não fiz hoje'}
            </Button>
          </form>
        </div>
      </div>

      {/* o efeito de marcar não é óbvio pelo botão: o exercício deixa de
          aparecer como pendente ao finalizar o treino */}
      {exercise.skipped && (
        <p className="text-xs text-muted-foreground">
          Este exercício não fica pendente ao finalizar o treino. As séries
          registradas nele continuam salvas.
        </p>
      )}

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
                {set.reps} {set.reps === 1 ? 'repetição' : 'repetições'}
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
                {entry.reps} {entry.reps === 1 ? 'repetição' : 'repetições'}
              </span>
              <Badge variant="outline">Sincronizando…</Badge>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1">
          <label
            htmlFor={`weight-${exercise.id}`}
            className="text-xs text-muted-foreground"
          >
            Peso (kg) · opcional
          </label>
          <Input
            id={`weight-${exercise.id}`}
            name="weightKg"
            type="number"
            step="0.5"
            min="0"
            placeholder="—"
            defaultValue={defaultWeight}
            className="h-8 w-20"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor={`reps-${exercise.id}`}
            className="text-xs text-muted-foreground"
          >
            Repetições
          </label>
          <Input
            id={`reps-${exercise.id}`}
            name="reps"
            type="number"
            min="1"
            max="200"
            defaultValue={defaultReps}
            className="h-8 w-16"
          />
        </div>
        <Button type="submit" size="sm">
          Registrar série
        </Button>
      </form>
      {isFirstTime && (
        <p className="text-xs text-muted-foreground">
          Primeira vez neste exercício: comece leve, com um peso que dê para
          fazer todas as repetições com boa execução. Em exercício de peso
          corporal, deixe o peso em branco.
        </p>
      )}
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
