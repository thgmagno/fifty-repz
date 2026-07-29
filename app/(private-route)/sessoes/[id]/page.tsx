import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle2Icon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WorkoutSessionRunner } from '@/components/sessions/workout-session-runner'
import { getWorkoutSession } from '@/lib/workout-sessions'
import { formatDurationLong, formatSessionDate } from '@/lib/utils'
import { privateRoutes } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Sessão de treino',
}

export default async function SessaoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getWorkoutSession(id)

  if (!session) {
    notFound()
  }

  if (session.status === 'COMPLETED') {
    return (
      <main className="flex flex-col gap-6 py-4">
        <div className="flex items-center gap-2">
          <CheckCircle2Icon className="text-primary" />
          <h1 className="text-2xl font-bold">{session.templateName}</h1>
        </div>
        <p className="text-muted-foreground">
          {session.completedAt && (
            <>Concluído em {formatSessionDate(session.completedAt)} — </>
          )}
          {formatDurationLong(session.durationSeconds ?? 0)} no total.
        </p>
        <ol className="flex flex-col gap-3">
          {session.exercises.map((exercise, index) => (
            <li key={exercise.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-medium">
                  {index + 1}. {exercise.exerciseName}
                </h2>
                {exercise.skipped && <Badge variant="secondary">Pulado</Badge>}
              </div>
              {exercise.sets.length > 0 && (
                <ul className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                  {exercise.sets.map((set) => (
                    <li key={set.id}>
                      Série {set.setNumber}:{' '}
                      {set.weightKg ? `${set.weightKg}kg × ` : ''}
                      {set.reps} reps
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
        <Link href={privateRoutes.history} className={buttonVariants()}>
          Voltar ao histórico
        </Link>
      </main>
    )
  }

  return (
    <main className="flex flex-col gap-6 py-4">
      <h1 className="text-2xl font-bold">{session.templateName}</h1>
      <WorkoutSessionRunner session={session} />
    </main>
  )
}
