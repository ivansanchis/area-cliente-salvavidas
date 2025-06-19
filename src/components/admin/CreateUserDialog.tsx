// src/components/admin/CreateUserDialog.tsx - CON CARDS AGRUPADAS

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
import { Switch } from "@/components/ui/switch"
import { UserPlus, Eye, EyeOff, RefreshCw, CheckCircle, Copy } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Grupo {
  id: string
  idGrupo: string
  nombre: string
}

interface Empresa {
  id: string
  idSage: string
  nombreCliente: string
  idGrupo: string
  grupo?: {
    nombre: string
  }
}

interface Dispositivo {
  id: string
  numeroSerie: string
  nombreCliente: string
  grupoCliente: string
}

export default function CreateUserDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdUserData, setCreatedUserData] = useState<{ email: string, password: string } | null>(null)

  // Estados del formulario
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellidos: '',
    role: 'EMPRESA' as 'ADMIN' | 'GRUPO' | 'EMPRESA' | 'DISPOSITIVO',
    grupoId: '',
    empresaId: '',
    dispositivoId: '',
    canViewContratos: true,
    canViewFormaciones: true,
    canViewFacturas: true,
  })

  // Datos para los selectores
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
  const [filteredEmpresas, setFilteredEmpresas] = useState<Empresa[]>([])
  const [loadingData, setLoadingData] = useState(false)

  // Cargar datos para los selectores
  useEffect(() => {
    if (open) {
      loadSelectData()
    }
  }, [open])

  // ✅ EFECTO CORREGIDO para filtrar empresas cuando cambia el grupo
  useEffect(() => {
    console.log('🔍 Filtering empresas. grupoId:', formData.grupoId)
    console.log('🔍 Available grupos:', grupos.map(g => ({ id: g.id, nombre: g.nombre })))
    console.log('🔍 Available empresas:', empresas.map(e => ({
      id: e.id,
      nombre: e.nombreCliente,
      grupoNombre: e.grupo?.nombre
    })))

    if (formData.grupoId) {
      const grupoSeleccionado = grupos.find(g => g.id === formData.grupoId)
      console.log('🔍 Grupo seleccionado:', grupoSeleccionado)

      if (grupoSeleccionado) {
        // ✅ FILTRAR por el nombre del grupo (que viene en empresa.grupo.nombre)
        const empresasDelGrupo = empresas.filter(empresa =>
          empresa.grupo?.nombre === grupoSeleccionado.nombre
        )

        console.log('✅ Empresas filtradas:', empresasDelGrupo.map(e => e.nombreCliente))
        setFilteredEmpresas(empresasDelGrupo)

        // Si la empresa seleccionada no pertenece al nuevo grupo, limpiarla
        if (formData.empresaId && !empresasDelGrupo.find(e => e.id === formData.empresaId)) {
          console.log('🔄 Clearing empresaId because it does not belong to selected group')
          setFormData(prev => ({ ...prev, empresaId: '' }))
        }
      }
    } else {
      console.log('🔄 No group selected, showing all empresas')
      setFilteredEmpresas(empresas)
    }
  }, [formData.grupoId, grupos, empresas])

  const loadSelectData = async () => {
    setLoadingData(true)
    try {
      const [gruposRes, empresasRes, dispositivosRes] = await Promise.all([
        fetch('/api/admin/grupos'),
        fetch('/api/admin/empresas'),
        fetch('/api/admin/dispositivos')
      ])

      if (gruposRes.ok) {
        const gruposData = await gruposRes.json()
        console.log('✅ Loaded grupos:', gruposData.map((g: any) => g.nombre))
        setGrupos(gruposData)
      }

      if (empresasRes.ok) {
        const empresasData = await empresasRes.json()
        console.log('✅ Loaded empresas:', empresasData.map((e: any) => ({
          nombre: e.nombreCliente,
          grupo: e.grupo?.nombre
        })))
        setEmpresas(empresasData)
        setFilteredEmpresas(empresasData)
      }

      if (dispositivosRes.ok) {
        const dispositivosData = await dispositivosRes.json()
        console.log('✅ Loaded dispositivos:', dispositivosData.length)
        setDispositivos(dispositivosData)
      }
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

    // Mezclar los caracteres
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword()
    setFormData(prev => ({ ...prev, password: newPassword }))
    setShowPassword(true)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Si cambia el role, limpiar los campos de acceso
    if (field === 'role') {
      setFormData(prev => ({
        ...prev,
        grupoId: '',
        empresaId: '',
        dispositivoId: ''
      }))
    }

    // Si cambia el grupo, limpiar empresa
    if (field === 'grupoId') {
      setFormData(prev => ({
        ...prev,
        empresaId: ''
      }))
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Construir el payload basado en el role
      let accessType = ''
      let accessId = ''

      switch (formData.role) {
        case 'ADMIN':
          accessType = 'ADMIN'
          accessId = 'ADMIN'
          break
        case 'GRUPO':
          if (!formData.grupoId) {
            alert('Debe seleccionar un grupo')
            return
          }
          const grupo = grupos.find(g => g.id === formData.grupoId)
          accessType = 'GRUPO'
          accessId = grupo?.idGrupo || ''
          break
        case 'EMPRESA':
          if (!formData.empresaId) {
            alert('Debe seleccionar una empresa')
            return
          }
          const empresa = empresas.find(e => e.id === formData.empresaId)
          accessType = 'EMPRESA'
          accessId = empresa?.idSage || ''
          break
        case 'DISPOSITIVO':
          if (!formData.dispositivoId) {
            alert('Debe seleccionar un dispositivo')
            return
          }
          const dispositivo = dispositivos.find(d => d.id === formData.dispositivoId)
          accessType = 'DISPOSITIVO'
          accessId = dispositivo?.numeroSerie || ''
          break
      }

      const payload = {
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        role: formData.role,
        accessType,
        accessId,
        grupoId: formData.grupoId || null,
        empresaId: formData.empresaId || null,
        dispositivoId: formData.dispositivoId || null,
        canViewContratos: formData.canViewContratos,
        canViewFormaciones: formData.canViewFormaciones,
        canViewFacturas: formData.canViewFacturas,
      }

      console.log('📝 Sending payload:', payload)

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const newUser = await response.json()
        console.log('✅ Usuario creado:', newUser)

        // ✅ GUARDAR datos para mostrar en el toast de éxito
        setCreatedUserData({
          email: payload.email,
          password: payload.password
        })

        // ✅ MOSTRAR toast de éxito
        setShowSuccess(true)

        // Resetear formulario
        setFormData({
          email: '',
          password: '',
          nombre: '',
          apellidos: '',
          role: 'EMPRESA',
          grupoId: '',
          empresaId: '',
          dispositivoId: '',
          canViewContratos: true,
          canViewFormaciones: true,
          canViewFacturas: true,
        })

        // Recargar después de 3 segundos
        setTimeout(() => {
          setOpen(false)
          setShowSuccess(false)
          window.location.reload()
        }, 3000)

      } else {
        const error = await response.json()
        console.error('❌ Error response:', error)
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('❌ Error creating user:', error)
      alert('Error al crear usuario')
    } finally {
      setLoading(false)
    }
  }

  // ✅ MOSTRAR TOAST DE ÉXITO
  if (showSuccess && createdUserData) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Usuario</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[500px]">
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-900">¡Usuario Creado Exitosamente!</h3>
              <p className="text-sm text-green-600 mt-2">
                El nuevo usuario ha sido registrado en el sistema
              </p>
            </div>

            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-green-800">Credenciales de Acceso</CardTitle>
                <CardDescription className="text-green-600">
                  ⚠️ Guarda esta información, la contraseña no se volverá a mostrar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-white rounded border">
                  <div>
                    <span className="text-xs text-gray-500">Email:</span>
                    <div className="font-mono text-sm">{createdUserData.email}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(createdUserData.email)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-2 bg-white rounded border">
                  <div>
                    <span className="text-xs text-gray-500">Contraseña:</span>
                    <div className="font-mono text-sm">{createdUserData.password}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(createdUserData.password)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <p className="text-xs text-gray-500">
              Cerrando automáticamente en 3 segundos...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
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

        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          
          {/* ✅ INFORMACIÓN PERSONAL - CARD */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">👤 Información Personal</CardTitle>
              <CardDescription>
                Datos básicos del usuario
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="apellidos">Apellidos *</Label>
                  <Input
                    id="apellidos"
                    value={formData.apellidos}
                    onChange={(e) => handleInputChange('apellidos', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="new-user-email"
                  name="new-user-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Contraseña *</Label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Input
                      id="new-user-password"
                      name="new-user-password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      autoComplete="new-password"
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
            </CardContent>
          </Card>

          {/* ✅ SISTEMA DE ACCESO - CARD */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🔐 Sistema de Acceso</CardTitle>
              <CardDescription>
                Configura los permisos y nivel de acceso del usuario
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="role">Tipo de Acceso</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo de acceso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">👑 Administrador (acceso total)</SelectItem>
                    <SelectItem value="GRUPO">🏢 Acceso por Grupo</SelectItem>
                    <SelectItem value="EMPRESA">🏬 Acceso por Empresa</SelectItem>
                    <SelectItem value="DISPOSITIVO">📱 Acceso por Dispositivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Selector de Grupo */}
              {(formData.role === 'GRUPO' || formData.role === 'EMPRESA') && (
                <div>
                  <Label htmlFor="grupo">Grupo Asignado</Label>
                  <Select
                    value={formData.grupoId}
                    onValueChange={(value) => handleInputChange('grupoId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      {grupos.map((grupo) => (
                        <SelectItem key={grupo.id} value={grupo.id}>
                          {grupo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Selector de Empresa */}
              {formData.role === 'EMPRESA' && (
                <div>
                  <Label htmlFor="empresa">Empresa Asignada</Label>
                  <Select
                    value={formData.empresaId}
                    onValueChange={(value) => handleInputChange('empresaId', value)}
                    disabled={!formData.grupoId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredEmpresas.map((empresa) => (
                        <SelectItem key={empresa.id} value={empresa.id}>
                          {empresa.nombreCliente}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!formData.grupoId && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Primero selecciona un grupo
                    </p>
                  )}
                  {formData.grupoId && filteredEmpresas.length === 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      No hay empresas disponibles para este grupo
                    </p>
                  )}
                </div>
              )}

              {/* Selector de Dispositivo */}
              {formData.role === 'DISPOSITIVO' && (
                <div>
                  <Label htmlFor="dispositivo">Dispositivo Asignado</Label>
                  <Select
                    value={formData.dispositivoId}
                    onValueChange={(value) => handleInputChange('dispositivoId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un dispositivo" />
                    </SelectTrigger>
                    <SelectContent>
                      {dispositivos.map((dispositivo) => (
                        <SelectItem key={dispositivo.id} value={dispositivo.id}>
                          {dispositivo.numeroSerie} - {dispositivo.nombreCliente}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ✅ PERMISOS DE CONTENIDO - CARD */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📋 Permisos de Contenido</CardTitle>
              <CardDescription>
                Especifica qué información puede ver el usuario
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="contratos"
                  checked={formData.canViewContratos}
                  onCheckedChange={(checked) => handleInputChange('canViewContratos', checked)}
                />
                <Label htmlFor="contratos">Puede ver Contratos</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="formaciones"
                  checked={formData.canViewFormaciones}
                  onCheckedChange={(checked) => handleInputChange('canViewFormaciones', checked)}
                />
                <Label htmlFor="formaciones">Puede ver Formaciones</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="facturas"
                  checked={formData.canViewFacturas}
                  onCheckedChange={(checked) => handleInputChange('canViewFacturas', checked)}
                />
                <Label htmlFor="facturas">Puede ver Facturas</Label>
              </div>
            </CardContent>
          </Card>

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