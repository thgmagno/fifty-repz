'use client'

import * as React from 'react'
import { cn, formatDateKeyLabel } from '@/lib/utils'

interface HeatmapDay {
  date: string
  count: number
}

const MONTH_ABBREVIATIONS = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
]

function workoutLabel(count: number) {
  return count === 1 ? '1 treino' : `${count} treinos`
}

// Um rótulo por vez que o mês vira, alinhado à coluna daquela semana; nas
// demais colunas o espaço fica vazio para a grade não sair do lugar.
function buildMonthLabels(weeks: (HeatmapDay | null)[][]) {
  let lastMonth = -1

  return weeks.map((week) => {
    const firstDay = week.find(Boolean)
    if (!firstDay) return ''

    const month = Number(firstDay.date.slice(5, 7)) - 1
    if (month === lastMonth) return ''

    lastMonth = month
    return MONTH_ABBREVIATIONS[month]
  })
}

export function ProfileHeatmap({ days }: { days: HeatmapDay[] }) {
  const [selected, setSelected] = React.useState<HeatmapDay | null>(null)

  if (days.length === 0) return null

  // Alinha o primeiro dia à coluna do domingo, como no gráfico do GitHub
  const firstDate = new Date(`${days[0].date}T00:00:00`)
  const startPadding = firstDate.getDay()
  const cells: (HeatmapDay | null)[] = [
    ...Array.from({ length: startPadding }, () => null),
    ...days,
  ]

  const weeks: (HeatmapDay | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  const monthLabels = buildMonthLabels(weeks)
  const trainedDays = days.filter((day) => day.count > 0).length

  return (
    <div className="flex flex-col gap-2">
      {/* o tooltip só abria no hover, então no celular a grade não dizia
          nada: o dia tocado aparece aqui */}
      <p className="text-sm text-muted-foreground">
        {selected
          ? `${formatDateKeyLabel(selected.date)} — ${workoutLabel(selected.count)}`
          : `${trainedDays} ${trainedDays === 1 ? 'dia treinado' : 'dias treinados'} no último ano`}
      </p>

      <div
        className="min-w-0 overflow-x-auto pb-2"
        // começa rolado para o fim (dias mais recentes), que é o que
        // interessa no mobile
        ref={(el) => {
          // eslint-disable-next-line no-param-reassign
          if (el) el.scrollLeft = el.scrollWidth
        }}
      >
        <div className="flex w-max flex-col gap-1">
          <div className="flex gap-1" aria-hidden="true">
            {monthLabels.map((label, index) => (
              <span
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className="w-3 text-[10px] leading-3 whitespace-nowrap text-muted-foreground"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={weekIndex}
                className="flex flex-col gap-1"
              >
                {week.map((day, dayIndex) => {
                  if (!day) {
                    // eslint-disable-next-line react/no-array-index-key
                    return <div key={dayIndex} className="size-3" />
                  }

                  // dia sem treino não vira parada de teclado: seriam
                  // centenas de elementos sem nada a dizer
                  if (day.count === 0) {
                    return (
                      <div
                        key={day.date}
                        className="size-3 rounded-sm bg-muted"
                      />
                    )
                  }

                  return (
                    <button
                      key={day.date}
                      type="button"
                      onClick={() => setSelected(day)}
                      aria-label={`${formatDateKeyLabel(day.date)} — ${workoutLabel(day.count)}`}
                      className={cn(
                        // o alvo de toque cresce além dos 12px do quadrado,
                        // até encostar no vizinho
                        'relative size-3 rounded-sm bg-emerald-600 after:absolute after:-inset-0.5 after:content-[""] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                        selected?.date === day.date &&
                          'ring-2 ring-ring ring-offset-1 ring-offset-background',
                      )}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-muted" />
          Sem treino
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-emerald-600" />
          Treinou
        </span>
      </div>
    </div>
  )
}
