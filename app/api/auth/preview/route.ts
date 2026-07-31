import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/session'
import { privateRoutes } from '@/lib/config'
import { generateUniqueUsername } from '@/lib/username'

const PREVIEW_GOOGLE_ID = 'preview-deployment-test-user'

// Login sem Google, só pra Preview Deployments da Vercel: a URL de preview
// muda a cada PR e não dá pra cadastrar redirect_uri em tempo real no
// Google Console, então o fluxo OAuth real fica inacessível ali. Gate
// server-side por VERCEL_ENV: em produção (e local) esta rota sempre 404.
export async function GET(req: NextRequest) {
  if (process.env.VERCEL_ENV !== 'preview') {
    return new NextResponse(null, { status: 404 })
  }

  const user = await prisma.user.upsert({
    where: { googleId: PREVIEW_GOOGLE_ID },
    update: {},
    create: {
      googleId: PREVIEW_GOOGLE_ID,
      email: 'preview@fiftyrepz.dev',
      name: 'Usuário de Preview',
      username: await generateUniqueUsername('usuario-preview'),
    },
  })

  await createSession(user.id)

  return NextResponse.redirect(new URL(privateRoutes.dashboard, req.url))
}
