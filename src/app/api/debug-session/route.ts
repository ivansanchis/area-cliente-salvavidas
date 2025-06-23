import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromCookie } from '@/lib/jwt-helper'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug session API called')
    
    const session = await getSessionFromCookie()
    
    console.log('📊 Session result:', session)
    
    if (!session) {
      console.log('❌ No session found')
      return NextResponse.json({ 
        error: 'No session found',
        session: null,
        debug: 'Could not decrypt session token'
      }, { status: 401 })
    }

    console.log('✅ Session found:', {
      email: session.user?.email,
      accessType: session.user?.accessType,
      accessId: session.user?.accessId
    })

    return NextResponse.json({
      message: 'Session found via cookie',
      session: session
    })

  } catch (error) {
    console.error('❌ Error in debug session:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        error: 'Error getting session', 
        details: errorMessage
      }, 
      { status: 500 }
    )
  }
}