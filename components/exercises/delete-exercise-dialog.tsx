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
import { deleteExercise } from '@/lib/actions/exercises'

interface DeleteExerciseDialogProps {
  trigger: React.ReactElement
  exerciseId: string
  exerciseName: string
}

export function DeleteExerciseDialog({
  trigger,
  exerciseId,
  exerciseName,
}: DeleteExerciseDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir exercício</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir “{exerciseName}”? Essa ação não pode
            ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="outline" />}>
            Cancelar
          </AlertDialogClose>
          <form action={deleteExercise}>
            <input type="hidden" name="id" value={exerciseId} />
            <Button type="submit" variant="destructive">
              Excluir
            </Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
