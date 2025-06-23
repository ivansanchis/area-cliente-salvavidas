// src/app/dashboard/admin/users/[id]/edit/page.tsx

import { notFound, redirect } from 'next/navigation'
import { verifyAdminFromCookies } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import EditUserForm from '@/components/admin/EditUserForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// ✅ CORREGIDO: params es ahora Promise en Next.js 15
interface PageProps {
  params: Promise<{
    id: string
  }>
}

async function getUserWithRelations(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        grupo: true,
        empresa: true
      }
    })
    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

async function getGrupos() {
  try {
    const grupos = await prisma.grupo.findMany({
      orderBy: { nombre: 'asc' }
    })
    return grupos
  } catch (error) {
    console.error('Error fetching grupos:', error)
    return []
  }
}

async function getEmpresas() {
  try {
    const empresas = await prisma.empresa.findMany({
      orderBy: { nombreCliente: 'asc' }
    })
    return empresas
  } catch (error) {
    console.error('Error fetching empresas:', error)
    return []
  }
}

async function getDispositivos() {
  try {
    const dispositivos = await prisma.dispositivo.findMany({
      orderBy: { numeroSerie: 'asc' }
    })
    return dispositivos
  } catch (error) {
    console.error('Error fetching dispositivos:', error)
    return []
  }
}

export default async function EditUserPage({ params }: PageProps) {
  // ✅ CORREGIDO: Await params
  const { id } = await params
  
  // Verificar que el usuario actual es admin
  const adminCheck = await verifyAdminFromCookies()
  if (!adminCheck.isAdmin) {
    redirect('/dashboard')
  }

  // Cargar datos del usuario a editar
  const user = await getUserWithRelations(id)
  if (!user) {
    notFound()
  }

  // Cargar datos para los selectores
  const [grupos, empresas, dispositivos] = await Promise.all([
    getGrupos(),
    getEmpresas(),
    getDispositivos()
  ])

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Breadcrumbs y navegación */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/admin">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a Admin
          </Button>
        </Link>
        <div className="text-sm text-muted-foreground">
          <span>Admin</span>
          <span className="mx-2">/</span>
          <span>Usuarios</span>
          <span className="mx-2">/</span>
          <span>Editar</span>
        </div>
      </div>

      {/* Título principal */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Editar Usuario</h1>
        <p className="text-muted-foreground mt-2">
          Modifica los datos y permisos del usuario: <strong>{user.email}</strong>
        </p>
      </div>

      {/* Card con el formulario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📝 Información del Usuario
          </CardTitle>
          <CardDescription>
            Actualiza los datos personales, roles y permisos de acceso del usuario.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditUserForm 
            user={user}
            grupos={grupos}
            empresas={empresas}
            dispositivos={dispositivos}
          />
        </CardContent>
      </Card>
    </div>
  )
}