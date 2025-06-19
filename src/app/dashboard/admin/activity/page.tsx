// src/app/dashboard/admin/activity/page.tsx - PÁGINA PRÓXIMAMENTE

import { verifyAdminFromCookies } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Clock, Users, Eye } from 'lucide-react'

export default async function ActivityPage() {
  const adminCheck = await verifyAdminFromCookies()
  
  if (!adminCheck.isAdmin) {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Activity className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Actividad</h1>
        <p className="text-muted-foreground mt-2">
          Monitoreo de acciones y eventos del sistema
        </p>
      </div>

      {/* Próximamente Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Clock className="h-6 w-6 text-orange-500" />
            Próximamente
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-lg text-muted-foreground">
            Esta sección estará disponible muy pronto con funcionalidades avanzadas de monitoreo.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Actividad de Usuarios</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Últimos accesos y acciones
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <Activity className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Eventos del Sistema</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Registro de operaciones
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <Eye className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Auditoría</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Trazabilidad completa
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Próximas funcionalidades:</strong> Logs de actividad, estadísticas de uso, 
              reportes de seguridad y análisis de comportamiento de usuarios.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}