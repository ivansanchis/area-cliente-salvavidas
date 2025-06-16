const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugUserSession() {
  try {
    console.log('🔍 DIAGNÓSTICO DE USUARIO Y PERMISOS')
    console.log('=' .repeat(50))
    
    // 1. Verificar usuarios existentes
    console.log('👥 USUARIOS EN BASE DE DATOS:')
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        accessType: true,
        accessId: true,
        grupoId: true,
        grupoAsignado: true,
        empresaAsignada: true,
        active: true
      }
    })
    
    users.forEach(user => {
      console.log(`📧 ${user.email}`)
      console.log(`   👤 Rol: ${user.role}`)
      console.log(`   🔑 Acceso: ${user.accessType} -> ${user.accessId}`)
      console.log(`   🏢 Grupo ID: ${user.grupoId}`)
      console.log(`   🏢 Grupo Asignado: ${user.grupoAsignado}`)
      console.log(`   🏬 Empresa Asignada: ${user.empresaAsignada}`)
      console.log(`   ✅ Activo: ${user.active}`)
      console.log('')
    })
    
    // 2. Verificar dispositivos del grupo Ciudad Rodrigo
    console.log('📱 DISPOSITIVOS DEL GRUPO CIUDAD RODRIGO:')
    const dispositivos = await prisma.dispositivo.findMany({
      where: {
        grupoCliente: 'AYUNTAMIENTO CIUDAD RODRIGO'
      },
      select: {
        numeroSerie: true,
        espacio: true,
        grupoCliente: true,
        nombreCliente: true,
        situacion: true
      }
    })
    
    console.log(`📊 Total dispositivos encontrados: ${dispositivos.length}`)
    dispositivos.forEach(dispositivo => {
      console.log(`  📱 ${dispositivo.numeroSerie}`)
      console.log(`     🏠 ${dispositivo.espacio}`)
      console.log(`     🏢 ${dispositivo.grupoCliente}`)
      console.log(`     🏬 ${dispositivo.nombreCliente}`)
      console.log(`     📊 ${dispositivo.situacion}`)
      console.log('')
    })
    
    // 3. Verificar grupos
    console.log('🏢 GRUPOS DISPONIBLES:')
    const grupos = await prisma.grupo.findMany({
      select: {
        idGrupo: true,
        nombre: true,
        numeroEquipos: true
      }
    })
    
    grupos.forEach(grupo => {
      console.log(`  🏢 ${grupo.nombre} (ID: ${grupo.idGrupo})`)
      console.log(`     📱 Equipos: ${grupo.numeroEquipos}`)
    })
    
    // 4. Verificar empresas
    console.log('\n🏬 EMPRESAS DISPONIBLES:')
    const empresas = await prisma.empresa.findMany({
      select: {
        idSage: true,
        nombreCliente: true,
        idGrupo: true,
        numeroEquipos: true
      }
    })
    
    empresas.forEach(empresa => {
      console.log(`  🏬 ${empresa.nombreCliente}`)
      console.log(`     🆔 SAGE: ${empresa.idSage}`)
      console.log(`     🏢 Grupo: ${empresa.idGrupo}`)
      console.log(`     📱 Equipos: ${empresa.numeroEquipos}`)
    })
    
    // 5. Verificar la relación específica del usuario problemático
    console.log('\n🔍 ANÁLISIS ESPECÍFICO DEL USUARIO CIUDAD RODRIGO:')
    const userCR = await prisma.user.findUnique({
      where: { email: 'usuario@ciudadrodrigo.com' },
      select: {
        email: true,
        role: true,
        accessType: true,
        accessId: true,
        grupoId: true,
        grupoAsignado: true,
        active: true
      }
    })
    
    if (userCR) {
      console.log('✅ Usuario encontrado:')
      console.log(`   📧 Email: ${userCR.email}`)
      console.log(`   👤 Rol: ${userCR.role}`)
      console.log(`   🔑 Tipo acceso: ${userCR.accessType}`)
      console.log(`   🆔 ID acceso: ${userCR.accessId}`)
      console.log(`   🏢 Grupo ID: ${userCR.grupoId}`)
      console.log(`   🏢 Grupo asignado: ${userCR.grupoAsignado}`)
      console.log(`   ✅ Activo: ${userCR.active}`)
      
      // Verificar qué dispositivos debería ver según sus permisos
      console.log('\n🔍 DISPOSITIVOS QUE DEBERÍA VER:')
      
      let queryCondition = {}
      
      if (userCR.role === 'GRUPO' && userCR.accessId) {
        // Si es acceso por grupo, buscar por nombre del grupo
        queryCondition = { grupoCliente: userCR.accessId }
        console.log(`   🔍 Buscando por grupo: ${userCR.accessId}`)
      } else if (userCR.role === 'EMPRESA' && userCR.accessId) {
        // Si es acceso por empresa, buscar por nombre de empresa
        queryCondition = { nombreCliente: userCR.accessId }
        console.log(`   🔍 Buscando por empresa: ${userCR.accessId}`)
      }
      
      const dispositivosPermitidos = await prisma.dispositivo.findMany({
        where: queryCondition,
        select: {
          numeroSerie: true,
          espacio: true,
          grupoCliente: true,
          nombreCliente: true
        }
      })
      
      console.log(`   📊 Total dispositivos que debería ver: ${dispositivosPermitidos.length}`)
      dispositivosPermitidos.forEach(disp => {
        console.log(`     📱 ${disp.numeroSerie} - ${disp.espacio}`)
      })
      
    } else {
      console.log('❌ Usuario no encontrado')
    }
    
    console.log('\n🎯 POSIBLES PROBLEMAS:')
    console.log('1. ❓ La API /api/dispositivos no está usando la sesión correctamente')
    console.log('2. ❓ El helper jwt-helper.ts no está funcionando bien')
    console.log('3. ❓ Los datos del usuario no coinciden con los esperados')
    console.log('4. ❓ Problema en el filtrado de dispositivos por grupo')
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugUserSession()