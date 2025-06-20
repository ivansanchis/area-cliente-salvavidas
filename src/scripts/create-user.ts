// scripts/create-user.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createUser() {
  try {
    console.log('🗑️ Borrando usuario test@salvavidas.com...')
    
    // Borrar el usuario test si existe
    try {
      await prisma.user.delete({
        where: { email: 'test@salvavidas.com' }
      })
      console.log('✅ Usuario test@salvavidas.com eliminado')
    } catch (error) {
      console.log('ℹ️ Usuario test@salvavidas.com no existía')
    }
    
    console.log('🔐 Hasheando contraseña...')
    
    // Hashear la contraseña "SalvaVidas2024!"
    const hashedPassword = await bcrypt.hash('SalvaVidas2024!', 12)
    
    console.log('👤 Creando usuario admin...')
    
    // Crear el usuario admin
    const user = await prisma.user.create({
      data: {
        email: 'admin@salvavidas.com',
        password: hashedPassword,
        name: 'Administrador',
        nombre: 'Admin',
        apellidos: 'Salvavidas',
        role: 'ADMIN',
        accessType: 'ADMIN',
        accessId: 'ALL', // Admin tiene acceso a todo
        canViewContratos: true,
        canViewFormaciones: true,
        canViewFacturas: true,
        active: true,
      }
    })

    console.log('✅ Usuario admin creado exitosamente:', {
      id: user.id,
      email: user.email,
      role: user.role,
      accessType: user.accessType,
      accessId: user.accessId
    })
    
    console.log('🔑 Credenciales:')
    console.log('   📧 Email: admin@salvavidas.com')
    console.log('   🔒 Contraseña: SalvaVidas2024!')
    console.log('   👑 Rol: ADMIN (acceso total)')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createUser()