import Link from 'next/link'
import { ArrowRightIcon } from 'lucide-react'
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
import type { UserPlan } from '@/lib/workout-plans'

export function UserPlanCard({ plan }: { plan: UserPlan }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>
          {plan.templates.length}{' '}
          {plan.templates.length === 1 ? 'treino' : 'treinos'}
          {plan.description ? ` · ${plan.description}` : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {plan.templates.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum treino ainda neste plano.
          </p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {plan.templates.slice(0, 4).map((template) => (
              <li key={template.id} className="truncate">
                {template.name}
                <span className="text-xs text-muted-foreground">
                  {' '}
                  · {template.exercises.length}{' '}
                  {template.exercises.length === 1 ? 'exercício' : 'exercícios'}
                </span>
              </li>
            ))}
            {plan.templates.length > 4 && (
              <li className="text-xs text-muted-foreground">
                + {plan.templates.length - 4} treinos
              </li>
            )}
          </ul>
        )}
      </CardContent>
      <CardFooter>
        <Link
          href={`${privateRoutes.plans}/${plan.id}`}
          className={buttonVariants({ variant: 'secondary', size: 'sm' })}
        >
          Abrir plano
          <ArrowRightIcon />
        </Link>
      </CardFooter>
    </Card>
  )
}
