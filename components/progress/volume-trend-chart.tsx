import { cn, formatVolume, formatWeekLabel } from '@/lib/utils'
import type { WeeklyVolume } from '@/lib/progress'

const CHART_HEIGHT = 120

export function VolumeTrendChart({ data }: { data: WeeklyVolume[] }) {
  const hasAnyVolume = data.some((entry) => entry.volume > 0)

  if (!hasAnyVolume) {
    return (
      <p className="text-sm text-muted-foreground">
        Sem treinos concluídos nas últimas semanas.
      </p>
    )
  }

  const max = Math.max(...data.map((entry) => entry.volume), 1)

  return (
    <div
      className="flex items-end gap-2"
      style={{ height: CHART_HEIGHT + 24 }}
    >
      {data.map((entry) => (
        <div
          key={entry.week}
          className="flex flex-1 flex-col items-center gap-1"
        >
          <div
            title={`${formatWeekLabel(entry.week)}: ${formatVolume(entry.volume)}`}
            className={cn(
              'w-full rounded-t-sm',
              entry.volume > 0 ? 'bg-primary' : 'bg-muted',
            )}
            style={{ height: Math.max(4, (entry.volume / max) * CHART_HEIGHT) }}
          />
          <span className="text-[10px] text-muted-foreground">
            {formatWeekLabel(entry.week)}
          </span>
        </div>
      ))}
    </div>
  )
}
