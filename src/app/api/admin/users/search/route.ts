// src/app/api/admin/users/search/route.ts - CORREGIDO PARA SQLITE

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminFromCookies } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/admin/users/search - User search request')
    
    const adminCheck = await verifyAdminFromCookies()
    
    if (!adminCheck.isAdmin) {
      console.log('❌ Admin access denied for search')
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Query too short' }, { status: 400 })
    }

    console.log('🔍 Searching for:', query)

    // ✅ BÚSQUEDA COMPATIBLE CON SQLITE (sin mode: 'insensitive')
    const searchTerm = `%${query.toLowerCase()}%`
    
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            email: {
              contains: query
            }
          },
          {
            nombre: {
              contains: query
            }
          },
          {
            apellidos: {
              contains: query
            }
          },
          {
            name: {
              contains: query
            }
          }
        ]
      },
      include: {
        grupo: true,
        empresa: true
      },
      orderBy: [
        { accessType: 'asc' },
        { email: 'asc' }
      ],
      take: 50 // Limitar resultados
    })

    console.log(`✅ Found ${users.length} users matching "${query}"`)

    return NextResponse.json(users)

  } catch (error) {
    console.error('❌ Error searching users:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}