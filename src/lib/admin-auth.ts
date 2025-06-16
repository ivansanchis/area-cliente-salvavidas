// src/lib/admin-auth.ts
import { getSessionFromCookie } from '@/lib/jwt-helper'
import { prisma } from '@/lib/prisma'

export async function verifyAdminAccess() {
  try {
    console.log('🔍 Verifying admin access...')
    
    const session = await getSessionFromCookie()
    
    if (!session?.user?.email) {
      console.log('❌ No session found')
      return { 
        isValid: false, 
        isAdmin: false, 
        user: null, 
        error: 'No autorizado - sin sesión' 
      }
    }

    console.log(`🔍 Checking admin status for: ${session.user.email}`)

    // Verificar en la base de datos si el usuario es ADMIN
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true,
        email: true,
        role: true, 
        active: true,
        nombre: true,
        apellidos: true
      }
    })

    if (!user) {
      console.log('❌ User not found in database')
      return { 
        isValid: false, 
        isAdmin: false, 
        user: null, 
        error: 'Usuario no encontrado' 
      }
    }

    if (!user.active) {
      console.log('❌ User is inactive')
      return { 
        isValid: false, 
        isAdmin: false, 
        user: null, 
        error: 'Usuario inactivo' 
      }
    }

    const isAdmin = user.role === 'ADMIN'
    
    if (!isAdmin) {
      console.log(`❌ User ${user.email} is not admin (role: ${user.role})`)
      return { 
        isValid: false, 
        isAdmin: false, 
        user: null, 
        error: 'Acceso denegado - permisos insuficientes' 
      }
    }

    console.log(`✅ Admin access verified for: ${user.email}`)
    
    return { 
      isValid: true, 
      isAdmin: true, 
      user: user,
      error: null
    }

  } catch (error) {
    console.error('❌ Error verifying admin access:', error)
    return { 
      isValid: false, 
      isAdmin: false, 
      user: null, 
      error: 'Error interno del servidor' 
    }
  }
}