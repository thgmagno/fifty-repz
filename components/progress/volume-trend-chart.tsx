'use client'

import * as React from 'react'
import { cn, formatVolume, formatWeekLabel } from '@/lib/utils'
import type { WeeklyVolume } from '@/lib/progress'

const CHART_HEIGHT = 120

export function VolumeTrendChart({ data }: { data: WeeklyVolume[] }) {
  const [selectedWeek, setSelectedWeek] = React.useState<string | null>(null)

  const hasAnyVolume = data.some((entry) => entry.volume > 0)

  if (!hasAnyVolume) {
    return (
      <p className="text-sm text-muted-foreground">
        Sem treinos concluídos nas últimas semanas.
      </p>
    )
  }

  // a barra sozinha não diz quanto representa, e em oito colunas não cabe um
  // rótulo por barra: a semana escolhida (a atual, por padrão) aparece por
  // extenso acima do gráfico
  const selected =
    data.find((entry) => entry.week === selectedWeek) ?? data[data.length - 1]

  const max = Math.max(...data.map((entry) => entry.volume), 1)

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        Semana de {formatWeekLabel(selected.week)}:{' '}
        <span className="font-semibold tabular-nums text-foreground">
          {formatVolume(selected.volume)}
        </span>
      </p>

      <div
        className="flex items-end gap-2"
        style={{ height: CHART_HEIGHT + 24 }}
      >
        {data.map((entry) => {
          const isSelected = entry.week === selected.week
          return (
            <div
              key={entry.week}
              className="flex min-w-0 flex-1 flex-col items-center gap-1"
            >
              <button
                type="button"
                onClick={() => setSelectedWeek(entry.week)}
                aria-pressed={isSelected}
                aria-label={`Semana de ${formatWeekLabel(entry.week)}: ${formatVolume(entry.volume)}`}
                title={`${formatWeekLabel(entry.week)}: ${formatVolume(entry.volume)}`}
                className="flex w-full items-end rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                style={{ height: CHART_HEIGHT }}
              >
                <span
                  className={cn(
                    'w-full rounded-t-sm',
                    entry.volume > 0 ? 'bg-primary' : 'bg-muted',
                    entry.volume > 0 && !isSelected && 'bg-primary/50',
                  )}
                  style={{
                    height: Math.max(4, (entry.volume / max) * CHART_HEIGHT),
                  }}
                />
              </button>
              <span
                className={cn(
                  'text-[10px] text-muted-foreground',
                  isSelected && 'font-medium text-foreground',
                )}
              >
                {formatWeekLabel(entry.week)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
