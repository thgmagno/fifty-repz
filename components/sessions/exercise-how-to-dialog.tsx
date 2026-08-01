'use client'

import { BookOpenIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ExerciseHowTo } from '@/components/exercises/exercise-how-to'

interface ExerciseHowToDialogProps {
  exerciseName: string
  imageUrls: string[]
  instructions: string[]
}

// Durante o treino é quando mais se precisa saber como executar o
// movimento. Antes daqui só havia imagens sem legenda, e o passo a passo
// ficava no catálogo, fora do fluxo da sessão.
export function ExerciseHowToDialog({
  exerciseName,
  imageUrls,
  instructions,
}: ExerciseHowToDialogProps) {
  if (imageUrls.length === 0 && instructions.length === 0) return null

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button type="button" variant="outline" size="sm">
            <BookOpenIcon />
            Como fazer
          </Button>
        }
      />
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{exerciseName}</DialogTitle>
        </DialogHeader>
        <ExerciseHowTo
          exerciseName={exerciseName}
          imageUrls={imageUrls}
          instructions={instructions}
        />
      </DialogContent>
    </Dialog>
  )
}
