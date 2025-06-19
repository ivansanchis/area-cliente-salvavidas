"use client"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

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
    const isAdmin = session.user?.email === 'test@salvavidas.com' || 
                   session.user?.accessType === 'admin'
    
    if (!isAdmin) {
      router.push("/dashboard")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando panel de administración...</p>
        </div>
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
      <div className="flex items-center justify-center h-64">
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

  // Determinar pestaña activa basándose en la ruta
  const activeTab = pathname === '/dashboard/admin/activity' ? 'activity' : 'users'

  const handleTabChange = (value: string) => {
    if (value === 'users') {
      router.push('/dashboard/admin')
    } else if (value === 'activity') {
      router.push('/dashboard/admin/activity')
    }
  }

  return (
    <div className="space-y-6">
      {/* Título de la página */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
        <p className="text-muted-foreground">
          Gestión completa de usuarios y permisos del sistema
        </p>
      </div>

      {/* Tabs de navegación */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="activity">Actividad</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-6">
          {activeTab === 'users' && children}
        </TabsContent>
        
        <TabsContent value="activity" className="mt-6">
          {activeTab === 'activity' && children}
        </TabsContent>
      </Tabs>
    </div>
  )
}