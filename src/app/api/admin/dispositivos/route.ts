// src/app/api/admin/dispositivos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { isAdmin, userEmail, error } = await verifyAdminAccess()
    
    if (!isAdmin) {
      console.log('❌ Admin access denied for dispositivos:', error)
      return NextResponse.json({ error: error || 'Acceso denegado' }, { status: 401 })
    }

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
    console.error('Error fetching dispositivos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}