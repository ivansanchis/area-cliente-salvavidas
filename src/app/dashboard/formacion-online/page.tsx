"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Monitor, Clock, Users, Upload, FileSpreadsheet, BookOpen, Play } from 'lucide-react'

export default function FormacionOnlinePage() {
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
        <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
          <Monitor className="h-8 w-8 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Formación Online</h1>
        <p className="text-muted-foreground mt-2">
          Plataforma e-learning y gestión de cursos virtuales
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
            La plataforma de formación online estará disponible muy pronto con todas las herramientas necesarias.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <BookOpen className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Temario Detallado</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Acceso completo al contenido por módulos y unidades didácticas
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Inscripción Individual</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Formularios conectados con Trainer Central de Zoho
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <Upload className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Alta Masiva</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Carga de plantillas Excel para múltiples alumnos
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <FileSpreadsheet className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Plantillas de Carga</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Descarga de plantillas para gestión masiva de empleados
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <Play className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Plataforma Integrada</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Acceso directo al entorno de aprendizaje virtual
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <Monitor className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Informes Personalizados</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Seguimiento del progreso y resultados de empleados
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Próximas funcionalidades:</strong> Descripción completa del curso online, 
              formularios de inscripción individual y masiva, integración con Trainer Central, 
              descarga de plantillas Excel y solicitud de informes personalizados.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}