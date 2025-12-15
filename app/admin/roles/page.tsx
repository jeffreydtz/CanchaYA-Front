'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-context'
import { useRouter } from 'next/navigation'
import apiClient, { Rol, CrearRolDto } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Lock, Briefcase, Loader2, Shield, Building2, User } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export default function RolesPage() {
  const { isAuthenticated, isSuperAdmin } = useAuth()
  const router = useRouter()
  const [roles, setRoles] = useState<Rol[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [nuevoRolNombre, setNuevoRolNombre] = useState('')
  const [nuevoRolNivelAcceso, setNuevoRolNivelAcceso] = useState<'usuario' | 'admin-club' | 'admin'>('usuario')

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
      return
    }
    if (!isSuperAdmin) {
      router.replace('/admin')
      return
    }
    fetchRoles()
  }, [isAuthenticated, isSuperAdmin, router])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getRoles()
      if (response.error) {
        toast.error(response.error)
      } else if (response.data) {
        setRoles(response.data)
      }
      } catch {
        toast.error('Error al cargar roles')
      } finally {
      setLoading(false)
    }
  }

  const handleCrearRol = async () => {
    if (!nuevoRolNombre.trim()) {
      toast.error('El nombre del rol es requerido')
      return
    }

    try {
      setCreating(true)
      const data: CrearRolDto = {
        nombre: nuevoRolNombre.trim().toLowerCase(),
        nivelAcceso: nuevoRolNivelAcceso,
      }
      const response = await apiClient.crearRol(data)
      if (response.error) {
        toast.error(response.error)
      } else {
        toast.success(`Rol "${nuevoRolNombre}" creado correctamente`)
        setNuevoRolNombre('')
        setNuevoRolNivelAcceso('usuario')
        setDialogOpen(false)
        fetchRoles()
      }
    } catch {
      toast.error('Error al crear rol')
    } finally {
      setCreating(false)
    }
  }

  if (!isAuthenticated || !isSuperAdmin) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Roles</h1>
          <p className="text-muted-foreground mt-1">
            Administra los roles del sistema y roles de negocio personalizados
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Crear Rol
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Rol de Negocio</DialogTitle>
              <DialogDescription>
                Cada rol de negocio se mapea a un nivel de acceso real. El nivel de acceso define qué puede hacer el usuario en el sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del rol</Label>
                <Input
                  id="nombre"
                  placeholder="ej: recepcionista, cajero, profesor-padel"
                  value={nuevoRolNombre}
                  onChange={(e) => setNuevoRolNombre(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !creating) {
                      handleCrearRol()
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  No puede usar nombres que ya existen en el sistema
                </p>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Nivel de acceso
                  <span className="text-xs font-normal text-muted-foreground">
                    (define permisos reales)
                  </span>
                </Label>
                <div className="grid gap-3 md:grid-cols-3">
                  <button
                    type="button"
                    className={`text-left p-3 rounded-lg border text-sm transition-all ${
                      nuevoRolNivelAcceso === 'usuario'
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-muted hover:border-muted-foreground/40'
                    }`}
                    onClick={() => setNuevoRolNivelAcceso('usuario')}
                  >
                    <div className="font-medium flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Usuario
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Puede reservar y ver sus propias reservas. Sin acceso a panel de administración.
                    </p>
                  </button>

                  <button
                    type="button"
                    className={`text-left p-3 rounded-lg border text-sm transition-all ${
                      nuevoRolNivelAcceso === 'admin-club'
                        ? 'border-orange-500 bg-orange-500/5 shadow-sm'
                        : 'border-muted hover:border-muted-foreground/40'
                    }`}
                    onClick={() => setNuevoRolNivelAcceso('admin-club')}
                  >
                    <div className="font-medium flex items-center gap-2 mb-1">
                      <Building2 className="h-4 w-4 text-orange-500" />
                      Admin Club
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Gestiona reservas, canchas y métricas solo de los clubes asignados.
                    </p>
                  </button>

                  <button
                    type="button"
                    className={`text-left p-3 rounded-lg border text-sm transition-all ${
                      nuevoRolNivelAcceso === 'admin'
                        ? 'border-red-500 bg-red-500/5 shadow-sm'
                        : 'border-muted hover:border-muted-foreground/40'
                    }`}
                    onClick={() => setNuevoRolNivelAcceso('admin')}
                  >
                    <div className="font-medium flex items-center gap-2 mb-1">
                      <Shield className="h-4 w-4 text-red-500" />
                      Admin Global
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Acceso total al sistema, todos los clubes y configuración global.
                    </p>
                  </button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={creating}
              >
                Cancelar
              </Button>
              <Button onClick={handleCrearRol} disabled={creating || !nuevoRolNombre.trim()}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Rol
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((rol) => (
            <Card key={rol.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {rol.tipo === 'sistema' ? (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                      )}
                      {rol.nombre}
                    </CardTitle>
                    <CardDescription>
                      {rol.tipo === 'sistema' ? 'Rol del Sistema' : 'Rol de Negocio'}
                    </CardDescription>
                  </div>
                  <Badge variant={rol.tipo === 'sistema' ? 'default' : 'secondary'}>
                    {rol.tipo}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {rol.tipo === 'sistema' ? (
                  <p className="text-sm text-muted-foreground">
                    Este rol es parte del núcleo del sistema y no puede ser modificado o eliminado.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Rol personalizado para segmentación de usuarios y gestión de permisos de negocio.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && roles.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No hay roles disponibles</p>
            <p className="text-sm text-muted-foreground mb-4">
              Crea un nuevo rol de negocio para comenzar
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Rol
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Access Levels Information Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Niveles de Acceso</h2>
        <p className="text-muted-foreground mb-6">
          Los niveles de acceso determinan los permisos reales de cada usuario en el sistema.
          A diferencia de los roles (que son informativos), los niveles de acceso controlan qué puede hacer cada usuario.
        </p>
        
        <div className="grid gap-4 md:grid-cols-3">
          {/* Usuario Level */}
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-500" />
                    Usuario
                  </CardTitle>
                  <CardDescription>Nivel básico</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                  Básico
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Hacer reservas
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Ver su historial
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Gestionar su perfil
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Participar en desafíos
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-500">✗</span> Acceso al panel de admin
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Admin Club Level */}
          <Card className="border-2 border-orange-200 dark:border-orange-800">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-orange-500" />
                    Admin de Club
                  </CardTitle>
                  <CardDescription>Gestión de clubes asignados</CardDescription>
                </div>
                <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                  Club
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Todo lo de Usuario
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Gestionar reservas del club
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Administrar canchas
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Ver métricas del club
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-500">✗</span> Gestionar otros clubes
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Admin Global Level */}
          <Card className="border-2 border-red-200 dark:border-red-800">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-500" />
                    Admin Global
                  </CardTitle>
                  <CardDescription>Acceso completo al sistema</CardDescription>
                </div>
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                  Global
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Todo lo de Admin Club
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Gestionar todos los clubes
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Administrar usuarios
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Crear/eliminar roles
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Configuración del sistema
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  ¿Cómo asignar niveles de acceso?
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Para cambiar el nivel de acceso de un usuario, ve a{' '}
                  <a href="/admin/usuarios" className="underline font-medium hover:text-blue-900 dark:hover:text-blue-100">
                    Gestión de Usuarios
                  </a>{' '}
                  y haz clic en el badge de nivel de acceso del usuario que deseas modificar.
                  Podrás seleccionar el nuevo nivel y, en caso de Admin de Club, asignar los clubes correspondientes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
