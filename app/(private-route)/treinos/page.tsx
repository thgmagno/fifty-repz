import type { Metadata } from 'next'
import Link from 'next/link'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
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
import { listWorkoutTemplates } from '@/lib/workout-templates'
import { muscleGroupLabels } from '@/lib/exercise-labels'
import { privateRoutes } from '@/lib/config'
import { formatRepTarget } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Treinos',
}

export default async function TreinosPage() {
  const templates = await listWorkoutTemplates()

  return (
    <main className="flex flex-col gap-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Treinos</h1>
          <p className="text-sm text-muted-foreground">
            Seus templates de treino, prontos para iniciar uma sessão.
          </p>
        </div>
        <Link
          href={`${privateRoutes.workouts}/novo`}
          className={buttonVariants()}
        >
          <PlusIcon />
          Novo treino
        </Link>
      </div>

      {templates.length === 0 ? (
        <p className="rounded-md border border-dashed py-12 text-center text-muted-foreground">
          Você ainda não tem treinos. Monte o primeiro!
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => {
            const muscleGroups = [
              ...new Set(
                template.exercises.map(
                  (item) => muscleGroupLabels[item.exercise.muscleGroup],
                ),
              ),
            ]

            return (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>
                    {template.exercises.length}{' '}
                    {template.exercises.length === 1
                      ? 'exercício'
                      : 'exercícios'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <ol className="flex flex-col gap-1 text-sm">
                    {template.exercises.slice(0, 5).map((item) => (
                      <li
                        key={item.id}
                        className="flex items-baseline justify-between gap-2"
                      >
                        <span className="min-w-0 truncate">
                          {item.exercise.name}
                        </span>
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
                <CardFooter className="justify-end">
                  <Link
                    href={`${privateRoutes.workouts}/${template.id}/editar`}
                    className={buttonVariants({
                      variant: 'ghost',
                      size: 'sm',
                    })}
                  >
                    <PencilIcon />
                    Editar
                  </Link>
                  <DeleteTemplateDialog
                    templateId={template.id}
                    templateName={template.name}
                    trigger={
                      <Button variant="destructive" size="sm">
                        <Trash2Icon />
                        Excluir
                      </Button>
                    }
                  />
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </main>
  )
}
