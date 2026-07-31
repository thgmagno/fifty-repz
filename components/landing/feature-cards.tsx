import {
  ClipboardListIcon,
  DumbbellIcon,
  FlameIcon,
  TrendingUpIcon,
  UsersIcon,
  WifiOffIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    icon: ClipboardListIcon,
    title: 'Treinos sob medida',
    description:
      'Monte seus próprios treinos com exercícios, séries e faixas de repetição.',
  },
  {
    icon: DumbbellIcon,
    title: 'Registro em tempo real',
    description:
      'Registre cada série durante o treino, com timer de descanso incluso.',
  },
  {
    icon: TrendingUpIcon,
    title: 'Progresso visual',
    description:
      'Gráficos de volume por semana, por grupo muscular e seus recordes pessoais.',
  },
  {
    icon: UsersIcon,
    title: 'Comunidade fitness',
    description: 'Siga amigos, curta e comente os treinos deles no feed.',
  },
  {
    icon: FlameIcon,
    title: 'Frequência e histórico',
    description:
      'Heatmap do último ano e o histórico completo de cada sessão concluída.',
  },
  {
    icon: WifiOffIcon,
    title: 'Funciona offline',
    description:
      'Instale como app no celular e continue registrando séries mesmo sem internet.',
  },
]

export function FeatureCards() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-16">
      <div className="text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Tudo que você precisa para treinar
        </h2>
        <p className="mt-2 text-muted-foreground">
          Da montagem do treino ao acompanhamento da evolução, sem depender de
          planilha.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <feature.icon className="size-6 text-primary" />
              <CardTitle className="pt-2">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {feature.description}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
