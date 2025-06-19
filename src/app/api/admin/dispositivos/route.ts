// src/app/api/admin/dispositivos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// ✅ FUNCIÓN SIMPLE para verificar admin (igual que en users/route.ts)
async function verifyAdminFromCookies() {
  try {
    console.log('🔍 Verifying admin from cookies...')
    
    const cookieStore = cookies()
    
    // Buscar cookie de sesión
    const sessionCookie = cookieStore.get('next-auth.session-token') || 
                         cookieStore.get('__Secure-next-auth.session-token')
    
    console.log('🔍 Session cookie found:', !!sessionCookie)
    
    if (!sessionCookie) {
      console.log('❌ No session cookie found')
      return { isValid: false, error: 'No hay cookie de sesión' }
    }

    // ✅ HACER petición interna al endpoint de NextAuth que SÍ funciona
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    try {
      const sessionResponse = await fetch(`${baseUrl}/api/auth/session`, {
        headers: {
          'Cookie': cookieStore.toString()
        },
        cache: 'no-store'
      })

      if (!sessionResponse.ok) {
        console.log('❌ Session API failed:', sessionResponse.status)
        return { isValid: false, error: 'No se pudo verificar sesión' }
      }

      const sessionData = await sessionResponse.json()
      console.log('✅ Session data from API:', {
        hasUser: !!sessionData?.user,
        email: sessionData?.user?.email,
        accessType: sessionData?.user?.accessType
      })

      if (!sessionData?.user?.email) {
        console.log('❌ No user in session')
        return { isValid: false, error: 'No hay usuario en la sesión' }
      }

      // Verificar que es admin desde la sesión directamente
      const userAccessType = sessionData.user.accessType
      const userEmail = sessionData.user.email
      
      console.log('🔍 Checking admin status:', { email: userEmail, accessType: userAccessType })

      // ✅ VERIFICACIÓN FLEXIBLE desde la sesión
      const isAdmin = userAccessType === 'ADMIN' || 
                     userAccessType === 'admin' || 
                     userEmail === 'test@salvavidas.com'

      if (!isAdmin) {
        console.log(`❌ User ${userEmail} is not admin (accessType: ${userAccessType})`)
        return { isValid: false, error: 'Acceso denegado - no es admin' }
      }

      console.log(`✅ Admin access verified for: ${userEmail}`)
      return { 
        isValid: true, 
        user: {
          email: userEmail,
          accessType: userAccessType
        }
      }

    } catch (fetchError) {
      console.error('❌ Error fetching session:', fetchError)
      return { isValid: false, error: 'Error al verificar sesión' }
    }

  } catch (error) {
    console.error('❌ Error in verifyAdminFromCookies:', error)
    return { isValid: false, error: 'Error interno de verificación' }
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/admin/dispositivos - Loading dispositivos for admin')
    
    const adminCheck = await verifyAdminFromCookies()
    
    if (!adminCheck.isValid) {
      console.log('❌ Admin access denied for dispositivos:', adminCheck.error)
      return NextResponse.json({ 
        error: adminCheck.error || 'Acceso denegado',
        debug: 'Admin verification failed for dispositivos'
      }, { status: 401 })
    }

    console.log(`✅ Admin access verified for dispositivos: ${adminCheck.user?.email}`)

    // Obtener todos los dispositivos
    const dispositivos = await prisma.dispositivo.findMany({
      select: {
        id: true,
        numeroSerie: true,
        espacio: true,
        provincia: true,
        situacion: true,
        nombreCliente: true,
        grupoCliente: true,
      },
      where: {
        situacion: 'ACTIVO' // Solo dispositivos activos para asignación
      },
      orderBy: [
        { grupoCliente: 'asc' },
        { numeroSerie: 'asc' }
      ]
    })

    console.log(`📊 Found ${dispositivos.length} dispositivos activos for admin selection`)

    return NextResponse.json(dispositivos)

  } catch (error) {
    console.error('❌ Error fetching dispositivos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}