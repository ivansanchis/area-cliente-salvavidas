import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDispositivos() {
  try {
    console.log('🔍 Verificando dispositivos en la base de datos...')
    
    // Total de dispositivos
    const totalDispositivos = await prisma.dispositivo.count()
    console.log(`📱 Total dispositivos: ${totalDispositivos}`)
    
    // Grupos con dispositivos
    const gruposConDispositivos = await prisma.dispositivo.groupBy({
      by: ['grupoCliente'],
      _count: {
        grupoCliente: true
      },
      orderBy: {
        _count: {
          grupoCliente: 'desc'
        }
      },
      take: 10
    })
    
    console.log('\n🏢 Grupos con más dispositivos:')
    gruposConDispositivos.forEach((grupo, index) => {
      console.log(`${index + 1}. ${grupo.grupoCliente} (${grupo._count.grupoCliente} dispositivos)`)
    })
    
    // Verificar específicamente ABANCA
    const dispositivosABANCA = await prisma.dispositivo.findMany({
      where: { grupoCliente: 'ABANCA' }
    })
    
    console.log(`\n🔍 Dispositivos para grupo "ABANCA": ${dispositivosABANCA.length}`)
    
    if (dispositivosABANCA.length === 0) {
      console.log('❌ No hay dispositivos para ABANCA')
      
      // Mostrar algunos dispositivos de ejemplo
      const ejemploDispositivos = await prisma.dispositivo.findMany({
        take: 5,
        select: {
          grupoCliente: true,
          numeroSerie: true,
          nombreCliente: true
        }
      })
      
      console.log('\n📊 Algunos dispositivos de ejemplo:')
      ejemploDispositivos.forEach((d, index) => {
        console.log(`${index + 1}. Grupo: "${d.grupoCliente}" | Cliente: "${d.nombreCliente}" | Serie: ${d.numeroSerie}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDispositivos()