// src/app/api/admin/empresas/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { isAdmin, userEmail, error } = await verifyAdminAccess()
    
    if (!isAdmin) {
      console.log('❌ Admin access denied for empresas:', error)
      return NextResponse.json({ error: error || 'Acceso denegado' }, { status: 401 })
    }

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

    console.log(`📊 Found ${empresas.length} empresas for admin selection`)

    return NextResponse.json(empresas)

  } catch (error) {
    console.error('Error fetching empresas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}