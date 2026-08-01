import type { Metadata } from 'next'
import { Page } from '@/components/page'
import { EditProfileForm } from '@/components/profile/edit-profile-form'
import { getUser } from '@/lib/dal'
import { privateRoutes } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Editar perfil',
}

// Só caminho interno, e nunca a própria edição: evita mandar o usuário para
// fora do app ou de volta para o formulário depois de salvar.
function parseOrigin(value: string | undefined) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null
  if (value.startsWith(privateRoutes.editProfile)) return null
  return value
}

export default async function EditarPerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ de?: string }>
}) {
  const [user, { de }] = await Promise.all([getUser(), searchParams])

  return (
    <Page>
      <div>
        <h1 className="text-2xl font-bold">Editar perfil</h1>
        <p className="text-sm text-muted-foreground">
          Ajuste como você aparece para as outras pessoas no app.
        </p>
      </div>
      <EditProfileForm
        name={user.name}
        image={user.image}
        username={user.username}
        bio={user.bio}
        backTo={parseOrigin(de) ?? `${privateRoutes.profile}/${user.username}`}
      />
    </Page>
  )
}
