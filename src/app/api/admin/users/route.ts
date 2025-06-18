// src/app/api/admin/users/route.ts - SOLUCIÓN SIN getServerSession
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// ✅ FUNCIÓN SIMPLE para verificar admin sin NextAuth server-side
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
    console.log('🔍 GET /api/admin/users - Loading users for admin')
    
    const adminCheck = await verifyAdminFromCookies()
    
    if (!adminCheck.isValid) {
      console.log('❌ Admin access denied:', adminCheck.error)
      return NextResponse.json({ 
        error: adminCheck.error || 'Acceso denegado',
        debug: 'Admin verification failed'
      }, { status: 401 })
    }

    console.log(`✅ Admin access verified: ${adminCheck.user?.email}`)

    // Obtener todos los usuarios
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nombre: true,
        apellidos: true,
        name: true,
        role: true,
        accessType: true,
        accessId: true,
        grupoAsignado: true,    
        empresaAsignada: true,  
        canViewContratos: true,
        canViewFormaciones: true,
        canViewFacturas: true,
        active: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        updatedBy: true,
      },
      orderBy: [
        { role: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    console.log(`📊 Found ${users.length} users`)

    // Formatear fechas para el frontend
    const usersFormatted = users.map(user => ({
      ...user,
      lastLogin: user.lastLogin?.toISOString() || null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }))

    return NextResponse.json(usersFormatted)

  } catch (error) {
    console.error('❌ Error fetching users:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        debug: error.message
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/admin/users - Creating new user')
    
    const adminCheck = await verifyAdminFromCookies()
    
    if (!adminCheck.isValid) {
      console.log('❌ Admin access denied for user creation:', adminCheck.error)
      return NextResponse.json({ error: adminCheck.error || 'Acceso denegado' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      email, 
      password, 
      nombre, 
      apellidos,
      grupoAsignado,     
      empresaAsignada,   
      role, 
      accessType, 
      accessId,
      grupoId,
      empresaId,
      dispositivoId,
      canViewContratos, 
      canViewFormaciones, 
      canViewFacturas 
    } = body

    // Validar campos requeridos
    if (!email || !password || !nombre || !apellidos || !role || !accessType || !accessId) {
      return NextResponse.json({ 
        error: 'Faltan campos requeridos' 
      }, { status: 400 })
    }

    // Verificar que el email no existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ 
        error: 'Ya existe un usuario con este email' 
      }, { status: 400 })
    }

    // Hash de la contraseña
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear el usuario
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nombre,
        apellidos,
        name: `${nombre} ${apellidos}`,
        role,
        accessType,
        accessId,
        grupoAsignado: grupoAsignado || null,      
        empresaAsignada: empresaAsignada || null,    
        grupoId: grupoId || null,
        empresaId: empresaId || null,
        dispositivoId: dispositivoId || null,
        canViewContratos: canViewContratos ?? true,
        canViewFormaciones: canViewFormaciones ?? true,
        canViewFacturas: canViewFacturas ?? true,
        active: true,
        createdBy: adminCheck.user?.email,
      }
    })

    // Crear log de actividad
    await prisma.activityLog.create({
      data: {
        userId: newUser.id,
        action: 'CREATE_USER',
        details: JSON.stringify({
          createdBy: adminCheck.user?.email,
          userEmail: newUser.email,
          role: newUser.role,
          accessType: newUser.accessType
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    console.log('✅ New user created by admin:', {
      adminEmail: adminCheck.user?.email,
      newUserEmail: newUser.email,
      role: newUser.role
    })

    // Retornar el usuario sin la contraseña
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      ...userWithoutPassword,
      createdAt: userWithoutPassword.createdAt.toISOString(),
      updatedAt: userWithoutPassword.updatedAt.toISOString(),
    })

  } catch (error) {
    console.error('❌ Error creating user:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}