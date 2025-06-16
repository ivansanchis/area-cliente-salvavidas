const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addUserFields() {
  try {
    console.log('🔧 Iniciando migración de campos de usuario...')
    
    // Verificar si los campos ya existen
    console.log('📊 Verificando estructura actual de la tabla User...')
    
    try {
      // Intentar hacer una consulta que use los campos nuevos
      await prisma.$queryRaw`SELECT grupoAsignado, empresaAsignada FROM User LIMIT 1`
      console.log('✅ Los campos ya existen en la base de datos')
      return
    } catch (error) {
      console.log('📝 Los campos no existen, procediendo a agregarlos...')
    }
    
    // Agregar los campos faltantes
    console.log('🔨 Agregando campo grupoAsignado...')
    await prisma.$executeRaw`ALTER TABLE User ADD COLUMN grupoAsignado TEXT`
    
    console.log('🔨 Agregando campo empresaAsignada...')  
    await prisma.$executeRaw`ALTER TABLE User ADD COLUMN empresaAsignada TEXT`
    
    console.log('✅ Campos agregados exitosamente')
    
    // Verificar que los campos se agregaron correctamente
    console.log('🔍 Verificando la migración...')
    const testUser = await prisma.user.findFirst()
    console.log('📊 Usuario de prueba:', {
      id: testUser?.id,
      email: testUser?.email,
      grupoAsignado: testUser?.grupoAsignado || 'NULL (correcto)',
      empresaAsignada: testUser?.empresaAsignada || 'NULL (correcto)'
    })
    
    console.log('🎉 ¡Migración completada exitosamente!')
    console.log('💡 Ahora puedes crear usuarios sin problemas')
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message)
    
    if (error.message.includes('duplicate column name')) {
      console.log('ℹ️  Los campos ya existen en la base de datos')
    } else {
      console.error('🚨 Error específico:', error)
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Función para verificar el estado actual
async function checkCurrentState() {
  try {
    console.log('\n📋 VERIFICANDO ESTADO ACTUAL DE LA BASE DE DATOS')
    console.log('=' .repeat(50))
    
    // Contar usuarios existentes
    const userCount = await prisma.user.count()
    console.log(`👥 Total de usuarios: ${userCount}`)
    
    // Mostrar estructura de usuarios
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        active: true
      }
    })
    
    console.log('📊 Usuarios actuales:')
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - ${user.active ? 'Activo' : 'Inactivo'}`)
    })
    
    // Contar otros datos
    const grupoCount = await prisma.grupo.count()
    const empresaCount = await prisma.empresa.count()
    const dispositivoCount = await prisma.dispositivo.count()
    
    console.log(`🏢 Total de grupos: ${grupoCount}`)
    console.log(`🏬 Total de empresas: ${empresaCount}`)
    console.log(`📱 Total de dispositivos: ${dispositivoCount}`)
    
  } catch (error) {
    console.error('❌ Error verificando estado:', error.message)
  }
}

// Ejecutar el script
async function main() {
  console.log('🚀 SCRIPT DE MIGRACIÓN - ÁREA CLIENTE SALVAVIDAS')
  console.log('=' .repeat(55))
  
  await checkCurrentState()
  await addUserFields()
  
  console.log('\n✅ PROCESO COMPLETADO')
  console.log('💡 Puedes proceder a probar la creación de usuarios')
}

main()
  .catch(console.error)