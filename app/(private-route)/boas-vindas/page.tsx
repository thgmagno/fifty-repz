import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { LayersIcon, PencilRulerIcon } from 'lucide-react'
import { Page } from '@/components/page'
import { Button } from '@/components/ui/button'
import { OnboardingChoiceCard } from '@/components/onboarding/onboarding-choice-card'
import { completeOnboarding } from '@/lib/actions/onboarding'
import { getUser } from '@/lib/dal'
import { privateRoutes } from '@/lib/config'
import { TrainingMode } from '@/lib/generated/prisma/enums'

export const metadata: Metadata = {
  title: 'Boas-vindas',
}

export default async function BoasVindasPage() {
  const user = await getUser()

  // onboarding é só do primeiro acesso: quem já escolheu volta para a Home
  if (user.onboardedAt) {
    redirect(privateRoutes.dashboard)
  }

  const firstName = user.name?.trim().split(/\s+/)[0]

  return (
    <Page className="mx-auto w-full max-w-3xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">
          {firstName ? `Boas-vindas, ${firstName}!` : 'Boas-vindas!'}
        </h1>
        <p className="text-sm text-muted-foreground">
          Sua conta está pronta. Como você prefere começar? Dá para mudar de
          ideia depois — os dois caminhos ficam sempre disponíveis no app.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <OnboardingChoiceCard
          choice={TrainingMode.PROGRAM}
          icon={LayersIcon}
          title="Seguir o plano Fifty Repz"
          description="Treinos prontos, na ordem certa. Indicado para quem está começando."
          highlights={[
            'Você não precisa escolher exercícios: já vêm definidos',
            'Comece pelo Nível 1 e avance conforme repete os treinos',
            'Cada exercício traz imagens e o passo a passo de execução',
          ]}
          actionLabel="Começar pelo Nível 1"
          recommended
        />

        <OnboardingChoiceCard
          choice={TrainingMode.SOLO}
          icon={PencilRulerIcon}
          title="Montar meus próprios treinos"
          description="Você escolhe os exercícios, as séries e as repetições."
          highlights={[
            'Monte cada treino a partir do catálogo de exercícios',
            'Crie exercícios próprios quando não achar no catálogo',
            'Indicado para quem já treina e sabe o que quer fazer',
          ]}
          actionLabel="Montar meu primeiro treino"
        />
      </div>

      <form action={completeOnboarding} className="flex justify-center">
        <input type="hidden" name="choice" value="later" />
        <Button type="submit" variant="ghost" size="sm">
          Decidir depois, quero só olhar o app
        </Button>
      </form>
    </Page>
  )
}
