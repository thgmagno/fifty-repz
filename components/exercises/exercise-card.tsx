import Image from 'next/image'
import { PencilIcon, Trash2Icon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ExerciseFormDialog } from '@/components/exercises/exercise-form-dialog'
import { DeleteExerciseDialog } from '@/components/exercises/delete-exercise-dialog'
import { equipmentLabels, muscleGroupLabels } from '@/lib/exercise-labels'
import type { ExerciseListItem } from '@/lib/exercises'

export function ExerciseCard({ exercise }: { exercise: ExerciseListItem }) {
  return (
    <Card className="gap-3 overflow-hidden pt-0">
      <div className="relative aspect-[3/2] w-full bg-muted">
        {exercise.imageUrls[0] ? (
          <Image
            src={exercise.imageUrls[0]}
            alt={exercise.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-muted-foreground">
            🏋️
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle title={exercise.nameEn ?? undefined}>
          {exercise.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-1.5">
        <Badge variant="secondary">
          {muscleGroupLabels[exercise.muscleGroup]}
        </Badge>
        <Badge variant="outline">{equipmentLabels[exercise.equipment]}</Badge>
        {exercise.isCustom && <Badge>Custom</Badge>}
      </CardContent>
      {exercise.isCustom && (
        <CardFooter className="justify-end">
          <ExerciseFormDialog
            exercise={{
              id: exercise.id,
              name: exercise.name,
              muscleGroup: exercise.muscleGroup,
              equipment: exercise.equipment,
            }}
            trigger={
              <Button variant="secondary" size="sm">
                <PencilIcon />
                Editar
              </Button>
            }
          />
          <DeleteExerciseDialog
            exerciseId={exercise.id}
            exerciseName={exercise.name}
            trigger={
              <Button variant="destructive" size="sm">
                <Trash2Icon />
                Excluir
              </Button>
            }
          />
        </CardFooter>
      )}
    </Card>
  )
}
