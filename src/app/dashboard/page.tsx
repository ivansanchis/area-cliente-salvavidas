"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Aún cargando
    if (!session) router.push("/login") // No hay sesión, redirigir al login
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Cargando...</div>
      </div>
    )
  }

  if (!session) {
    return null // Se redirigirá al login
  }

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Área de Cliente - Salvavidas Cardio
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Hola, {session.user.name || session.user.email}
              </span>
              <Button variant="outline" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Bienvenido a tu área de cliente personalizada</p>
        </div>

        {/* Información del usuario */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Tu Acceso</CardTitle>
              <CardDescription>Información de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Email:</strong> {session.user.email}</p>
                <p><strong>Tipo de acceso:</strong> {session.user.accessType}</p>
                <p><strong>ID de acceso:</strong> {session.user.accessId}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Permisos</CardTitle>
              <CardDescription>Qué puedes ver</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>✅ Contratos: {session.user.canViewContratos ? "Sí" : "No"}</p>
                <p>✅ Formaciones: {session.user.canViewFormaciones ? "Sí" : "No"}</p>
                <p>✅ Facturas: {session.user.canViewFacturas ? "Sí" : "No"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estado</CardTitle>
              <CardDescription>Tu cardioprotección</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>🟢 Sistema activo</p>
                <p>📊 Datos sincronizados</p>
                <p>🔒 Acceso verificado</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Próximas funcionalidades */}
        <Card>
          <CardHeader>
            <CardTitle>Área de Cliente</CardTitle>
            <CardDescription>Accede a tus servicios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Mis Servicios</h4>
                <ul className="text-sm space-y-2">
                  <li>
                    <a href="/dashboard/dispositivos" className="text-blue-600 hover:underline">
                      • Dispositivos y ubicaciones
                    </a>
                  </li>
                  <li className="text-gray-500">• Mapa interactivo (próximamente)</li>
                  <li className="text-gray-500">• Formaciones realizadas (próximamente)</li>
                  <li className="text-gray-500">• Formación online (próximamente)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Mis Contratos</h4>
                <ul className="text-sm space-y-2">
                  <li className="text-gray-500">• Contratos activos (próximamente)</li>
                  <li className="text-gray-500">• Histórico de facturas (próximamente)</li>
                  <li className="text-gray-500">• Descargas y certificados (próximamente)</li>
                  <li className="text-gray-500">• Contacto con asesores (próximamente)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}