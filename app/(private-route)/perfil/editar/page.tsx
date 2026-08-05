import type { Metadata } from 'next'
import { Page } from '@/components/page'
import { EditProfileForm } from '@/components/profile/edit-profile-form'
import { DeleteAccountDialog } from '@/components/profile/delete-account-dialog'
import { Separator } from '@/components/ui/separator'
import { getUser } from '@/lib/dal'
import { getAccountDeletionSummary } from '@/lib/profile'
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
  const [user, { de }, deletionSummary] = await Promise.all([
    getUser(),
    searchParams,
    getAccountDeletionSummary(),
  ])

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

      <Separator />

      {/* Fica no fim da página e fora do formulário de edição: excluir a
          conta não é uma alteração de perfil, e nada aqui deve ficar a um
          clique de distância de "Salvar". */}
      <section className="flex flex-col gap-2">
        <h2 className="font-medium">Excluir conta</h2>
        <p className="text-sm text-muted-foreground">
          Apaga sua conta e todos os seus dados de forma permanente. Essa ação
          não pode ser desfeita.
        </p>
        <div>
          <DeleteAccountDialog
            username={user.username}
            summary={deletionSummary}
          />
        </div>
      </section>
    </Page>
  )
}
