'use client'

import Image from 'next/image'
import { ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
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

interface ExerciseImageGalleryProps {
  exerciseName: string
  imageUrls: string[]
}

export function ExerciseImageGallery({
  exerciseName,
  imageUrls,
}: ExerciseImageGalleryProps) {
  if (imageUrls.length === 0) return null

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button type="button" variant="outline" size="sm">
            <ImageIcon />
            Imagens
          </Button>
        }
      />
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{exerciseName}</DialogTitle>
        </DialogHeader>
        {imageUrls.length > 1 ? (
          <Carousel className="w-full">
            <CarouselContent>
              {imageUrls.map((url, imageIndex) => (
                <CarouselItem key={url}>
                  <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted sm:aspect-video">
                    <Image
                      src={url}
                      alt={`${exerciseName} - imagem ${imageIndex + 1} de ${imageUrls.length}`}
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
            <Image
              src={imageUrls[0]}
              alt={exerciseName}
              fill
              sizes="(max-width: 640px) 100vw, 640px"
              className="object-contain"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
