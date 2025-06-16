// src/app/api/admin/dispositivos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/admin/dispositivos - Loading dispositivos for admin')
    
    const adminCheck = await verifyAdminAccess()
    
    if (!adminCheck.isValid) {
      console.log('❌ Admin access denied for dispositivos:', adminCheck.error)
      return NextResponse.json({ error: adminCheck.error || 'Acceso denegado' }, { status: 401 })
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