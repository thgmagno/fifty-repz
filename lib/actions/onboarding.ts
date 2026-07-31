'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import { privateRoutes } from '@/lib/config'
import { TrainingMode } from '@/lib/generated/prisma/enums'

// "later" = o usuário preferiu decidir depois: o onboarding é marcado como
// concluído (para não reaparecer a cada acesso), mas sem modo de treino.
const choiceSchema = z.enum([TrainingMode.PROGRAM, TrainingMode.SOLO, 'later'])

const destinationByChoice = {
  [TrainingMode.PROGRAM]: privateRoutes.programs,
  [TrainingMode.SOLO]: `${privateRoutes.workouts}/novo`,
  later: privateRoutes.dashboard,
}

export async function completeOnboarding(formData: FormData): Promise<void> {
  const { userId } = await verifySession()

  const parsed = choiceSchema.safeParse(formData.get('choice'))
  if (!parsed.success) {
    return
  }

  const choice = parsed.data

  await prisma.user.update({
    where: { id: userId },
    data: {
      trainingMode: choice === 'later' ? null : choice,
      onboardedAt: new Date(),
    },
  })

  revalidatePath(privateRoutes.dashboard)
  redirect(destinationByChoice[choice])
}
