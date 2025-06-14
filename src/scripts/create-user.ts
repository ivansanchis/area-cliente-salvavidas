import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash('123456', 12)
    
    // Crear usuario de prueba
    const user = await prisma.user.create({
      data: {
        email: 'test@salvavidas.com',
        password: hashedPassword,
        name: 'Usuario de Prueba',
        accessType: 'grupo',
        accessId: 'GRUPO-001',
        canViewContratos: true,
        canViewFormaciones: true,
        canViewFacturas: true,
        active: true,
      },
    })

    console.log('✅ Usuario creado exitosamente:')
    console.log('📧 Email: test@salvavidas.com')
    console.log('🔐 Password: 123456')
    console.log('👤 Nombre:', user.name)
    console.log('🔑 Tipo de acceso:', user.accessType)
    
  } catch (error) {
    console.error('❌ Error creando usuario:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()