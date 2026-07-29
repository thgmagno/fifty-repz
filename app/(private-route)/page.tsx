import { Page } from '@/components/page'
import { getUser } from '@/lib/dal'

export default async function Dashboard() {
  const user = await getUser()

  return (
    <Page>
      <h1 className="text-2xl font-bold">Eaí, {user.name ?? user.email}!</h1>
    </Page>
  )
}
