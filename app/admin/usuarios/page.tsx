'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Edit, UserPlus, Loader2 } from 'lucide-react'
import apiClient, { UsuarioAdmin, Rol, CrearUsuarioAdminDto, ActualizarUsuarioDto, CambiarRolDto } from '@/lib/api-client'
import { withErrorBoundary } from '@/components/error/with-error-boundary'
import { toast } from 'sonner'

function AdminUsersPage() {
  const { isAuthenticated, isSuperAdmin, userId } = useAuth()
  const [users, setUsers] = useState<UsuarioAdmin[]>([])
  const [roles, setRoles] = useState<Rol[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UsuarioAdmin | null>(null)

  // Form states
  const [nuevoUsuario, setNuevoUsuario] = useState<CrearUsuarioAdminDto>({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'usuario',
  })

  const [editUsuario, setEditUsuario] = useState<ActualizarUsuarioDto>({
    nombre: '',
    apellido: '',
    email: '',
  })

  useEffect(() => {
    if (!isAuthenticated) return
    loadUsers()
    loadRoles()
  }, [isAuthenticated])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getUsuarios()
      if (response.error) {
        toast.error(response.error)
      } else if (response.data) {
        setUsers(response.data)
      }
    } catch {
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      const response = await apiClient.getRoles()
      if (response.data) {
        setRoles(response.data)
      }
    } catch {
      // Silently fail - roles are optional
    }
  }

  const handleCrearUsuario = async () => {
    if (!nuevoUsuario.nombre || !nuevoUsuario.apellido || !nuevoUsuario.email || !nuevoUsuario.password) {
      toast.error('Todos los campos son requeridos')
      return
    }

    try {
      setCreating(true)
      const response = await apiClient.crearUsuarioAdmin(nuevoUsuario)
      if (response.error) {
        toast.error(response.error)
      } else {
        toast.success('Usuario creado correctamente')
        setCreateDialogOpen(false)
        setNuevoUsuario({
          nombre: '',
          apellido: '',
          email: '',
          password: '',
          rol: 'usuario',
        })
        loadUsers()
      }
    } catch {
      toast.error('Error al crear usuario')
    } finally {
      setCreating(false)
    }
  }

  const handleEditarUsuario = async () => {
    if (!selectedUser) return

    try {
      setEditing(true)
      const response = await apiClient.actualizarUsuario(selectedUser.id, editUsuario)
      if (response.error) {
        toast.error(response.error)
      } else {
        toast.success('Usuario actualizado correctamente')
        setEditDialogOpen(false)
        setSelectedUser(null)
        loadUsers()
      }
    } catch {
      toast.error('Error al actualizar usuario')
    } finally {
      setEditing(false)
    }
  }

  const handleCambiarRol = async (usuarioId: string, nuevoRol: string) => {
    // Prevent admin from changing their own role
    if (usuarioId === userId && isSuperAdmin) {
      toast.error('No puedes cambiar tu propio rol')
      return
    }

    try {
      const data: CambiarRolDto = { rol: nuevoRol }
      const response = await apiClient.cambiarRolUsuario(usuarioId, data)
      if (response.error) {
        toast.error(response.error)
      } else {
        toast.success(`Rol actualizado a "${nuevoRol}"`)
        loadUsers()
      }
    } catch {
      toast.error('Error al cambiar rol')
    }
  }

  const openEditDialog = (user: UsuarioAdmin) => {
    setSelectedUser(user)
    setEditUsuario({
      nombre: user.persona.nombre,
      apellido: user.persona.apellido,
      email: user.persona.email,
    })
    setEditDialogOpen(true)
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.persona?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.persona?.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.persona?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.rol === roleFilter
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'activo' ? user.activo : !user.activo)
    return matchesSearch && matchesRole && matchesStatus
  })

  const getStatusBadge = (activo: boolean) => {
    if (activo) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Activo
        </Badge>
      )
    } else {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          Inactivo
        </Badge>
      )
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <Badge variant="default" className="bg-purple-100 text-purple-800">
            Administrador
          </Badge>
        )
      case 'admin-club':
        return (
          <Badge variant="default" className="bg-indigo-100 text-indigo-800">
            Admin Club
          </Badge>
        )
      case 'usuario':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Usuario
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-800">
            {role}
          </Badge>
        )
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return '-'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Administra los usuarios del sistema y asigna roles
          </p>
        </div>
        {isSuperAdmin && (
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                <DialogDescription>
                  Crea un nuevo usuario y asigna un rol inicial
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      value={nuevoUsuario.nombre}
                      onChange={(e) =>
                        setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido</Label>
                    <Input
                      id="apellido"
                      value={nuevoUsuario.apellido}
                      onChange={(e) =>
                        setNuevoUsuario({ ...nuevoUsuario, apellido: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={nuevoUsuario.email}
                    onChange={(e) =>
                      setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={nuevoUsuario.password}
                    onChange={(e) =>
                      setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rol">Rol</Label>
                  <Select
                    value={nuevoUsuario.rol}
                    onValueChange={(value) =>
                      setNuevoUsuario({ ...nuevoUsuario, rol: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((rol) => (
                        <SelectItem key={rol.id} value={rol.nombre}>
                          {rol.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  disabled={creating}
                >
                  Cancelar
                </Button>
                <Button onClick={handleCrearUsuario} disabled={creating}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear Usuario
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios Registrados</CardTitle>
          <CardDescription>Lista de todos los usuarios en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4">
            <Input
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                {roles.map((rol) => (
                  <SelectItem key={rol.id} value={rol.nombre}>
                    {rol.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha de Registro</TableHead>
                    <TableHead>Último Acceso</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No se encontraron usuarios
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.persona?.nombre} {user.persona?.apellido}
                        </TableCell>
                        <TableCell>{user.persona?.email}</TableCell>
                        <TableCell>
                          {isSuperAdmin ? (
                            <Select
                              value={user.rol}
                              onValueChange={(value) => handleCambiarRol(user.id, value)}
                              disabled={user.id === userId}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((rol) => (
                                  <SelectItem key={rol.id} value={rol.nombre}>
                                    {rol.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            getRoleBadge(user.rol)
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(user.activo)}</TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>{formatDate(user.lastLoginAt)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Actualiza los datos del usuario
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nombre">Nombre</Label>
                <Input
                  id="edit-nombre"
                  value={editUsuario.nombre}
                  onChange={(e) =>
                    setEditUsuario({ ...editUsuario, nombre: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-apellido">Apellido</Label>
                <Input
                  id="edit-apellido"
                  value={editUsuario.apellido}
                  onChange={(e) =>
                    setEditUsuario({ ...editUsuario, apellido: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editUsuario.email}
                onChange={(e) =>
                  setEditUsuario({ ...editUsuario, email: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={editing}
            >
              Cancelar
            </Button>
            <Button onClick={handleEditarUsuario} disabled={editing}>
              {editing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default withErrorBoundary(AdminUsersPage, 'Gestión de Usuarios')
