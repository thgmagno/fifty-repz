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

export function FinishSessionDialog({
  sessionId,
  hasLoggedSets,
}: {
  sessionId: string
  hasLoggedSets: boolean
}) {
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
            {hasLoggedSets
              ? 'A sessão será salva com as séries registradas até agora. Depois de finalizada, não é possível registrar novas séries.'
              : 'Você não registrou nenhuma série, então este treino não vai contar para o nível.'}
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
