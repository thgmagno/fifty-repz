import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ClockIcon, DumbbellIcon, PencilIcon } from 'lucide-react'
import { Page } from '@/components/page'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProfileHeatmap } from '@/components/profile-heatmap'
import { FollowListDialog } from '@/components/profile/follow-list-dialog'
import { getUserProfile } from '@/lib/profile'
import { getUser } from '@/lib/dal'
import { listFollowers, listFollowing } from '@/lib/follow'
import { followUser, unfollowUser } from '@/lib/actions/follow'
import { formatDurationLong } from '@/lib/utils'
import { privateRoutes } from '@/lib/config'

interface PerfilPageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({
  params,
}: PerfilPageProps): Promise<Metadata> {
  const { username } = await params
  return { title: `@${username}` }
}

export default async function PerfilPage({ params }: PerfilPageProps) {
  const { username } = await params
  const [profile, currentUser] = await Promise.all([
    getUserProfile(username),
    getUser(),
  ])

  if (!profile) {
    notFound()
  }

  const isOwnProfile = profile.id === currentUser.id
  const [followers, following] = await Promise.all([
    listFollowers(profile.id),
    listFollowing(profile.id),
  ])

  return (
    <Page>
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
            <p className="text-sm text-muted-foreground">
              @{profile.username}
            </p>
          </div>
        </div>
        {isOwnProfile ? (
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={privateRoutes.editProfile} />}
          >
            <PencilIcon />
            Editar perfil
          </Button>
        ) : (
          <form action={profile.isFollowing ? unfollowUser : followUser}>
            <input type="hidden" name="userId" value={profile.id} />
            <input type="hidden" name="username" value={profile.username} />
            <Button
              type="submit"
              variant={profile.isFollowing ? 'outline' : 'default'}
            >
              {profile.isFollowing ? 'Deixar de seguir' : 'Seguir'}
            </Button>
          </form>
        )}
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
    </Page>
  )
}
