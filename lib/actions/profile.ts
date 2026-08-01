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
    name?: string[]
    username?: string[]
    bio?: string[]
    form?: string[]
  }
}

const USERNAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .max(60, 'O nome pode ter no máximo 60 caracteres.')
    .optional(),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'O usuário precisa ter pelo menos 3 caracteres.')
    .max(30, 'O usuário pode ter no máximo 30 caracteres.')
    .regex(USERNAME_PATTERN, 'Use apenas letras minúsculas, números e hífen.'),
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

  const name = formData.get('name')
  const bio = formData.get('bio')
  const parsed = profileSchema.safeParse({
    // campo em branco vira null: o perfil cai no @usuário, como antes de
    // existir nome nenhum
    name: typeof name === 'string' && name.trim() === '' ? undefined : name,
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

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.name ?? null,
      username: parsed.data.username,
      bio: parsed.data.bio ?? null,
    },
  })

  // nome e usuário aparecem em perfil, feed, comentários e busca:
  // revalidar só o perfil deixaria o nome antigo pelo caminho
  revalidatePath(privateRoutes.dashboard, 'layout')
  return { success: true }
}
