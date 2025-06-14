import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createRealUser() {
  try {
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash('123456', 12)
    
    // Eliminar usuario anterior si existe
    await prisma.user.deleteMany({
      where: { email: 'test@salvavidas.com' }
    })
    
    // Crear usuario con grupo real
    const user = await prisma.user.create({
      data: {
        email: 'test@salvavidas.com',
        password: hashedPassword,
        name: 'Usuario de Prueba - ABANCA',
        accessType: 'grupo',
        accessId: 'ABANCA', // Usar nombre del grupo real
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
    
    // Verificar cuántos dispositivos tiene este grupo
    const dispositivos = await prisma.dispositivo.findMany({
      where: { grupoCliente: 'ABANCA' }
    })
    
    console.log('📱 Dispositivos disponibles para este grupo:', dispositivos.length)
    
  } catch (error) {
    console.error('❌ Error creando usuario:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createRealUser()