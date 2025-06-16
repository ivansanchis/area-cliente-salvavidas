import { cookies } from 'next/headers'

export async function getSessionFromCookie() {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('next-auth.session-token')
    
    if (!sessionToken) {
      console.log('❌ No session token found in cookies')
      return null
    }

    console.log('🔍 Found session token, making internal request...')
    
    // Hacer una petición interna a la API de session de NextAuth
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
    const sessionResponse = await fetch(`${baseUrl}/api/auth/session`, {
      headers: {
        'Cookie': `next-auth.session-token=${sessionToken.value}`
      }
    })
    
    if (!sessionResponse.ok) {
      console.log('❌ Session API returned error:', sessionResponse.status)
      return null
    }
    
    const sessionData = await sessionResponse.json()
    console.log('✅ Session data from API:', sessionData)
    
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
