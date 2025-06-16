// src/app/dashboard/admin/page.tsx
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import CreateUserDialog from "@/components/admin/CreateUserDialog"
import { 
  UserPlus, 
  Search, 
  Users, 
  Shield, 
  Activity,
  Download,
  Edit,
  UserX,
  UserCheck
} from "lucide-react"

interface User {
  id: string
  email: string
  nombre?: string
  apellidos?: string
  name?: string
  role: string
  accessType: string
  accessId: string
  canViewContratos: boolean
  canViewFormaciones: boolean
  canViewFacturas: boolean
  active: boolean
  lastLogin?: string
  createdAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        console.error('Error fetching users')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = filterRole === "all" || user.role === filterRole.toUpperCase()
    
    return matchesSearch && matchesRole
  })

  const getRoleBadge = (role: string) => {
    const variants = {
      ADMIN: "bg-red-100 text-red-800",
      GRUPO: "bg-blue-100 text-blue-800", 
      EMPRESA: "bg-green-100 text-green-800",
      DISPOSITIVO: "bg-yellow-100 text-yellow-800"
    }
    
    return variants[role as keyof typeof variants] || "bg-gray-100 text-gray-800"
  }

  const getStatusBadge = (active: boolean) => {
    return active 
      ? "bg-green-100 text-green-800" 
      : "bg-red-100 text-red-800"
  }

  const getUserDisplayName = (user: User) => {
    if (user.nombre && user.apellidos) {
      return `${user.nombre} ${user.apellidos}`
    }
    return user.name || user.email
  }

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    active: users.filter(u => u.active).length,
    inactive: users.filter(u => !u.active).length,
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-lg">Cargando usuarios...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra usuarios y sus permisos</p>
        </div>
        <CreateUserDialog onUserCreated={fetchUsers} />
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Total Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Administradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.admins}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <UserCheck className="w-4 h-4 mr-2" />
              Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <UserX className="w-4 h-4 mr-2" />
              Inactivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busca y filtra usuarios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por email, nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full sm:w-48">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full h-9 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los roles</option>
                <option value="admin">Administrador</option>
                <option value="grupo">Grupo</option>
                <option value="empresa">Empresa</option>
                <option value="dispositivo">Dispositivo</option>
              </select>
            </div>
            
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Acceso</TableHead>
                  <TableHead>Permisos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último Login</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{getUserDisplayName(user)}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={getRoleBadge(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{user.accessType}</div>
                        <div className="text-gray-500 truncate max-w-32">{user.accessId}</div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.canViewContratos && (
                          <Badge variant="outline" className="text-xs">Contratos</Badge>
                        )}
                        {user.canViewFormaciones && (
                          <Badge variant="outline" className="text-xs">Formaciones</Badge>
                        )}
                        {user.canViewFacturas && (
                          <Badge variant="outline" className="text-xs">Facturas</Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={getStatusBadge(user.active)}>
                        {user.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm text-gray-500">
                        {user.lastLogin 
                          ? new Date(user.lastLogin).toLocaleDateString('es-ES')
                          : 'Nunca'
                        }
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className={user.active ? "text-red-600" : "text-green-600"}
                        >
                          {user.active ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}