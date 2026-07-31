import { NextRequest, NextResponse } from 'next/server'
import { legalRoutes, privateRoutes, publicRoutes } from './lib/config'
import { decrypt, SESSION_COOKIE } from './lib/session'

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Assets do PWA (service worker, manifest, fallback offline) + páginas
  // legais (termos/privacidade): sempre acessíveis, autenticado ou não —
  // os assets porque o navegador/service worker busca essas rotas
  // independente de haver sessão, e as páginas legais porque, diferente do
  // login, fazem sentido também para quem já está logado
  const alwaysPublicAssets: string[] = [
    publicRoutes.nextSw,
    publicRoutes.manifest,
    publicRoutes.offline,
    legalRoutes.privacy,
    legalRoutes.terms,
  ]
  if (alwaysPublicAssets.includes(pathname)) {
    return NextResponse.next()
  }

  // Checagem otimista: só lê e valida o cookie de sessão (sem ir ao banco)
  const session = await decrypt(req.cookies.get(SESSION_COOKIE)?.value)
  const isAuthenticated = Boolean(session?.userId)
  const isPublicRoute = Object.values(publicRoutes).includes(pathname)

  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL(publicRoutes.login, req.url))
  }

  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL(privateRoutes.dashboard, req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|webp|svg|gif)$).*)',
  ],
}
