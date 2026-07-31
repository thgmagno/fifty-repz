import Link from 'next/link'
import { LayersIcon, PlayIcon, PlusIcon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { privateRoutes } from '@/lib/config'
import { cn } from '@/lib/utils'
import { TrainingMode } from '@/lib/generated/prisma/enums'

// Ação rápida fixa da Home: garante que sempre existe um caminho visível para
// começar a treinar, sem depender do menu lateral.
export function HomeQuickActions({
  trainingMode,
}: {
  trainingMode: TrainingMode | null
}) {
  const isSolo = trainingMode === TrainingMode.SOLO

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pronto para treinar?</CardTitle>
        <CardDescription>
          {isSolo
            ? 'Escolha um dos seus treinos e comece agora.'
            : 'Escolha um treino do plano Fifty Repz e comece agora.'}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex-col items-stretch gap-2 sm:flex-row sm:items-center">
        <Link
          href={isSolo ? privateRoutes.workouts : privateRoutes.programs}
          className={cn(buttonVariants(), 'w-full sm:w-auto')}
        >
          <PlayIcon />
          Iniciar treino
        </Link>
        <Link
          href={
            isSolo ? privateRoutes.programs : `${privateRoutes.workouts}/novo`
          }
          className={cn(
            buttonVariants({ variant: 'secondary' }),
            'w-full sm:w-auto',
          )}
        >
          {isSolo ? <LayersIcon /> : <PlusIcon />}
          {isSolo ? 'Ver o plano Fifty Repz' : 'Montar meu próprio treino'}
        </Link>
      </CardFooter>
    </Card>
  )
}
