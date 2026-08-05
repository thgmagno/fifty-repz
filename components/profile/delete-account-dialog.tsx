'use client'

import * as React from 'react'
import { TriangleAlertIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  deleteAccount,
  type DeleteAccountFormState,
} from '@/lib/actions/account'
import type { AccountDeletionSummary } from '@/lib/profile'

interface DeleteAccountDialogProps {
  username: string
  summary: AccountDeletionSummary
}

const initialState: DeleteAccountFormState = {}

function plural(count: number, singular: string, pluralWord: string) {
  return `${count} ${count === 1 ? singular : pluralWord}`
}

// O que o usuário perde, em números. Só entra na lista o que ele de fato
// tem: dizer "0 exercícios próprios" só faz barulho.
function lossItems({
  completedSessions,
  workoutTemplates,
  customExercises,
  followers,
}: AccountDeletionSummary) {
  const items: string[] = []

  if (completedSessions > 0) {
    items.push(
      `${plural(completedSessions, 'treino concluído', 'treinos concluídos')}, com todas as séries, cargas e o progresso dos níveis`,
    )
  }
  if (workoutTemplates > 0) {
    items.push(plural(workoutTemplates, 'treino montado', 'treinos montados'))
  }
  if (customExercises > 0) {
    items.push(
      plural(
        customExercises,
        'exercício criado por você',
        'exercícios criados por você',
      ),
    )
  }
  if (followers > 0) {
    items.push(
      `${plural(followers, 'pessoa que segue', 'pessoas que seguem')} você`,
    )
  }

  items.push('seu perfil, suas curtidas e seus comentários')

  return items
}

export function DeleteAccountDialog({
  username,
  summary,
}: DeleteAccountDialogProps) {
  const [confirmation, setConfirmation] = React.useState('')
  const [state, formAction, pending] = React.useActionState(
    deleteAccount,
    initialState,
  )

  const matches = confirmation.trim().toLowerCase() === username.toLowerCase()
  const items = lossItems(summary)

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button variant="outline" className="text-destructive" />}
      >
        <TriangleAlertIcon />
        Excluir minha conta
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir sua conta</AlertDialogTitle>
          <AlertDialogDescription>
            Isso apaga sua conta e tudo que está ligado a ela, de vez. Não dá
            para desfazer, e não guardamos cópia para recuperar depois.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-3 text-sm">
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground">Você vai perder:</p>
            <ul className="list-disc pl-5 text-muted-foreground">
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <p className="text-muted-foreground">
            Se quiser só dar uma pausa, dá para sair do app pelo menu e voltar
            quando quiser — seus treinos continuam aqui.
          </p>

          <form action={formAction} className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="delete-confirmation">
                Para confirmar, digite{' '}
                <span className="font-semibold text-foreground">
                  {username}
                </span>
              </Label>
              <Input
                id="delete-confirmation"
                name="confirmation"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                placeholder={username}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
              />
              {state.errors?.confirmation && (
                <p className="text-sm text-destructive">
                  {state.errors.confirmation[0]}
                </p>
              )}
              {state.errors?.form && (
                <p className="text-sm text-destructive">
                  {state.errors.form[0]}
                </p>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogClose render={<Button variant="outline" />}>
                Manter minha conta
              </AlertDialogClose>
              <Button
                type="submit"
                variant="destructive"
                className="w-full"
                disabled={!matches || pending}
              >
                {pending ? 'Excluindo…' : 'Excluir para sempre'}
              </Button>
            </AlertDialogFooter>
          </form>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
