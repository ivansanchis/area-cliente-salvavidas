import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'
import { readFileSync } from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function loadExcelData() {
  try {
    console.log('🚀 Iniciando carga de datos desde Excel...')
    
    // Limpiar datos existentes (excepto usuarios)
    console.log('🧹 Limpiando datos existentes...')
    await prisma.alumno.deleteMany()
    await prisma.factura.deleteMany()
    await prisma.formacion.deleteMany()
    await prisma.dispositivo.deleteMany()
    await prisma.contrato.deleteMany()
    await prisma.empresa.deleteMany()
    await prisma.grupo.deleteMany()
    
    // 1. EMPRESAS
    console.log('📊 Cargando EMPRESAS...')
    const empresasFile = readFileSync(path.join(process.cwd(), 'src/data/EMPRESAS.xlsx'))
    const empresasWorkbook = XLSX.read(empresasFile)
    const empresasData = XLSX.utils.sheet_to_json(empresasWorkbook.Sheets['Export']) as any[]
    
    // Crear grupos únicos primero
    const gruposUnicos = new Map()
    empresasData.forEach(row => {
      // Verificar que los campos requeridos existen
      if (row['ID Grupo'] && row['Grupo Cliente']) {
        const idGrupo = row['ID Grupo'].toString()
        if (!gruposUnicos.has(idGrupo)) {
          gruposUnicos.set(idGrupo, {
            idGrupo: idGrupo,
            nombre: row['Grupo Cliente'],
            numeroEquipos: 0,
            numeroFormaciones: 0,
            mrrTotal: 0,
            cuotaMediaEquipo: 0,
          })
        }
      }
    })
    
    // Insertar grupos
    for (const grupo of gruposUnicos.values()) {
      await prisma.grupo.upsert({
        where: { nombre: grupo.nombre },
        update: grupo,
        create: grupo
      })
    }
    console.log(`✅ ${gruposUnicos.size} grupos creados`)
    
    // Insertar empresas
    let empresasCreadas = 0
    for (const row of empresasData) {
      try {
        // Verificar que los campos requeridos existen
        if (!row['Nombre Cliente'] || !row['ID Grupo']) {
          continue
        }
        
        await prisma.empresa.upsert({
          where: { idSage: row['Nombre Cliente'] },
          update: {
            idGrupo: row['ID Grupo'].toString(),
            nombreCliente: row['Nombre Cliente'],
            numeroEquipos: row['Nº Equipos'] || 0,
            numeroFormaciones: 0,
            mrr: row['MRR'] || 0,
            cuotaEquipo: row['Nº Equipos'] > 0 ? (row['MRR'] || 0) / row['Nº Equipos'] : 0,
          },
          create: {
            idSage: row['Nombre Cliente'],
            idGrupo: row['ID Grupo'].toString(),
            nombreCliente: row['Nombre Cliente'],
            numeroEquipos: row['Nº Equipos'] || 0,
            numeroFormaciones: 0,
            mrr: row['MRR'] || 0,
            cuotaEquipo: row['Nº Equipos'] > 0 ? (row['MRR'] || 0) / row['Nº Equipos'] : 0,
          }
        })
        empresasCreadas++
      } catch (error) {
        // Ignorar errores de relación por ahora
        continue
      }
    }
    console.log(`✅ ${empresasCreadas} empresas creadas`)
    
    // 2. CONTRATOS
    console.log('📊 Cargando CONTRATOS...')
    const contratosFile = readFileSync(path.join(process.cwd(), 'src/data/CONTRATOS.xlsx'))
    const contratosWorkbook = XLSX.read(contratosFile)
    const contratosData = XLSX.utils.sheet_to_json(contratosWorkbook.Sheets['Export']) as any[]
    
    let contratosCreados = 0
    for (const row of contratosData) {
      try {
        // Convertir fecha de Excel a Date
        const fechaInicio = row['FECHA_INI'] ? new Date((row['FECHA_INI'] - 25569) * 86400 * 1000) : new Date()
        
        await prisma.contrato.create({
          data: {
            idContrato: row['ID Contrato'],
            idGrupo: row['ID Grupo'].toString(),
            grupoCliente: row['Grupo Cliente'],
            estadoContrato: row['Estado'] || 'Activo',
            idSage: row['Nombre Cliente SAGE'],
            cif: row['CIF'] || 'N/A',
            nombreClienteSage: row['Nombre Cliente SAGE'],
            fechaInicio: fechaInicio,
            fechaFinalizacion: null,
            contratoSage: row['Contrato Sage'] || '',
            periodoFacturacion: row['Periodo Facturación'] || 'Mensual',
            formaPago: 'Domiciliación',
            descripcion: row['DESCRIPCIO'] || null,
            mrr: row['MRR'] || 0,
            numeroEquipos: row['Nº Equipos'] || 0,
            cuotaMediaEquipo: row['Nº Equipos'] > 0 ? (row['MRR'] || 0) / row['Nº Equipos'] : 0,
            ultimaFactura: null,
            ultimoCobro: null,
          }
        })
        contratosCreados++
      } catch (error) {
        continue
      }
    }
    console.log(`✅ ${contratosCreados} contratos creados`)
    
    // 3. DISPOSITIVOS
    console.log('📊 Cargando DISPOSITIVOS...')
    const dispositivosFile = readFileSync(path.join(process.cwd(), 'src/data/DISPOSITIVOS.xlsx'))
    const dispositivosWorkbook = XLSX.read(dispositivosFile)
    const dispositivosData = XLSX.utils.sheet_to_json(dispositivosWorkbook.Sheets['Export']) as any[]
    
    let dispositivosCreados = 0
    for (const row of dispositivosData.slice(0, 100)) { // Solo primeros 100 para prueba
      try {
        // Convertir fechas de Excel
        const fechaInstal = row['Fecha Instal'] ? new Date((row['Fecha Instal'] - 25569) * 86400 * 1000) : new Date()
        const fechaRevis = row['Fecha Revis.'] ? new Date((row['Fecha Revis.'] - 25569) * 86400 * 1000) : new Date()
        
        await prisma.dispositivo.create({
          data: {
            numeroSerie: row['# Serie']?.toString().trim(),
            idContrato: row['ID Contrato'],
            idSage: row['Nombre Cliente'],
            grupoCliente: row['Grupo Cliente'],
            nombreCliente: row['Nombre Cliente'],
            contratoSage: row['Contrato Sage'] || '',
            espacio: row['Espacio'] || '',
            provincia: row['Provincia'] || '',
            linkInforme: row['Link a Informe'] || null,
            linkAudit: row['Link a Audit'] || null,
            fechaInstalacion: fechaInstal,
            fechaRevision: fechaRevis,
            edLink: row['Ed.'] || null,
            altaLink: null,
            latitud: row['Lat'] ? parseFloat(row['Lat']) : null,
            longitud: row['Lng'] ? parseFloat(row['Lng']) : null,
            contratoSoslink: row['Contrato Soslink'] || null,
            cancelacion: row['Canc.'] || null,
            situacion: row['Situación'] || 'Activo',
            idUbicacion: row['ID Ubic.']?.toString() || null,
            numeroPedido: row['# Ped'] || null,
          }
        })
        dispositivosCreados++
      } catch (error) {
        continue
      }
    }
    console.log(`✅ ${dispositivosCreados} dispositivos creados`)
    
    // 4. FORMACIONES (muestra)
    console.log('📊 Cargando FORMACIONES (muestra)...')
    const formacionesFile = readFileSync(path.join(process.cwd(), 'src/data/FORMACIONES.xlsx'))
    const formacionesWorkbook = XLSX.read(formacionesFile)
    const formacionesData = XLSX.utils.sheet_to_json(formacionesWorkbook.Sheets['Export']) as any[]
    
    let formacionesCreadas = 0
    for (const row of formacionesData.slice(0, 50)) { // Solo primeras 50 para prueba
      try {
        // Convertir fecha
        const fechaRealizacion = row['start_at'] ? new Date(row['start_at']) : new Date()
        
        await prisma.formacion.create({
          data: {
            idFormacion: row['id'].toString(),
            instructor: row['Instructor VF'] || 'No asignado',
            estado: row['Estado'] || 'Completado',
            tipoFormacion: row['Tipo Formación'] || 'SVB + DEA',
            ccaa: row['CCAA'] || 'No especificado',
            fechaRealizacion: fechaRealizacion,
            horaInicio: row['start_time_at'] || '09:00',
            direccion: row['address'] || '',
            codigoPostal: row['postal_code'] || '',
            ciudad: row['town'] || '',
            provincia: row['province'] || '',
            duracionTotal: row['hours_total'] || 8,
            fundae: row['fundae'] === 'Si' || false,
            centro: row['center'] || '',
            evaluacionInstructor: null,
            idCliente: row['Nombre Cliente SAGE'],
            grupoCliente: row['Grupo Cliente'],
            nombreClienteSage: row['Nombre Cliente SAGE'],
            numeroPedido: row['order_number']?.toString() || null,
          }
        })
        formacionesCreadas++
      } catch (error) {
        continue
      }
    }
    console.log(`✅ ${formacionesCreadas} formaciones creadas`)
    
    console.log('🎉 ¡Carga de datos completada!')
    console.log('📊 Resumen:')
    console.log(`- ${gruposUnicos.size} grupos`)
    console.log(`- ${empresasCreadas} empresas`)
    console.log(`- ${contratosCreados} contratos`)
    console.log(`- ${dispositivosCreados} dispositivos`)
    console.log(`- ${formacionesCreadas} formaciones`)
    
  } catch (error) {
    console.error('❌ Error cargando datos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

loadExcelData()