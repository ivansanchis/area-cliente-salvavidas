// src/scripts/vacuumDatabase.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function vacuumDatabase() {
  try {
    console.log('🧹 Compactando base de datos SQLite...');
    
    // Verificar espacio antes
    console.log('📊 Verificando tamaño actual...');
    
    const beforeStats = await prisma.$queryRaw`PRAGMA page_count;`;
    const pageSize = await prisma.$queryRaw`PRAGMA page_size;`;
    
    // Convertir BigInt a Number
    const pageCount = Number(beforeStats[0].page_count);
    const pageSizeNum = Number(pageSize[0].page_size);
    
    console.log(`📈 Páginas antes: ${pageCount}`);
    console.log(`📏 Tamaño de página: ${pageSizeNum} bytes`);
    
    const sizeBefore = pageCount * pageSizeNum;
    console.log(`💾 Tamaño antes: ${(sizeBefore / 1024 / 1024).toFixed(2)} MB`);
    
    // Ejecutar VACUUM para compactar
    console.log('🔄 Ejecutando VACUUM...');
    await prisma.$executeRaw`VACUUM;`;
    
    // Verificar espacio después
    const afterStats = await prisma.$queryRaw`PRAGMA page_count;`;
    const pageCountAfter = Number(afterStats[0].page_count);
    const sizeAfter = pageCountAfter * pageSizeNum;
    
    console.log(`📉 Páginas después: ${pageCountAfter}`);
    console.log(`💾 Tamaño después: ${(sizeAfter / 1024 / 1024).toFixed(2)} MB`);
    
    const savedSpace = sizeBefore - sizeAfter;
    const savedPercentage = ((savedSpace / sizeBefore) * 100).toFixed(1);
    
    console.log(`✅ Espacio liberado: ${(savedSpace / 1024 / 1024).toFixed(2)} MB (${savedPercentage}%)`);
    
    // Mostrar estadísticas finales de tablas
    console.log('📊 Registros finales por tabla:');
    
    const grupos = await prisma.grupo.count();
    const empresas = await prisma.empresa.count();
    const contratos = await prisma.contrato.count();
    const dispositivos = await prisma.dispositivo.count();
    const formaciones = await prisma.formacion.count();
    const facturas = await prisma.factura.count();
    const alumnos = await prisma.alumno.count();
    
    console.log(`   - Grupos: ${grupos}`);
    console.log(`   - Empresas: ${empresas}`);
    console.log(`   - Contratos: ${contratos}`);
    console.log(`   - Dispositivos: ${dispositivos}`);
    console.log(`   - Formaciones: ${formaciones}`);
    console.log(`   - Facturas: ${facturas}`);
    console.log(`   - Alumnos: ${alumnos}`);
    
    console.log('🎉 ¡Base de datos compactada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error compactando base de datos:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

// Ejecutar la función
console.log('🚀 Iniciando compactación de base de datos...');
vacuumDatabase();