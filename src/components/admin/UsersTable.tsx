// src/components/admin/UsersTable.tsx - CORREGIDO ELIMINAR VS DESACTIVAR

"use client"

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from 'sonner'
import Link from 'next/link'
import { Pencil, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'

// ✅ INTERFAZ UNIFICADA que coincide con AdminUsersManager
interface User {
  id: string
  email: string
  nombre?: string | null
  apellidos?: string | null
  name?: string | null
  role: string
  accessType: string
  accessId: string
  active: boolean
  canViewContratos: boolean
  canViewFormaciones: boolean
  canViewFacturas: boolean
  createdAt: Date
  updatedAt: Date
  grupo?: { 
    id: string
    nombre: string
    idGrupo: string
    numeroEquipos: number
    numeroFormaciones: number
    mrrTotal: number
    cuotaMediaEquipo: number
    createdAt: Date
    updatedAt: Date
  } | null
  empresa?: { 
    id: string
    nombreCliente: string
    idSage: string
    idGrupo: string
    numeroEquipos: number
    numeroFormaciones: number
    mrr: number
    cuotaEquipo: number
    createdAt: Date
    updatedAt: Date
  } | null
}

interface UsersTableProps {
  users: User[]
  onUserUpdate: (updatedUser: User) => void
  onUserRemove: (userId: string) => void
}

export default function UsersTable({ users, onUserUpdate, onUserRemove }: UsersTableProps) {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    user: User | null
    action: 'delete' | 'deactivate' | null
  }>({
    open: false,
    user: null,
    action: null
  })
  const [isProcessing, setIsProcessing] = useState(false)

  const getRoleIcon = (accessType: string) => {
    switch (accessType) {
      case 'ADMIN': return '👑'
      case 'GRUPO': return '🏢'
      case 'EMPRESA': return '🏬'
      case 'DISPOSITIVO': return '📱'
      default: return '👤'
    }
  }

  const getRoleColor = (accessType: string) => {
    switch (accessType) {
      case 'ADMIN': return 'bg-red-100 text-red-800 border-red-200'
      case 'GRUPO': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'EMPRESA': return 'bg-green-100 text-green-800 border-green-200'
      case 'DISPOSITIVO': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const openDeleteDialog = (user: User) => {
    setDeleteDialog({
      open: true,
      user,
      action: null // Inicialmente null, se define al elegir botón
    })
  }

  const closeDeleteDialog = () => {
    setDeleteDialog({
      open: false,
      user: null,
      action: null
    })
  }

  const handleUserAction = async (action: 'delete' | 'deactivate') => {
    if (!deleteDialog.user) return

    setIsProcessing(true)

    try {
      const endpoint = action === 'delete' 
        ? `/api/admin/users/${deleteDialog.user.id}`
        : `/api/admin/users/${deleteDialog.user.id}/deactivate`

      const response = await fetch(endpoint, {
        method: action === 'delete' ? 'DELETE' : 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        if (action === 'delete') {
          // ✅ ELIMINAR: quitar completamente del listado
          onUserRemove(deleteDialog.user.id)
          
          toast.success('Usuario eliminado permanentemente', {
            description: `${deleteDialog.user.email} ha sido eliminado de la base de datos`,
            icon: <CheckCircle className="h-4 w-4" />,
            duration: 4000,
          })
        } else {
          // ✅ DESACTIVAR: actualizar estado del usuario
          const updatedUser = { ...deleteDialog.user, active: false }
          onUserUpdate(updatedUser)
          
          toast.success('Usuario desactivado correctamente', {
            description: `${deleteDialog.user.email} ha sido desactivado`,
            icon: <CheckCircle className="h-4 w-4" />,
            duration: 4000,
          })
        }
        
        closeDeleteDialog()
      } else {
        const error = await response.json()
        
        toast.error('Error al procesar la solicitud', {
          description: error.error || 'Ha ocurrido un error inesperado',
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Error processing user action:', error)
      
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor',
        duration: 5000,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Tipo de Acceso</TableHead>
                <TableHead>Acceso Asignado</TableHead>
                <TableHead>Permisos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.email}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.nombre && user.apellidos 
                          ? `${user.nombre} ${user.apellidos}`
                          : user.name || 'Sin nombre'
                        }
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge className={getRoleColor(user.accessType)}>
                      {getRoleIcon(user.accessType)} {user.accessType}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="max-w-[200px] truncate text-sm">
                      {user.accessType === 'ADMIN' && (
                        <span className="text-muted-foreground">Acceso total al sistema</span>
                      )}
                      {user.accessType === 'GRUPO' && user.grupo && (
                        <span>{user.grupo.nombre}</span>
                      )}
                      {user.accessType === 'EMPRESA' && user.empresa && (
                        <span>{user.empresa.nombreCliente}</span>
                      )}
                      {user.accessType === 'DISPOSITIVO' && (
                        <span>Dispositivo: {user.accessId}</span>
                      )}
                      {!user.grupo && !user.empresa && user.accessType !== 'ADMIN' && user.accessType !== 'DISPOSITIVO' && (
                        <span className="text-muted-foreground">No asignado</span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-1">
                      {user.canViewContratos && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline" className="text-xs cursor-help">C</Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Puede ver Contratos</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {user.canViewFormaciones && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline" className="text-xs cursor-help">F</Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Puede ver Formaciones</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {user.canViewFacturas && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline" className="text-xs cursor-help">€</Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Puede ver Facturas</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant={user.active ? "default" : "secondary"}>
                      {user.active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/admin/users/${user.id}/edit`}>
                        <Button variant="outline" size="sm" title="Editar usuario">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      
                      {/* ✅ CORREGIDO: El botón ahora abre el modal sin preseleccionar acción */}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => openDeleteDialog(user)}
                        title="Gestionar usuario"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No hay usuarios que coincidan con la búsqueda</p>
          </div>
        )}

        {/* ✅ MODAL MEJORADO CON DOS ACCIONES DISTINTAS */}
        <Dialog open={deleteDialog.open} onOpenChange={closeDeleteDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Gestionar Usuario
              </DialogTitle>
              <DialogDescription>
                Selecciona la acción que deseas realizar con este usuario:
              </DialogDescription>
            </DialogHeader>

            {deleteDialog.user && (
              <div className="py-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium">{deleteDialog.user.email}</p>
                  <p className="text-sm text-muted-foreground">
                    {deleteDialog.user.nombre && deleteDialog.user.apellidos 
                      ? `${deleteDialog.user.nombre} ${deleteDialog.user.apellidos}`
                      : deleteDialog.user.name || 'Sin nombre'
                    }
                  </p>
                </div>
                
                <div className="space-y-3 mt-4">
                  <div className="text-sm">
                    <p className="font-medium text-orange-600">Desactivar Usuario:</p>
                    <p className="text-muted-foreground">El usuario seguirá en la base de datos pero no podrá acceder. Aparecerá como "Inactivo".</p>
                  </div>
                  
                  <div className="text-sm">
                    <p className="font-medium text-red-600">Eliminar Usuario:</p>
                    <p className="text-muted-foreground">El usuario será eliminado permanentemente de la base de datos. Esta acción no se puede deshacer.</p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={closeDeleteDialog}
                disabled={isProcessing}
              >
                Cancelar
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleUserAction('deactivate')}
                disabled={isProcessing}
                className="text-orange-600 hover:text-orange-700"
              >
                {isProcessing ? 'Desactivando...' : 'Desactivar'}
              </Button>
              
              <Button
                variant="destructive"
                onClick={() => handleUserAction('delete')}
                disabled={isProcessing}
              >
                {isProcessing ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}