import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // ✅ USAR NextAuth directamente
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.log('❌ No NextAuth session found or no email')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log('🔍 User session data:', {
      email: session.user.email,
      accessType: session.user.accessType,
      accessId: session.user.accessId
    })

    // Obtener datos adicionales del usuario desde la base de datos
    const userData = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        role: true,
        accessType: true,
        accessId: true,
        grupoAsignado: true,
        empresaAsignada: true,
        active: true
      }
    })

    if (!userData || !userData.active) {
      console.log('❌ User not found or inactive')
      return NextResponse.json({ error: 'Usuario no encontrado o inactivo' }, { status: 403 })
    }

    console.log('📊 User data from DB:', userData)

    // Obtener dispositivos según el tipo de acceso del usuario
    let dispositivos
    let whereCondition = {}

    switch (userData.accessType) {
      case 'GRUPO':
      case 'grupo':
        // CORRECCIÓN: Usar el nombre completo del grupo, no el ID
        if (userData.grupoAsignado) {
          // Usar el nombre completo del grupo asignado
          whereCondition = { grupoCliente: userData.grupoAsignado }
          console.log(`🔍 Searching devices for group: ${userData.grupoAsignado}`)
        } else if (userData.accessId) {
          // Fallback: buscar por accessId si no hay grupoAsignado
          // Primero intentar obtener el nombre del grupo desde la tabla Grupo
          const grupo = await prisma.grupo.findUnique({
            where: { idGrupo: userData.accessId },
            select: { nombre: true }
          })
          
          if (grupo) {
            whereCondition = { grupoCliente: grupo.nombre }
            console.log(`🔍 Searching devices for group (via ID lookup): ${grupo.nombre}`)
          } else {
            // Último recurso: usar directamente el accessId
            whereCondition = { grupoCliente: userData.accessId }
            console.log(`🔍 Searching devices for group (direct): ${userData.accessId}`)
          }
        }
        break

      case 'EMPRESA':
      case 'empresa':
        // Para empresas, usar el nombre de la empresa
        if (userData.empresaAsignada) {
          whereCondition = { nombreCliente: userData.empresaAsignada }
          console.log(`🔍 Searching devices for company: ${userData.empresaAsignada}`)
        } else if (userData.accessId) {
          // Fallback: usar accessId
          whereCondition = { nombreCliente: userData.accessId }
          console.log(`🔍 Searching devices for company (direct): ${userData.accessId}`)
        }
        break

      case 'DISPOSITIVO':
      case 'dispositivo':
        // Para dispositivos específicos, usar número de serie
        whereCondition = { numeroSerie: userData.accessId }
        console.log(`🔍 Searching specific device: ${userData.accessId}`)
        break

      case 'ADMIN':
      case 'admin':
        // Administradores pueden ver todos los dispositivos
        whereCondition = {}
        console.log('🔍 Admin user - showing all devices')
        break

      default:
        console.log(`❌ Invalid access type: ${userData.accessType}`)
        return NextResponse.json({ error: 'Tipo de acceso no válido' }, { status: 403 })
    }

    console.log('🔍 Where condition:', whereCondition)

    // Ejecutar la consulta
    dispositivos = await prisma.dispositivo.findMany({
      where: whereCondition,
      orderBy: {
        fechaRevision: 'asc'
      }
    })

    console.log(`📱 Found ${dispositivos.length} dispositivos for user ${session.user.email}`)

    // Log de los dispositivos encontrados para debugging
    if (dispositivos.length > 0) {
      console.log('📱 Devices found:')
      dispositivos.forEach(d => {
        console.log(`  - ${d.numeroSerie}: ${d.espacio} (${d.grupoCliente})`)
      })
    } else {
      console.log('❌ No devices found. Debugging info:')
      console.log('   - User access type:', userData.accessType)
      console.log('   - User access ID:', userData.accessId)
      console.log('   - User grupo asignado:', userData.grupoAsignado)
      console.log('   - Where condition used:', whereCondition)
      
      // Hacer una consulta de prueba para ver qué grupos existen
      const allGroups = await prisma.dispositivo.findMany({
        select: { grupoCliente: true },
        distinct: ['grupoCliente']
      })
      console.log('   - Available group names in devices:', allGroups.map(g => g.grupoCliente))
    }

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
    console.error('❌ Error fetching dispositivos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}