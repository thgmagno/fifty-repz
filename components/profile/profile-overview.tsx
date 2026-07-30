import type { ReactNode } from 'react'
import { ClockIcon, DumbbellIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProfileHeatmap } from '@/components/profile-heatmap'
import { FollowListDialog } from '@/components/profile/follow-list-dialog'
import { formatDurationLong } from '@/lib/utils'
import type { UserProfile } from '@/lib/profile'
import type { FollowListItem } from '@/lib/follow'

export function ProfileOverview({
  profile,
  followers,
  following,
  actions,
}: {
  profile: UserProfile
  followers: FollowListItem[]
  following: FollowListItem[]
  actions?: ReactNode
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {profile.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.image}
              alt={profile.name ?? profile.username}
              className="size-16 rounded-full"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold">
              {profile.name ?? `@${profile.username}`}
            </h1>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          </div>
        </div>
        {actions}
      </div>

      {profile.bio && <p className="text-sm">{profile.bio}</p>}

      <div className="flex items-center gap-4">
        <FollowListDialog
          title="Seguidores"
          users={followers}
          trigger={
            <Button variant="ghost" size="sm" className="h-auto px-1">
              <strong>{profile.stats.followersCount}</strong>
              seguidores
            </Button>
          }
        />
        <FollowListDialog
          title="Seguindo"
          users={following}
          trigger={
            <Button variant="ghost" size="sm" className="h-auto px-1">
              <strong>{profile.stats.followingCount}</strong>
              seguindo
            </Button>
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-sm font-normal text-muted-foreground">
              <DumbbellIcon className="size-4" />
              Treinos concluídos
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {profile.stats.completedSessionsCount}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-sm font-normal text-muted-foreground">
              <ClockIcon className="size-4" />
              Tempo total treinado
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {formatDurationLong(profile.stats.totalDurationSeconds)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frequência no último ano</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileHeatmap days={profile.heatmap} />
        </CardContent>
      </Card>
    </>
  )
}
