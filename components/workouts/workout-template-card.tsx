import Link from 'next/link'
import { PencilIcon, Trash2Icon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DeleteTemplateDialog } from '@/components/workouts/delete-template-dialog'
import { StartWorkoutButton } from '@/components/workouts/start-workout-button'
import { muscleGroupLabels } from '@/lib/exercise-labels'
import { privateRoutes } from '@/lib/config'
import { cn, formatRepTarget } from '@/lib/utils'
import type { UserPlanTemplate } from '@/lib/workout-plans'
import type { InProgressSession } from '@/lib/workout-sessions'

// Card de um treino do usuário: usado na página do plano e na lista de
// treinos, sempre com as mesmas ações.
export function WorkoutTemplateCard({
  template,
  inProgress,
}: {
  template: UserPlanTemplate
  inProgress: InProgressSession | null
}) {
  const muscleGroups = [
    ...new Set(
      template.exercises.map(
        (item) => muscleGroupLabels[item.exercise.muscleGroup],
      ),
    ),
  ]

  return (
    <Card className="@container">
      <CardHeader>
        <CardTitle>{template.name}</CardTitle>
        <CardDescription>
          {template.exercises.length}{' '}
          {template.exercises.length === 1 ? 'exercício' : 'exercícios'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <ol className="flex flex-col gap-1 text-sm">
          {template.exercises.slice(0, 5).map((item) => (
            <li
              key={item.id}
              className="flex items-baseline justify-between gap-2"
            >
              <span className="min-w-0 truncate">{item.exercise.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatRepTarget(
                  item.targetSets,
                  item.targetReps,
                  item.targetRepsMax,
                )}
              </span>
            </li>
          ))}
          {template.exercises.length > 5 && (
            <li className="text-xs text-muted-foreground">
              + {template.exercises.length - 5} exercícios
            </li>
          )}
        </ol>
        <div className="flex flex-wrap gap-1">
          {muscleGroups.slice(0, 4).map((group) => (
            <Badge key={group} variant="secondary">
              {group}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-2 @sm:flex-row @sm:items-center @sm:justify-end">
        <StartWorkoutButton
          templateId={template.id}
          inProgress={inProgress}
          size="sm"
          className="w-full @sm:mr-auto @sm:w-auto"
        />
        <Link
          href={`${privateRoutes.workouts}/${template.id}/editar`}
          className={cn(
            buttonVariants({ variant: 'secondary', size: 'sm' }),
            'w-full @sm:w-auto',
          )}
        >
          <PencilIcon />
          Editar
        </Link>
        <DeleteTemplateDialog
          templateId={template.id}
          templateName={template.name}
          trigger={
            <Button
              variant="destructive"
              size="sm"
              className="w-full @sm:w-auto"
            >
              <Trash2Icon />
              Excluir
            </Button>
          }
        />
      </CardFooter>
    </Card>
  )
}
