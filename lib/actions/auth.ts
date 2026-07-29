'use server'

import { redirect } from 'next/navigation'
import { deleteSession } from '@/lib/session'
import { publicRoutes } from '@/lib/config'

export async function logout() {
  await deleteSession()
  redirect(publicRoutes.login)
}
