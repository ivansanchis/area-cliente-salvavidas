// src/scripts/convertUserToAdmin.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function convertUserToAdmin() {
  try {
    console.log('👑 Convirtiendo usuario a ADMIN...');
    
    // Actualizar el usuario existente con todos los campos nuevos
    const updatedUser = await prisma.user.update({
      where: {
        email: 'test@salvavidas.com'
      },
      data: {
        // Nuevos campos de datos personales
        nombre: 'Usuario',
        apellidos: 'Administrador',
        
        // Nuevo sistema de roles
        role: 'ADMIN',
        
        // Mantener compatibilidad con campos existentes
        // accessType y accessId se mantienen como están
        
        // Asegurar permisos completos para admin
        canViewContratos: true,
        canViewFormaciones: true,
        canViewFacturas: true,
        active: true,
        
        // Campos de auditoría
        updatedBy: 'system', // Indicar que fue actualizado por el sistema
        lastLogin: null // Se actualizará en el próximo login
      }
    });
    
    console.log('✅ Usuario actualizado exitosamente:');
    console.log('📧 Email:', updatedUser.email);
    console.log('👤 Nombre completo:', `${updatedUser.nombre} ${updatedUser.apellidos}`);
    console.log('👑 Rol:', updatedUser.role);
    console.log('🔑 Tipo de acceso (legacy):', updatedUser.accessType);
    console.log('🏢 ID de acceso (legacy):', updatedUser.accessId);
    console.log('✅ Estado:', updatedUser.active ? 'Activo' : 'Inactivo');
    console.log('📊 Permisos:');
    console.log('   - Contratos:', updatedUser.canViewContratos ? '✅' : '❌');
    console.log('   - Formaciones:', updatedUser.canViewFormaciones ? '✅' : '❌');
    console.log('   - Facturas:', updatedUser.canViewFacturas ? '✅' : '❌');
    
    // Crear un log de actividad inicial
    await prisma.activityLog.create({
      data: {
        userId: updatedUser.id,
        action: 'CREATE_USER',
        details: JSON.stringify({
          message: 'Usuario convertido a ADMIN por migración del sistema',
          previousRole: 'USER',
          newRole: 'ADMIN'
        }),
        ipAddress: '127.0.0.1',
        userAgent: 'System Migration Script'
      }
    });
    
    console.log('📝 Log de actividad creado');
    
    // Verificar que el usuario puede acceder al panel de admin
    console.log('\n🔍 Verificando acceso de administrador...');
    
    if (updatedUser.role === 'ADMIN') {
      console.log('✅ El usuario tiene acceso completo al panel de administración');
      console.log('🎯 Puede gestionar otros usuarios');
      console.log('📊 Puede ver todas las estadísticas');
      console.log('🔧 Puede configurar el sistema');
    }
    
    // Mostrar resumen de la base de datos
    console.log('\n📊 Estado actual de la base de datos:');
    const userCount = await prisma.user.count();
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    const activityCount = await prisma.activityLog.count();
    
    console.log(`👥 Total de usuarios: ${userCount}`);
    console.log(`👑 Administradores: ${adminCount}`);
    console.log(`📝 Registros de actividad: ${activityCount}`);
    
    console.log('\n🎉 ¡Conversión a ADMIN completada exitosamente!');
    console.log('🚀 Ya puedes desarrollar el panel de administración');
    
  } catch (error) {
    console.error('❌ Error convirtiendo usuario a ADMIN:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

// Ejecutar la función
console.log('🚀 Iniciando conversión a ADMIN...');
convertUserToAdmin();