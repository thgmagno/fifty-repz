'use client'

import * as React from 'react'
import { ClockIcon } from 'lucide-react'
import { ExercisePanel } from '@/components/sessions/exercise-panel'
import {
  RestTimer,
  type RestTimerHandle,
} from '@/components/sessions/rest-timer'
import { FinishSessionDialog } from '@/components/sessions/finish-session-dialog'
import { formatDuration } from '@/lib/utils'
import type { WorkoutSessionDetail } from '@/lib/workout-sessions'

function useElapsedSeconds(startedAt: Date) {
  const [elapsed, setElapsed] = React.useState(() =>
    Math.floor((Date.now() - startedAt.getTime()) / 1000),
  )

  React.useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.getTime()) / 1000))
    }, 1000)
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

  const completedExercises = session.exercises.filter(
    (exercise) =>
      exercise.skipped || exercise.sets.length >= exercise.targetSets,
  ).length

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
        <FinishSessionDialog sessionId={session.id} />
      </div>

      <RestTimer ref={restTimerRef} />

      <ol className="flex flex-col gap-3">
        {session.exercises.map((exercise, index) => (
          <ExercisePanel
            key={exercise.id}
            exercise={exercise}
            index={index}
            onSetLogged={() => restTimerRef.current?.start()}
          />
        ))}
      </ol>
    </div>
  )
}
