import { muscleGroupLabels } from '@/lib/exercise-labels'
import { formatVolume } from '@/lib/utils'
import type { MuscleGroupVolume } from '@/lib/progress'

export function MuscleGroupChart({ data }: { data: MuscleGroupVolume[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Sem treinos concluídos nos últimos 90 dias.
      </p>
    )
  }

  const max = data[0].volume

  return (
    <ul className="flex flex-col gap-2">
      {data.map((entry) => (
        <li key={entry.muscleGroup} className="flex items-center gap-3">
          <span className="w-32 shrink-0 truncate text-sm text-muted-foreground">
            {muscleGroupLabels[entry.muscleGroup]}
          </span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.max(4, (entry.volume / max) * 100)}%` }}
            />
          </div>
          <span className="w-20 shrink-0 text-right text-sm tabular-nums">
            {formatVolume(entry.volume)}
          </span>
        </li>
      ))}
    </ul>
  )
}
