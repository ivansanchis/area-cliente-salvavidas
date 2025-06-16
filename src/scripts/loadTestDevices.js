// src/scripts/loadTestDevices.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function loadTestDevices() {
  try {
    console.log('🔧 Cargando dispositivos de prueba...');
    
    // Obtener algunos contratos existentes
    const contratos = await prisma.contrato.findMany({
      take: 5,
      include: {
        grupo: true,
        empresa: true
      }
    });
    
    console.log(`📋 Encontrados ${contratos.length} contratos para asociar dispositivos`);
    
    // Crear dispositivos de prueba
    const devicePromises = contratos.map((contrato, index) => {
      const serie = `DEA${(index + 1).toString().padStart(3, '0')}`;
      
      const deviceData = {
        serie: serie,
        numeroSerie: serie, // Campo requerido que faltaba
        contratoId: contrato.id,
        grupoId: contrato.grupoId || 'default-grupo',
        empresaId: contrato.empresaId || 'default-empresa',
        idSage: contrato.idSage || 'default-sage',
        grupoCliente: contrato.grupo?.nombre || 'Grupo de Prueba',
        nombreCliente: contrato.nombreCliente || 'Cliente de Prueba',
        contratoSage: contrato.contratoSage || 'Contrato de Prueba',
        espacio: `Espacio Cardioprotegido ${index + 1}`,
        provincia: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'][index % 5],
        linkInforme: `https://soslink.com/informe/${serie}`,
        linkAudit: `https://soslink.com/audit/${serie}`,
        fechaInstal: new Date('2023-01-01'),
        fechaRevis: new Date('2024-07-01'),
        lat: 40.4168 + (Math.random() - 0.5) * 0.1,
        lng: -3.7038 + (Math.random() - 0.5) * 0.1,
        situacion: 'ACTIVO',
        numero: index + 1
      };
      
      return prisma.dispositivo.create({
        data: deviceData
      });
    });
    
    const createdDevices = await Promise.all(devicePromises);
    
    console.log(`✅ Creados ${createdDevices.length} dispositivos de prueba:`);
    createdDevices.forEach((device, index) => {
      console.log(`   - ${device.serie}: ${device.espacio} (${device.provincia})`);
    });
    
    // Verificar el conteo final
    const totalDevices = await prisma.dispositivo.count();
    console.log(`📊 Total de dispositivos en la base de datos: ${totalDevices}`);
    
    console.log('🎉 ¡Dispositivos de prueba cargados exitosamente!');
    
  } catch (error) {
    console.error('❌ Error cargando dispositivos:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

// Ejecutar la función
console.log('🚀 Iniciando carga de dispositivos de prueba...');
loadTestDevices();