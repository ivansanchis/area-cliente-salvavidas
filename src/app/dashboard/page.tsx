"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Aún cargando
    if (!session) router.push("/login") // No hay sesión, redirigir al login
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
    return null // Se redirigirá al login
  }

  // Función para obtener el badge del tipo de acceso
  const getAccessTypeBadge = (accessType: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "ADMIN": "destructive",
      "GRUPO": "default",
      "EMPRESA": "secondary",
      "DISPOSITIVO": "outline"
    }
    return variants[accessType] || "outline"
  }

  return (
    <div className="space-y-6">
      {/* Header de la página */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Bienvenido a tu Área de Cliente
        </h1>
        <p className="text-muted-foreground">
          Accede a toda la información de tu cardioprotección desde un solo lugar
        </p>
      </div>

      {/* Información del usuario */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Tu Información</CardTitle>
            <CardDescription>Datos de tu cuenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm">{session.user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tipo de acceso</p>
              <Badge variant={getAccessTypeBadge(session.user.accessType)}>
                {session.user.accessType}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID de acceso</p>
              <p className="text-sm font-mono">{session.user.accessId}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Permisos</CardTitle>
            <CardDescription>Secciones a las que tienes acceso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Contratos</span>
              <Badge variant={session.user.canViewContratos ? "default" : "secondary"}>
                {session.user.canViewContratos ? "Activado" : "Desactivado"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Formaciones</span>
              <Badge variant={session.user.canViewFormaciones ? "default" : "secondary"}>
                {session.user.canViewFormaciones ? "Activado" : "Desactivado"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Facturas</span>
              <Badge variant={session.user.canViewFacturas ? "default" : "secondary"}>
                {session.user.canViewFacturas ? "Activado" : "Desactivado"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Estado del Sistema</CardTitle>
            <CardDescription>Tu cardioprotección</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Sistema activo</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Datos sincronizados</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Acceso verificado</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen de servicios */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Servicios</CardTitle>
          <CardDescription>
            Acceso rápido a las principales funcionalidades del área de cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-primary">Mis Servicios</h4>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span className="text-sm">Dispositivos y ubicaciones</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Mapa interactivo (próximamente)</span>
                </li>
                {session.user.canViewFormaciones && (
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Formaciones realizadas (próximamente)</span>
                  </li>
                )}
                {session.user.canViewFormaciones && (
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Formación online (próximamente)</span>
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-primary">Gestión y Documentos</h4>
              <ul className="space-y-2">
                {session.user.canViewContratos && (
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Contratos activos (próximamente)</span>
                  </li>
                )}
                {session.user.canViewFacturas && (
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Histórico de facturas (próximamente)</span>
                  </li>
                )}
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Descargas y certificados (próximamente)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Contacto con asesores (próximamente)</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mensaje de bienvenida personalizado */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold text-lg">SC</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                ¡Bienvenido a Salvavidas Cardio!
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tu seguridad es nuestra prioridad. Desde este portal podrás gestionar todos los aspectos 
                de tu cardioprotección de manera sencilla y eficiente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}