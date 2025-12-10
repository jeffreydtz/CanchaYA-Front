'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-context'
import { useRouter } from 'next/navigation'
import apiClient, { Rol, CrearRolDto } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Lock, Briefcase, Loader2 } from 'lucide-react'
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
    } catch (error) {
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
      }
      const response = await apiClient.crearRol(data)
      if (response.error) {
        toast.error(response.error)
      } else {
        toast.success(`Rol "${nuevoRolNombre}" creado correctamente`)
        setNuevoRolNombre('')
        setDialogOpen(false)
        fetchRoles()
      }
    } catch (error) {
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
                Los roles de negocio se usan para segmentación y UX. No agregan permisos adicionales de seguridad.
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
                  No puede usar nombres reservados: admin, admin-club, usuario
                </p>
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
    </div>
  )
}
