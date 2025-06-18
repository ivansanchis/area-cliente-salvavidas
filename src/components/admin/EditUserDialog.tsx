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
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, RefreshCw, Save, X } from 'lucide-react'
import { toast } from 'sonner'

const editUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().optional(),
  nombre: z.string().min(1, 'Nombre requerido'),
  apellidos: z.string().min(1, 'Apellidos requeridos'),
  grupoAsignado: z.string().optional(),
  empresaAsignada: z.string().optional(),
  tipoAcceso: z.enum(['grupo', 'empresa', 'dispositivo']),
  associatedId: z.string().min(1, 'ID de acceso requerido'),
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

interface Dispositivo {
  id: string
  numeroSerie: string
  espacio: string
  provincia: string
  situacion: string
  nombreCliente: string
  grupoCliente: string
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
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [isFormReady, setIsFormReady] = useState(false)

  const form = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      email: '',
      password: '',
      nombre: '',
      apellidos: '',
      grupoAsignado: '',
      empresaAsignada: '',
      tipoAcceso: 'empresa',
      associatedId: '',
      canViewContratos: true,
      canViewFormaciones: true,
      canViewFacturas: true,
      active: true,
    },
  })

  // Función para generar contraseña segura
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

  console.log('🔍 EditUserDialog render - User:', user?.email, 'Open:', open)

  // ✅ LIMPIAR estado cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      console.log('🧹 Modal closed - Cleaning state')
      setIsDataLoaded(false)
      setIsFormReady(false)
      setGrupos([])
      setEmpresas([])
      setDispositivos([])
      form.reset({
        email: '',
        password: '',
        nombre: '',
        apellidos: '',
        grupoAsignado: '',
        empresaAsignada: '',
        tipoAcceso: 'empresa',
        associatedId: '',
        canViewContratos: true,
        canViewFormaciones: true,
        canViewFacturas: true,
        active: true,
      })
    }
  }, [open, form])

  // ✅ Cargar datos cuando se abre el modal
  useEffect(() => {
    if (open && !isDataLoaded) {
      console.log('🔄 Modal opened - Loading select data...')
      loadSelectData()
    }
  }, [open, isDataLoaded])

  const loadSelectData = async () => {
    try {
      console.log('📡 Fetching select data...')
      setIsDataLoaded(false)
      setIsFormReady(false)
      
      // Cargar datos en paralelo
      const [gruposResponse, empresasResponse, dispositivosResponse] = await Promise.all([
        fetch('/api/admin/grupos'),
        fetch('/api/admin/empresas'),
        fetch('/api/admin/dispositivos')
      ])

      if (!gruposResponse.ok || !empresasResponse.ok || !dispositivosResponse.ok) {
        throw new Error('Error loading data from APIs')
      }

      const [gruposData, empresasData, dispositivosData] = await Promise.all([
        gruposResponse.json(),
        empresasResponse.json(),
        dispositivosResponse.json()
      ])

      console.log('✅ Data loaded:', {
        grupos: gruposData.length,
        empresas: empresasData.length,
        dispositivos: dispositivosData.length
      })

      setGrupos(gruposData)
      setEmpresas(empresasData)
      setDispositivos(dispositivosData)
      setIsDataLoaded(true)

    } catch (error) {
      console.error('❌ Error loading select data:', error)
      toast.error('Error cargando datos para los selectores')
    }
  }

  // ✅ POBLAR FORMULARIO - Solo cuando TODO esté listo
  useEffect(() => {
    if (user && isDataLoaded && grupos.length > 0 && empresas.length > 0 && !isFormReady) {
      console.log('📝 All data ready - Populating form with user data')
      console.log('👤 User data to populate:', {
        grupoAsignado: user.grupoAsignado,
        empresaAsignada: user.empresaAsignada,
        accessType: user.accessType,
        accessId: user.accessId,
        role: user.role
      })
      
      // Mapear role a tipoAcceso
      let tipoAcceso: 'grupo' | 'empresa' | 'dispositivo' = 'empresa'
      switch (user.role) {
        case 'GRUPO':
          tipoAcceso = 'grupo'
          break
        case 'EMPRESA':
          tipoAcceso = 'empresa'
          break
        case 'DISPOSITIVO':
          tipoAcceso = 'dispositivo'
          break
        default:
          tipoAcceso = 'empresa'
      }

      const formData: EditUserFormData = {
        email: user.email || '',
        password: '',
        nombre: user.nombre || '',
        apellidos: user.apellidos || '',
        grupoAsignado: user.grupoAsignado || '',
        empresaAsignada: user.empresaAsignada || '',
        tipoAcceso: tipoAcceso,
        associatedId: user.accessId || '',
        canViewContratos: user.canViewContratos ?? true,
        canViewFormaciones: user.canViewFormaciones ?? true,
        canViewFacturas: user.canViewFacturas ?? true,
        active: user.active ?? true,
      }

      console.log('📝 Populating form with data:', formData)
      
      // ✅ USAR requestAnimationFrame para asegurar que React haya terminado completamente
      requestAnimationFrame(() => {
        form.reset(formData)
        setIsFormReady(true)
        console.log('✅ Form populated and ready')
      })
    }
  }, [user, isDataLoaded, grupos, empresas, isFormReady, form])

  // Obtener opciones para el selector de acceso según el tipo
  const getAssociatedOptions = () => {
    const tipoAcceso = form.watch('tipoAcceso')
    
    switch (tipoAcceso) {
      case 'grupo':
        return grupos.map(grupo => ({
          value: grupo.idGrupo,
          label: grupo.nombre
        }))
      case 'empresa':
        return empresas.map(empresa => ({
          value: empresa.idSage,
          label: empresa.nombreCliente
        }))
      case 'dispositivo':
        return dispositivos.map(dispositivo => ({
          value: dispositivo.numeroSerie,
          label: `${dispositivo.numeroSerie} - ${dispositivo.espacio}`
        }))
      default:
        return []
    }
  }

  // ✅ OBTENER empresas filtradas por grupo - Función mejorada
  const getEmpresasFiltradas = () => {
    const grupoSeleccionado = form.watch('grupoAsignado')
    if (!grupoSeleccionado) {
      console.log('🔍 No group selected, returning empty array')
      return []
    }
    
    const filtered = empresas.filter(empresa => empresa.grupo.nombre === grupoSeleccionado)
    console.log(`🔍 Filtering empresas by group "${grupoSeleccionado}":`, filtered.length, 'found')
    return filtered
  }

  // Manejar cambio de tipo de acceso
  const handleTipoAccesoChange = (newTipoAcceso: 'grupo' | 'empresa' | 'dispositivo') => {
    console.log('🔄 Tipo acceso changed to:', newTipoAcceso)
    form.setValue('tipoAcceso', newTipoAcceso)
    form.setValue('associatedId', '') // Limpiar la selección anterior
  }

  // ✅ Manejar cambio de grupo - Limpiar empresa cuando cambia
  const handleGrupoChange = (newGrupo: string) => {
    console.log('🔄 Grupo changed to:', newGrupo)
    form.setValue('grupoAsignado', newGrupo)
    form.setValue('empresaAsignada', '') // Limpiar empresa cuando cambia el grupo
  }

  const onSubmit = async (data: EditUserFormData) => {
    if (!user) return

    try {
      setIsLoading(true)
      console.log('💾 Submitting user update:', { userId: user.id, data })

      // Mapear tipoAcceso de vuelta a role para compatibilidad con la API
      let role: 'ADMIN' | 'GRUPO' | 'EMPRESA' | 'DISPOSITIVO' = 'EMPRESA'
      switch (data.tipoAcceso) {
        case 'grupo':
          role = 'GRUPO'
          break
        case 'empresa':
          role = 'EMPRESA'
          break
        case 'dispositivo':
          role = 'DISPOSITIVO'
          break
      }

      const updateData = {
        email: data.email,
        password: data.password,
        nombre: data.nombre,
        apellidos: data.apellidos,
        grupoAsignado: data.grupoAsignado,
        empresaAsignada: data.empresaAsignada,
        role: role,
        accessType: data.tipoAcceso,
        accessId: data.associatedId,
        canViewContratos: data.canViewContratos,
        canViewFormaciones: data.canViewFormaciones,
        canViewFacturas: data.canViewFacturas,
        active: data.active,
      }

      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
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
    setIsFormReady(false)
    setGrupos([])
    setEmpresas([])
    setDispositivos([])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Modifica los datos del usuario seleccionado
          </DialogDescription>
        </DialogHeader>

        {/* ✅ Mostrar loading state mientras se cargan los datos */}
        {!isDataLoaded && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Cargando datos del formulario...</span>
            </div>
          </div>
        )}

        {/* ✅ Solo mostrar formulario cuando TODO esté listo */}
        {isDataLoaded && (
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
                      <Input 
                        type="email" 
                        placeholder="usuario@empresa.com" 
                        autoComplete="off"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ✅ CONTRASEÑA - Ancho completo */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva Contraseña</FormLabel>
                    <FormDescription>
                      Deja vacío para mantener la contraseña actual
                    </FormDescription>
                    <div className="flex gap-2">
                      <FormControl>
                        <div className="relative flex-1">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Nueva contraseña (opcional)"
                            autoComplete="new-password"
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
                        className="flex items-center gap-2 shrink-0"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Generar
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ✅ Asignación de Grupo y Empresa - MEJORADO */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="grupoAsignado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex flex-col gap-2">
                        Grupo Asignado *
                        {user?.grupoAsignado && (
                          <span className="text-xs text-gray-500">
                            (Actual: {user.grupoAsignado})
                          </span>
                        )}
                      </FormLabel>
                      <Select 
                        onValueChange={handleGrupoChange}
                        value={field.value || ''}
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
                      <FormLabel className="flex flex-col gap-2">
                        Empresa Asignada
                        {user?.empresaAsignada && (
                          <span className="text-xs text-gray-500">
                            (Actual: {user.empresaAsignada})
                          </span>
                        )}
                      </FormLabel>
                      <Select 
                        onValueChange={(value) => form.setValue('empresaAsignada', value)} 
                        value={field.value || ''}
                        disabled={!form.watch('grupoAsignado')}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Primero selecciona grupo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getEmpresasFiltradas().map((empresa) => (
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

              {/* Nivel de Acceso */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Nivel de Acceso</h3>
                
                <FormField
                  control={form.control}
                  name="tipoAcceso"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="tipoAcceso">Nivel de Acceso *</Label>
                      <Select 
                        value={field.value} 
                        onValueChange={handleTipoAccesoChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el tipo de acceso" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="grupo">🏢 Grupo - Ver todos los datos del grupo</SelectItem>
                          <SelectItem value="empresa">🏪 Empresa - Ver solo datos de la empresa</SelectItem>
                          <SelectItem value="dispositivo">📱 Dispositivo - Ver solo un dispositivo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch('tipoAcceso') && (
                  <FormField
                    control={form.control}
                    name="associatedId"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="associatedId">
                          {form.watch('tipoAcceso') === 'grupo' && 'Grupo de Acceso *'}
                          {form.watch('tipoAcceso') === 'empresa' && 'Empresa de Acceso *'}
                          {form.watch('tipoAcceso') === 'dispositivo' && 'Dispositivo de Acceso *'}
                          {user?.accessId && (
                            <span className="text-xs text-gray-500 ml-2">
                              (Actual: {user.accessId})
                            </span>
                          )}
                        </Label>
                        <Select 
                          value={field.value} 
                          onValueChange={(value) => form.setValue('associatedId', value)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={`Selecciona ${form.watch('tipoAcceso')}`} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getAssociatedOptions().map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Permisos de Acceso */}
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
                          <FormLabel>Contratos</FormLabel>
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
                          <FormLabel>Formaciones</FormLabel>
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
                          <FormLabel>Facturas</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* ✅ USUARIO ACTIVO - Switch con contenedor separado */}
              <div className="border-t pt-6">
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-y-0">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-medium">
                            Estado del Usuario
                          </FormLabel>
                          <FormDescription>
                            {field.value 
                              ? "El usuario tiene acceso activo al sistema" 
                              : "El usuario está desactivado y no puede acceder"
                            }
                          </FormDescription>
                        </div>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-medium ${field.value ? 'text-green-600' : 'text-red-600'}`}>
                              {field.value ? 'Activo' : 'Inactivo'}
                            </span>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className={`${
                                field.value 
                                  ? 'bg-green-600 focus-visible:ring-green-600' 
                                  : 'bg-red-600 focus-visible:ring-red-600'
                              }`}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

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
        )}
      </DialogContent>
    </Dialog>
  )
}