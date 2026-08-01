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
  // séries desta sessão ainda não gravadas no servidor (fila offline)
  pendingSyncCount: number
  trigger?: React.ReactElement
}

function finishDescription({
  loggedSets,
  totalExercises,
  pendingExercises,
  pendingSyncCount,
}: Omit<FinishSessionDialogProps, 'sessionId' | 'trigger'>) {
  // Finalizar fecha a sessão para novas séries: o que ainda não chegou ao
  // servidor seria recusado e perdido. Enquanto houver fila, o estado da
  // sincronização é a única informação que importa aqui.
  if (pendingSyncCount > 0) {
    return pendingSyncCount === 1
      ? '1 série registrada ainda não foi salva no servidor. Assim que a sincronização terminar, o botão de finalizar libera — finalizar agora descartaria essa série.'
      : `${pendingSyncCount} séries registradas ainda não foram salvas no servidor. Assim que a sincronização terminar, o botão de finalizar libera — finalizar agora descartaria essas séries.`
  }

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
  pendingSyncCount,
  trigger,
}: FinishSessionDialogProps) {
  const waitingSync = pendingSyncCount > 0

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
              pendingSyncCount,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="outline" />}>
            Continuar treinando
          </AlertDialogClose>
          {/* O diálogo fica aberto enquanto a fila drena: o contador vem do
              componente pai, então o botão libera sozinho quando a última
              série é gravada, sem precisar fechar e abrir de novo. */}
          <form action={finishSession}>
            <input type="hidden" name="sessionId" value={sessionId} />
            <Button type="submit" className="w-full" disabled={waitingSync}>
              <CheckIcon />
              {waitingSync ? 'Salvando séries…' : 'Finalizar'}
            </Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
