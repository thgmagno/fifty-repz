'use client'

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

export function FinishSessionDialog({ sessionId }: { sessionId: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button size="lg" />}>
        <CheckIcon />
        Finalizar treino
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Finalizar treino</AlertDialogTitle>
          <AlertDialogDescription>
            A sessão será salva com as séries registradas até agora. Depois de
            finalizada, não é possível registrar novas séries.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="outline" />}>
            Continuar treinando
          </AlertDialogClose>
          <form action={finishSession}>
            <input type="hidden" name="sessionId" value={sessionId} />
            <Button type="submit">
              <CheckIcon />
              Finalizar
            </Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
