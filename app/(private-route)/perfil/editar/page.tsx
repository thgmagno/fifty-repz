import type { Metadata } from 'next'
import { Page } from '@/components/page'
import { EditProfileForm } from '@/components/profile/edit-profile-form'
import { getUser } from '@/lib/dal'

export const metadata: Metadata = {
  title: 'Editar perfil',
}

export default async function EditarPerfilPage() {
  const user = await getUser()

  return (
    <Page>
      <div>
        <h1 className="text-2xl font-bold">Editar perfil</h1>
        <p className="text-sm text-muted-foreground">
          Escolha seu nome de usuário e conte um pouco sobre você.
        </p>
      </div>
      <EditProfileForm username={user.username} bio={user.bio} />
    </Page>
  )
}
