import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
    console.log("Proxy is working");
    return NextResponse.next()
}

export const config = {
    matcher: '/:path*',
}