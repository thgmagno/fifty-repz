'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/dal'
import { deleteSession } from '@/lib/session'
import { privateRoutes, publicRoutes } from '@/lib/config'

export interface DeleteAccountFormState {
  errors?: {
    confirmation?: string[]
    form?: string[]
  }
}

// Exclusão definitiva da conta. Tudo que pertence ao usuário sai junto por
// cascata de banco (as FKs são ON DELETE CASCADE): exercícios próprios,
// planos, treinos, sessões e suas séries, quem ele segue e quem o segue, e
// as curtidas e comentários que ele deixou — inclusive nas sessões de outras
// pessoas. Não há soft delete: o pedido é remover os dados, não escondê-los.
export async function deleteAccount(
  _prevState: DeleteAccountFormState,
  formData: FormData,
): Promise<DeleteAccountFormState> {
  const user = await getUser()

  // A digitação do usuário é revalidada aqui, e não só na tela: uma ação de
  // servidor é um endpoint como outro qualquer, e esta é irreversível.
  const confirmation = String(formData.get('confirmation') ?? '')
    .trim()
    .toLowerCase()

  if (confirmation !== user.username.toLowerCase()) {
    return {
      errors: {
        confirmation: [`Digite ${user.username} para confirmar a exclusão.`],
      },
    }
  }

  try {
    await prisma.user.delete({ where: { id: user.id } })
  } catch {
    return {
      errors: {
        form: [
          'Não foi possível excluir a conta agora. Tente de novo em alguns instantes.',
        ],
      },
    }
  }

  // o cookie some junto: sem isso a sessão seguiria válida apontando para um
  // usuário que não existe mais
  await deleteSession()

  // perfis, feed e busca deixam de mostrar o usuário excluído
  revalidatePath(privateRoutes.dashboard, 'layout')

  return redirect(publicRoutes.login)
}
