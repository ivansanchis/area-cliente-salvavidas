// src/scripts/correctLoadDevices.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function correctLoadDevices() {
  try {
    console.log('🔧 Cargando dispositivos con schema correcto...');
    
    // Obtener algunos contratos existentes
    const contratos = await prisma.contrato.findMany({
      take: 5,
      include: {
        grupo: true,
        empresa: true
      }
    });
    
    console.log(`📋 Encontrados ${contratos.length} contratos para asociar dispositivos`);
    
    if (contratos.length === 0) {
      console.log('❌ No hay contratos disponibles para crear dispositivos');
      return;
    }
    
    // Crear dispositivos uno por uno con la estructura correcta
    for (let i = 0; i < Math.min(contratos.length, 5); i++) {
      const contrato = contratos[i];
      const numeroSerie = `DEA${(i + 1).toString().padStart(3, '0')}`;
      
      try {
        console.log(`🔄 Creando dispositivo ${numeroSerie}...`);
        
        const deviceData = {
          numeroSerie: numeroSerie,
          idContrato: contrato.idContrato,  // Campo correcto del schema
          idSage: contrato.idSage,
          grupoCliente: contrato.grupoCliente,
          nombreCliente: contrato.nombreClienteSage,
          contratoSage: contrato.contratoSage,
          espacio: `Espacio Cardioprotegido ${i + 1}`,
          provincia: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'][i % 5],
          linkInforme: `https://soslink.com/informe/${numeroSerie}`,
          linkAudit: `https://soslink.com/audit/${numeroSerie}`,
          fechaInstalacion: new Date('2023-01-01'),
          fechaRevision: new Date('2024-07-01'),
          edLink: `https://soslink.com/ed/${numeroSerie}`,
          altaLink: `https://soslink.com/alta/${numeroSerie}`,
          latitud: 40.4168 + (Math.random() - 0.5) * 0.1, // Coordenadas cerca de Madrid
          longitud: -3.7038 + (Math.random() - 0.5) * 0.1,
          contratoSoslink: `SOSLINK-${numeroSerie}`,
          situacion: 'ACTIVO',
          idUbicacion: `UB${(i + 1).toString().padStart(3, '0')}`,
          numeroPedido: `PED${(i + 1).toString().padStart(4, '0')}`
        };
        
        const device = await prisma.dispositivo.create({
          data: deviceData
        });
        
        console.log(`✅ Dispositivo ${numeroSerie} creado exitosamente`);
        console.log(`   - Espacio: ${device.espacio}`);
        console.log(`   - Provincia: ${device.provincia}`);
        console.log(`   - Situación: ${device.situacion}`);
        
      } catch (deviceError) {
        console.log(`❌ Error creando dispositivo ${numeroSerie}:`, deviceError.message);
      }
    }
    
    // Verificar cuántos dispositivos tenemos ahora
    const totalDevices = await prisma.dispositivo.count();
    console.log(`📊 Total de dispositivos en la base de datos: ${totalDevices}`);
    
    if (totalDevices > 0) {
      console.log('🎉 ¡Dispositivos cargados exitosamente!');
      
      // Mostrar resumen de dispositivos creados
      const devices = await prisma.dispositivo.findMany({
        select: {
          numeroSerie: true,
          espacio: true,
          provincia: true,
          situacion: true
        }
      });
      
      console.log('📋 Resumen de dispositivos:');
      devices.forEach(device => {
        console.log(`   - ${device.numeroSerie}: ${device.espacio} (${device.provincia})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

// Ejecutar la función
console.log('🚀 Iniciando carga de dispositivos con schema correcto...');
correctLoadDevices();