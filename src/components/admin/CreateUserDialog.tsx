// src/components/admin/CreateUserDialog.tsx
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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserPlus, Eye, EyeOff, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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

interface CreateUserDialogProps {
  onUserCreated: () => void
}

export default function CreateUserDialog({ onUserCreated }: CreateUserDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // Datos del formulario
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellidos: '',
    grupoAsignado: '', // NUEVO: Grupo del usuario (independiente del acceso)
    empresaAsignada: '', // NUEVO: Empresa del usuario (independiente del acceso)
    tipoAcceso: '',
    associatedId: '',
    canViewContratos: true,
    canViewFormaciones: true,
    canViewFacturas: true,
  })

  // Datos para los selectores
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [empresasFiltradas, setEmpresasFiltradas] = useState<Empresa[]>([])
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
  const [dispositivosFiltrados, setDispositivosFiltrados] = useState<Dispositivo[]>([])
  const [loadingData, setLoadingData] = useState(false)

  // Cargar datos para los selectores
  useEffect(() => {
    if (open) {
      loadSelectData()
    }
  }, [open])

  // Filtrar empresas cuando cambia el grupo asignado
  useEffect(() => {
    if (formData.grupoAsignado) {
      const empresasDePasteGrupo = empresas.filter(empresa => 
        empresa.grupo?.nombre === formData.grupoAsignado
      )
      setEmpresasFiltradas(empresasDePasteGrupo)
      
      // Si la empresa seleccionada no pertenece al nuevo grupo, limpiarla
      if (formData.empresaAsignada && !empresasDePasteGrupo.find(e => e.nombreCliente === formData.empresaAsignada)) {
        setFormData(prev => ({ ...prev, empresaAsignada: '' }))
      }
    } else {
      setEmpresasFiltradas(empresas)
    }
  }, [formData.grupoAsignado, empresas])

  // Filtrar dispositivos cuando cambia el grupo asignado (para tipo de acceso dispositivo)
  useEffect(() => {
    if (formData.tipoAcceso === 'dispositivo' && formData.grupoAsignado) {
      const dispositivosDelGrupo = dispositivos.filter(dispositivo => 
        dispositivo.grupoCliente === formData.grupoAsignado
      )
      setDispositivosFiltrados(dispositivosDelGrupo)
      
      // Si el dispositivo seleccionado no pertenece al nuevo grupo, limpiarlo
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
      // Cargar grupos
      const gruposRes = await fetch('/api/admin/grupos')
      if (gruposRes.ok) {
        const gruposData = await gruposRes.json()
        setGrupos(gruposData)
      }

      // Cargar empresas
      const empresasRes = await fetch('/api/admin/empresas')
      if (empresasRes.ok) {
        const empresasData = await empresasRes.json()
        setEmpresas(empresasData)
        setEmpresasFiltradas(empresasData)
      }

      // Cargar dispositivos
      const dispositivosRes = await fetch('/api/admin/dispositivos')
      if (dispositivosRes.ok) {
        const dispositivosData = await dispositivosRes.json()
        setDispositivos(dispositivosData)
        setDispositivosFiltrados(dispositivosData)
      }
    } catch (error) {
      console.error('Error loading select data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*'
    let password = ''
    
    // Asegurar al menos un carácter de cada tipo
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)] // Mayúscula
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)] // Minúscula
    password += '0123456789'[Math.floor(Math.random() * 10)] // Número
    password += '!@#$%&*'[Math.floor(Math.random() * 7)] // Símbolo
    
    // Completar hasta 12 caracteres
    for (let i = 4; i < 12; i++) {
      password += chars[Math.floor(Math.random() * chars.length)]
    }
    
    // Mezclar los caracteres
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword()
    setFormData(prev => ({ ...prev, password: newPassword }))
    setShowPassword(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Determinar role basado en tipoAcceso
      let role = 'EMPRESA' // default
      if (formData.tipoAcceso === 'grupo') role = 'GRUPO'
      else if (formData.tipoAcceso === 'empresa') role = 'EMPRESA'
      else if (formData.tipoAcceso === 'dispositivo') role = 'DISPOSITIVO'

      const userData = {
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        grupoAsignado: formData.grupoAsignado, // NUEVO
        empresaAsignada: formData.empresaAsignada, // NUEVO
        role: role,
        accessType: formData.tipoAcceso,
        accessId: formData.associatedId,
        canViewContratos: formData.canViewContratos,
        canViewFormaciones: formData.canViewFormaciones,
        canViewFacturas: formData.canViewFacturas,
      }

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        const newUser = await response.json()
        console.log('✅ Usuario creado:', newUser)
        
        // Resetear formulario
        setFormData({
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
        })
        
        setOpen(false)
        onUserCreated()
        
        // Mostrar mensaje de éxito (podrías usar un toast aquí)
        alert(`Usuario creado exitosamente!\n\nEmail: ${userData.email}\nContraseña: ${userData.password}\n\n⚠️ Guarda esta contraseña, no se volverá a mostrar.`)
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Error al crear usuario')
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
        // Usar dispositivos filtrados si hay grupo asignado
        const dispositivosAUsar = formData.grupoAsignado ? dispositivosFiltrados : dispositivos
        return dispositivosAUsar.map(dispositivo => ({
          value: dispositivo.numeroSerie,
          label: `${dispositivo.numeroSerie} - ${dispositivo.espacio}`
        }))
      default:
        return []
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2">
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Usuario</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          <DialogDescription>
            Completa la información para crear un nuevo usuario del sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                data-lpignore="true"
                data-form-type="other"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Contraseña *</Label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-form-type="other"
                    required
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

            {/* NUEVOS CAMPOS: Grupo y Empresa Asignados */}
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
            <p className="text-sm text-gray-600">Define qué información puede ver este usuario (independiente de su grupo/empresa asignada)</p>
            
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
                {formData.tipoAcceso === 'dispositivo' && formData.grupoAsignado && (
                  <p className="text-xs text-blue-600 mb-2">
                    📍 Mostrando solo dispositivos del grupo: {formData.grupoAsignado}
                  </p>
                )}
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
            <h3 className="text-sm font-medium text-gray-900">Permisos de Información</h3>
            <p className="text-sm text-gray-600">Selecciona qué tipo de información puede ver este usuario</p>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.canViewContratos}
                  onChange={(e) => setFormData(prev => ({ ...prev, canViewContratos: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Contratos</span>
                <Badge variant="outline" className="text-xs">Contratos activos y histórico</Badge>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.canViewFormaciones}
                  onChange={(e) => setFormData(prev => ({ ...prev, canViewFormaciones: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Formaciones</span>
                <Badge variant="outline" className="text-xs">Cursos realizados y certificados</Badge>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.canViewFacturas}
                  onChange={(e) => setFormData(prev => ({ ...prev, canViewFacturas: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Facturas</span>
                <Badge variant="outline" className="text-xs">Histórico de facturación</Badge>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}