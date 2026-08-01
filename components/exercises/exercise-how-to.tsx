'use client'

import Image from 'next/image'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

// Todo exercício do catálogo tem duas imagens: início e fim do movimento.
// Fora desse caso (exercício criado pelo usuário, por exemplo) a legenda cai
// para a numeração.
function imageCaption(index: number, total: number) {
  if (total === 2) return index === 0 ? 'Posição inicial' : 'Posição final'
  return `Imagem ${index + 1} de ${total}`
}

function ExerciseImage({
  url,
  alt,
  caption,
}: {
  url: string
  alt: string
  caption?: string
}) {
  return (
    <figure>
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted sm:aspect-video">
        <Image
          src={url}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, 640px"
          className="object-contain"
        />
      </div>
      {caption && (
        <figcaption className="pt-1 text-center text-xs text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

function ExerciseImages({
  exerciseName,
  imageUrls,
}: {
  exerciseName: string
  imageUrls: string[]
}) {
  if (imageUrls.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-md bg-muted text-4xl text-muted-foreground sm:aspect-video">
        🏋️
      </div>
    )
  }

  if (imageUrls.length === 1) {
    return <ExerciseImage url={imageUrls[0]} alt={exerciseName} />
  }

  return (
    <Carousel className="w-full">
      <CarouselContent>
        {imageUrls.map((url, index) => {
          const caption = imageCaption(index, imageUrls.length)
          return (
            <CarouselItem key={url}>
              <ExerciseImage
                url={url}
                alt={`${exerciseName} — ${caption}`}
                caption={caption}
              />
            </CarouselItem>
          )
        })}
      </CarouselContent>
      <CarouselPrevious className="left-2" />
      <CarouselNext className="right-2" />
    </Carousel>
  )
}

// Imagens legendadas e passo a passo do exercício. Mesmo conteúdo no
// catálogo e dentro da sessão de treino, que é onde ele mais faz falta.
export function ExerciseHowTo({
  exerciseName,
  imageUrls,
  instructions,
}: {
  exerciseName: string
  imageUrls: string[]
  instructions: string[]
}) {
  return (
    <>
      <ExerciseImages exerciseName={exerciseName} imageUrls={imageUrls} />

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Como executar</h3>
        {instructions.length > 0 ? (
          <ol className="flex list-inside list-decimal flex-col gap-2 text-sm text-muted-foreground">
            {instructions.map((step, index) => (
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
    </>
  )
}
