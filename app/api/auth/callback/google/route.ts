import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decodeJwt } from 'jose'
import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/session'
import { privateRoutes, publicRoutes } from '@/lib/config'
import {
  GOOGLE_TOKEN_URL,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  getRedirectUri,
} from '@/lib/oauth'

interface GoogleIdTokenClaims {
  sub: string
  email: string
  email_verified?: boolean
  name?: string
  picture?: string
}

function loginErrorRedirect(req: NextRequest) {
  const url = new URL(publicRoutes.login, req.url)
  url.searchParams.set('error', 'oauth')
  return NextResponse.redirect(url)
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')

  const cookieStore = await cookies()
  const storedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value
  const codeVerifier = cookieStore.get(OAUTH_VERIFIER_COOKIE)?.value

  cookieStore.delete(OAUTH_STATE_COOKIE)
  cookieStore.delete(OAUTH_VERIFIER_COOKIE)

  if (
    !code ||
    !state ||
    !storedState ||
    state !== storedState ||
    !codeVerifier
  ) {
    return loginErrorRedirect(req)
  }

  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      redirect_uri: getRedirectUri(req.nextUrl.origin),
      grant_type: 'authorization_code',
      code_verifier: codeVerifier,
    }),
  })

  if (!tokenResponse.ok) {
    return loginErrorRedirect(req)
  }

  const { id_token: idToken } = (await tokenResponse.json()) as {
    id_token?: string
  }

  if (!idToken) {
    return loginErrorRedirect(req)
  }

  // O id_token veio direto do endpoint de token do Google via TLS,
  // então decodificar sem verificar a assinatura é seguro aqui.
  const claims = decodeJwt<GoogleIdTokenClaims>(idToken)

  if (!claims.sub || !claims.email) {
    return loginErrorRedirect(req)
  }

  const user = await prisma.user.upsert({
    where: { googleId: claims.sub },
    update: {
      email: claims.email,
      name: claims.name ?? null,
      image: claims.picture ?? null,
    },
    create: {
      googleId: claims.sub,
      email: claims.email,
      name: claims.name ?? null,
      image: claims.picture ?? null,
    },
  })

  await createSession(user.id)

  return NextResponse.redirect(new URL(privateRoutes.dashboard, req.url))
}
