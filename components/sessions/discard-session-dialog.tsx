'use client'

import * as React from 'react'
import { Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { discardWorkoutSession } from '@/lib/actions/workout-sessions'

interface DiscardSessionDialogProps {
  trigger: React.ReactElement
  sessionId: string
  // séries já registradas: é o que o usuário perde ao descartar
  loggedSets: number
}

export function DiscardSessionDialog({
  trigger,
  sessionId,
  loggedSets,
}: DiscardSessionDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Descartar treino</AlertDialogTitle>
          <AlertDialogDescription>
            {loggedSets > 0
              ? `As ${loggedSets} séries registradas serão apagadas. O treino não vai para o histórico nem conta para o nível.`
              : 'O treino não vai para o histórico nem conta para o nível.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="outline" />}>
            Continuar treinando
          </AlertDialogClose>
          <form action={discardWorkoutSession}>
            <input type="hidden" name="sessionId" value={sessionId} />
            <Button type="submit" variant="destructive" className="w-full">
              <Trash2Icon />
              Descartar treino
            </Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
