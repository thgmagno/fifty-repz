'use client'

import Link from 'next/link'
import { PlayIcon, Trash2Icon } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
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
import { startWorkoutSession } from '@/lib/actions/workout-sessions'
import { privateRoutes } from '@/lib/config'
import { cn } from '@/lib/utils'
import type { InProgressSession } from '@/lib/workout-sessions'

interface StartWorkoutButtonProps {
  templateId: string
  // sessão aberta do usuário, se houver — só existe uma por vez
  inProgress: InProgressSession | null
  size?: 'sm' | 'default'
  variant?: 'default' | 'secondary'
  className?: string
}

// Um treino por vez: o botão precisa dizer o que vai acontecer antes de
// acontecer. Se a sessão aberta é deste treino, ele leva de volta para ela;
// se é de outro, pergunta antes de trocar.
export function StartWorkoutButton({
  templateId,
  inProgress,
  size = 'default',
  variant = 'default',
  className,
}: StartWorkoutButtonProps) {
  // o treino aberto é este: o botão leva de volta para a sessão e ignora a
  // variante recebida, porque retomar é a ação em destaque da tela
  if (inProgress?.templateId === templateId) {
    return (
      <Link
        href={`${privateRoutes.sessions}/${inProgress.id}`}
        className={cn(buttonVariants({ size }), className)}
      >
        <PlayIcon />
        Continuar
      </Link>
    )
  }

  if (inProgress) {
    return (
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button size={size} variant={variant} className={className} />
          }
        >
          <PlayIcon />
          Iniciar
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem um treino em andamento</AlertDialogTitle>
            <AlertDialogDescription>
              {inProgress.loggedSets > 0
                ? `“${inProgress.templateName}” está aberto, com ${inProgress.loggedSets} séries registradas. Iniciar outro apaga essas séries.`
                : `“${inProgress.templateName}” está aberto, sem nenhuma série registrada.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose
              render={
                <Link
                  href={`${privateRoutes.sessions}/${inProgress.id}`}
                  className={cn(buttonVariants({ variant: 'outline' }))}
                />
              }
            >
              Continuar o que está aberto
            </AlertDialogClose>
            <form action={startWorkoutSession}>
              <input type="hidden" name="templateId" value={templateId} />
              <input type="hidden" name="replaceInProgress" value="true" />
              <Button type="submit" variant="destructive" className="w-full">
                <Trash2Icon />
                Descartar e iniciar este
              </Button>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <form action={startWorkoutSession} className={className}>
      <input type="hidden" name="templateId" value={templateId} />
      <Button type="submit" size={size} variant={variant} className="w-full">
        <PlayIcon />
        Iniciar
      </Button>
    </form>
  )
}
