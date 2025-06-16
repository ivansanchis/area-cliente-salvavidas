import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
export async function getSessionFromCookie() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      console.log('❌ No session found')
      return null
    }

    console.log('✅ Session obtained for:', session.user?.email)
    return session

  } catch (error) {
    console.error('❌ Error getting session:', error)
    return null
  }
}