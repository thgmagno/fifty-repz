import type { LucideIcon } from 'lucide-react'
import { ArrowRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { completeOnboarding } from '@/lib/actions/onboarding'

export function OnboardingChoiceCard({
  choice,
  icon: Icon,
  title,
  description,
  highlights,
  actionLabel,
  recommended = false,
}: {
  choice: string
  icon: LucideIcon
  title: string
  description: string
  highlights: string[]
  actionLabel: string
  recommended?: boolean
}) {
  return (
    <Card
      className={recommended ? 'border-primary/40 bg-primary/5' : undefined}
    >
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
        <form action={completeOnboarding} className="w-full">
          <input type="hidden" name="choice" value={choice} />
          <Button
            type="submit"
            variant={recommended ? 'default' : 'secondary'}
            className="w-full"
          >
            {actionLabel}
            <ArrowRightIcon />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
