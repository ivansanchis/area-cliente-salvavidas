"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Clock, CreditCard, Download, UserPlus, Receipt, Settings } from 'lucide-react'

export default function ContratosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    if (!session) router.push("/login")
  }, [session, status, router])

  // Verificar permisos de contratos
  useEffect(() => {
    if (session?.user && !session.user.canViewContratos) {
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

  if (!session || !session.user.canViewContratos) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Mis Contratos</h1>
        <p className="text-muted-foreground mt-2">
          Gestión de contratos activos y facturación
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
            La sección de contratos y facturación estará disponible muy pronto con funcionalidades completas.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Contratos Activos</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Visualización completa de todos los contratos vigentes
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <Receipt className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Histórico de Facturas</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Acceso completo al historial de facturación y pagos
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <Download className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Descarga de Facturas</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Descarga individual de facturas en formato PDF
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <UserPlus className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Ampliación de Servicios</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Formularios conectados con Zoho CRM para nuevos servicios
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <CreditCard className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Incidencias de Pago</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Resolución de problemas de facturación via Zoho Desk
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <Settings className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Cambios de Facturación</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Solicitud de modificaciones en datos de facturación
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Próximas funcionalidades:</strong> Tabla de contratos activos con MRR, 
              histórico completo de facturas, descarga de documentos, formularios de ampliación 
              de servicios, y gestión de incidencias de pago integrada con Zoho.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}