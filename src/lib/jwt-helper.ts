import { cookies } from 'next/headers'

export async function getSessionFromCookie() {
  try {
    const cookieStore = await cookies()
    
    // Intentar diferentes nombres de cookies que NextAuth puede usar
    const possibleCookieNames = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token', // Para HTTPS
      'next-auth.csrf-token',
      '__Secure-next-auth.csrf-token'
    ]
    
    let sessionToken = null
    let cookieName = null
    
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
      console.log('📊 Available cookies:', cookieStore.getAll().map(c => c.name))
      return null
    }

    console.log(`🔍 Found session token: ${cookieName}`)
    
    // Hacer una petición interna a la API de session de NextAuth
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
    const sessionResponse = await fetch(`${baseUrl}/api/auth/session`, {
      headers: {
        'Cookie': `${cookieName}=${sessionToken.value}`
      },
      cache: 'no-store' // Evitar cache para obtener datos frescos
    })
    
    if (!sessionResponse.ok) {
      console.log('❌ Session API returned error:', sessionResponse.status, sessionResponse.statusText)
      return null
    }
    
    const sessionData = await sessionResponse.json()
    console.log('✅ Session data from API:', {
      hasUser: !!sessionData?.user,
      email: sessionData?.user?.email,
      expires: sessionData?.expires
    })
    
    if (!sessionData || !sessionData.user) {
      console.log('❌ No user in session data')
      return null
    }
    
    return sessionData
    
  } catch (error) {
    console.error('❌ Error getting session:', error)
    return null
  }
}