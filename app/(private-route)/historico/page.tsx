import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarIcon, ClockIcon, DumbbellIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { listCompletedWorkoutSessions } from '@/lib/workout-sessions'
import { formatDurationLong, formatSessionDate } from '@/lib/utils'
import { privateRoutes } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Histórico',
}

export default async function HistoricoPage() {
  const sessions = await listCompletedWorkoutSessions()

  return (
    <main className="flex flex-col gap-6 py-4">
      <div>
        <h1 className="text-2xl font-bold">Histórico</h1>
        <p className="text-sm text-muted-foreground">
          Suas sessões de treino finalizadas, mais recentes primeiro.
        </p>
      </div>

      {sessions.length === 0 ? (
        <p className="rounded-md border border-dashed py-12 text-center text-muted-foreground">
          Você ainda não finalizou nenhum treino.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {sessions.map((session) => (
            <li key={session.id}>
              <Link
                href={`${privateRoutes.sessions}/${session.id}`}
                className="block"
              >
                <Card className="transition-colors hover:bg-muted/40">
                  <CardHeader>
                    <CardTitle>{session.templateName}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CalendarIcon className="size-4" />
                      {session.completedAt
                        ? formatSessionDate(session.completedAt)
                        : '—'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ClockIcon className="size-4" />
                      {formatDurationLong(session.durationSeconds ?? 0)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <DumbbellIcon className="size-4" />
                      {session.exercises.length}{' '}
                      {session.exercises.length === 1
                        ? 'exercício'
                        : 'exercícios'}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
