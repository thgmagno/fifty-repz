'use client'

import * as React from 'react'
import { BellIcon, TimerIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatDuration } from '@/lib/utils'

const DEFAULT_REST_SECONDS = 90

export interface RestTimerHandle {
  start: () => void
}

function playRestEndChime(
  audioContextRef: React.RefObject<AudioContext | null>,
) {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext

    if (!AudioContextClass) return

    if (!audioContextRef.current) {
      // eslint-disable-next-line no-param-reassign -- lazy init do ref
      audioContextRef.current = new AudioContextClass()
    }
    const ctx = audioContextRef.current
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }

    // dois beeps curtos e ascendentes
    ;[660, 880].forEach((frequency, index) => {
      const startTime = ctx.currentTime + index * 0.18
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3)

      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.start(startTime)
      oscillator.stop(startTime + 0.3)
    })
  } catch {
    // ambiente sem suporte a Web Audio: segue só com o aviso visual
  }

  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate([200, 100, 200])
  }
}

export const RestTimer = React.forwardRef<RestTimerHandle>((_props, ref) => {
  const [duration, setDuration] = React.useState(DEFAULT_REST_SECONDS)
  const [secondsLeft, setSecondsLeft] = React.useState(0)
  const [running, setRunning] = React.useState(false)
  const [justFinished, setJustFinished] = React.useState(false)
  const audioContextRef = React.useRef<AudioContext | null>(null)

  React.useImperativeHandle(ref, () => ({
    start: () => {
      setSecondsLeft(duration)
      setRunning(true)
      setJustFinished(false)
    },
  }))

  React.useEffect(() => {
    if (!running) return undefined

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setRunning(false)
          setJustFinished(true)
          playRestEndChime(audioContextRef)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [running])

  React.useEffect(() => {
    if (!justFinished) return undefined
    const timeout = setTimeout(() => setJustFinished(false), 5000)
    return () => clearTimeout(timeout)
  }, [justFinished])

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
          {justFinished ? (
            <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
              <BellIcon className="size-4" />
              Descanso concluído!
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">
              Descanso entre séries
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <Label htmlFor="rest-duration" className="text-xs">
              Descanso (segundos)
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
