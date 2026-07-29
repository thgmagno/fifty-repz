import { NextRequest, NextResponse } from 'next/server'
import { privateRoutes, publicRoutes } from './lib/config'
import { decrypt, SESSION_COOKIE } from './lib/session'

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Rota do service worker do Next.js: acessível autenticado ou não
  if (pathname === publicRoutes.nextSw) {
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
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
