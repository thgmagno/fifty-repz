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
import { deleteWorkoutTemplate } from '@/lib/actions/workout-templates'

interface DeleteTemplateDialogProps {
  trigger: React.ReactElement
  templateId: string
  templateName: string
}

export function DeleteTemplateDialog({
  trigger,
  templateId,
  templateName,
}: DeleteTemplateDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir treino</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir “{templateName}”? Essa ação não pode
            ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="outline" />}>
            Cancelar
          </AlertDialogClose>
          <form action={deleteWorkoutTemplate}>
            <input type="hidden" name="id" value={templateId} />
            <Button type="submit" variant="destructive">
              Excluir
            </Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
