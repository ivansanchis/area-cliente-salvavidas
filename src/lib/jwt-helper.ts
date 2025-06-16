import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function getSessionFromCookie() {
  try {
    // First try the built-in helper which reads cookies for us
    const session = await getServerSession(authOptions)

    if (session?.user) {
      console.log('✅ Session obtained for:', session.user.email)
      return session
    }

    console.log('ℹ️ getServerSession returned no session, falling back to manual lookup')

    const cookieStore = cookies()

    // NextAuth can store the token under different cookie names
    const possibleCookieNames = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.csrf-token',
      '__Secure-next-auth.csrf-token'
    ]

    let sessionToken: { value: string } | null = null
    let cookieName = ''

    for (const name of possibleCookieNames) {
      const cookie = cookieStore.get(name)
      if (cookie) {
        sessionToken = cookie
        cookieName = name
        break
      }
    }

    if (!sessionToken) {
      console.log('❌ No session token found in cookies')
      return null
    }

    console.log(`🔍 Found session token: ${cookieName}`)

    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
    const sessionResponse = await fetch(`${baseUrl}/api/auth/session`, {
      headers: {
        Cookie: `${cookieName}=${sessionToken.value}`
      },
      cache: 'no-store'
    })

    if (!sessionResponse.ok) {
      console.log('❌ Session API returned error:', sessionResponse.status, sessionResponse.statusText)
      return null
    }

    const sessionData = await sessionResponse.json()

    if (!sessionData || !sessionData.user) {
      console.log('❌ No user in session data')
      return null
    }

    console.log('✅ Session obtained via fallback for:', sessionData.user.email)
    return sessionData

  } catch (error) {
    console.error('❌ Error getting session:', error)
    return null
  }
}