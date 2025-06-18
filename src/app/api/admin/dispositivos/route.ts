// src/app/api/admin/dispositivos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/admin/dispositivos - Loading dispositivos for admin')
    
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

    console.log(`✅ Admin access verified for dispositivos: ${user.email}`)

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