"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff, RefreshCw, Save, X } from 'lucide-react'
import { toast } from 'sonner'

const editUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().optional(),
  nombre: z.string().min(1, 'Nombre requerido'),
  apellidos: z.string().min(1, 'Apellidos requeridos'),
  grupoAsignado: z.string().optional(),
  empresaAsignada: z.string().optional(),
  role: z.enum(['ADMIN', 'GRUPO', 'EMPRESA', 'DISPOSITIVO']),
  accessType: z.string().min(1, 'Tipo de acceso requerido'),
  accessId: z.string().min(1, 'ID de acceso requerido'),
  canViewContratos: z.boolean(),
  canViewFormaciones: z.boolean(),
  canViewFacturas: z.boolean(),
  active: z.boolean(),
})

type EditUserFormData = z.infer<typeof editUserSchema>

interface User {
  id: string
  email: string
  nombre: string
  apellidos: string
  grupoAsignado?: string
  empresaAsignada?: string
  role: 'ADMIN' | 'GRUPO' | 'EMPRESA' | 'DISPOSITIVO'
  accessType: string
  accessId: string
  canViewContratos: boolean
  canViewFormaciones: boolean
  canViewFacturas: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}

interface Grupo {
  id: string
  idGrupo: string
  nombre: string
  numeroEquipos: number
  numeroFormaciones: number
  mrrTotal: number
}

interface Empresa {
  id: string
  idSage: string
  nombreCliente: string
  numeroEquipos: number
  numeroFormaciones: number
  mrr: number
  grupo: {
    nombre: string
  }
}

interface EditUserDialogProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserUpdated: () => void
}

export function EditUserDialog({ user, open, onOpenChange, onUserUpdated }: EditUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [empresasFiltradas, setEmpresasFiltradas] = useState<Empresa[]>([])
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  const form = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      email: '',
      password: '',
      nombre: '',
      apellidos: '',
      grupoAsignado: '',
      empresaAsignada: '',
      role: 'EMPRESA',
      accessType: 'empresa',
      accessId: '',
      canViewContratos: true,
      canViewFormaciones: true,
      canViewFacturas: true,
      active: true,
    },
  })

  // 🔧 NUEVO: Función para generar contraseña segura
  const generateSecurePassword = () => {
    const length = 12
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    form.setValue('password', password)
    toast.success('Contraseña generada automáticamente')
  }

  console.log('🔍 Opening edit modal for user:', user)

  // Cargar datos de selectores cuando se abre el modal
  useEffect(() => {
    if (open && !isDataLoaded) {
      console.log('🔄 Loading select data for EditUserDialog...')
      loadSelectData()
    }
  }, [open, isDataLoaded])

  const loadSelectData = async () => {
    try {
      console.log('📡 Fetching grupos...')
      const gruposResponse = await fetch('/api/admin/grupos')
      if (!gruposResponse.ok) {
        const errorData = await gruposResponse.text()
        console.log('❌ Error loading grupos:', gruposResponse.status, gruposResponse.statusText)
        console.log('❌ Error details:', errorData)
        throw new Error(`Error ${gruposResponse.status}: ${gruposResponse.statusText}`)
      }
      const gruposData = await gruposResponse.json()
      setGrupos(gruposData)
      console.log('✅ Grupos loaded:', gruposData.length)

      console.log('📡 Fetching empresas...')
      const empresasResponse = await fetch('/api/admin/empresas')
      if (!empresasResponse.ok) {
        const errorData = await empresasResponse.text()
        console.log('❌ Error loading empresas:', empresasResponse.status, empresasResponse.statusText)
        console.log('❌ Error details:', errorData)
        throw new Error(`Error ${empresasResponse.status}: ${empresasResponse.statusText}`)
      }
      const empresasData = await empresasResponse.json()
      setEmpresas(empresasData)
      console.log('✅ Empresas loaded:', empresasData.length)

      setIsDataLoaded(true)
      console.log('✅ All select data loaded successfully')
    } catch (error) {
      console.error('❌ Error loading select data:', error)
      toast.error('Error cargando datos para los selectores')
    }
  }

  // 🔧 CORREGIDO: Poblar formulario cuando se abren los datos Y el usuario
  useEffect(() => {
    if (user && isDataLoaded) {
      console.log('📝 Populating form with user data after data loaded')
      
      // Resetear el formulario con todos los valores del usuario
      const formData: EditUserFormData = {
        email: user.email || '',
        password: '', // Siempre vacío para edición
        nombre: user.nombre || '',
        apellidos: user.apellidos || '',
        grupoAsignado: user.grupoAsignado || '',  // ✅ CRÍTICO: Pre-seleccionar grupo
        empresaAsignada: user.empresaAsignada || '', // ✅ CRÍTICO: Pre-seleccionar empresa
        role: user.role || 'EMPRESA',
        accessType: user.accessType || 'empresa',
        accessId: user.accessId || '',
        canViewContratos: user.canViewContratos ?? true,
        canViewFormaciones: user.canViewFormaciones ?? true,
        canViewFacturas: user.canViewFacturas ?? true,
        active: user.active ?? true,
      }

      console.log('📝 Setting form data:', formData)
      console.log('📊 Available grupos:', grupos.map(g => g.nombre))
      console.log('📊 Available empresas:', empresas.map(e => e.nombreCliente))

      // ✅ NUEVO: Usar reset() en lugar de setValue() individual
      form.reset(formData)

      // Si hay grupo asignado, filtrar empresas
      if (user.grupoAsignado) {
        console.log('🔍 Filtering empresas for grupo:', user.grupoAsignado)
        const empresasFiltradas = empresas.filter(empresa => empresa.grupo.nombre === user.grupoAsignado)
        setEmpresasFiltradas(empresasFiltradas)
        console.log('📊 Filtered empresas:', empresasFiltradas.map(e => e.nombreCliente))
      }
    }
  }, [user, isDataLoaded, form, empresas]) // ✅ NUEVO: Incluir todas las dependencias

  // Manejar cambio de grupo
  const handleGrupoChange = (grupoNombre: string) => {
    console.log('🔄 Grupo changed to:', grupoNombre)
    form.setValue('grupoAsignado', grupoNombre)
    
    // Limpiar empresa seleccionada cuando cambia el grupo
    form.setValue('empresaAsignada', '')
    
    // Filtrar empresas por grupo seleccionado
    const empresasFiltradas = empresas.filter(empresa => empresa.grupo.nombre === grupoNombre)
    setEmpresasFiltradas(empresasFiltradas)
    console.log('📊 Empresas filtradas para grupo', grupoNombre, ':', empresasFiltradas.map(e => e.nombreCliente))

    // Actualizar accessType y accessId basado en el rol
    const role = form.getValues('role')
    if (role === 'GRUPO') {
      form.setValue('accessType', 'grupo')
      const grupo = grupos.find(g => g.nombre === grupoNombre)
      if (grupo) {
        form.setValue('accessId', grupo.idGrupo)
      }
    }
  }

  // Manejar cambio de empresa
  const handleEmpresaChange = (empresaNombre: string) => {
    console.log('🔄 Empresa changed to:', empresaNombre)
    form.setValue('empresaAsignada', empresaNombre)

    // Actualizar accessType y accessId basado en el rol
    const role = form.getValues('role')
    if (role === 'EMPRESA') {
      form.setValue('accessType', 'empresa')
      const empresa = empresas.find(e => e.nombreCliente === empresaNombre)
      if (empresa) {
        form.setValue('accessId', empresa.idSage)
      }
    }
  }

  // Manejar cambio de rol
  const handleRoleChange = (newRole: 'ADMIN' | 'GRUPO' | 'EMPRESA' | 'DISPOSITIVO') => {
    console.log('🔄 Role changed to:', newRole)
    form.setValue('role', newRole)

    // Actualizar accessType y accessId basado en el nuevo rol
    const grupoAsignado = form.getValues('grupoAsignado')
    const empresaAsignada = form.getValues('empresaAsignada')

    switch (newRole) {
      case 'ADMIN':
        form.setValue('accessType', 'admin')
        form.setValue('accessId', 'all')
        break
      case 'GRUPO':
        form.setValue('accessType', 'grupo')
        if (grupoAsignado) {
          const grupo = grupos.find(g => g.nombre === grupoAsignado)
          if (grupo) {
            form.setValue('accessId', grupo.idGrupo)
          }
        }
        break
      case 'EMPRESA':
        form.setValue('accessType', 'empresa')
        if (empresaAsignada) {
          const empresa = empresas.find(e => e.nombreCliente === empresaAsignada)
          if (empresa) {
            form.setValue('accessId', empresa.idSage)
          }
        }
        break
      case 'DISPOSITIVO':
        form.setValue('accessType', 'dispositivo')
        // Para dispositivo, necesitaríamos un selector adicional
        break
    }
  }

  const onSubmit = async (data: EditUserFormData) => {
    if (!user) return

    try {
      setIsLoading(true)
      console.log('💾 Submitting user update:', { userId: user.id, data })

      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error actualizando usuario')
      }

      const result = await response.json()
      console.log('✅ User updated successfully:', result)

      toast.success('Usuario actualizado exitosamente')
      onUserUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error('❌ Error updating user:', error)
      toast.error(error instanceof Error ? error.message : 'Error actualizando usuario')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    form.reset()
    setIsDataLoaded(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Modifica los datos del usuario seleccionado
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Datos básicos */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del usuario" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apellidos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellidos *</FormLabel>
                    <FormControl>
                      <Input placeholder="Apellidos del usuario" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="usuario@empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contraseña */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva Contraseña</FormLabel>
                  <FormDescription>
                    Deja vacío para mantener la contraseña actual
                  </FormDescription>
                  <div className="flex space-x-2">
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Nueva contraseña (opcional)"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={generateSecurePassword}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Generar
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Asignación de Grupo y Empresa */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="grupoAsignado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Grupo Asignado *
                      {user?.grupoAsignado && (
                        <span className="text-xs text-gray-500">
                          (Actual: {user.grupoAsignado})
                        </span>
                      )}
                    </FormLabel>
                    <Select 
                      onValueChange={handleGrupoChange} 
                      value={field.value || ''} // ✅ CRÍTICO: Usar field.value
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona grupo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {grupos.map((grupo) => (
                          <SelectItem key={grupo.id} value={grupo.nombre}>
                            {grupo.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="empresaAsignada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Empresa Asignada
                      {user?.empresaAsignada && (
                        <span className="text-xs text-gray-500">
                          (Actual: {user.empresaAsignada})
                        </span>
                      )}
                    </FormLabel>
                    <Select 
                      onValueChange={handleEmpresaChange} 
                      value={field.value || ''} // ✅ CRÍTICO: Usar field.value
                      disabled={!form.getValues('grupoAsignado')}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Primero selecciona grupo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {empresasFiltradas.map((empresa) => (
                          <SelectItem key={empresa.id} value={empresa.nombreCliente}>
                            {empresa.nombreCliente}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Rol y Acceso */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol del Usuario *</FormLabel>
                    <Select onValueChange={handleRoleChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ADMIN">Administrador</SelectItem>
                        <SelectItem value="GRUPO">Acceso por Grupo</SelectItem>
                        <SelectItem value="EMPRESA">Acceso por Empresa</SelectItem>
                        <SelectItem value="DISPOSITIVO">Acceso por Dispositivo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Acceso</FormLabel>
                    <FormControl>
                      <Input placeholder="Tipo de acceso" {...field} readOnly />
                    </FormControl>
                    <FormDescription>
                      Se actualiza automáticamente según el rol
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accessId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID de Acceso</FormLabel>
                    <FormControl>
                      <Input placeholder="ID de acceso" {...field} readOnly />
                    </FormControl>
                    <FormDescription>
                      Se actualiza automáticamente según la asignación
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Permisos */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Permisos de Acceso</h4>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="canViewContratos"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Ver Contratos</FormLabel>
                        <FormDescription>
                          Permite acceso a la sección de contratos
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="canViewFormaciones"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Ver Formaciones</FormLabel>
                        <FormDescription>
                          Permite acceso a la sección de formaciones
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="canViewFacturas"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Ver Facturas</FormLabel>
                        <FormDescription>
                          Permite acceso a la sección de facturas
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Estado del usuario */}
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Usuario Activo</FormLabel>
                    <FormDescription>
                      Desmarcar para desactivar el acceso del usuario
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}