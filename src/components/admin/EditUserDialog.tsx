// src/components/admin/EditUserDialog.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Edit, Eye, EyeOff, RefreshCw, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
}

interface Grupo {
  id: string
  idGrupo: string
  nombre: string
}

interface Empresa {
  id: string
  idSage: string
  nombreCliente: string
  grupo?: {
    nombre: string
  }
}

interface Dispositivo {
  id: string
  numeroSerie: string
  espacio: string
  grupoCliente: string
  nombreCliente: string
}

interface EditUserDialogProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserUpdated: () => void
}

export default function EditUserDialog({ user, open, onOpenChange, onUserUpdated }: EditUserDialogProps) {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [changePassword, setChangePassword] = useState(false)
  
  // Datos del formulario
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellidos: '',
    grupoAsignado: '',
    empresaAsignada: '',
    tipoAcceso: '',
    associatedId: '',
    canViewContratos: true,
    canViewFormaciones: true,
    canViewFacturas: true,
    active: true
  })

  // Estado original para detectar cambios
  const [originalData, setOriginalData] = useState<typeof formData | null>(null)

  // Datos para los selectores
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [empresasFiltradas, setEmpresasFiltradas] = useState<Empresa[]>([])
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
  const [dispositivosFiltrados, setDispositivosFiltrados] = useState<Dispositivo[]>([])
  const [loadingData, setLoadingData] = useState(false)

  // Efecto para cargar datos cuando se abre el modal
  useEffect(() => {
    if (open && user) {
      console.log('🔍 Opening edit modal for user:', {
        email: user.email,
        grupoAsignado: user.grupoAsignado,
        empresaAsignada: user.empresaAsignada,
        accessType: user.accessType,
        accessId: user.accessId
      })
      
      // Primero cargar las opciones de los selectores
      loadSelectData().then(() => {
        // Después pre-poblar el formulario con los datos del usuario
        const userData = {
          email: user.email,
          password: '',
          nombre: user.nombre || '',
          apellidos: user.apellidos || '',
          grupoAsignado: user.grupoAsignado || '',
          empresaAsignada: user.empresaAsignada || '',
          tipoAcceso: user.accessType.toLowerCase(),
          associatedId: user.accessId,
          canViewContratos: user.canViewContratos,
          canViewFormaciones: user.canViewFormaciones,
          canViewFacturas: user.canViewFacturas,
          active: user.active
        }
        
        console.log('📝 Setting form data after loading options:', userData)
        setFormData(userData)
        setOriginalData(userData) // Guardar estado original
      })
      
      setChangePassword(false)
    }
  }, [open, user])

  // Efecto adicional para sincronizar los selectores después de que se carguen los datos
  useEffect(() => {
    if (grupos.length > 0 && user && user.grupoAsignado && !formData.grupoAsignado) {
      console.log('🔄 Syncing grupo selector with user data')
      setFormData(prev => ({
        ...prev,
        grupoAsignado: user.grupoAsignado || ''
      }))
    }
  }, [grupos, user])

  useEffect(() => {
    if (empresas.length > 0 && user && user.empresaAsignada && !formData.empresaAsignada) {
      console.log('🔄 Syncing empresa selector with user data')
      setFormData(prev => ({
        ...prev,
        empresaAsignada: user.empresaAsignada || ''
      }))
    }
  }, [empresas, user])

  // Filtrar empresas cuando cambia el grupo asignado
  useEffect(() => {
    if (formData.grupoAsignado) {
      const empresasDelGrupo = empresas.filter(empresa =>
        empresa.grupo?.nombre === formData.grupoAsignado
      )
      setEmpresasFiltradas(empresasDelGrupo)
      
      // Si la empresa seleccionada no pertenece al nuevo grupo, limpiarla
      if (formData.empresaAsignada && !empresasDelGrupo.find(e => e.nombreCliente === formData.empresaAsignada)) {
        setFormData(prev => ({ ...prev, empresaAsignada: '' }))
      }
    } else {
      setEmpresasFiltradas(empresas)
    }
  }, [formData.grupoAsignado, empresas])

  // Filtrar dispositivos cuando cambia el grupo asignado
  useEffect(() => {
    if (formData.tipoAcceso === 'dispositivo' && formData.grupoAsignado) {
      const dispositivosDelGrupo = dispositivos.filter(dispositivo => 
        dispositivo.grupoCliente === formData.grupoAsignado
      )
      setDispositivosFiltrados(dispositivosDelGrupo)
      
      if (formData.associatedId && !dispositivosDelGrupo.find(d => d.numeroSerie === formData.associatedId)) {
        setFormData(prev => ({ ...prev, associatedId: '' }))
      }
    } else {
      setDispositivosFiltrados(dispositivos)
    }
  }, [formData.grupoAsignado, formData.tipoAcceso, dispositivos])

  const loadSelectData = async () => {
    setLoadingData(true)
    try {
      console.log('🔄 Loading select data for EditUserDialog...')
      
      // Cargar grupos
      const gruposRes = await fetch('/api/admin/grupos')
      if (gruposRes.ok) {
        const gruposData = await gruposRes.json()
        console.log('✅ Grupos loaded:', gruposData.length, gruposData.map(g => g.nombre))
        setGrupos(gruposData)
      } else {
        console.error('❌ Error loading grupos:', gruposRes.status, gruposRes.statusText)
      }

      // Cargar empresas
      const empresasRes = await fetch('/api/admin/empresas')
      if (empresasRes.ok) {
        const empresasData = await empresasRes.json()
        console.log('✅ Empresas loaded:', empresasData.length, empresasData.map(e => e.nombreCliente))
        setEmpresas(empresasData)
        setEmpresasFiltradas(empresasData)
      } else {
        console.error('❌ Error loading empresas:', empresasRes.status, empresasRes.statusText)
      }

      // Cargar dispositivos
      const dispositivosRes = await fetch('/api/admin/dispositivos')
      if (dispositivosRes.ok) {
        const dispositivosData = await dispositivosRes.json()
        console.log('✅ Dispositivos loaded:', dispositivosData.length)
        setDispositivos(dispositivosData)
        setDispositivosFiltrados(dispositivosData)
      } else {
        console.error('❌ Error loading dispositivos:', dispositivosRes.status, dispositivosRes.statusText)
      }
      
      console.log('✅ All select data loaded successfully')
      
    } catch (error) {
      console.error('❌ Error loading select data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*'
    let password = ''
    
    // Asegurar al menos un carácter de cada tipo
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
    password += '0123456789'[Math.floor(Math.random() * 10)]
    password += '!@#$%&*'[Math.floor(Math.random() * 7)]
    
    // Completar hasta 12 caracteres
    for (let i = 4; i < 12; i++) {
      password += chars[Math.floor(Math.random() * chars.length)]
    }
    
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword()
    setFormData(prev => ({ ...prev, password: newPassword }))
    setShowPassword(true)
  }

  // Detectar cambios en el formulario
  const hasChanges = () => {
    if (!originalData) return false
    
    return Object.keys(formData).some(key => {
      if (key === 'password') return changePassword && formData.password.length > 0
      return formData[key as keyof typeof formData] !== originalData[key as keyof typeof originalData]
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !hasChanges()) {
      onOpenChange(false)
      return
    }

    setLoading(true)

    try {
      // Determinar role basado en tipoAcceso
      let role = 'EMPRESA' // default
      if (formData.tipoAcceso === 'grupo') role = 'GRUPO'
      else if (formData.tipoAcceso === 'empresa') role = 'EMPRESA'
      else if (formData.tipoAcceso === 'dispositivo') role = 'DISPOSITIVO'

      const updateData: any = {
        email: formData.email,
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        grupoAsignado: formData.grupoAsignado,
        empresaAsignada: formData.empresaAsignada,
        role: role,
        accessType: formData.tipoAcceso,
        accessId: formData.associatedId,
        canViewContratos: formData.canViewContratos,
        canViewFormaciones: formData.canViewFormaciones,
        canViewFacturas: formData.canViewFacturas,
        active: formData.active
      }

      // Solo incluir contraseña si se está cambiando
      if (changePassword && formData.password) {
        updateData.password = formData.password
      }

      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        console.log('✅ Usuario actualizado:', updatedUser)
        
        onOpenChange(false)
        onUserUpdated()
        
        // Mostrar mensaje de éxito
        let message = '¡Usuario actualizado exitosamente!'
        if (changePassword && formData.password) {
          message += `\n\n🔑 Nueva contraseña: ${formData.password}\n\n⚠️ Guarda esta contraseña, no se volverá a mostrar.`
        }
        alert(message)
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error al actualizar usuario')
    } finally {
      setLoading(false)
    }
  }

  const getAssociatedOptions = () => {
    switch (formData.tipoAcceso) {
      case 'grupo':
        return grupos.map(grupo => ({
          value: grupo.nombre,
          label: grupo.nombre
        }))
      case 'empresa':
        return empresas.map(empresa => ({
          value: empresa.nombreCliente,
          label: empresa.nombreCliente
        }))
      case 'dispositivo':
        const dispositivosAUsar = formData.grupoAsignado ? dispositivosFiltrados : dispositivos
        return dispositivosAUsar.map(dispositivo => ({
          value: dispositivo.numeroSerie,
          label: `${dispositivo.numeroSerie} - ${dispositivo.espacio}`
        }))
      default:
        return []
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit className="w-5 h-5" />
            <span>Editar Usuario</span>
          </DialogTitle>
          <DialogDescription>
            Modifica la información del usuario. Solo se guardarán los campos que cambies.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del usuario */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Usuario Actual</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">ID:</span> {user.id}
              </div>
              <div>
                <span className="text-blue-700">Creado:</span> {new Date(user.createdAt).toLocaleDateString()}
              </div>
              <div>
                <span className="text-blue-700">Actualizado:</span> {new Date(user.updatedAt).toLocaleDateString()}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-700">Estado:</span>
                <Badge variant={user.active ? "default" : "destructive"}>
                  {user.active ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Datos personales */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Datos Personales</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  autoComplete="off"
                  required
                />
              </div>
              <div>
                <Label htmlFor="apellidos">Apellidos *</Label>
                <Input
                  id="apellidos"
                  value={formData.apellidos}
                  onChange={(e) => setFormData(prev => ({ ...prev, apellidos: e.target.value }))}
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                autoComplete="off"
                required
              />
            </div>

            {/* Cambio de contraseña */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="changePassword"
                  checked={changePassword}
                  onChange={(e) => setChangePassword(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="changePassword" className="text-sm">
                  Cambiar contraseña
                </Label>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>

              {changePassword && (
                <div>
                  <Label htmlFor="password">Nueva Contraseña *</Label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        autoComplete="new-password"
                        required={changePassword}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGeneratePassword}
                      className="flex items-center space-x-1"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Generar</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Grupo y Empresa Asignados */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="grupoAsignado">Grupo Asignado *</Label>
                {loadingData ? (
                  <div className="h-10 bg-gray-100 rounded-md flex items-center justify-center">
                    <span className="text-sm text-gray-500">Cargando...</span>
                  </div>
                ) : (
                  <Select 
                    value={formData.grupoAsignado} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, grupoAsignado: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      {grupos.map((grupo) => (
                        <SelectItem key={grupo.id} value={grupo.nombre}>
                          {grupo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                <Label htmlFor="empresaAsignada">Empresa Asignada</Label>
                {loadingData ? (
                  <div className="h-10 bg-gray-100 rounded-md flex items-center justify-center">
                    <span className="text-sm text-gray-500">Cargando...</span>
                  </div>
                ) : (
                  <Select 
                    value={formData.empresaAsignada} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, empresaAsignada: value }))}
                    disabled={!formData.grupoAsignado}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.grupoAsignado ? "Selecciona empresa" : "Primero selecciona grupo"} />
                    </SelectTrigger>
                    <SelectContent>
                      {empresasFiltradas.map((empresa) => (
                        <SelectItem key={empresa.id} value={empresa.nombreCliente}>
                          {empresa.nombreCliente}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          {/* Tipo de acceso */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Nivel de Acceso</h3>
            
            <div>
              <Label htmlFor="tipoAcceso">Nivel de Acceso *</Label>
              <Select 
                value={formData.tipoAcceso} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, tipoAcceso: value, associatedId: '' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de acceso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grupo">🏢 Grupo - Ver todos los datos del grupo</SelectItem>
                  <SelectItem value="empresa">🏪 Empresa - Ver solo datos de la empresa</SelectItem>
                  <SelectItem value="dispositivo">📱 Dispositivo - Ver solo un dispositivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.tipoAcceso && (
              <div>
                <Label htmlFor="associatedId">
                  {formData.tipoAcceso === 'grupo' && 'Grupo de Acceso *'}
                  {formData.tipoAcceso === 'empresa' && 'Empresa de Acceso *'}
                  {formData.tipoAcceso === 'dispositivo' && 'Dispositivo de Acceso *'}
                </Label>
                {loadingData ? (
                  <div className="h-10 bg-gray-100 rounded-md flex items-center justify-center">
                    <span className="text-sm text-gray-500">Cargando opciones...</span>
                  </div>
                ) : (
                  <Select 
                    value={formData.associatedId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, associatedId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Selecciona ${formData.tipoAcceso}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {getAssociatedOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </div>

          {/* Permisos granulares */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Permisos y Estado</h3>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.canViewContratos}
                  onChange={(e) => setFormData(prev => ({ ...prev, canViewContratos: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Contratos</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.canViewFormaciones}
                  onChange={(e) => setFormData(prev => ({ ...prev, canViewFormaciones: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Formaciones</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.canViewFacturas}
                  onChange={(e) => setFormData(prev => ({ ...prev, canViewFacturas: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Facturas</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium">Usuario Activo</span>
                <Badge variant={formData.active ? "default" : "destructive"}>
                  {formData.active ? "Activo" : "Inactivo"}
                </Badge>
              </label>
            </div>
          </div>

          {/* Indicador de cambios */}
          {hasChanges() && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-800 font-medium">
                  Hay cambios pendientes de guardar
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !hasChanges()}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}