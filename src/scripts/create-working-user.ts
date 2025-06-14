import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createWorkingUser() {
  try {
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash('123456', 12)
    
    // Eliminar usuario anterior si existe
    await prisma.user.deleteMany({
      where: { email: 'test@salvavidas.com' }
    })
    
    // Crear usuario con grupo que SÍ tiene dispositivos
    const user = await prisma.user.create({
      data: {
        email: 'test@salvavidas.com',
        password: hashedPassword,
        name: 'Usuario de Prueba - Ayuntamiento Ciudad Rodrigo',
        accessType: 'grupo',
        accessId: 'AYUNTAMIENTO CIUDAD RODRIGO', // Grupo con 11 dispositivos
        canViewContratos: true,
        canViewFormaciones: true,
        canViewFacturas: true,
        active: true,
      },
    })

    console.log('✅ Usuario actualizado exitosamente:')
    console.log('📧 Email: test@salvavidas.com')
    console.log('🔐 Password: 123456')
    console.log('👤 Nombre:', user.name)
    console.log('🔑 Tipo de acceso:', user.accessType)
    console.log('🏢 Grupo asignado:', user.accessId)
    
    // Verificar dispositivos para este grupo
    const dispositivos = await prisma.dispositivo.findMany({
      where: { grupoCliente: 'AYUNTAMIENTO CIUDAD RODRIGO' },
      select: {
        numeroSerie: true,
        espacio: true,
        provincia: true,
        situacion: true
      }
    })
    
    console.log(`\n📱 Dispositivos disponibles: ${dispositivos.length}`)
    dispositivos.forEach((d, index) => {
      console.log(`${index + 1}. ${d.numeroSerie} - ${d.espacio} (${d.provincia}) - ${d.situacion}`)
    })
    
  } catch (error) {
    console.error('❌ Error creando usuario:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createWorkingUser()