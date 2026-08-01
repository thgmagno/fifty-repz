'use client'

import * as React from 'react'
import { ClockIcon, Trash2Icon, WifiOffIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExercisePanel } from '@/components/sessions/exercise-panel'
import {
  RestTimer,
  type RestTimerHandle,
} from '@/components/sessions/rest-timer'
import { DiscardSessionDialog } from '@/components/sessions/discard-session-dialog'
import { FinishSessionDialog } from '@/components/sessions/finish-session-dialog'
import { useOnlineStatus } from '@/hooks/use-online-status'
import {
  listPendingSets,
  queuePendingSet,
  removePendingSet,
  type PendingSetEntry,
} from '@/lib/offline-db'
import { logSet } from '@/lib/actions/workout-sessions'
import { cn, formatDuration } from '@/lib/utils'
import type { WorkoutSessionDetail } from '@/lib/workout-sessions'

function useElapsedSeconds(startedAt: Date) {
  // Nasce em 0 (igual no server e no client) em vez de Date.now() -
  // startedAt: calcular a partir do relógio no initializer do useState
  // diverge entre o render do servidor e a hidratação no client, causando
  // mismatch. O valor real chega logo no primeiro tick do efeito.
  const [elapsed, setElapsed] = React.useState(0)

  React.useEffect(() => {
    const tick = () => {
      setElapsed(Math.floor((Date.now() - startedAt.getTime()) / 1000))
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [startedAt])

  return elapsed
}

export function WorkoutSessionRunner({
  session,
}: {
  session: WorkoutSessionDetail
}) {
  const elapsed = useElapsedSeconds(session.startedAt)
  const restTimerRef = React.useRef<RestTimerHandle>(null)
  const isOnline = useOnlineStatus()
  const [pendingSets, setPendingSets] = React.useState<PendingSetEntry[]>([])
  const syncingIds = React.useRef(new Set<string>())

  const syncEntry = React.useCallback(async (entry: PendingSetEntry) => {
    if (syncingIds.current.has(entry.localId)) return
    syncingIds.current.add(entry.localId)

    try {
      const formData = new FormData()
      formData.set('sessionExerciseId', entry.sessionExerciseId)
      formData.set('localId', entry.localId)
      formData.set(
        'weightKg',
        entry.weightKg === null ? '' : String(entry.weightKg),
      )
      formData.set('reps', String(entry.reps))

      const result = await logSet({}, formData)

      // sucesso ou rejeição definitiva do servidor: não faz sentido reter
      // na fila (retry infinito só ajuda em falha de rede, coberta pelo catch)
      if (result.success || result.errors) {
        await removePendingSet(entry.localId)
        setPendingSets((current) =>
          current.filter((item) => item.localId !== entry.localId),
        )
      }
    } catch {
      // falha de rede: mantém na fila, tenta de novo quando reconectar
    } finally {
      syncingIds.current.delete(entry.localId)
    }
  }, [])

  // hidrata a fila do IndexedDB ao montar: sobrevive a reload com
  // sincronização pendente
  React.useEffect(() => {
    listPendingSets()
      .then(setPendingSets)
      .catch(() => {})
  }, [])

  // drena a fila sempre que a conexão volta (ou que sobra algo pendente)
  React.useEffect(() => {
    if (!isOnline || pendingSets.length === 0) return
    pendingSets.forEach((entry) => {
      syncEntry(entry)
    })
  }, [isOnline, pendingSets, syncEntry])

  const handleLogSet = React.useCallback(
    (input: {
      sessionExerciseId: string
      weightKg: number | null
      reps: number
    }) => {
      const entry: PendingSetEntry = {
        localId: crypto.randomUUID(),
        createdAt: Date.now(),
        ...input,
      }
      setPendingSets((current) => [...current, entry])
      queuePendingSet(entry).catch(() => {})
      syncEntry(entry)
    },
    [syncEntry],
  )

  // séries da fila offline ainda não estão em session.exercises, mas já
  // contam: elas serão sincronizadas
  const loggedSets =
    pendingSets.length +
    session.exercises.reduce(
      (total, exercise) => total + exercise.sets.length,
      0,
    )

  // as séries da fila também contam aqui: offline, o exercício não pode
  // aparecer como pendente só porque a sincronização não aconteceu ainda
  const pendingByExercise = pendingSets.reduce((total, entry) => {
    total.set(
      entry.sessionExerciseId,
      (total.get(entry.sessionExerciseId) ?? 0) + 1,
    )
    return total
  }, new Map<string, number>())

  const completedExercises = session.exercises.filter(
    (exercise) =>
      exercise.skipped ||
      exercise.sets.length + (pendingByExercise.get(exercise.id) ?? 0) >=
        exercise.targetSets,
  ).length

  const pendingExercises = session.exercises.length - completedExercises
  const allDone = pendingExercises === 0 && session.exercises.length > 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ClockIcon className="size-4" />
          <span className="text-lg font-semibold tabular-nums text-foreground">
            {formatDuration(elapsed)}
          </span>
          <span className="text-sm">
            {completedExercises}/{session.exercises.length} exercícios
          </span>
        </div>
        <div className="flex items-center gap-2">
          <DiscardSessionDialog
            sessionId={session.id}
            loggedSets={loggedSets}
            trigger={
              <Button variant="ghost" size="lg" className="text-destructive">
                <Trash2Icon />
                Descartar
              </Button>
            }
          />
          <FinishSessionDialog
            sessionId={session.id}
            loggedSets={loggedSets}
            totalExercises={session.exercises.length}
            pendingExercises={pendingExercises}
          />
        </div>
      </div>

      {(!isOnline || pendingSets.length > 0) && (
        <div className="flex items-center gap-2 rounded-md border border-dashed p-2 text-sm text-muted-foreground">
          <WifiOffIcon className="size-4 shrink-0" />
          {!isOnline ? (
            <span>
              Você está offline. As séries continuam sendo registradas e
              {pendingSets.length > 0
                ? ` ${pendingSets.length} serão sincronizadas quando a conexão voltar.`
                : ' serão sincronizadas quando a conexão voltar.'}
            </span>
          ) : (
            <span>
              Sincronizando {pendingSets.length}{' '}
              {pendingSets.length === 1 ? 'série pendente' : 'séries pendentes'}
              …
            </span>
          )}
        </div>
      )}

      <RestTimer ref={restTimerRef} />

      <ol className="flex flex-col gap-3">
        {session.exercises.map((exercise, index) => (
          <ExercisePanel
            key={exercise.id}
            exercise={exercise}
            index={index}
            onSetLogged={() => restTimerRef.current?.start()}
            pendingSets={pendingSets.filter(
              (entry) => entry.sessionExerciseId === exercise.id,
            )}
            onLogSet={handleLogSet}
          />
        ))}
      </ol>

      {/* o "Finalizar" de cima fica longe depois de rolar cinco exercícios:
          quem termina a última série encontra o encerramento ali mesmo */}
      <div
        className={cn(
          'flex flex-col items-center gap-2 rounded-md border p-4 text-center',
          allDone && 'border-primary/40 bg-primary/5',
        )}
      >
        <p className="font-medium">
          {allDone
            ? 'Treino completo!'
            : `${completedExercises} de ${session.exercises.length} exercícios concluídos`}
        </p>
        <p className="text-sm text-muted-foreground">
          {allDone
            ? 'Todos os exercícios têm as séries registradas.'
            : 'Dá para finalizar mesmo com exercícios pendentes.'}
        </p>
        <FinishSessionDialog
          sessionId={session.id}
          loggedSets={loggedSets}
          totalExercises={session.exercises.length}
          pendingExercises={pendingExercises}
        />
      </div>
    </div>
  )
}
