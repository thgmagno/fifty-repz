'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ExerciseHowTo } from '@/components/exercises/exercise-how-to'
import { equipmentLabels, muscleGroupLabels } from '@/lib/exercise-labels'
import type { ExerciseListItem } from '@/lib/exercises'

interface ExerciseDetailDialogProps {
  trigger: React.ReactElement
  exercise: Pick<
    ExerciseListItem,
    | 'name'
    | 'nameEn'
    | 'muscleGroup'
    | 'secondaryMuscles'
    | 'equipment'
    | 'imageUrls'
    | 'instructions'
  >
}

export function ExerciseDetailDialog({
  trigger,
  exercise,
}: ExerciseDetailDialogProps) {
  const { imageUrls } = exercise

  return (
    <Dialog>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{exercise.name}</DialogTitle>
          {exercise.nameEn && (
            <DialogDescription>{exercise.nameEn}</DialogDescription>
          )}
        </DialogHeader>

        {/* músculos e equipamento sobem para junto do título: imagens e
            passo a passo vêm juntos, do mesmo componente que a sessão usa */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">
            {muscleGroupLabels[exercise.muscleGroup]}
          </Badge>
          <Badge variant="outline">{equipmentLabels[exercise.equipment]}</Badge>
          {exercise.secondaryMuscles.map((muscle) => (
            <Badge key={muscle} variant="outline">
              {muscleGroupLabels[muscle]}
            </Badge>
          ))}
        </div>

        <ExerciseHowTo
          exerciseName={exercise.name}
          imageUrls={imageUrls}
          instructions={exercise.instructions}
        />
      </DialogContent>
    </Dialog>
  )
}
