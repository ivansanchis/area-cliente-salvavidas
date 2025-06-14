"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

interface Dispositivo {
  id: string
  numeroSerie: string
  espacio: string
  provincia: string
  fechaInstalacion: string
  fechaRevision: string
  situacion: string
  latitud: number | null
  longitud: number | null
  linkInforme: string | null
}

export default function DispositivosPage() {
  const { data: session, status } = useSession()
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchDispositivos()
    }
  }, [session])

  const fetchDispositivos = async () => {
    try {
      const response = await fetch('/api/dispositivos')
      if (!response.ok) {
        console.error('Error response:', response.status, response.statusText)
        setDispositivos([]) // Asegurar que sea un array
        return
      }
      const data = await response.json()
      if (Array.isArray(data)) {
        setDispositivos(data)
      } else {
        console.error('Data is not an array:', data)
        setDispositivos([])
      }
    } catch (error) {
      console.error('Error fetching dispositivos:', error)
      setDispositivos([]) // Asegurar que sea un array
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return <div className="p-8">Cargando dispositivos...</div>
  }

  if (!session) {
    return <div className="p-8">No tienes acceso</div>
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dispositivos</h1>
        <p className="text-gray-600">Gestión de equipos de cardioprotección</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Dispositivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dispositivos.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dispositivos.filter(d => d.situacion === 'Activo').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Con Coordenadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dispositivos.filter(d => d.latitud && d.longitud).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Próximas Revisiones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {dispositivos.filter(d => new Date(d.fechaRevision) <= new Date()).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de dispositivos */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Dispositivos</CardTitle>
          <CardDescription>
            {dispositivos.length} dispositivos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serie</TableHead>
                  <TableHead>Espacio</TableHead>
                  <TableHead>Provincia</TableHead>
                  <TableHead>Instalación</TableHead>
                  <TableHead>Próxima Revisión</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dispositivos.map((dispositivo) => (
                  <TableRow key={dispositivo.id}>
                    <TableCell className="font-mono text-sm">
                      {dispositivo.numeroSerie}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {dispositivo.espacio}
                    </TableCell>
                    <TableCell>{dispositivo.provincia}</TableCell>
                    <TableCell>
                      {new Date(dispositivo.fechaInstalacion).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell className={
                      new Date(dispositivo.fechaRevision) <= new Date() 
                        ? "text-red-600 font-medium" 
                        : ""
                    }>
                      {new Date(dispositivo.fechaRevision).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        dispositivo.situacion === 'Activo' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {dispositivo.situacion}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {dispositivo.linkInforme && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={dispositivo.linkInforme} target="_blank" rel="noopener noreferrer">
                              Ver Informe
                            </a>
                          </Button>
                        )}
                        {dispositivo.latitud && dispositivo.longitud && (
                          <Button variant="outline" size="sm" asChild>
                            <a 
                              href={`https://maps.google.com/?q=${dispositivo.latitud},${dispositivo.longitud}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              Ver Mapa
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}