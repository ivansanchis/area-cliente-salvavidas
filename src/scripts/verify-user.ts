import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'test@salvavidas.com' }
    })
    
    if (!user) {
      console.log('❌ Usuario no encontrado')
      return
    }
    
    console.log('📊 Datos actuales del usuario:')
    console.log('Email:', user.email)
    console.log('Nombre:', user.name)
    console.log('Tipo de acceso:', user.accessType)
    console.log('ID de acceso:', user.accessId)
    console.log('Activo:', user.active)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyUser()