import { Page } from '@/components/page'
import { getUser } from '@/lib/dal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MuscleGroupChart } from '@/components/progress/muscle-group-chart'
import { VolumeTrendChart } from '@/components/progress/volume-trend-chart'
import { PersonalRecordsList } from '@/components/progress/personal-records-list'

import {
  getMuscleGroupVolume,
  getWeeklyVolumeTrend,
  getPersonalRecords,
} from '@/lib/progress'

export default async function Dashboard() {
  const user = await getUser()

  const [muscleGroupVolume, weeklyTrend, personalRecords] = await Promise.all(
    [getMuscleGroupVolume(), getWeeklyVolumeTrend(), getPersonalRecords()],
  )

  return (
    <Page>
      <h1 className="text-2xl font-bold">Olá, {user.name ?? user.email}!</h1>

      <section className='flex flex-col gap-3'>
        <div>
          <h1 className="text-xl font-bold">Progresso</h1>
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
