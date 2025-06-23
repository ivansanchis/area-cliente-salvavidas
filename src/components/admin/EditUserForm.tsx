// src/components/admin/EditUserForm.tsx - CORREGIDO MAPEO DE VALORES PREDETERMINADOS

'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Save, X } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  nombre: string | null
  apellidos: string | null
  // ✅ CORREGIDO: cambiar de union type a string para coincidir con Prisma
  role: string
  accessType: string
  accessId: string
  grupoId: string | null
  empresaId: string | null
  dispositivoId: string | null
  canViewContratos: boolean
  canViewFormaciones: boolean
  canViewFacturas: boolean
  active: boolean
  // ✅ CORREGIDO: tipos que coinciden con lo que devuelve Prisma
  grupo?: { 
    id: string
    idGrupo: string
    nombre: string
    createdAt: Date
    updatedAt: Date
    numeroEquipos: number
    numeroFormaciones: number
    mrrTotal: number
    cuotaMediaEquipo: number
  } | null
  empresa?: { 
    id: string
    idSage: string
    nombreCliente: string
    idGrupo: string
    numeroEquipos: number
    numeroFormaciones: number
    mrr: number
    cuotaEquipo: number
    createdAt: Date
    updatedAt: Date
  } | null
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
  idGrupo: string
}

interface Dispositivo {
  id: string
  numeroSerie: string
  nombreCliente: string
  grupoCliente: string
}

interface EditUserFormProps {
  user: User
  grupos: Grupo[]
  empresas: Empresa[]
  dispositivos: Dispositivo[]
}

export default function EditUserForm({ user, grupos, empresas, dispositivos }: EditUserFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ✅ FUNCIÓN PARA MAPEAR CORRECTAMENTE LOS VALORES INICIALES
  const getInitialValues = () => {
    console.log('🔍 Debugging initial values for user:', user.email)
    console.log('📊 User data:', {
      grupoId: user.grupoId,
      empresaId: user.empresaId,
      dispositivoId: user.dispositivoId,
      grupo: user.grupo,
      empresa: user.empresa
    })

    // ✅ MAPEAR GRUPO: Buscar el grupo por idGrupo (foreign key)
    let mappedGrupoId = ''
    if (user.grupoId) {
      const foundGrupo = grupos.find(g => g.idGrupo === user.grupoId)
      if (foundGrupo) {
        mappedGrupoId = foundGrupo.id
        console.log('✅ Grupo found:', foundGrupo.nombre, 'mapped to ID:', foundGrupo.id)
      } else {
        console.log('❌ Grupo not found for grupoId:', user.grupoId)
      }
    }

    // ✅ MAPEAR EMPRESA: Buscar la empresa por idSage (foreign key)
    let mappedEmpresaId = ''
    if (user.empresaId) {
      const foundEmpresa = empresas.find(e => e.idSage === user.empresaId)
      if (foundEmpresa) {
        mappedEmpresaId = foundEmpresa.id
        console.log('✅ Empresa found:', foundEmpresa.nombreCliente, 'mapped to ID:', foundEmpresa.id)
      } else {
        console.log('❌ Empresa not found for empresaId:', user.empresaId)
      }
    }

    // ✅ MAPEAR DISPOSITIVO: Buscar el dispositivo por numeroSerie
    let mappedDispositivoId = ''
    if (user.dispositivoId) {
      const foundDispositivo = dispositivos.find(d => d.numeroSerie === user.dispositivoId)
      if (foundDispositivo) {
        mappedDispositivoId = foundDispositivo.id
        console.log('✅ Dispositivo found:', foundDispositivo.numeroSerie, 'mapped to ID:', foundDispositivo.id)
      } else {
        console.log('❌ Dispositivo not found for dispositivoId:', user.dispositivoId)
      }
    }

    const initialValues = {
      nombre: user.nombre || '',
      apellidos: user.apellidos || '',
      role: user.role,
      grupoId: mappedGrupoId,
      empresaId: mappedEmpresaId,
      dispositivoId: mappedDispositivoId,
      canViewContratos: user.canViewContratos,
      canViewFormaciones: user.canViewFormaciones,
      canViewFacturas: user.canViewFacturas,
      active: user.active
    }

    console.log('📋 Final mapped values:', initialValues)
    return initialValues
  }

  // Estados del formulario con valores iniciales correctos
  const [formData, setFormData] = useState(getInitialValues())

  // Estados para manejar las empresas filtradas
  const [filteredEmpresas, setFilteredEmpresas] = useState<Empresa[]>([])

  // ✅ FUNCIÓN PARA FILTRAR EMPRESAS POR GRUPO
  const filterEmpresasByGrupo = (grupoIdSelected: string) => {
    if (grupoIdSelected) {
      const grupo = grupos.find(g => g.id === grupoIdSelected)
      if (grupo) {
        const empresasDelGrupo = empresas.filter(e => e.idGrupo === grupo.idGrupo)
        console.log('🏢 Filtering empresas for grupo:', grupo.nombre, 'found:', empresasDelGrupo.length)
        setFilteredEmpresas(empresasDelGrupo)
      }
    } else {
      setFilteredEmpresas(empresas)
    }
  }

  // Efecto para filtrar empresas cuando cambia el grupo
  useEffect(() => {
    filterEmpresasByGrupo(formData.grupoId)
  }, [formData.grupoId, grupos, empresas])

  // ✅ EFECTO INICIAL CORREGIDO - Sin el typo
  useEffect(() => {
    console.log('🔄 Initial effect - setting up filtered empresas')
    filterEmpresasByGrupo(formData.grupoId)
  }, []) // Solo se ejecuta una vez al montar

  const handleInputChange = (field: string, value: any) => {
    console.log('📝 Input change:', field, '=', value)
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Si cambia el role, limpiar los campos de acceso
    if (field === 'role') {
      console.log('🔄 Role changed, clearing access fields')
      setFormData(prev => ({
        ...prev,
        grupoId: '',
        empresaId: '',
        dispositivoId: ''
      }))
    }

    // Si cambia el grupo, limpiar empresa
    if (field === 'grupoId') {
      console.log('🔄 Grupo changed, clearing empresa')
      setFormData(prev => ({
        ...prev,
        empresaId: ''
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log('📤 Submitting form with data:', formData)

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
            toast.error('Debe seleccionar un grupo')
            return
          }
          const grupo = grupos.find(g => g.id === formData.grupoId)
          accessType = 'GRUPO'
          accessId = grupo?.idGrupo || ''
          break
        case 'EMPRESA':
          if (!formData.empresaId) {
            toast.error('Debe seleccionar una empresa')
            return
          }
          const empresa = empresas.find(e => e.id === formData.empresaId)
          accessType = 'EMPRESA'
          accessId = empresa?.idSage || ''
          break
        case 'DISPOSITIVO':
          if (!formData.dispositivoId) {
            toast.error('Debe seleccionar un dispositivo')
            return
          }
          const dispositivo = dispositivos.find(d => d.id === formData.dispositivoId)
          accessType = 'DISPOSITIVO'
          accessId = dispositivo?.numeroSerie || ''
          break
      }

      const payload = {
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
        active: formData.active
      }

      console.log('📋 Final payload:', payload)

      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar usuario')
      }

      toast.success('Usuario actualizado correctamente')
      
      startTransition(() => {
        router.push('/dashboard/admin')
        router.refresh()
      })

    } catch (error) {
      console.error('Error updating user:', error)
      toast.error(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    startTransition(() => {
      router.push('/dashboard/admin')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Información Personal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">👤 Información Personal</CardTitle>
          <CardDescription>
            Datos básicos del usuario
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              value={user.email} 
              disabled 
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground mt-1">
              El email no se puede modificar
            </p>
          </div>

          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              placeholder="Nombre del usuario"
            />
          </div>

          <div className="md:col-span-1">
            <Label htmlFor="apellidos">Apellidos</Label>
            <Input
              id="apellidos"
              value={formData.apellidos}
              onChange={(e) => handleInputChange('apellidos', e.target.value)}
              placeholder="Apellidos del usuario"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => handleInputChange('active', checked)}
            />
            <Label htmlFor="active">Usuario activo</Label>
          </div>
        </CardContent>
      </Card>

      {/* Sistema de Roles */}
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

      {/* Permisos Granulares */}
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

      {/* Botones de acción */}
      <div className="flex gap-4 pt-6">
        <Button 
          type="submit" 
          disabled={isSubmitting || isPending}
          className="flex-1 md:flex-none"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </>
          )}
        </Button>

        <Button 
          type="button" 
          variant="outline" 
          onClick={handleCancel}
          disabled={isSubmitting || isPending}
          className="flex-1 md:flex-none"
        >
          <X className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
      </div>
    </form>
  )
}