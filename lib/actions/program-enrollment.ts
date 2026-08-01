'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import { privateRoutes } from '@/lib/config'
import { ProgramAudience } from '@/lib/generated/prisma/enums'

const audienceSchema = z.enum([ProgramAudience.MALE, ProgramAudience.FEMALE])

// Matrícula na versão do plano oficial. A escolha é definitiva pela
// interface, então o app pergunta uma vez e nunca mais.
export async function enrollInOfficialProgram(
  formData: FormData,
): Promise<void> {
  const { userId } = await verifySession()

  const parsed = audienceSchema.safeParse(formData.get('audience'))
  if (!parsed.success) {
    return
  }

  // updateMany com programAudience nulo: reenviar o formulário (ou clicar
  // duas vezes) nunca troca a versão de quem já se matriculou — e trocar
  // esconderia o progresso feito na outra
  await prisma.user.updateMany({
    where: { id: userId, programAudience: null },
    data: { programAudience: parsed.data },
  })

  // planos, treinos e Home mudam de uma vez
  revalidatePath(privateRoutes.dashboard, 'layout')
}
