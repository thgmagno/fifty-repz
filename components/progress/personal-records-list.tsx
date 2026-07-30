import { TrophyIcon } from 'lucide-react'
import { formatSessionDate } from '@/lib/utils'
import type { PersonalRecord } from '@/lib/progress'

export function PersonalRecordsList({
  records,
}: {
  records: PersonalRecord[]
}) {
  if (records.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Registre séries com peso para ver seus recordes aqui.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {records.map((record) => (
        <li
          key={record.exerciseName}
          className="flex items-center justify-between gap-2 rounded-md border p-2.5 text-sm"
        >
          <div className="flex items-center gap-2">
            <TrophyIcon className="size-4 text-primary" />
            <span className="font-medium">{record.exerciseName}</span>
          </div>
          <div className="text-right">
            <div className="font-semibold tabular-nums">
              {record.weightKg}kg × {record.reps}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatSessionDate(record.achievedAt)}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
