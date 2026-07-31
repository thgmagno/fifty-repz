import Link from 'next/link'
import { LayersIcon, PlusIcon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { privateRoutes } from '@/lib/config'
import { cn } from '@/lib/utils'
import { TrainingMode } from '@/lib/generated/prisma/enums'

const steps = [
  'Escolha um treino — pronto, do plano Fifty Repz, ou montado por você.',
  'Durante o treino, registre cada série com o peso e as repetições.',
  'Finalize o treino: ele entra no seu histórico e nos gráficos daqui.',
]

// Estado inicial da Home enquanto não há nenhum treino concluído: no lugar de
// três gráficos vazios, o próximo passo explicado.
export function FirstWorkoutCard({
  trainingMode,
}: {
  trainingMode: TrainingMode | null
}) {
  const isSolo = trainingMode === TrainingMode.SOLO

  const programLink = (
    <Link
      href={privateRoutes.programs}
      className={cn(
        buttonVariants({ variant: isSolo ? 'secondary' : 'default' }),
        'w-full sm:w-auto',
      )}
    >
      <LayersIcon />
      Comece pelo Nível 1 do plano Fifty Repz
    </Link>
  )

  const builderLink = (
    <Link
      href={`${privateRoutes.workouts}/novo`}
      className={cn(
        buttonVariants({ variant: isSolo ? 'default' : 'secondary' }),
        'w-full sm:w-auto',
      )}
    >
      <PlusIcon />
      Montar meu próprio treino
    </Link>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seu primeiro treino</CardTitle>
        <CardDescription>
          Ainda não há nada para mostrar aqui. Assim que você concluir o
          primeiro treino, esta área passa a exibir sua evolução.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="flex flex-col gap-2 text-sm">
          {steps.map((step, index) => (
            <li key={step} className="flex gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {index + 1}
              </span>
              <span className="text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-2 sm:flex-row sm:items-center">
        {isSolo ? builderLink : programLink}
        {isSolo ? programLink : builderLink}
      </CardFooter>
    </Card>
  )
}
