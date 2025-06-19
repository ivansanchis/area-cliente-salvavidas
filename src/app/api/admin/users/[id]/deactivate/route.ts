// src/app/api/admin/users/[id]/deactivate/route.ts - API PARA DESACTIVAR

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminFromCookies } from '@/lib/admin-auth'

interface Params {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    
    console.log('🔧 PATCH /api/admin/users/[id]/deactivate - Deactivating user:', id)
    
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

    // Verificar que no se está desactivando a sí mismo
    if (user.email === adminCheck.user?.email) {
      console.log('❌ Cannot deactivate self')
      return NextResponse.json({ error: 'No puedes desactivarte a ti mismo' }, { status: 400 })
    }

    console.log('🔄 Deactivating user...')

    // Desactivar usuario (soft delete)
    const deactivatedUser = await prisma.user.update({
      where: { id },
      data: {
        active: false,
        updatedAt: new Date(),
        updatedBy: adminCheck.user?.email
      }
    })

    console.log('✅ User deactivated successfully:', deactivatedUser.email)

    return NextResponse.json({ 
      message: 'Usuario desactivado correctamente',
      user: deactivatedUser
    })

  } catch (error) {
    console.error('❌ Error deactivating user:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = {
      error: 'Error interno del servidor',
      details: errorMessage,
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(errorDetails, { status: 500 })
  }
}