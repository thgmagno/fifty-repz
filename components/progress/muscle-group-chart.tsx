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

  // com grupos treinados só sem carga, o primeiro da lista pode ter volume
  // zero — o divisor precisa aguentar isso
  const max = Math.max(...data.map((entry) => entry.volume), 1)
  const hasBodyweightOnly = data.some((entry) => entry.volume === 0)

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {data.map((entry) => (
          <li key={entry.muscleGroup} className="flex items-center gap-3">
            <span className="w-24 shrink-0 truncate text-sm text-muted-foreground">
              {muscleGroupLabels[entry.muscleGroup]}
            </span>
            <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
              {entry.volume > 0 && (
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${Math.max(4, (entry.volume / max) * 100)}%`,
                  }}
                />
              )}
            </div>
            <span className="w-24 shrink-0 text-right tabular-nums">
              {entry.volume > 0 ? (
                <span className="text-sm">{formatVolume(entry.volume)}</span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {entry.bodyweightReps} repetições
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      {hasBodyweightOnly && (
        <p className="text-xs text-muted-foreground">
          Exercício sem carga não entra no volume — aparece pelo total de
          repetições.
        </p>
      )}
    </div>
  )
}
