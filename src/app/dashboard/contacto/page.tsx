"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle, Clock, Users, Headphones, FileText, Phone, Mail, User } from 'lucide-react'

export default function ContactoPage() {
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
        <div className="mx-auto w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mb-4">
          <MessageCircle className="h-8 w-8 text-cyan-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Contacto</h1>
        <p className="text-muted-foreground mt-2">
          Canales de comunicación y soporte técnico
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
            La sección de contacto estará disponible muy pronto con todos los canales de comunicación integrados.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <User className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Tu Asesor Comercial</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Información personalizada y formularios de contacto directo
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <Headphones className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Soporte Técnico (SAT)</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Formularios conectados con Zoho Desk para incidencias
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <FileText className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Administración</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Consultas sobre facturación y documentos fiscales
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <Phone className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Contacto Directo</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Teléfonos y datos de contacto personalizados por usuario
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <Mail className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Formularios Integrados</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Conexión directa con Zoho CRM y Zoho Desk
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <Users className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Autocompletado Inteligente</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Formularios con datos del usuario para agilizar gestiones
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Próximas funcionalidades:</strong> Información personalizada del asesor comercial 
              asignado, formularios de soporte técnico integrados con Zoho Desk, contacto con administración 
              para facturación, y autocompletado inteligente de datos del usuario.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}