'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import { privateRoutes } from '@/lib/config'
import { isReservedUsername } from '@/lib/username'

export interface ProfileFormState {
  success?: boolean
  errors?: {
    username?: string[]
    bio?: string[]
    form?: string[]
  }
}

const USERNAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

const profileSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'O usuário precisa ter pelo menos 3 caracteres.')
    .max(30, 'O usuário pode ter no máximo 30 caracteres.')
    .regex(
      USERNAME_PATTERN,
      'Use apenas letras minúsculas, números e hífen.',
    ),
  bio: z
    .string()
    .trim()
    .max(280, 'A bio pode ter no máximo 280 caracteres.')
    .optional(),
})

export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const { userId } = await verifySession()

  const bio = formData.get('bio')
  const parsed = profileSchema.safeParse({
    username: formData.get('username'),
    bio: typeof bio === 'string' && bio.trim() === '' ? undefined : bio,
  })

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  if (isReservedUsername(parsed.data.username)) {
    return {
      errors: { username: ['Esse nome de usuário não está disponível.'] },
    }
  }

  const existing = await prisma.user.findUnique({
    where: { username: parsed.data.username },
    select: { id: true },
  })

  if (existing && existing.id !== userId) {
    return { errors: { username: ['Esse nome de usuário já está em uso.'] } }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { username: parsed.data.username, bio: parsed.data.bio ?? null },
  })

  revalidatePath(`${privateRoutes.profile}/${user.username}`)
  revalidatePath(privateRoutes.editProfile)
  return { success: true }
}
