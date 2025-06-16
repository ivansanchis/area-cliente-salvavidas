// scripts/updatePassword.js
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updatePassword() {
  try {
    // Cambia esta contraseña por la que prefieras
    const newPassword = 'SalvaVidas2024!';
    
    // Generar el hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Actualizar el usuario de prueba
    const updatedUser = await prisma.user.update({
      where: {
        email: 'test@salvavidas.com'
      },
      data: {
        password: hashedPassword
      }
    });
    
    console.log('✅ Contraseña actualizada correctamente para:', updatedUser.email);
    console.log('🔑 Nueva contraseña:', newPassword);
    console.log('🔒 Hash generado:', hashedPassword);
    
  } catch (error) {
    console.error('❌ Error actualizando contraseña:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePassword();