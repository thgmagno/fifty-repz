'use client'

import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { StartWorkoutButton } from '@/components/workouts/start-workout-button'
import { equipmentLabels, muscleGroupLabels } from '@/lib/exercise-labels'
import { formatRepTarget } from '@/lib/utils'
import type { ProgramTemplate } from '@/lib/workout-programs'
import type { InProgressSession } from '@/lib/workout-sessions'

// Prévia do treino antes de iniciar: sem isso, o único jeito de saber o que
// tem dentro é criar a sessão — que não dá para cancelar.
export function TemplatePreviewDialog({
  template,
  inProgress,
  trigger,
}: {
  template: ProgramTemplate
  inProgress: InProgressSession | null
  trigger: React.ReactElement
}) {
  const muscleGroups = [
    ...new Set(
      template.exercises.map(
        (item) => muscleGroupLabels[item.exercise.muscleGroup],
      ),
    ),
  ]

  return (
    <Dialog>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{template.name}</DialogTitle>
          <DialogDescription>
            {template.exercises.length}{' '}
            {template.exercises.length === 1 ? 'exercício' : 'exercícios'} ·
            séries x repetições
          </DialogDescription>
        </DialogHeader>

        {muscleGroups.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {muscleGroups.map((group) => (
              <Badge key={group} variant="secondary">
                {group}
              </Badge>
            ))}
          </div>
        )}

        <ol className="flex flex-col gap-2">
          {template.exercises.map((item) => (
            <li
              key={item.id}
              className="flex items-baseline justify-between gap-3 border-b pb-2 last:border-b-0 last:pb-0"
            >
              <span className="min-w-0">
                <span className="block">{item.exercise.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {equipmentLabels[item.exercise.equipment]}
                </span>
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {formatRepTarget(
                  item.targetSets,
                  item.targetReps,
                  item.targetRepsMax,
                )}
              </span>
            </li>
          ))}
        </ol>

        <DialogFooter>
          <StartWorkoutButton
            templateId={template.id}
            inProgress={inProgress}
            className="w-full sm:w-auto"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
