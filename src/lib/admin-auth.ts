// src/lib/admin-auth.ts
import { getSessionFromCookie } from '@/lib/jwt-helper'
import { prisma } from '@/lib/prisma'

export async function verifyAdminAccess() {
  try {
    const session = await getSessionFromCookie()
    
    if (!session?.user?.email) {
      return { isAdmin: false, error: 'No session found' }
    }

    // Verificar en la base de datos si el usuario es ADMIN
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, active: true }
    })

    if (!user) {
      return { isAdmin: false, error: 'User not found' }
    }

    if (!user.active) {
      return { isAdmin: false, error: 'User is inactive' }
    }

    const isAdmin = user.role === 'ADMIN'
    
    return { 
      isAdmin, 
      userEmail: session.user.email,
      error: isAdmin ? null : 'User is not admin'
    }

  } catch (error) {
    console.error('Error verifying admin access:', error)
    return { isAdmin: false, error: 'Server error' }
  }
}