// src/app/api/admin/grupos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { isAdmin, userEmail, error } = await verifyAdminAccess()
    
    if (!isAdmin) {
      console.log('❌ Admin access denied for grupos:', error)
      return NextResponse.json({ error: error || 'Acceso denegado' }, { status: 401 })
    }

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

    console.log(`📊 Found ${grupos.length} grupos for admin selection`)

    return NextResponse.json(grupos)

  } catch (error) {
    console.error('Error fetching grupos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}