'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PlayIcon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { privateRoutes } from '@/lib/config'
import { cn } from '@/lib/utils'

// Único botão flutuante do app: atalho para começar a treinar sem depender
// de abrir o menu lateral. z-30 fica acima do conteúdo e abaixo do overlay
// do sidebar mobile (z-50).
export function StartWorkoutFab({
  workoutInProgress,
}: {
  workoutInProgress: boolean
}) {
  const pathname = usePathname()

  // o atalho só serve para chegar aos treinos: na própria tela de treinos
  // não tem para onde levar, e com treino em andamento o caminho é retomar
  // a sessão, não começar outra
  if (workoutInProgress || pathname === privateRoutes.workouts) return null

  return (
    <Link
      href={privateRoutes.workouts}
      aria-label="Iniciar treino"
      title="Iniciar treino"
      className={cn(
        buttonVariants({ size: 'icon-lg' }),
        'fixed bottom-4 z-30 size-14 rounded-full shadow-lg ltr:right-4 rtl:left-4',
        "[&_svg:not([class*='size-'])]:size-6",
      )}
    >
      <PlayIcon />
    </Link>
  )
}
