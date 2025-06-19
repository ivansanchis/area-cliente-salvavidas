// src/app/dashboard/admin/layout.tsx - CON SOLO 2 PESTAÑAS
"use client"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/login")
      return
    }

    // Verificar que el usuario sea ADMIN
    // Como aún no tenemos el campo 'role' en la sesión, verificamos por accessType temporal
    const isAdmin = session.user?.email === 'test@salvavidas.com' || 
                   session.user?.accessType === 'admin'
    
    if (!isAdmin) {
      router.push("/dashboard")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando panel de administración...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Verificación temporal hasta actualizar NextAuth
  const isAdmin = session.user?.email === 'test@salvavidas.com'
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Acceso Denegado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              No tienes permisos para acceder al panel de administración.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ✅ DETERMINAR PESTAÑA ACTIVA
  const isUsersTab = pathname === '/dashboard/admin' || pathname.startsWith('/dashboard/admin/users')
  const isActivityTab = pathname === '/dashboard/admin/activity'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del Admin */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SC</span>
                </div>
                <div className="ml-3">
                  <h1 className="text-lg font-semibold text-gray-900">
                    Panel de Administración
                  </h1>
                  <p className="text-xs text-gray-500">Salvavidas Cardio</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  👑 ADMIN
                </span>
                <span className="text-sm text-gray-700">
                  {session.user?.name || session.user?.email}
                </span>
              </div>
              
              <button
                onClick={() => router.push("/dashboard")}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                ← Volver al Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ✅ NAVEGACIÓN CON SOLO 2 PESTAÑAS */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {/* Pestaña Usuarios */}
            <button
              onClick={() => router.push("/dashboard/admin")}
              className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                isUsersTab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Usuarios
            </button>
            
            {/* Pestaña Actividad */}
            <button
              onClick={() => router.push("/dashboard/admin/activity")}
              className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                isActivityTab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Actividad
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}