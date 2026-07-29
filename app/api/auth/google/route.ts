import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
    GOOGLE_AUTH_URL,
    OAUTH_STATE_COOKIE,
    OAUTH_VERIFIER_COOKIE,
    generateCodeChallenge,
    generateRandomToken,
    getRedirectUri,
    oauthTempCookieOptions,
} from "@/lib/oauth"

export async function GET(req: NextRequest) {
    const state = generateRandomToken()
    const codeVerifier = generateRandomToken()
    const codeChallenge = await generateCodeChallenge(codeVerifier)

    const cookieStore = await cookies()
    cookieStore.set(OAUTH_STATE_COOKIE, state, oauthTempCookieOptions)
    cookieStore.set(OAUTH_VERIFIER_COOKIE, codeVerifier, oauthTempCookieOptions)

    const authUrl = new URL(GOOGLE_AUTH_URL)
    authUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID ?? "")
    authUrl.searchParams.set("redirect_uri", getRedirectUri(req.nextUrl.origin))
    authUrl.searchParams.set("response_type", "code")
    authUrl.searchParams.set("scope", "openid email profile")
    authUrl.searchParams.set("state", state)
    authUrl.searchParams.set("code_challenge", codeChallenge)
    authUrl.searchParams.set("code_challenge_method", "S256")
    authUrl.searchParams.set("prompt", "select_account")

    return NextResponse.redirect(authUrl)
}
