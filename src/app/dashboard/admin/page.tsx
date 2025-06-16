// src/app/dashboard/admin/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Filter, 
  Users, 
  UserPlus, 
  Edit,
  Shield,
  Building,
  Smartphone,
  Eye,
  RefreshCw
} from "lucide-react"
import CreateUserDialog from "@/components/admin/CreateUserDialog"
import EditUserDialog from "@/components/admin/EditUserDialog"

interface User {
  id: string
  email: string
  nombre: string | null
  apellidos: string | null
  role: string
  accessType: string
  accessId: string
  grupoAsignado: string | null
  empresaAsignada: string | null
  canViewContratos: boolean
  canViewFormaciones: boolean
  canViewFacturas: boolean
  active: boolean
  createdAt: string
  updatedAt: string
  lastLogin?: string | null
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  
  // Estados para el modal de edición
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [users, searchTerm, roleFilter, statusFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const userData = await response.json()
        setUsers(userData)
      } else {
        console.error('Error fetching users:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = users

    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.grupoAsignado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.empresaAsignada?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro de rol
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Filtro de estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(user => 
        statusFilter === "active" ? user.active : !user.active
      )
    }

    setFilteredUsers(filtered)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditModalOpen(true)
  }

  const handleEditComplete = () => {
    // Refrescar la lista de usuarios después de editar
    fetchUsers()
    setEditModalOpen(false)
    setSelectedUser(null)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-4 h-4 text-red-600" />
      case 'GRUPO':
        return <Building className="w-4 h-4 text-blue-600" />
      case 'EMPRESA':
        return <Building className="w-4 h-4 text-green-600" />
      case 'DISPOSITIVO':
        return <Smartphone className="w-4 h-4 text-purple-600" />
      default:
        return <Users className="w-4 h-4 text-gray-600" />
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive'
      case 'GRUPO':
        return 'default'
      case 'EMPRESA':
        return 'secondary'
      case 'DISPOSITIVO':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPermissionsSummary = (user: User) => {
    const permissions = []
    if (user.canViewContratos) permissions.push('C')
    if (user.canViewFormaciones) permissions.push('F')
    if (user.canViewFacturas) permissions.push('Fa')
    return permissions.join(' • ') || 'Sin permisos'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Cargando usuarios...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Administra usuarios, roles y permisos del sistema
          </p>
        </div>
        <CreateUserDialog onUserCreated={fetchUsers} />
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium">Total Usuarios</span>
          </div>
          <p className="text-2xl font-bold mt-2">{users.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium">Administradores</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            {users.filter(u => u.role === 'ADMIN').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">Activos</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            {users.filter(u => u.active).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium">Grupos</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            {users.filter(u => u.role === 'GRUPO').length}
          </p>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por email, nombre, grupo o empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
                <SelectItem value="GRUPO">Grupo</SelectItem>
                <SelectItem value="EMPRESA">Empresa</SelectItem>
                <SelectItem value="DISPOSITIVO">Dispositivo</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={fetchUsers}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualizar</span>
            </Button>
          </div>
        </div>

        {/* Resultados de filtros */}
        <div className="mt-4 text-sm text-gray-600">
          Mostrando {filteredUsers.length} de {users.length} usuarios
          {searchTerm && (
            <span> • Búsqueda: "{searchTerm}"</span>
          )}
          {roleFilter !== "all" && (
            <span> • Rol: {roleFilter}</span>
          )}
          {statusFilter !== "all" && (
            <span> • Estado: {statusFilter === "active" ? "Activos" : "Inactivos"}</span>
          )}
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Rol & Acceso</TableHead>
              <TableHead>Asignación</TableHead>
              <TableHead>Permisos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Última actividad</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                {/* Usuario */}
                <TableCell>
                  <div>
                    <div className="font-medium">{user.nombre} {user.apellidos}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </TableCell>

                {/* Rol & Acceso */}
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(user.role)}
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {user.accessType} → {user.accessId}
                  </div>
                </TableCell>

                {/* Asignación */}
                <TableCell>
                  <div className="text-sm">
                    {user.grupoAsignado && (
                      <div className="flex items-center space-x-1">
                        <Building className="w-3 h-3 text-blue-500" />
                        <span className="truncate max-w-[120px]" title={user.grupoAsignado}>
                          {user.grupoAsignado}
                        </span>
                      </div>
                    )}
                    {user.empresaAsignada && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Building className="w-3 h-3 text-green-500" />
                        <span className="truncate max-w-[120px] text-xs text-gray-600" title={user.empresaAsignada}>
                          {user.empresaAsignada}
                        </span>
                      </div>
                    )}
                    {!user.grupoAsignado && !user.empresaAsignada && (
                      <span className="text-xs text-gray-400">Sin asignación</span>
                    )}
                  </div>
                </TableCell>

                {/* Permisos */}
                <TableCell>
                  <div className="text-xs">
                    {getPermissionsSummary(user)}
                  </div>
                </TableCell>

                {/* Estado */}
                <TableCell>
                  <Badge variant={user.active ? "default" : "secondary"}>
                    {user.active ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>

                {/* Última actividad */}
                <TableCell className="text-sm">
                  <div>
                    <div className="text-gray-600">
                      {formatDate(user.updatedAt)}
                    </div>
                    {user.lastLogin && (
                      <div className="text-xs text-gray-400">
                        Último login: {formatDate(user.lastLogin)}
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Acciones */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                      className="flex items-center space-x-1"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Editar</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Estado vacío */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron usuarios
            </h3>
            <p className="text-gray-500">
              {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                ? "Prueba ajustando los filtros de búsqueda"
                : "Crea tu primer usuario usando el botón 'Nuevo Usuario'"}
            </p>
          </div>
        )}
      </div>

      {/* Modal de edición */}
      <EditUserDialog
        user={selectedUser}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onUserUpdated={handleEditComplete}
      />
    </div>
  )
}