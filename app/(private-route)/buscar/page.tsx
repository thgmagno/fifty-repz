import type { Metadata } from 'next'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'
import { Page } from '@/components/page'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { searchUsers } from '@/lib/users'
import { privateRoutes } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Buscar pessoas',
}

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const users = q ? await searchUsers(q) : []

  return (
    <Page>
      <div>
        <h1 className="text-2xl font-bold">Buscar pessoas</h1>
        <p className="text-sm text-muted-foreground">
          Encontre outros usuários pelo nome ou usuário.
        </p>
      </div>

      <form className="flex gap-2" action={privateRoutes.search}>
        <div className="min-w-48 flex-1">
          <Input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nome ou @usuário…"
            aria-label="Buscar pessoas"
          />
        </div>
        <Button type="submit" variant="outline">
          <SearchIcon />
          Buscar
        </Button>
      </form>

      {q && users.length === 0 && (
        <p className="py-10 text-center text-muted-foreground">
          Nenhum usuário encontrado para &quot;{q}&quot;.
        </p>
      )}

      {users.length > 0 && (
        <ul className="flex flex-col gap-1">
          {users.map((user) => (
            <li key={user.id}>
              <Link
                href={`${privateRoutes.profile}/${user.username}`}
                className="flex items-center gap-3 rounded-md p-2 hover:bg-muted"
              >
                {user.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name ?? user.username}
                    className="size-10 rounded-full"
                  />
                )}
                <div className="flex flex-col text-sm">
                  <span className="font-medium">
                    {user.name ?? `@${user.username}`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    @{user.username}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Page>
  )
}
