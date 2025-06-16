const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function restoreEssentialData() {
  try {
    console.log('🔄 RESTAURANDO DATOS ESENCIALES')
    console.log('=' .repeat(50))
    
    // Verificar estado actual
    const userCount = await prisma.user.count()
    console.log(`📊 Usuarios actuales: ${userCount}`)
    
    if (userCount > 0) {
      console.log('ℹ️  Ya hay usuarios en la base de datos')
      const users = await prisma.user.findMany({
        select: { email: true, role: true, active: true }
      })
      console.log('👥 Usuarios existentes:')
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.role})`)
      })
      return
    }
    
    console.log('🔧 Creando datos básicos...')
    
    // 1. CREAR GRUPOS DE EJEMPLO
    console.log('📁 Creando grupos...')
    const grupos = await Promise.all([
      prisma.grupo.create({
        data: {
          idGrupo: 'AYTO_CIUDAD_RODRIGO',
          nombre: 'AYUNTAMIENTO CIUDAD RODRIGO',
          numeroEquipos: 11,
          numeroFormaciones: 2,
          mrrTotal: 1650.0,
          cuotaMediaEquipo: 150.0
        }
      }),
      prisma.grupo.create({
        data: {
          idGrupo: 'DIPUTACION_SALAMANCA',
          nombre: 'DIPUTACIÓN DE SALAMANCA',
          numeroEquipos: 25,
          numeroFormaciones: 1,
          mrrTotal: 3750.0,
          cuotaMediaEquipo: 150.0
        }
      }),
      prisma.grupo.create({
        data: {
          idGrupo: 'JUNTA_CASTILLA_LEON',
          nombre: 'JUNTA DE CASTILLA Y LEÓN',
          numeroEquipos: 50,
          numeroFormaciones: 3,
          mrrTotal: 7500.0,
          cuotaMediaEquipo: 150.0
        }
      })
    ])
    
    console.log(`✅ ${grupos.length} grupos creados`)
    
    // 2. CREAR EMPRESAS DE EJEMPLO
    console.log('🏢 Creando empresas...')
    const empresas = await Promise.all([
      prisma.empresa.create({
        data: {
          idSage: 'SAGE_001',
          idGrupo: 'AYTO_CIUDAD_RODRIGO',
          nombreCliente: 'Ayuntamiento de Ciudad Rodrigo',
          numeroEquipos: 11,
          numeroFormaciones: 2,
          mrr: 1650.0,
          cuotaEquipo: 150.0
        }
      }),
      prisma.empresa.create({
        data: {
          idSage: 'SAGE_002',
          idGrupo: 'DIPUTACION_SALAMANCA',
          nombreCliente: 'Diputación Provincial de Salamanca',
          numeroEquipos: 25,
          numeroFormaciones: 1,
          mrr: 3750.0,
          cuotaEquipo: 150.0
        }
      }),
      prisma.empresa.create({
        data: {
          idSage: 'SAGE_003',
          idGrupo: 'JUNTA_CASTILLA_LEON',
          nombreCliente: 'Consejería de Sanidad - Junta CyL',
          numeroEquipos: 50,
          numeroFormaciones: 3,
          mrr: 7500.0,
          cuotaEquipo: 150.0
        }
      })
    ])
    
    console.log(`✅ ${empresas.length} empresas creadas`)
    
    // 3. CREAR CONTRATOS DE EJEMPLO
    console.log('📄 Creando contratos...')
    const contratos = await Promise.all([
      prisma.contrato.create({
        data: {
          idContrato: 'CNT_001',
          idGrupo: 'AYTO_CIUDAD_RODRIGO',
          grupoCliente: 'AYUNTAMIENTO CIUDAD RODRIGO',
          estadoContrato: 'ACTIVO',
          idSage: 'SAGE_001',
          cif: 'P3708100A',
          nombreClienteSage: 'Ayuntamiento de Ciudad Rodrigo',
          fechaInicio: new Date('2024-01-01'),
          fechaFinalizacion: new Date('2024-12-31'),
          contratoSage: 'CARDIOPROTECCION_ANUAL',
          periodoFacturacion: 'MENSUAL',
          formaPago: 'DOMICILIACION',
          descripcion: 'Servicio integral de cardioprotección',
          mrr: 1650.0,
          numeroEquipos: 11,
          cuotaMediaEquipo: 150.0,
          ultimaFactura: new Date('2024-11-01'),
          ultimoCobro: new Date('2024-11-05')
        }
      }),
      prisma.contrato.create({
        data: {
          idContrato: 'CNT_002',
          idGrupo: 'DIPUTACION_SALAMANCA',
          grupoCliente: 'DIPUTACIÓN DE SALAMANCA',
          estadoContrato: 'ACTIVO',
          idSage: 'SAGE_002',
          cif: 'P3700000B',
          nombreClienteSage: 'Diputación Provincial de Salamanca',
          fechaInicio: new Date('2024-01-01'),
          fechaFinalizacion: new Date('2024-12-31'),
          contratoSage: 'CARDIOPROTECCION_ANUAL',
          periodoFacturacion: 'MENSUAL',
          formaPago: 'TRANSFERENCIA',
          descripcion: 'Servicio de cardioprotección provincial',
          mrr: 3750.0,
          numeroEquipos: 25,
          cuotaMediaEquipo: 150.0,
          ultimaFactura: new Date('2024-11-01'),
          ultimoCobro: new Date('2024-11-03')
        }
      })
    ])
    
    console.log(`✅ ${contratos.length} contratos creados`)
    
    // 4. CREAR DISPOSITIVOS DE EJEMPLO
    console.log('📱 Creando dispositivos...')
    const dispositivos = await Promise.all([
      prisma.dispositivo.create({
        data: {
          numeroSerie: 'DEA_CR_001',
          idContrato: 'CNT_001',
          idSage: 'SAGE_001',
          grupoCliente: 'AYUNTAMIENTO CIUDAD RODRIGO',
          nombreCliente: 'Ayuntamiento de Ciudad Rodrigo',
          contratoSage: 'CARDIOPROTECCION_ANUAL',
          espacio: 'Casa Consistorial - Planta Baja',
          provincia: 'Salamanca',
          linkInforme: 'https://soslink.com/informe/DEA_CR_001',
          linkAudit: 'https://soslink.com/audit/DEA_CR_001',
          fechaInstalacion: new Date('2024-01-15'),
          fechaRevision: new Date('2024-07-15'),
          edLink: 'https://soslink.com/ed/DEA_CR_001',
          altaLink: 'https://soslink.com/alta/DEA_CR_001',
          latitud: 40.5987,
          longitud: -6.5341,
          contratoSoslink: 'SOSLINK_CR_001',
          situacion: 'ACTIVO',
          idUbicacion: 'UBI_001',
          numeroPedido: 'PED_2024_001'
        }
      }),
      prisma.dispositivo.create({
        data: {
          numeroSerie: 'DEA_CR_002',
          idContrato: 'CNT_001',
          idSage: 'SAGE_001',
          grupoCliente: 'AYUNTAMIENTO CIUDAD RODRIGO',
          nombreCliente: 'Ayuntamiento de Ciudad Rodrigo',
          contratoSage: 'CARDIOPROTECCION_ANUAL',
          espacio: 'Polideportivo Municipal',
          provincia: 'Salamanca',
          linkInforme: 'https://soslink.com/informe/DEA_CR_002',
          linkAudit: 'https://soslink.com/audit/DEA_CR_002',
          fechaInstalacion: new Date('2024-01-20'),
          fechaRevision: new Date('2024-07-20'),
          edLink: 'https://soslink.com/ed/DEA_CR_002',
          altaLink: 'https://soslink.com/alta/DEA_CR_002',
          latitud: 40.5995,
          longitud: -6.5355,
          contratoSoslink: 'SOSLINK_CR_002',
          situacion: 'ACTIVO',
          idUbicacion: 'UBI_002',
          numeroPedido: 'PED_2024_002'
        }
      }),
      prisma.dispositivo.create({
        data: {
          numeroSerie: 'DEA_SAL_001',
          idContrato: 'CNT_002',
          idSage: 'SAGE_002',
          grupoCliente: 'DIPUTACIÓN DE SALAMANCA',
          nombreCliente: 'Diputación Provincial de Salamanca',
          contratoSage: 'CARDIOPROTECCION_ANUAL',
          espacio: 'Palacio Provincial - Recepción',
          provincia: 'Salamanca',
          linkInforme: 'https://soslink.com/informe/DEA_SAL_001',
          linkAudit: 'https://soslink.com/audit/DEA_SAL_001',
          fechaInstalacion: new Date('2024-02-01'),
          fechaRevision: new Date('2024-08-01'),
          edLink: 'https://soslink.com/ed/DEA_SAL_001',
          altaLink: 'https://soslink.com/alta/DEA_SAL_001',
          latitud: 40.9701,
          longitud: -5.6635,
          contratoSoslink: 'SOSLINK_SAL_001',
          situacion: 'ACTIVO',
          idUbicacion: 'UBI_003',
          numeroPedido: 'PED_2024_003'
        }
      })
    ])
    
    console.log(`✅ ${dispositivos.length} dispositivos creados`)
    
    // 5. CREAR USUARIO ADMINISTRADOR
    console.log('👤 Creando usuario administrador...')
    const hashedPassword = await bcrypt.hash('SalvaVidas2024!', 12)
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'test@salvavidas.com',
        password: hashedPassword,
        name: 'Administrador Test',
        nombre: 'Administrador',
        apellidos: 'Test',
        role: 'ADMIN',
        accessType: 'ADMIN',
        accessId: 'ADMIN',
        active: true,
        grupoAsignado: null,
        empresaAsignada: null,
        canViewContratos: true,
        canViewFormaciones: true,
        canViewFacturas: true
      }
    })
    
    console.log('✅ Usuario administrador creado')
    
    // 6. CREAR USUARIO DE PRUEBA PARA GRUPO
    console.log('👤 Creando usuario de prueba para grupo...')
    const hashedPasswordUser = await bcrypt.hash('123456', 12)
    
    const groupUser = await prisma.user.create({
      data: {
        email: 'usuario@ciudadrodrigo.com',
        password: hashedPasswordUser,
        name: 'Usuario Ciudad Rodrigo',
        nombre: 'Usuario',
        apellidos: 'Ciudad Rodrigo',
        role: 'GRUPO',
        accessType: 'GRUPO',
        accessId: 'AYTO_CIUDAD_RODRIGO',
        grupoId: 'AYTO_CIUDAD_RODRIGO',
        active: true,
        grupoAsignado: 'AYUNTAMIENTO CIUDAD RODRIGO',
        empresaAsignada: null,
        canViewContratos: true,
        canViewFormaciones: true,
        canViewFacturas: true
      }
    })
    
    console.log('✅ Usuario de grupo creado')
    
    // RESUMEN FINAL
    console.log('\n🎉 RESTAURACIÓN COMPLETADA')
    console.log('=' .repeat(50))
    console.log('📊 DATOS CREADOS:')
    console.log(`   🏢 Grupos: ${grupos.length}`)
    console.log(`   🏬 Empresas: ${empresas.length}`)
    console.log(`   📄 Contratos: ${contratos.length}`)
    console.log(`   📱 Dispositivos: ${dispositivos.length}`)
    console.log(`   👥 Usuarios: 2`)
    
    console.log('\n🔑 CREDENCIALES DE ACCESO:')
    console.log('   ADMINISTRADOR:')
    console.log('   📧 Email: test@salvavidas.com')
    console.log('   🔑 Contraseña: SalvaVidas2024!')
    console.log('   👤 Rol: ADMIN')
    console.log('')
    console.log('   USUARIO GRUPO:')
    console.log('   📧 Email: usuario@ciudadrodrigo.com')
    console.log('   🔑 Contraseña: 123456')
    console.log('   👤 Rol: GRUPO (ve solo datos de Ciudad Rodrigo)')
    
    console.log('\n✅ ¡Listo! Ya puedes usar la aplicación')
    
  } catch (error) {
    console.error('❌ Error durante la restauración:', error)
    
    if (error.code === 'P2002') {
      console.log('ℹ️  Algunos datos ya existen (esto es normal)')
    } else {
      console.error('🚨 Error específico:', error.message)
    }
  } finally {
    await prisma.$disconnect()
  }
}

restoreEssentialData()