import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

export const SESSION_COOKIE = "session"

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 dias

const encodedKey = new TextEncoder().encode(process.env.SESSION_SECRET)

export interface SessionPayload {
    userId: string
    [key: string]: unknown
}

export async function encrypt(payload: SessionPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(encodedKey)
}

export async function decrypt(session: string | undefined = "") {
    try {
        const { payload } = await jwtVerify<SessionPayload>(session, encodedKey, {
            algorithms: ["HS256"],
        })
        return payload
    } catch {
        return null
    }
}

export async function createSession(userId: string) {
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)
    const session = await encrypt({ userId })
    const cookieStore = await cookies()

    cookieStore.set(SESSION_COOKIE, session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: expiresAt,
        sameSite: "lax",
        path: "/",
    })
}

export async function deleteSession() {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE)
}
