import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle2Icon } from 'lucide-react'
import { Page } from '@/components/page'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WorkoutSessionRunner } from '@/components/sessions/workout-session-runner'
import { LikeButton } from '@/components/likes/like-button'
import { CommentForm } from '@/components/comments/comment-form'
import { CommentList } from '@/components/comments/comment-list'
import { SessionSummary } from '@/components/sessions/session-summary'
import {
  getCompletedSessionSummary,
  getInProgressWorkoutSession,
  getWorkoutSession,
} from '@/lib/workout-sessions'
import { getLikeState } from '@/lib/likes'
import { listComments } from '@/lib/comments'
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
    const backHref = session.isOwner
      ? privateRoutes.history
      : privateRoutes.feed
    const backLabel = session.isOwner ? 'Voltar ao histórico' : 'Voltar ao feed'
    // o resumo é o fecho do treino de quem o fez: quem só está vendo o
    // treino de outra pessoa segue com o registro
    const [likeState, comments, summary, inProgressSession] = await Promise.all(
      [
        getLikeState(session.id),
        listComments(session.id),
        session.isOwner ? getCompletedSessionSummary(session.id) : null,
        session.isOwner ? getInProgressWorkoutSession() : null,
      ],
    )

    return (
      <Page>
        {!session.isOwner && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {session.user.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name ?? session.user.username}
                className="size-6 rounded-full"
              />
            )}
            <span>
              Treino de{' '}
              <Link
                href={`${privateRoutes.profile}/${session.user.username}`}
                className="font-medium text-foreground hover:underline"
              >
                {session.user.name ?? `@${session.user.username}`}
              </Link>
            </span>
          </div>
        )}
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

        {summary && (
          <SessionSummary summary={summary} inProgress={inProgressSession} />
        )}

        <ol className="flex flex-col gap-3">
          {session.exercises.map((exercise, index) => (
            <li key={exercise.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-medium">
                  {index + 1}. {exercise.exerciseName}
                </h2>
                {exercise.skipped && (
                  <Badge variant="secondary">Não feito</Badge>
                )}
              </div>
              {exercise.sets.length > 0 && (
                <ul className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                  {exercise.sets.map((set) => (
                    <li key={set.id}>
                      Série {set.setNumber}:{' '}
                      {set.weightKg ? `${set.weightKg}kg × ` : ''}
                      {set.reps} {set.reps === 1 ? 'repetição' : 'repetições'}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>

        <LikeButton
          sessionId={session.id}
          likeCount={likeState.likeCount}
          likedByMe={likeState.likedByMe}
        />

        <div id="comentarios" className="flex flex-col gap-3">
          <h2 className="font-medium">Comentários</h2>
          <CommentForm sessionId={session.id} />
          <CommentList sessionId={session.id} comments={comments} />
        </div>

        <Link href={backHref} className={buttonVariants()}>
          {backLabel}
        </Link>
      </Page>
    )
  }

  return (
    <Page>
      <h1 className="text-2xl font-bold">{session.templateName}</h1>
      <WorkoutSessionRunner session={session} />
    </Page>
  )
}
