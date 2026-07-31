'use client'

import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Badge } from '@/components/ui/badge'
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

        {imageUrls.length > 1 ? (
          <Carousel className="w-full">
            <CarouselContent>
              {imageUrls.map((url, imageIndex) => (
                <CarouselItem key={url}>
                  <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted sm:aspect-video">
                    <Image
                      src={url}
                      alt={`${exercise.name} - imagem ${imageIndex + 1} de ${imageUrls.length}`}
                      fill
                      sizes="(max-width: 640px) 100vw, 640px"
                      className="object-contain"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        ) : (
          <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted sm:aspect-video">
            {imageUrls[0] ? (
              <Image
                src={imageUrls[0]}
                alt={exercise.name}
                fill
                sizes="(max-width: 640px) 100vw, 640px"
                className="object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-4xl text-muted-foreground">
                🏋️
              </div>
            )}
          </div>
        )}

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

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Como executar</h3>
          {exercise.instructions.length > 0 ? (
            <ol className="flex list-inside list-decimal flex-col gap-2 text-sm text-muted-foreground">
              {exercise.instructions.map((step, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <li key={index}>{step}</li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">
              Sem instruções disponíveis.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
