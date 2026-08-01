'use client'

import * as React from 'react'
import { CheckIcon } from 'lucide-react'
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
import { finishSession } from '@/lib/actions/workout-sessions'

interface FinishSessionDialogProps {
  sessionId: string
  loggedSets: number
  totalExercises: number
  // exercícios que ainda não têm todas as séries (pulados não contam)
  pendingExercises: number
  trigger?: React.ReactElement
}

function finishDescription({
  loggedSets,
  totalExercises,
  pendingExercises,
}: Omit<FinishSessionDialogProps, 'sessionId' | 'trigger'>) {
  if (loggedSets === 0) {
    return 'Você não registrou nenhuma série, então este treino não vai contar para o nível.'
  }

  if (pendingExercises > 0) {
    return `${pendingExercises} de ${totalExercises} exercícios ainda não têm todas as séries. A sessão será salva assim mesmo, e depois não dá para registrar mais nada.`
  }

  return 'Todos os exercícios estão completos. Depois de finalizada, não é possível registrar novas séries.'
}

export function FinishSessionDialog({
  sessionId,
  loggedSets,
  totalExercises,
  pendingExercises,
  trigger,
}: FinishSessionDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={trigger ?? <Button size="lg" />}>
        <CheckIcon />
        Finalizar treino
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Finalizar treino</AlertDialogTitle>
          <AlertDialogDescription>
            {finishDescription({
              loggedSets,
              totalExercises,
              pendingExercises,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="outline" />}>
            Continuar treinando
          </AlertDialogClose>
          <form action={finishSession}>
            <input type="hidden" name="sessionId" value={sessionId} />
            <Button type="submit" className="w-full">
              <CheckIcon />
              Finalizar
            </Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
