// src/scripts/cleanupDatabase.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupDatabase() {
  try {
    console.log('🧹 Iniciando limpieza de base de datos...');
    
    // 1. Primero obtener algunos grupos con sus relaciones
    console.log('📊 Analizando datos existentes...');
    
    const totalGrupos = await prisma.grupo.count();
    const totalEmpresas = await prisma.empresa.count();
    const totalContratos = await prisma.contrato.count();
    const totalDispositivos = await prisma.dispositivo.count();
    const totalFormaciones = await prisma.formacion.count();
    
    console.log(`📈 Datos actuales:`);
    console.log(`   - Grupos: ${totalGrupos}`);
    console.log(`   - Empresas: ${totalEmpresas}`);
    console.log(`   - Contratos: ${totalContratos}`);
    console.log(`   - Dispositivos: ${totalDispositivos}`);
    console.log(`   - Formaciones: ${totalFormaciones}`);
    
    // 2. Seleccionar 10 grupos representativos con sus datos
    console.log('🎯 Seleccionando grupos representativos...');
    
    const gruposToKeep = await prisma.grupo.findMany({
      take: 10,
      include: {
        empresas: {
          take: 5, // Máximo 5 empresas por grupo
          include: {
            contratos: {
              take: 5, // Máximo 5 contratos por empresa
            },
            dispositivos: {
              take: 5, // Máximo 5 dispositivos por empresa
            },
            formaciones: {
              take: 3, // Máximo 3 formaciones por empresa
              include: {
                alumnos: true
              }
            },
            facturas: {
              take: 5, // Máximo 5 facturas por empresa
            }
          }
        }
      }
    });
    
    console.log(`✅ Seleccionados ${gruposToKeep.length} grupos para mantener`);
    
    // 3. Recopilar IDs a mantener
    const grupoIdsToKeep = gruposToKeep.map(g => g.id).filter(id => id != null);
    const empresaIdsToKeep = [];
    const contratoIdsToKeep = [];
    const dispositivoIdsToKeep = [];
    const formacionIdsToKeep = [];
    const facturaIdsToKeep = [];
    const alumnoIdsToKeep = [];
    
    gruposToKeep.forEach(grupo => {
      grupo.empresas.forEach(empresa => {
        if (empresa.id) empresaIdsToKeep.push(empresa.id);
        
        empresa.contratos.forEach(contrato => {
          if (contrato.id) contratoIdsToKeep.push(contrato.id);
        });
        
        empresa.dispositivos.forEach(dispositivo => {
          if (dispositivo.serie) dispositivoIdsToKeep.push(dispositivo.serie);
        });
        
        empresa.formaciones.forEach(formacion => {
          if (formacion.id) formacionIdsToKeep.push(formacion.id);
          formacion.alumnos.forEach(alumno => {
            if (alumno.id) alumnoIdsToKeep.push(alumno.id);
          });
        });
        
        empresa.facturas.forEach(factura => {
          if (factura.id) facturaIdsToKeep.push(factura.id);
        });
      });
    });
    
    // Filtrar undefined/null values
    const cleanGrupoIds = grupoIdsToKeep.filter(id => id != null);
    const cleanEmpresaIds = empresaIdsToKeep.filter(id => id != null);
    const cleanContratoIds = contratoIdsToKeep.filter(id => id != null);
    const cleanDispositivoIds = dispositivoIdsToKeep.filter(id => id != null);
    const cleanFormacionIds = formacionIdsToKeep.filter(id => id != null);
    const cleanFacturaIds = facturaIdsToKeep.filter(id => id != null);
    const cleanAlumnoIds = alumnoIdsToKeep.filter(id => id != null);
    
    console.log(`📋 Registros a mantener:`);
    console.log(`   - Grupos: ${cleanGrupoIds.length}`);
    console.log(`   - Empresas: ${cleanEmpresaIds.length}`);
    console.log(`   - Contratos: ${cleanContratoIds.length}`);
    console.log(`   - Dispositivos: ${cleanDispositivoIds.length}`);
    console.log(`   - Formaciones: ${cleanFormacionIds.length}`);
    console.log(`   - Facturas: ${cleanFacturaIds.length}`);
    console.log(`   - Alumnos: ${cleanAlumnoIds.length}`);
    
    // 4. Eliminar registros que no están en las listas (en orden correcto para evitar errores de FK)
    console.log('🗑️ Eliminando registros no necesarios...');
    
    // Eliminar alumnos (solo si hay IDs para mantener)
    if (cleanAlumnoIds.length > 0) {
      const deletedAlumnos = await prisma.alumno.deleteMany({
        where: {
          id: {
            notIn: cleanAlumnoIds
          }
        }
      });
      console.log(`   ✅ Alumnos eliminados: ${deletedAlumnos.count}`);
    } else {
      // Si no hay alumnos para mantener, eliminar todos
      const deletedAlumnos = await prisma.alumno.deleteMany({});
      console.log(`   ✅ Alumnos eliminados: ${deletedAlumnos.count}`);
    }
    
    // Eliminar facturas
    if (cleanFacturaIds.length > 0) {
      const deletedFacturas = await prisma.factura.deleteMany({
        where: {
          id: {
            notIn: cleanFacturaIds
          }
        }
      });
      console.log(`   ✅ Facturas eliminadas: ${deletedFacturas.count}`);
    } else {
      const deletedFacturas = await prisma.factura.deleteMany({});
      console.log(`   ✅ Facturas eliminadas: ${deletedFacturas.count}`);
    }
    
    // Eliminar formaciones
    if (cleanFormacionIds.length > 0) {
      const deletedFormaciones = await prisma.formacion.deleteMany({
        where: {
          id: {
            notIn: cleanFormacionIds
          }
        }
      });
      console.log(`   ✅ Formaciones eliminadas: ${deletedFormaciones.count}`);
    } else {
      const deletedFormaciones = await prisma.formacion.deleteMany({});
      console.log(`   ✅ Formaciones eliminadas: ${deletedFormaciones.count}`);
    }
    
    // Eliminar dispositivos
    if (cleanDispositivoIds.length > 0) {
      const deletedDispositivos = await prisma.dispositivo.deleteMany({
        where: {
          serie: {
            notIn: cleanDispositivoIds
          }
        }
      });
      console.log(`   ✅ Dispositivos eliminados: ${deletedDispositivos.count}`);
    } else {
      const deletedDispositivos = await prisma.dispositivo.deleteMany({});
      console.log(`   ✅ Dispositivos eliminados: ${deletedDispositivos.count}`);
    }
    
    // Eliminar contratos
    if (cleanContratoIds.length > 0) {
      const deletedContratos = await prisma.contrato.deleteMany({
        where: {
          id: {
            notIn: cleanContratoIds
          }
        }
      });
      console.log(`   ✅ Contratos eliminados: ${deletedContratos.count}`);
    } else {
      const deletedContratos = await prisma.contrato.deleteMany({});
      console.log(`   ✅ Contratos eliminados: ${deletedContratos.count}`);
    }
    
    // Eliminar empresas
    if (cleanEmpresaIds.length > 0) {
      const deletedEmpresas = await prisma.empresa.deleteMany({
        where: {
          id: {
            notIn: cleanEmpresaIds
          }
        }
      });
      console.log(`   ✅ Empresas eliminadas: ${deletedEmpresas.count}`);
    } else {
      const deletedEmpresas = await prisma.empresa.deleteMany({});
      console.log(`   ✅ Empresas eliminadas: ${deletedEmpresas.count}`);
    }
    
    // Eliminar grupos
    if (cleanGrupoIds.length > 0) {
      const deletedGrupos = await prisma.grupo.deleteMany({
        where: {
          id: {
            notIn: cleanGrupoIds
          }
        }
      });
      console.log(`   ✅ Grupos eliminados: ${deletedGrupos.count}`);
    }
    
    // 5. Verificar resultados finales
    console.log('📊 Verificando resultados finales...');
    
    const finalGrupos = await prisma.grupo.count();
    const finalEmpresas = await prisma.empresa.count();
    const finalContratos = await prisma.contrato.count();
    const finalDispositivos = await prisma.dispositivo.count();
    const finalFormaciones = await prisma.formacion.count();
    const finalFacturas = await prisma.factura.count();
    const finalAlumnos = await prisma.alumno.count();
    
    console.log(`✅ Base de datos limpiada exitosamente:`);
    console.log(`   - Grupos: ${finalGrupos} (era ${totalGrupos})`);
    console.log(`   - Empresas: ${finalEmpresas} (era ${totalEmpresas})`);
    console.log(`   - Contratos: ${finalContratos} (era ${totalContratos})`);
    console.log(`   - Dispositivos: ${finalDispositivos} (era ${totalDispositivos})`);
    console.log(`   - Formaciones: ${finalFormaciones} (era ${totalFormaciones})`);
    console.log(`   - Facturas: ${finalFacturas}`);
    console.log(`   - Alumnos: ${finalAlumnos}`);
    
    console.log('🎉 ¡Limpieza completada! La base de datos ahora es mucho más ligera.');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

// Ejecutar la función
console.log('🚀 Iniciando script de limpieza de base de datos...');
cleanupDatabase();