import { notFound, redirect } from 'next/navigation'
import { Page } from '@/components/page'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileOverview } from '@/components/profile/profile-overview'
import { FirstWorkoutCard } from '@/components/home/first-workout-card'
import { HomeQuickActions } from '@/components/home/home-quick-actions'
import { InProgressSessionBanner } from '@/components/workouts/in-progress-session-banner'
import { MuscleGroupChart } from '@/components/progress/muscle-group-chart'
import { VolumeTrendChart } from '@/components/progress/volume-trend-chart'
import { PersonalRecordsList } from '@/components/progress/personal-records-list'
import { getUser } from '@/lib/dal'
import { getUserProfile } from '@/lib/profile'
import { listFollowers, listFollowing } from '@/lib/follow'
import { getInProgressWorkoutSession } from '@/lib/workout-sessions'
import { privateRoutes } from '@/lib/config'
import {
  getMuscleGroupVolume,
  getWeeklyVolumeTrend,
  getPersonalRecords,
} from '@/lib/progress'

export default async function Dashboard() {
  const user = await getUser()

  // primeiro acesso: antes do painel, o usuário escolhe como quer treinar
  if (!user.onboardedAt) {
    redirect(privateRoutes.onboarding)
  }

  const [
    profile,
    muscleGroupVolume,
    weeklyTrend,
    personalRecords,
    inProgressSession,
  ] = await Promise.all([
    getUserProfile(user.username),
    getMuscleGroupVolume(),
    getWeeklyVolumeTrend(),
    getPersonalRecords(),
    getInProgressWorkoutSession(),
  ])

  if (!profile) {
    notFound()
  }

  const [followers, following] = await Promise.all([
    listFollowers(profile.id),
    listFollowing(profile.id),
  ])

  const hasCompletedSessions = profile.stats.completedSessionsCount > 0

  return (
    <Page>
      {inProgressSession ? (
        <InProgressSessionBanner session={inProgressSession} />
      ) : (
        <HomeQuickActions trainingMode={user.trainingMode} />
      )}

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

        {hasCompletedSessions ? (
          <>
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
                <CardTitle>
                  Volume por grupo muscular (últimos 90 dias)
                </CardTitle>
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
          </>
        ) : (
          <FirstWorkoutCard trainingMode={user.trainingMode} />
        )}
      </section>
    </Page>
  )
}
