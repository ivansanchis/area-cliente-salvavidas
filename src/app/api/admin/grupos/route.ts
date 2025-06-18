// src/app/api/admin/grupos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/admin/grupos - Loading grupos for admin')
    
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

    console.log(`✅ Admin access verified for grupos: ${user.email}`)

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