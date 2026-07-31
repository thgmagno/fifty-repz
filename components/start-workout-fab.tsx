import Link from 'next/link'
import { PlayIcon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { privateRoutes } from '@/lib/config'
import { cn } from '@/lib/utils'

// Único botão flutuante do app: atalho sempre visível para começar a treinar,
// sem depender de abrir o menu lateral. z-30 fica acima do conteúdo e abaixo
// do overlay do sidebar mobile (z-50).
export function StartWorkoutFab() {
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
