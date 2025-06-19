// src/lib/admin-auth.ts - CORREGIDO PARA NEXT.JS 15

import { cookies } from 'next/headers'
import { decode } from 'next-auth/jwt'

export interface AdminCheckResult {
  isAdmin: boolean
  user?: {
    email: string
    accessType: string
  }
}

/**
 * Verifica if el usuario actual es administrador basándose en las cookies
 * Compatible con Next.js 15 (cookies debe ser awaited)
 */
export async function verifyAdminFromCookies(): Promise<AdminCheckResult> {
  try {
    console.log('🔍 verifyAdminFromCookies: Starting verification...')
    
    // ✅ AWAIT cookies() para Next.js 15
    const cookieStore = await cookies()
    
    // Buscar la cookie de sesión (nombre estándar de NextAuth)
    const sessionToken = cookieStore.get('next-auth.session-token')?.value || 
                        cookieStore.get('__Secure-next-auth.session-token')?.value

    if (!sessionToken) {
      console.log('❌ No session token found in cookies')
      return { isAdmin: false }
    }

    console.log('✅ Session token found')

    // Decodificar el JWT usando el mismo secret que NextAuth
    const decoded = await decode({
      token: sessionToken,
      secret: process.env.NEXTAUTH_SECRET!,
    })

    if (!decoded) {
      console.log('❌ Failed to decode session token')
      return { isAdmin: false }
    }

    console.log('🔍 Decoded token data:', {
      email: decoded.email,
      accessType: decoded.accessType,
      accessId: decoded.accessId
    })

    // Verificar if es administrador basándose en accessType
    const isAdmin = decoded.accessType === 'ADMIN'

    console.log(`${isAdmin ? '✅' : '❌'} Admin check result: ${isAdmin}`)

    return {
      isAdmin,
      user: decoded.email ? {
        email: decoded.email as string,
        accessType: decoded.accessType as string
      } : undefined
    }

  } catch (error) {
    console.error('❌ Error in verifyAdminFromCookies:', error)
    return { isAdmin: false }
  }
}