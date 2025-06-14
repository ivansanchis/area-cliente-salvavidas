import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkGrupos() {
  try {
    console.log('🔍 Verificando grupos en la base de datos...')
    
    const grupos = await prisma.grupo.findMany({
      take: 10,
      orderBy: { nombre: 'asc' }
    })
    
    console.log(`\n✅ Encontrados ${grupos.length} grupos (mostrando primeros 10):`)
    grupos.forEach((grupo, index) => {
      console.log(`${index + 1}. ${grupo.nombre} (ID: ${grupo.idGrupo})`)
    })
    
    // También verificar empresas
    const empresas = await prisma.empresa.findMany({
      take: 5,
      orderBy: { nombreCliente: 'asc' }
    })
    
    console.log(`\n📊 Empresas disponibles (mostrando primeras 5):`)
    empresas.forEach((empresa, index) => {
      console.log(`${index + 1}. ${empresa.nombreCliente}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkGrupos()