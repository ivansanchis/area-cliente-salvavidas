// src/app/api/admin/empresas/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/admin/empresas - Loading empresas for admin')
    
    const adminCheck = await verifyAdminAccess()
    
    if (!adminCheck.isValid) {
      console.log('❌ Admin access denied for empresas:', adminCheck.error)
      return NextResponse.json({ error: adminCheck.error || 'Acceso denegado' }, { status: 401 })
    }

    console.log(`✅ Admin access verified for empresas: ${adminCheck.user?.email}`)

    // Obtener todas las empresas
    const empresas = await prisma.empresa.findMany({
      select: {
        id: true,
        idSage: true,
        nombreCliente: true,
        numeroEquipos: true,
        numeroFormaciones: true,
        mrr: true,
        grupo: {
          select: {
            nombre: true
          }
        }
      },
      orderBy: {
        nombreCliente: 'asc'
      }
    })

    console.log(`📊 Found ${empresas.length} empresas for admin selection:`, empresas.map(e => e.nombreCliente))

    return NextResponse.json(empresas)

  } catch (error) {
    console.error('❌ Error fetching empresas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}