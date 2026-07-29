import { NextRequest, NextResponse } from "next/server";
import { publicRoutes } from "./lib/config";

export function proxy(req: NextRequest) {
    const pathname = req.nextUrl.pathname

    // TODO: implementar lógica real de autenticação
    // 1 - usuário autenticado não pode ver rotas públicas, assim como, 
    //     usuário NÃO autenticado, obviamente, não pode ver rotas privadas.
    // 2 - Existe uma rota "/sw.js" que é do NextJs, portanto esta rota deverá ser
    //     acessível tanto para usuário autenticado quanto para Não autenticado
    if (!Object.values(publicRoutes).includes(pathname)) {
        return NextResponse.redirect(new URL(publicRoutes.login, req.url))
    }
    
    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}