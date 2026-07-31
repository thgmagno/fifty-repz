'use client'

import * as React from 'react'
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
import { deleteWorkoutPlan } from '@/lib/actions/workout-plans'

interface DeletePlanDialogProps {
  trigger: React.ReactElement
  planId: string
  planName: string
  templateCount: number
}

export function DeletePlanDialog({
  trigger,
  planId,
  planName,
  templateCount,
}: DeletePlanDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir plano</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir “{planName}”?
            {templateCount > 0 &&
              ` Os ${templateCount} treinos deste plano também serão excluídos.`}{' '}
            Os treinos já concluídos continuam no seu histórico. Essa ação não
            pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="outline" />}>
            Cancelar
          </AlertDialogClose>
          <form action={deleteWorkoutPlan}>
            <input type="hidden" name="id" value={planId} />
            <Button type="submit" variant="destructive" className="w-full">
              Excluir
            </Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
