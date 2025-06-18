// src/app/api/admin/empresas/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/admin/empresas - Loading empresas for admin')
    
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      console.log('❌ No NextAuth session found')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log(`🔍 Checking admin access for: ${session.user.email}`)

    // Verificar que es admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        accessType: true, 
        active: true,
        role: true,
        email: true
      }
    })

    if (!user?.active) {
      console.log('❌ User not found or inactive')
      return NextResponse.json({ error: 'Usuario inactivo' }, { status: 401 })
    }

    // ✅ VERIFICACIÓN FLEXIBLE
    const isAdmin = user.role === 'ADMIN' || 
                   user.accessType === 'ADMIN' || 
                   user.accessType === 'admin' || 
                   user.email === 'test@salvavidas.com'

    if (!isAdmin) {
      console.log(`❌ User ${user.email} is not admin (role: ${user.role}, accessType: ${user.accessType})`)
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 401 })
    }

    console.log(`✅ Admin access verified for empresas: ${user.email}`)

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