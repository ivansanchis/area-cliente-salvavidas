// src/app/api/admin/users/route.ts - CORREGIDO PARA NEXT.JS 15 Y FOREIGN KEYS

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminFromCookies } from '@/lib/admin-auth'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/admin/users - Loading users for admin')
    
    const adminCheck = await verifyAdminFromCookies()
    
    if (!adminCheck.isAdmin) {
      console.log('❌ Admin access denied')
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    console.log(`✅ Admin access verified: ${adminCheck.user?.email}`)

    // Obtener todos los usuarios con relaciones
    const users = await prisma.user.findMany({
      include: {
        grupo: true,
        empresa: true
      },
      orderBy: [
        { accessType: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    console.log(`📊 Found ${users.length} users`)

    return NextResponse.json(users)

  } catch (error) {
    console.error('❌ Error fetching users:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/admin/users - Creating new user')
    
    const adminCheck = await verifyAdminFromCookies()
    
    if (!adminCheck.isAdmin) {
      console.log('❌ Admin access denied for user creation')
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()
    console.log('📝 Request body for new user:', body)
    
    const { 
      email, 
      password, 
      nombre, 
      apellidos,
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
      console.log('❌ Missing required fields')
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    // Verificar que el email no existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('❌ Email already exists:', email)
      return NextResponse.json({ error: 'Ya existe un usuario con este email' }, { status: 400 })
    }

    // ✅ RESOLVER FOREIGN KEYS CORRECTAS (igual que en edición)
    let finalGrupoId: string | null = null
    let finalEmpresaId: string | null = null
    let finalDispositivoId: string | null = null

    // Validaciones según el role y obtener foreign keys correctas
    if (role === 'GRUPO' && !grupoId) {
      return NextResponse.json({ error: 'grupoId es requerido para role GRUPO' }, { status: 400 })
    }

    if (role === 'EMPRESA' && (!empresaId || !grupoId)) {
      return NextResponse.json({ error: 'empresaId y grupoId son requeridos para role EMPRESA' }, { status: 400 })
    }

    if (role === 'DISPOSITIVO' && !dispositivoId) {
      return NextResponse.json({ error: 'dispositivoId es requerido para role DISPOSITIVO' }, { status: 400 })
    }

    // ✅ VALIDAR Y OBTENER LOS VALORES CORRECTOS PARA FOREIGN KEYS
    if (grupoId) {
      const grupo = await prisma.grupo.findUnique({ where: { id: grupoId } })
      if (!grupo) {
        console.log('❌ Grupo not found:', grupoId)
        return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 400 })
      }
      finalGrupoId = grupo.idGrupo // ✅ Usar idGrupo para la foreign key
      console.log('✅ Grupo validated:', grupo.nombre, 'idGrupo:', finalGrupoId)
    }

    if (empresaId) {
      const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } })
      if (!empresa) {
        console.log('❌ Empresa not found:', empresaId)
        return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 400 })
      }
      finalEmpresaId = empresa.idSage // ✅ Usar idSage para la foreign key
      console.log('✅ Empresa validated:', empresa.nombreCliente, 'idSage:', finalEmpresaId)
    }

    if (dispositivoId) {
      const dispositivo = await prisma.dispositivo.findUnique({ where: { id: dispositivoId } })
      if (!dispositivo) {
        console.log('❌ Dispositivo not found:', dispositivoId)
        return NextResponse.json({ error: 'Dispositivo no encontrado' }, { status: 400 })
      }
      finalDispositivoId = dispositivo.numeroSerie // ✅ Usar numeroSerie para la referencia
      console.log('✅ Dispositivo validated:', dispositivo.numeroSerie)
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    console.log('🔄 Creating user in database...')
    console.log('📊 Final foreign key values:', {
      finalGrupoId,
      finalEmpresaId,
      finalDispositivoId
    })

    // ✅ CREAR USUARIO CON FOREIGN KEYS CORRECTAS
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
        grupoId: finalGrupoId, // ✅ Ahora usa el idGrupo correcto
        empresaId: finalEmpresaId, // ✅ Ahora usa el idSage correcto
        dispositivoId: finalDispositivoId, // ✅ Ahora usa el numeroSerie correcto
        canViewContratos: canViewContratos ?? true,
        canViewFormaciones: canViewFormaciones ?? true,
        canViewFacturas: canViewFacturas ?? true,
        active: true,
        createdBy: adminCheck.user?.email,
      },
      include: {
        grupo: true,
        empresa: true
      }
    })

    console.log('✅ New user created successfully:', newUser.email)

    // Retornar el usuario sin la contraseña
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json(userWithoutPassword)

  } catch (error) {
    console.error('❌ Error creating user:', error)
    
    // Proporcionar más detalles del error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = {
      error: 'Error interno del servidor',
      details: errorMessage,
      timestamp: new Date().toISOString(),
      // ✅ Agregar información específica si es error de Prisma
      ...(error && typeof error === 'object' && 'code' in error && {
        prismaError: {
          code: (error as any).code,
          meta: (error as any).meta
        }
      })
    }
    
    return NextResponse.json(errorDetails, { status: 500 })
  }
}