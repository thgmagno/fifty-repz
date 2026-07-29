'use client'

import * as React from 'react'
import { TimerIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatDuration } from '@/lib/utils'

const DEFAULT_REST_SECONDS = 90

export interface RestTimerHandle {
  start: () => void
}

export const RestTimer = React.forwardRef<RestTimerHandle>((_props, ref) => {
  const [duration, setDuration] = React.useState(DEFAULT_REST_SECONDS)
  const [secondsLeft, setSecondsLeft] = React.useState(0)
  const [running, setRunning] = React.useState(false)

  React.useImperativeHandle(ref, () => ({
    start: () => {
      setSecondsLeft(duration)
      setRunning(true)
    },
  }))

  React.useEffect(() => {
    if (!running) return undefined

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [running])

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/40 p-3">
      <TimerIcon className="text-muted-foreground" />
      {running ? (
        <>
          <span className="text-lg font-semibold tabular-nums">
            {formatDuration(secondsLeft)}
          </span>
          <span className="text-sm text-muted-foreground">de descanso</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setRunning(false)}
          >
            Pular descanso
          </Button>
        </>
      ) : (
        <>
          <span className="text-sm text-muted-foreground">
            Descanso entre séries
          </span>
          <div className="flex items-center gap-1.5">
            <Label htmlFor="rest-duration" className="text-xs">
              Duração (s)
            </Label>
            <Input
              id="rest-duration"
              type="number"
              min={10}
              max={600}
              step={5}
              value={duration}
              onChange={(event) =>
                setDuration(Number(event.target.value) || DEFAULT_REST_SECONDS)
              }
              className="h-8 w-20"
            />
          </div>
        </>
      )}
    </div>
  )
})
