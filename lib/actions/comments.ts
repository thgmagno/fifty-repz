'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import { canAccessSession } from '@/lib/workout-sessions'
import { privateRoutes } from '@/lib/config'

export interface CommentFormState {
  success?: boolean
  errors?: {
    body?: string[]
    form?: string[]
  }
}

const commentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Escreva um comentário.')
    .max(500, 'O comentário pode ter no máximo 500 caracteres.'),
})

export async function createComment(
  _prevState: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const { userId } = await verifySession()

  const sessionId = formData.get('sessionId')
  if (typeof sessionId !== 'string' || !sessionId) {
    return { errors: { form: ['Sessão inválida.'] } }
  }

  if (!(await canAccessSession(sessionId))) {
    return { errors: { form: ['Você não tem acesso a essa sessão.'] } }
  }

  const parsed = commentSchema.safeParse({ body: formData.get('body') })
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  await prisma.comment.create({
    data: { userId, sessionId, body: parsed.data.body },
  })

  revalidatePath(`${privateRoutes.sessions}/${sessionId}`)
  revalidatePath(privateRoutes.feed)
  return { success: true }
}

export async function deleteComment(formData: FormData): Promise<void> {
  const { userId } = await verifySession()

  const commentId = formData.get('commentId')
  const sessionId = formData.get('sessionId')
  if (
    typeof commentId !== 'string' ||
    !commentId ||
    typeof sessionId !== 'string' ||
    !sessionId
  ) {
    return
  }

  // ownership garantido na própria query: só exclui o próprio comentário
  await prisma.comment.deleteMany({ where: { id: commentId, userId } })

  revalidatePath(`${privateRoutes.sessions}/${sessionId}`)
  revalidatePath(privateRoutes.feed)
}
