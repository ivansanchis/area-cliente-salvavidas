// src/app/dashboard/admin/page.tsx - CORREGIDA CON CONEXIÓN COMPLETA

import { verifyAdminFromCookies } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import CreateUserDialog from '@/components/admin/CreateUserDialog'
import AdminUsersManager from '@/components/admin/AdminUsersManager'
import { Users, Shield, Activity, Building2 } from 'lucide-react'

async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        grupo: true,
        empresa: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return users
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

async function getEnhancedStats() {
  try {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      grupoUsers,
      empresaUsers,
      dispositivoUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { active: true } }),
      prisma.user.count({ where: { active: false } }),
      prisma.user.count({ where: { accessType: 'GRUPO' } }),
      prisma.user.count({ where: { accessType: 'EMPRESA' } }),
      prisma.user.count({ where: { accessType: 'DISPOSITIVO' } })
    ])

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      grupoUsers,
      empresaUsers,
      dispositivoUsers
    }
  } catch (error) {
    console.error('Error fetching enhanced stats:', error)
    return {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      grupoUsers: 0,
      empresaUsers: 0,
      dispositivoUsers: 0
    }
  }
}

export default async function AdminPage() {
  const adminCheck = await verifyAdminFromCookies()
  
  if (!adminCheck.isAdmin) {
    redirect('/dashboard')
  }

  const [users, stats] = await Promise.all([
    getUsers(),
    getEnhancedStats()
  ])

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <Shield className="inline-block mr-3 h-8 w-8" />
            Panel de Administración
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestión completa de usuarios y permisos del sistema
          </p>
        </div>
        <CreateUserDialog />
      </div>

      {/* Enhanced Stats Cards - 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Usuarios registrados en el sistema
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Active vs Inactive */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado de Usuarios</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm">Activos</span>
                </div>
                <span className="text-lg font-semibold text-green-600">{stats.activeUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm">Inactivos</span>
                </div>
                <span className="text-lg font-semibold text-red-600">{stats.inactiveUsers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Access Types (sin Admin) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipos de Acceso</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🏢 Grupo</span>
                </div>
                <span className="text-sm font-semibold text-blue-600">{stats.grupoUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🏬 Empresa</span>
                </div>
                <span className="text-sm font-semibold text-green-600">{stats.empresaUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">📱 Dispositivo</span>
                </div>
                <span className="text-sm font-semibold text-purple-600">{stats.dispositivoUsers}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Usuarios ({users.length})
          </CardTitle>
          <CardDescription>
            Gestiona todos los usuarios del sistema, sus roles y permisos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminUsersManager initialUsers={users} />
        </CardContent>
      </Card>
    </div>
  )
}