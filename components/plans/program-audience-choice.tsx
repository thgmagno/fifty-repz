import { ArrowRightIcon, DumbbellIcon, SparklesIcon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { enrollInOfficialProgram } from '@/lib/actions/program-enrollment'
import { ProgramAudience } from '@/lib/generated/prisma/enums'

function AudienceCard({
  audience,
  icon: Icon,
  title,
  description,
  highlights,
  actionLabel,
}: {
  audience: ProgramAudience
  icon: LucideIcon
  title: string
  description: string
  highlights: string[]
  actionLabel: string
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="size-5 text-primary" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          {highlights.map((highlight) => (
            <li key={highlight} className="flex gap-2">
              <span aria-hidden className="text-primary">
                •
              </span>
              {highlight}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <form action={enrollInOfficialProgram} className="w-full">
          <input type="hidden" name="audience" value={audience} />
          <Button type="submit" className="w-full">
            {actionLabel}
            <ArrowRightIcon />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

// O plano oficial tem duas versões, e a escolha acontece aqui — uma vez só,
// na primeira vez que a pessoa entra nos planos.
export function ProgramAudienceChoice() {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-xl font-bold">Plano Fifty Repz</h2>
        <p className="text-sm text-muted-foreground">
          O plano oficial tem duas versões: a mesma jornada de 5 níveis, com
          seleção de exercícios diferente. Escolha a sua para começar.
        </p>
        <p className="text-xs text-muted-foreground">
          Você escolhe uma vez: depois disso, seus treinos ficam nesta versão.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AudienceCard
          audience={ProgramAudience.MALE}
          icon={DumbbellIcon}
          title="Versão masculina"
          description="Seleção com mais volume de peito, ombros e braços."
          highlights={[
            '5 níveis, 19 treinos prontos',
            'Peito, costas e pernas equilibrados',
            '50 treinos concluídos liberam o próximo nível',
          ]}
          actionLabel="Seguir a versão masculina"
        />
        <AudienceCard
          audience={ProgramAudience.FEMALE}
          icon={SparklesIcon}
          title="Versão feminina"
          description="Seleção com mais ênfase em glúteos, posterior de coxa e pernas."
          highlights={[
            '5 níveis, 19 treinos prontos',
            'Mais volume de glúteos, posterior e pernas',
            '50 treinos concluídos liberam o próximo nível',
          ]}
          actionLabel="Seguir a versão feminina"
        />
      </div>
    </section>
  )
}
