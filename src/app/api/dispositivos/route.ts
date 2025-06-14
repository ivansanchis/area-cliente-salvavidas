import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromCookie } from '@/lib/jwt-helper'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookie()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log('🔍 User access:', {
      email: session.user.email,
      accessType: session.user.accessType,
      accessId: session.user.accessId
    })

    // Obtener dispositivos según el tipo de acceso del usuario
    let dispositivos

    switch (session.user.accessType) {
      case 'grupo':
        // El usuario puede ver todos los dispositivos de su grupo
        dispositivos = await prisma.dispositivo.findMany({
          where: {
            grupoCliente: session.user.accessId
          },
          orderBy: {
            fechaRevision: 'asc'
          }
        })
        break

      case 'empresa':
        // El usuario puede ver solo dispositivos de su empresa
        dispositivos = await prisma.dispositivo.findMany({
          where: {
            nombreCliente: session.user.accessId
          },
          orderBy: {
            fechaRevision: 'asc'
          }
        })
        break

      case 'dispositivo':
        // El usuario puede ver solo un dispositivo específico
        dispositivos = await prisma.dispositivo.findMany({
          where: {
            numeroSerie: session.user.accessId
          }
        })
        break

      default:
        return NextResponse.json({ error: 'Tipo de acceso no válido' }, { status: 403 })
    }

    console.log(`📱 Found ${dispositivos.length} dispositivos for user`)

    // Formatear fechas para el frontend
    const dispositivosFormateados = dispositivos.map(dispositivo => ({
      id: dispositivo.id,
      numeroSerie: dispositivo.numeroSerie,
      espacio: dispositivo.espacio,
      provincia: dispositivo.provincia,
      fechaInstalacion: dispositivo.fechaInstalacion.toISOString(),
      fechaRevision: dispositivo.fechaRevision.toISOString(),
      situacion: dispositivo.situacion,
      latitud: dispositivo.latitud,
      longitud: dispositivo.longitud,
      linkInforme: dispositivo.linkInforme,
      linkAudit: dispositivo.linkAudit,
      nombreCliente: dispositivo.nombreCliente,
      grupoCliente: dispositivo.grupoCliente,
    }))

    return NextResponse.json(dispositivosFormateados)

  } catch (error) {
    console.error('Error fetching dispositivos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}