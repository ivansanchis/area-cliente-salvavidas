// src/app/api/admin/users/[id]/route.ts - CORREGIDO DELETE PARA HARD DELETE

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminFromCookies } from '@/lib/admin-auth'

interface Params {
  params: Promise<{
    id: string
  }>
}

// GET - Obtener usuario por ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    
    const adminCheck = await verifyAdminFromCookies()
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        grupo: true,
        empresa: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT - Actualizar usuario
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    
    console.log('🔧 PUT /api/admin/users/[id] - Starting update for user:', id)
    
    const adminCheck = await verifyAdminFromCookies()
    if (!adminCheck.isAdmin) {
      console.log('❌ Access denied - not admin')
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()
    console.log('📝 Request body:', body)
    
    const {
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
      canViewFacturas,
      active
    } = body

    // Validar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      console.log('❌ User not found:', id)
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    console.log('✅ User found, proceeding with validations...')

    // ✅ RESOLVER FOREIGN KEYS CORRECTAS
    let finalGrupoId: string | null = null
    let finalEmpresaId: string | null = null
    let finalDispositivoId: string | null = null

    // Validaciones según el role
    if (role === 'GRUPO' && !grupoId) {
      console.log('❌ Validation failed: grupoId required for GRUPO role')
      return NextResponse.json({ error: 'grupoId es requerido para role GRUPO' }, { status: 400 })
    }

    if (role === 'EMPRESA' && (!empresaId || !grupoId)) {
      console.log('❌ Validation failed: empresaId and grupoId required for EMPRESA role')
      return NextResponse.json({ error: 'empresaId y grupoId son requeridos para role EMPRESA' }, { status: 400 })
    }

    if (role === 'DISPOSITIVO' && !dispositivoId) {
      console.log('❌ Validation failed: dispositivoId required for DISPOSITIVO role')
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

    console.log('🔄 Updating user in database...')
    console.log('📊 Final foreign key values:', {
      finalGrupoId,
      finalEmpresaId,
      finalDispositivoId
    })

    // ✅ ACTUALIZAR USUARIO CON FOREIGN KEYS CORRECTAS
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        nombre,
        apellidos,
        role,
        accessType,
        accessId,
        grupoId: finalGrupoId, // ✅ Ahora usa el idGrupo correcto
        empresaId: finalEmpresaId, // ✅ Ahora usa el idSage correcto
        dispositivoId: finalDispositivoId, // ✅ Ahora usa el numeroSerie correcto
        canViewContratos: canViewContratos ?? true,
        canViewFormaciones: canViewFormaciones ?? true,
        canViewFacturas: canViewFacturas ?? true,
        active: active ?? true,
        updatedAt: new Date()
      },
      include: {
        grupo: true,
        empresa: true
      }
    })

    console.log('✅ User updated successfully:', updatedUser.email)
    return NextResponse.json(updatedUser)

  } catch (error) {
    console.error('❌ Error updating user:', error)
    
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

// ✅ DELETE - HARD DELETE (ELIMINACIÓN PERMANENTE)
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    
    console.log('🗑️ DELETE /api/admin/users/[id] - Hard deleting user:', id)
    
    const adminCheck = await verifyAdminFromCookies()
    if (!adminCheck.isAdmin) {
      console.log('❌ Access denied - not admin')
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      console.log('❌ User not found:', id)
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Verificar que no se está eliminando a sí mismo
    if (user.email === adminCheck.user?.email) {
      console.log('❌ Cannot delete self')
      return NextResponse.json({ error: 'No puedes eliminarte a ti mismo' }, { status: 400 })
    }

    console.log('🔄 Permanently deleting user from database...')

    // ✅ HARD DELETE - Eliminar permanentemente de la base de datos
    const deletedUser = await prisma.user.delete({
      where: { id }
    })

    console.log('✅ User permanently deleted:', deletedUser.email)

    return NextResponse.json({ 
      message: 'Usuario eliminado permanentemente',
      user: deletedUser
    })

  } catch (error) {
    console.error('❌ Error deleting user:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = {
      error: 'Error interno del servidor',
      details: errorMessage,
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(errorDetails, { status: 500 })
  }
}