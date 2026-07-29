import { getUser } from '@/lib/dal'

export default async function Dashboard() {
  const user = await getUser()

  return (
    <main>
      <h1 className="text-2xl font-bold">Eaí, {user.name ?? user.email}!</h1>
    </main>
  )
}
