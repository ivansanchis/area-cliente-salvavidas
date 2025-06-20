// src/app/api/admin/dispositivos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminFromCookies } from '@/lib/admin-auth'


export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/admin/dispositivos - Loading dispositivos for admin')
    
    const adminCheck = await verifyAdminFromCookies()

    if (!adminCheck.isAdmin) {
      console.log('❌ Admin access denied for dispositivos')
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
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