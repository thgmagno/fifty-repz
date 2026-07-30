import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarIcon, ClockIcon, WeightIcon } from 'lucide-react'
import { Page } from '@/components/page'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { listFeedSessions, hasAnyFollowing } from '@/lib/feed'
import {
  formatDurationLong,
  formatSessionDate,
  formatVolume,
  cn,
} from '@/lib/utils'
import { privateRoutes } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Feed',
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>
}) {
  const { cursor } = await searchParams
  const [{ items, nextCursor }, following] = await Promise.all([
    listFeedSessions(cursor),
    hasAnyFollowing(),
  ])

  return (
    <Page>
      <div>
        <h1 className="text-2xl font-bold">Feed</h1>
        <p className="text-sm text-muted-foreground">
          Treinos finalizados de quem você segue, mais recentes primeiro.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="rounded-md border border-dashed py-12 text-center text-muted-foreground">
          {following
            ? 'As pessoas que você segue ainda não finalizaram nenhum treino.'
            : 'Você ainda não segue ninguém. Use a busca para encontrar pessoas.'}
        </p>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {items.map((session) => (
              <li key={session.id}>
                <Link
                  href={`${privateRoutes.sessions}/${session.id}`}
                  className="block"
                >
                  <Card className="transition-colors hover:bg-muted/40">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        {session.user.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={session.user.image}
                            alt={session.user.name ?? session.user.username}
                            className="size-8 rounded-full"
                          />
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {session.user.name ?? `@${session.user.username}`}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            @{session.user.username}
                          </span>
                        </div>
                      </div>
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
                        <WeightIcon className="size-4" />
                        {formatVolume(session.totalVolume)}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
          {nextCursor && (
            <Link
              href={`${privateRoutes.feed}?cursor=${nextCursor}`}
              className={cn(buttonVariants({ variant: 'outline' }), 'self-center')}
            >
              Carregar mais
            </Link>
          )}
        </>
      )}
    </Page>
  )
}
