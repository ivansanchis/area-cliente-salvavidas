"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Clock, FileText, Award, Shield, Map, BookOpen } from 'lucide-react'

export default function DescargablesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    if (!session) router.push("/login")
  }, [session, status, router])

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

  if (!session) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <Download className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Descargables</h1>
        <p className="text-muted-foreground mt-2">
          Documentación, certificados y recursos disponibles
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
            La sección de descargables estará disponible muy pronto con toda la documentación necesaria.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Normativas Autonómicas</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Documentos normativos por Comunidad Autónoma en PDF
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Certificado de Cardioprotección</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Generación dinámica de certificados personalizados
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <Shield className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Plan de Emergencias</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Solicitud y descarga de planes de emergencia personalizados
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <BookOpen className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Plan de Comunicación</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Documentos informativos y de comunicación descargables
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <Map className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Recursos por CCAA</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Documentación específica según ubicación geográfica
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <Download className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Descarga Automática</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Generación dinámica con datos de empresa y fechas
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Próximas funcionalidades:</strong> Selector de CCAA para normativas, 
              generación automática de certificados de cardioprotección, solicitud de planes 
              de emergencia via Zoho Desk, y descarga directa de documentación corporativa.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}