'use client'

import { cn } from '@/lib/utils'

interface HeatmapDay {
  date: string
  count: number
}

function bucketColor(count: number) {
  if (count === 0) return 'bg-muted'
  return 'bg-emerald-600'
}

export function ProfileHeatmap({ days }: { days: HeatmapDay[] }) {
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

  return (
    <div
      className="flex min-w-0 gap-1 overflow-x-auto pb-2"
      // começa rolado para o fim (dias mais recentes), mais relevante no mobile
      ref={(el) => {
        // eslint-disable-next-line no-param-reassign
        if (el) el.scrollLeft = el.scrollWidth
      }}
    >
      {weeks.map((week, weekIndex) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={weekIndex}
          className="flex flex-col gap-1"
        >
          {week.map((day, dayIndex) =>
            day ? (
              <div
                key={day.date}
                title={new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(day.date))}
                className={cn('size-3 rounded-sm', bucketColor(day.count))}
              />
            ) : (
              // eslint-disable-next-line react/no-array-index-key
              <div key={dayIndex} className="size-3" />
            ),
          )}
        </div>
      ))}
    </div>
  )
}
