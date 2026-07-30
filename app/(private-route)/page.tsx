import { notFound } from 'next/navigation'
import { Page } from '@/components/page'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileOverview } from '@/components/profile/profile-overview'
import { MuscleGroupChart } from '@/components/progress/muscle-group-chart'
import { VolumeTrendChart } from '@/components/progress/volume-trend-chart'
import { PersonalRecordsList } from '@/components/progress/personal-records-list'
import { getUser } from '@/lib/dal'
import { getUserProfile } from '@/lib/profile'
import { listFollowers, listFollowing } from '@/lib/follow'
import {
  getMuscleGroupVolume,
  getWeeklyVolumeTrend,
  getPersonalRecords,
} from '@/lib/progress'

export default async function Dashboard() {
  const user = await getUser()

  const [profile, muscleGroupVolume, weeklyTrend, personalRecords] =
    await Promise.all([
      getUserProfile(user.username),
      getMuscleGroupVolume(),
      getWeeklyVolumeTrend(),
      getPersonalRecords(),
    ])

  if (!profile) {
    notFound()
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
      />

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-xl font-bold">Progresso</h2>
          <p className="text-sm text-muted-foreground">
            Sua evolução ao longo do tempo, com base nos treinos concluídos.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Volume total por semana</CardTitle>
          </CardHeader>
          <CardContent>
            <VolumeTrendChart data={weeklyTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Volume por grupo muscular (últimos 90 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <MuscleGroupChart data={muscleGroupVolume} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recordes pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <PersonalRecordsList records={personalRecords} />
          </CardContent>
        </Card>
      </section>
    </Page>
  )
}
