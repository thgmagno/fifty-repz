import { redirect } from 'next/navigation'
import { Page } from '@/components/page'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FirstWorkoutCard } from '@/components/home/first-workout-card'
import { HomeQuickActions } from '@/components/home/home-quick-actions'
import { InProgressSessionBanner } from '@/components/workouts/in-progress-session-banner'
import { MuscleGroupChart } from '@/components/progress/muscle-group-chart'
import { VolumeTrendChart } from '@/components/progress/volume-trend-chart'
import { PersonalRecordsList } from '@/components/progress/personal-records-list'
import { getUser } from '@/lib/dal'
import {
  countCompletedWorkoutSessions,
  getInProgressWorkoutSession,
} from '@/lib/workout-sessions'
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
    completedSessionsCount,
    muscleGroupVolume,
    weeklyTrend,
    personalRecords,
    inProgressSession,
  ] = await Promise.all([
    countCompletedWorkoutSessions(),
    getMuscleGroupVolume(),
    getWeeklyVolumeTrend(),
    getPersonalRecords(),
    getInProgressWorkoutSession(),
  ])

  const hasCompletedSessions = completedSessionsCount > 0

  return (
    <Page>
      {inProgressSession ? (
        <InProgressSessionBanner session={inProgressSession} />
      ) : (
        <HomeQuickActions name={user.name} trainingMode={user.trainingMode} />
      )}

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
                {/* "volume" não é explicado em lugar nenhum do app */}
                <CardDescription>
                  Volume = peso × repetições, somado. Toque numa barra para ver
                  a semana.
                </CardDescription>
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
                <CardDescription>
                  Volume = peso × repetições, somado.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MuscleGroupChart data={muscleGroupVolume} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recordes pessoais</CardTitle>
                <CardDescription>
                  O maior peso que você já levantou em cada exercício.
                </CardDescription>
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
