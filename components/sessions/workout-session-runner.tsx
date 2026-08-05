'use client'

import * as React from 'react'
import {
  AlertTriangleIcon,
  ClockIcon,
  Trash2Icon,
  WifiOffIcon,
} from 'lucide-react'
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
  const [syncError, setSyncError] = React.useState<string | null>(null)
  const syncingIds = React.useRef(new Set<string>())
  // séries que o servidor já resolveu (gravadas ou recusadas em definitivo):
  // um dreno posterior que ainda carregue a entrada não a reenvia
  const settledIds = React.useRef(new Set<string>())

  // A falha ao apagar do IndexedDB não pode segurar o estado da tela: a série
  // já foi resolvida pelo servidor e precisa sair da fila em memória de
  // qualquer jeito. Como finalizar agora espera a fila esvaziar, deixar a
  // entrada presa aqui travaria o treino esperando um dreno que nunca vem.
  const dropEntry = React.useCallback(async (localId: string) => {
    settledIds.current.add(localId)
    try {
      await removePendingSet(localId)
    } catch {
      // armazenamento indisponível: o estado abaixo é o que governa a UI
    }
    setPendingSets((current) =>
      current.filter((item) => item.localId !== localId),
    )
  }, [])

  const syncEntry = React.useCallback(
    async (entry: PendingSetEntry) => {
      if (
        syncingIds.current.has(entry.localId) ||
        settledIds.current.has(entry.localId)
      ) {
        return
      }
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

        if (result.success) {
          await dropEntry(entry.localId)
          return
        }

        // Rejeição definitiva do servidor: retry não resolve, então a série
        // sai da fila. Mas nunca em silêncio — ela representa um esforço que
        // o usuário já viu registrado na tela, e sumir sem aviso é pior do
        // que a falha em si.
        if (result.errors) {
          await dropEntry(entry.localId)
          setSyncError(
            result.errors.form?.[0] ??
              result.errors.reps?.[0] ??
              result.errors.weightKg?.[0] ??
              'Uma série não pôde ser salva e foi descartada.',
          )
        }
      } catch {
        // falha de rede: mantém na fila, tenta de novo quando reconectar
      } finally {
        syncingIds.current.delete(entry.localId)
      }
    },
    [dropEntry],
  )

  // hidrata a fila do IndexedDB ao montar: sobrevive a reload com
  // sincronização pendente
  React.useEffect(() => {
    listPendingSets()
      .then(setPendingSets)
      .catch(() => {})
  }, [])

  // Dreno serializado. O servidor numera a série pela contagem já existente,
  // então duas séries do mesmo exercício enviadas em paralelo receberiam o
  // mesmo número — era o que acontecia ao drenar a fila com um forEach. A
  // corrente de promessas garante uma série por vez, na ordem de criação
  // (que é a ordem em que `pendingSets` é montado, tanto na hidratação
  // quanto ao registrar).
  const drainChain = React.useRef<Promise<void>>(Promise.resolve())

  const drainQueue = React.useCallback(
    (entries: PendingSetEntry[]) => {
      if (entries.length === 0) return
      // encadear em vez de Promise.all: é o "uma por vez" desta função
      const run = () =>
        entries.reduce(
          (chain, entry) => chain.then(() => syncEntry(entry)),
          Promise.resolve(),
        )
      // `then(run, run)` em vez de `finally`: a corrente segue mesmo que o
      // dreno anterior tenha rejeitado, senão uma falha a interromperia
      // para sempre
      drainChain.current = drainChain.current.then(run, run).catch(() => {})
    },
    [syncEntry],
  )

  // drena a fila sempre que a conexão volta (ou que sobra algo pendente)
  React.useEffect(() => {
    if (!isOnline) return
    drainQueue(pendingSets)
  }, [isOnline, pendingSets, drainQueue])

  // Saída manual: uma falha de rede mantém a série na fila, mas o efeito
  // acima só roda de novo quando `isOnline` muda ou quando outra série é
  // registrada. Sem este botão, uma conexão que cai sem o navegador marcar
  // `offline` deixaria a sincronização parada — e, como finalizar agora
  // espera a fila esvaziar, o treino ficaria travado até recarregar a página.
  const retrySync = React.useCallback(() => {
    setSyncError(null)
    drainQueue(pendingSets)
  }, [drainQueue, pendingSets])

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
      // o envio fica por conta do efeito de dreno, que reage à mudança de
      // `pendingSets`: assim existe um caminho único e serializado de saída
      setPendingSets((current) => [...current, entry])
      queuePendingSet(entry).catch(() => {})
    },
    [],
  )

  // A fila do IndexedDB é global, não por sessão: pode sobrar nela série de
  // uma sessão anterior (descartada ou trocada) ainda não sincronizada. Só
  // as desta sessão entram nas contas daqui — senão uma sobra de outro
  // treino inflaria o contador e, pior, seguraria o "Finalizar" deste.
  const sessionExerciseIds = new Set(
    session.exercises.map((exercise) => exercise.id),
  )
  const sessionPendingSets = pendingSets.filter((entry) =>
    sessionExerciseIds.has(entry.sessionExerciseId),
  )

  // séries da fila offline ainda não estão em session.exercises, mas já
  // contam: elas serão sincronizadas
  const loggedSets =
    sessionPendingSets.length +
    session.exercises.reduce(
      (total, exercise) => total + exercise.sets.length,
      0,
    )

  // as séries da fila também contam aqui: offline, o exercício não pode
  // aparecer como pendente só porque a sincronização não aconteceu ainda
  const pendingByExercise = sessionPendingSets.reduce((total, entry) => {
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

  // "concluído" junta duas coisas diferentes — o que foi feito e o que foi
  // marcado como não feito. Com algum marcado, o cabeçalho separa os dois.
  const skippedExercises = session.exercises.filter(
    (exercise) => exercise.skipped,
  ).length
  const doneExercises = completedExercises - skippedExercises

  const progressLabel =
    skippedExercises > 0
      ? `${doneExercises} ${doneExercises === 1 ? 'feito' : 'feitos'} e ${skippedExercises} não ${skippedExercises === 1 ? 'feito' : 'feitos'}, de ${session.exercises.length}`
      : `${completedExercises}/${session.exercises.length} exercícios`

  const pendingSyncCount = sessionPendingSets.length

  function finishHint() {
    // a sincronização vem antes de qualquer outra leitura do estado: enquanto
    // ela não termina, "completo" ainda não é verdade no servidor
    if (pendingSyncCount > 0) {
      return pendingSyncCount === 1
        ? '1 série ainda está sendo salva. Dá para finalizar assim que ela terminar.'
        : `${pendingSyncCount} séries ainda estão sendo salvas. Dá para finalizar assim que elas terminarem.`
    }
    if (!allDone) return 'Dá para finalizar mesmo com exercícios pendentes.'
    if (skippedExercises === 0) {
      return 'Todos os exercícios têm as séries registradas.'
    }
    return skippedExercises === 1
      ? '1 exercício ficou como não feito; o resto tem as séries registradas.'
      : `${skippedExercises} exercícios ficaram como não feitos; o resto tem as séries registradas.`
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ClockIcon className="size-4" />
          <span className="text-lg font-semibold tabular-nums text-foreground">
            {formatDuration(elapsed)}
          </span>
          <span className="text-sm">{progressLabel}</span>
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
            pendingSyncCount={pendingSyncCount}
          />
        </div>
      </div>

      {(!isOnline || pendingSyncCount > 0) && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-dashed p-2 text-sm text-muted-foreground">
          <WifiOffIcon className="size-4 shrink-0" />
          {!isOnline ? (
            <span>
              Você está offline. As séries continuam sendo registradas e
              {pendingSyncCount > 0
                ? ` ${pendingSyncCount} serão sincronizadas quando a conexão voltar.`
                : ' serão sincronizadas quando a conexão voltar.'}
            </span>
          ) : (
            <>
              <span>
                Sincronizando {pendingSyncCount}{' '}
                {pendingSyncCount === 1 ? 'série pendente' : 'séries pendentes'}
                …
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={retrySync}
              >
                Tentar agora
              </Button>
            </>
          )}
        </div>
      )}

      {syncError && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-2 text-sm text-destructive">
          <AlertTriangleIcon className="size-4 shrink-0" />
          <span>{syncError} Registre-a de novo antes de finalizar.</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setSyncError(null)}
          >
            Entendi
          </Button>
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
        <p className="text-sm text-muted-foreground">{finishHint()}</p>
        <FinishSessionDialog
          sessionId={session.id}
          loggedSets={loggedSets}
          totalExercises={session.exercises.length}
          pendingExercises={pendingExercises}
          pendingSyncCount={pendingSyncCount}
        />
      </div>
    </div>
  )
}
