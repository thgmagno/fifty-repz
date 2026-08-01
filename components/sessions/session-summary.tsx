import Link from 'next/link'
import { CheckCircle2Icon, HistoryIcon, PartyPopperIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StartWorkoutButton } from '@/components/workouts/start-workout-button'
import { privateRoutes } from '@/lib/config'
import { formatDurationLong, formatVolume } from '@/lib/utils'
import type {
  CompletedSessionSummary,
  InProgressSession,
} from '@/lib/workout-sessions'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-2.5">
      <p className="text-lg font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

// O que aparece logo depois de finalizar: o esforço de agora, onde ele deixa
// a progressão do nível e para onde ir em seguida.
export function SessionSummary({
  summary,
  inProgress,
}: {
  summary: CompletedSessionSummary
  inProgress: InProgressSession | null
}) {
  const { level } = summary

  return (
    <Card className={summary.isFirstWorkout ? 'border-primary/40' : undefined}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {/* o título da página já diz que o treino foi concluído: aqui só
              vale gastar destaque com o que é novo */}
          {summary.isFirstWorkout ? (
            <>
              <PartyPopperIcon className="text-primary" />
              Seu primeiro treino, feito!
            </>
          ) : (
            <>
              <CheckCircle2Icon className="text-primary" />
              Resumo do treino
            </>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat
            label="de treino"
            value={formatDurationLong(summary.durationSeconds)}
          />
          <Stat
            label={summary.totalSets === 1 ? 'série' : 'séries'}
            value={String(summary.totalSets)}
          />
          <Stat
            label="exercícios"
            value={`${summary.completedExercises}/${summary.totalExercises}`}
          />
          {/* volume só aparece quando houve peso: treino de peso corporal
              mostraria "0 kg" e confundiria mais do que informaria */}
          {summary.volumeKg > 0 && (
            <Stat
              label="de peso levantado"
              value={formatVolume(summary.volumeKg)}
            />
          )}
        </div>

        {level && (
          <div className="flex flex-wrap items-center gap-2 rounded-md border p-2.5">
            <span className="text-sm font-medium">{level.name}</span>
            <Badge
              variant={
                level.completions >= level.unlockThreshold
                  ? 'default'
                  : 'outline'
              }
            >
              {level.completions}/{level.unlockThreshold}
            </Badge>
            <span className="text-xs text-muted-foreground">
              treinos concluídos
            </span>
            {level.justUnlockedNext && level.nextLevelName && (
              <Badge className="ml-auto">{level.nextLevelName} liberado!</Badge>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {level?.nextTemplate && (
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                Próximo: {level.nextTemplate.name}
              </span>
              <StartWorkoutButton
                templateId={level.nextTemplate.id}
                inProgress={inProgress}
                className="w-full sm:w-auto"
              />
            </div>
          )}
          <Link
            href={privateRoutes.history}
            className={`${buttonVariants({ variant: 'secondary' })} sm:ml-auto`}
          >
            <HistoryIcon />
            Ver histórico
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
