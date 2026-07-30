import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { Page } from '@/components/page'
import { Button } from '@/components/ui/button'
import { ProfileOverview } from '@/components/profile/profile-overview'
import { getUserProfile } from '@/lib/profile'
import { getUser } from '@/lib/dal'
import { listFollowers, listFollowing } from '@/lib/follow'
import { followUser, unfollowUser } from '@/lib/actions/follow'
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

  // O perfil do próprio usuário só é acessível pelo dashboard.
  if (profile.id === currentUser.id) {
    redirect(privateRoutes.dashboard)
  }

  const [followers, following] = await Promise.all([
    listFollowers(profile.id),
    listFollowing(profile.id),
  ])

  return (
    <Page>
      <ProfileOverview
        profile={profile}
        followers={followers}
        following={following}
        actions={
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
        }
      />
    </Page>
  )
}
