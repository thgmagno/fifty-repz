import { getUser } from '@/lib/dal'

export default async function Dashboard() {
  const user = await getUser()

  return (
    <main>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        Bem-vindo, {user.name ?? user.email}!
      </p>
    </main>
  )
}
