"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Clock, MapPin, Users, FileText, Calendar, Award } from 'lucide-react'

export default function FormacionesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    if (!session) router.push("/login")
  }, [session, status, router])

  // Verificar permisos de formaciones
  useEffect(() => {
    if (session?.user && !session.user.canViewFormaciones) {
      router.push("/dashboard")
    }
  }, [session, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session || !session.user.canViewFormaciones) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <GraduationCap className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Formaciones</h1>
        <p className="text-muted-foreground mt-2">
          Gestión de cursos de formación y certificaciones
        </p>
      </div>

      {/* Próximamente Card */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Clock className="h-6 w-6 text-orange-500" />
            Próximamente
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-lg text-muted-foreground">
            Esta sección estará disponible muy pronto con funcionalidades completas de gestión de formaciones.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Historial de Formaciones</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Acceso completo a todas las formaciones realizadas por la empresa
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <MapPin className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Mapa Interactivo</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Visualización geográfica de formaciones con filtros avanzados
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Gestión de Alumnos</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Control de participantes y descarga de diplomas individuales
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Certificaciones</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Seguimiento de certificados y fechas de reciclaje
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <FileText className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Exportación de Datos</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Descarga de informes en Excel y PDF con filtros personalizados
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <GraduationCap className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Solicitar Reciclajes</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Formularios conectados con Zoho CRM para nuevas formaciones
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Próximas funcionalidades:</strong> Tabla interactiva con formaciones por empresa, 
              mapa de ubicaciones, gestión de alumnos y diplomas, alertas de reciclaje, 
              y conexión directa con Zoho CRM para solicitudes comerciales.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}