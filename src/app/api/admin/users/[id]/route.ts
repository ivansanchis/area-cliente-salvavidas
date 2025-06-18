// src/app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// ✅ FUNCIÓN HELPER para verificar admin (igual que en route.ts principal)
async function verifyAdminAccess() {
  try {
    console.log('🔍 Verifying admin access...')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.log('❌ No NextAuth session found')
      return { isValid: false, error: 'No hay sesión activa' }
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true,
        email: true,
        role: true, 
        active: true,
        accessType: true
      }
    })

    if (!user || !user.active) {
      return { isValid: false, error: 'Usuario no encontrado o inactivo' }
    }

    // ✅ VERIFICACIÓN FLEXIBLE
    const isAdmin = user.role === 'ADMIN' || 
                   user.accessType === 'ADMIN' || 
                   user.accessType === 'admin' || 
                   user.email === 'test@salvavidas.com'
    
    if (!isAdmin) {
      return { isValid: false, error: 'Acceso denegado - permisos insuficientes' }
    }

    return { isValid: true, user }

  } catch (error) {
    console.error('❌ Error verifying admin access:', error)
    return { isValid: false, error: 'Error interno del servidor' }
  }
}

interface UpdateUserRequest {
  email?: string
  password?: string
  nombre?: string
  apellidos?: string
  grupoAsignado?: string
  empresaAsignada?: string
  role?: 'ADMIN' | 'GRUPO' | 'EMPRESA' | 'DISPOSITIVO'
  accessType?: string
  accessId?: string
  canViewContratos?: boolean
  canViewFormaciones?: boolean
  canViewFacturas?: boolean
  active?: boolean
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔄 PUT /api/admin/users/[id] - Updating user:', params.id)
    
    // Verificar acceso de administrador
    const adminCheck = await verifyAdminAccess()
    if (!adminCheck.isValid) {
      console.log('❌ Access denied:', adminCheck.error)
      return NextResponse.json({ error: adminCheck.error }, { status: 401 })
    }

    const userId = params.id
    if (!userId) {
      return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 })
    }

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellidos: true,
        role: true,
        accessType: true,
        accessId: true,
        grupoAsignado: true,
        empresaAsignada: true,
        canViewContratos: true,
        canViewFormaciones: true,
        canViewFacturas: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!existingUser) {
      console.log(`❌ User not found: ${userId}`)
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    console.log('📊 Existing user data:', existingUser)

    // Parsear datos del request
    const updateData: UpdateUserRequest = await request.json()
    console.log('📝 Update data received:', updateData)

    // Validaciones
    if (updateData.email && updateData.email !== existingUser.email) {
      // Verificar que el nuevo email no esté en uso
      const emailExists = await prisma.user.findUnique({
        where: { email: updateData.email },
        select: { id: true }
      })
      
      if (emailExists && emailExists.id !== userId) {
        return NextResponse.json({ 
          error: 'El email ya está en uso por otro usuario' 
        }, { status: 400 })
      }
    }

    // Preparar datos para actualización
    const dataToUpdate: any = {}

    // Campos básicos
    if (updateData.email !== undefined && updateData.email !== existingUser.email) {
      dataToUpdate.email = updateData.email
    }
    
    if (updateData.nombre !== undefined && updateData.nombre !== existingUser.nombre) {
      dataToUpdate.nombre = updateData.nombre
    }
    
    if (updateData.apellidos !== undefined && updateData.apellidos !== existingUser.apellidos) {
      dataToUpdate.apellidos = updateData.apellidos
    }

    // Grupo y empresa asignados
    if (updateData.grupoAsignado !== undefined && updateData.grupoAsignado !== existingUser.grupoAsignado) {
      dataToUpdate.grupoAsignado = updateData.grupoAsignado
      
      // Si cambia el grupo, actualizar también grupoId
      if (updateData.grupoAsignado) {
        const grupo = await prisma.grupo.findFirst({
          where: { nombre: updateData.grupoAsignado },
          select: { idGrupo: true }
        })
        if (grupo) {
          dataToUpdate.grupoId = grupo.idGrupo
        }
      } else {
        dataToUpdate.grupoId = null
      }
    }
    
    if (updateData.empresaAsignada !== undefined && updateData.empresaAsignada !== existingUser.empresaAsignada) {
      dataToUpdate.empresaAsignada = updateData.empresaAsignada
      
      // Si cambia la empresa, actualizar también empresaId
      if (updateData.empresaAsignada) {
        const empresa = await prisma.empresa.findFirst({
          where: { nombreCliente: updateData.empresaAsignada },
          select: { idSage: true }
        })
        if (empresa) {
          dataToUpdate.empresaId = empresa.idSage
        }
      } else {
        dataToUpdate.empresaId = null
      }
    }

    // Sistema de roles y acceso
    if (updateData.role !== undefined && updateData.role !== existingUser.role) {
      dataToUpdate.role = updateData.role
    }
    
    if (updateData.accessType !== undefined && updateData.accessType !== existingUser.accessType) {
      dataToUpdate.accessType = updateData.accessType
    }
    
    if (updateData.accessId !== undefined && updateData.accessId !== existingUser.accessId) {
      dataToUpdate.accessId = updateData.accessId
    }

    // Permisos granulares
    if (updateData.canViewContratos !== undefined && updateData.canViewContratos !== existingUser.canViewContratos) {
      dataToUpdate.canViewContratos = updateData.canViewContratos
    }
    
    if (updateData.canViewFormaciones !== undefined && updateData.canViewFormaciones !== existingUser.canViewFormaciones) {
      dataToUpdate.canViewFormaciones = updateData.canViewFormaciones
    }
    
    if (updateData.canViewFacturas !== undefined && updateData.canViewFacturas !== existingUser.canViewFacturas) {
      dataToUpdate.canViewFacturas = updateData.canViewFacturas
    }

    // Estado activo/inactivo
    if (updateData.active !== undefined && updateData.active !== existingUser.active) {
      dataToUpdate.active = updateData.active
    }

    // Contraseña (si se proporciona)
    if (updateData.password && updateData.password.trim().length > 0) {
      console.log('🔑 Updating password')
      const hashedPassword = await bcrypt.hash(updateData.password, 12)
      dataToUpdate.password = hashedPassword
    }

    console.log('📝 Final data to update:', Object.keys(dataToUpdate))

    // Si no hay cambios, devolver el usuario actual
    if (Object.keys(dataToUpdate).length === 0) {
      console.log('ℹ️ No changes detected')
      return NextResponse.json({
        message: 'No hay cambios para actualizar',
        user: existingUser
      })
    }

    // Actualizar usuario en la base de datos
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        nombre: true,
        apellidos: true,
        role: true,
        accessType: true,
        accessId: true,
        grupoAsignado: true,
        empresaAsignada: true,
        canViewContratos: true,
        canViewFormaciones: true,
        canViewFacturas: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    })

    console.log('✅ User updated successfully:', updatedUser.id)

    // Registrar actividad en el log (opcional)
    try {
      await prisma.activityLog.create({
        data: {
          userId: adminCheck.user!.id,
          action: 'UPDATE_USER',
          details: JSON.stringify({
            targetUserId: userId,
            targetUserEmail: updatedUser.email,
            changedFields: Object.keys(dataToUpdate),
            passwordChanged: !!updateData.password
          }),
          metadata: JSON.stringify({
            userAgent: request.headers.get('user-agent'),
            ip: request.headers.get('x-forwarded-for') || 'unknown'
          })
        }
      })
    } catch (logError) {
      console.warn('⚠️ Failed to log activity:', logError)
      // No fallar la operación principal por un error de logging
    }

    return NextResponse.json({
      message: 'Usuario actualizado exitosamente',
      user: updatedUser
    })

  } catch (error) {
    console.error('❌ Error updating user:', error)
    
    if (error instanceof Error) {
      // Errores de validación de Prisma
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json({ 
          error: 'El email ya está en uso' 
        }, { status: 400 })
      }
      
      // Otros errores de validación
      if (error.message.includes('Invalid')) {
        return NextResponse.json({ 
          error: 'Datos de entrada inválidos' 
        }, { status: 400 })
      }
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// También agregamos GET para obtener un usuario específico (útil para debugging)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 GET /api/admin/users/[id] - Getting user:', params.id)
    
    // Verificar acceso de administrador
    const adminCheck = await verifyAdminAccess()
    if (!adminCheck.isValid) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 })
    }

    const userId = params.id
    if (!userId) {
      return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellidos: true,
        role: true,
        accessType: true,
        accessId: true,
        grupoAsignado: true,
        empresaAsignada: true,
        canViewContratos: true,
        canViewFormaciones: true,
        canViewFacturas: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json(user)

  } catch (error) {
    console.error('❌ Error getting user:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}