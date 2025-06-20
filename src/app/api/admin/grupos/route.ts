// src/app/api/admin/grupos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminFromCookies } from '@/lib/admin-auth'


export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/admin/grupos - Loading grupos for admin')
    
    const adminCheck = await verifyAdminFromCookies()

    if (!adminCheck.isAdmin) {
      console.log('❌ Admin access denied for grupos')
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    console.log(`✅ Admin access verified for grupos: ${adminCheck.user?.email}`)

    // Obtener todos los grupos
    const grupos = await prisma.grupo.findMany({
      select: {
        id: true,
        idGrupo: true,
        nombre: true,
        numeroEquipos: true,
        numeroFormaciones: true,
        mrrTotal: true,
      },
      orderBy: {
        nombre: 'asc'
      }
    })

    console.log(`📊 Found ${grupos.length} grupos for admin selection:`, grupos.map(g => g.nombre))

    return NextResponse.json(grupos)

  } catch (error) {
    console.error('❌ Error fetching grupos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}