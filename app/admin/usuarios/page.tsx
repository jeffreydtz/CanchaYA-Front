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
import { Edit, UserPlus, Loader2, Shield, Building2 } from 'lucide-react'
import apiClient, { UsuarioAdmin, Rol, CrearUsuarioAdminDto, ActualizarUsuarioDto, CambiarRolDto, CambiarNivelAccesoDto, Club } from '@/lib/api-client'
import { Checkbox } from '@/components/ui/checkbox'
import { withErrorBoundary } from '@/components/error/with-error-boundary'
import { toast } from 'sonner'

function AdminUsersPage() {
  const { isAuthenticated, isSuperAdmin, userId } = useAuth()
  const [users, setUsers] = useState<UsuarioAdmin[]>([])
  const [roles, setRoles] = useState<Rol[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [accessLevelFilter, setAccessLevelFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(false)
  const [changingAccess, setChangingAccess] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [accessDialogOpen, setAccessDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UsuarioAdmin | null>(null)
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<'usuario' | 'admin-club' | 'admin'>('usuario')
  const [selectedClubIds, setSelectedClubIds] = useState<string[]>([])

  // Form states
  const [nuevoUsuario, setNuevoUsuario] = useState<CrearUsuarioAdminDto & { nivelAcceso?: 'usuario' | 'admin-club' | 'admin', clubIds?: string[] }>({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'usuario',
    nivelAcceso: 'usuario',
    clubIds: [],
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
    loadClubs()
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

  const loadClubs = async () => {
    try {
      const response = await apiClient.getClubes()
      if (response.data) {
        setClubs(response.data)
      }
    } catch {
      // Silently fail - clubs are optional
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

  const openAccessDialog = (user: UsuarioAdmin) => {
    setSelectedUser(user)
    setSelectedAccessLevel(user.nivelAcceso || 'usuario')
    setSelectedClubIds(user.clubIds || [])
    setAccessDialogOpen(true)
  }

  const handleCambiarNivelAcceso = async () => {
    if (!selectedUser) return

    // Prevent admin from changing their own access level
    if (selectedUser.id === userId) {
      toast.error('No puedes cambiar tu propio nivel de acceso')
      return
    }

    // Validate clubIds when admin-club is selected
    if (selectedAccessLevel === 'admin-club' && selectedClubIds.length === 0) {
      toast.error('Debes seleccionar al menos un club para el nivel Admin Club')
      return
    }

    try {
      setChangingAccess(true)
      const data: CambiarNivelAccesoDto = {
        nivelAcceso: selectedAccessLevel,
        ...(selectedAccessLevel === 'admin-club' && { clubIds: selectedClubIds }),
      }
      const response = await apiClient.cambiarNivelAcceso(selectedUser.id, data)
      if (response.error) {
        toast.error(response.error)
      } else {
        toast.success(`Nivel de acceso actualizado a "${getAccessLevelName(selectedAccessLevel)}"`)
        setAccessDialogOpen(false)
        loadUsers()
      }
    } catch {
      toast.error('Error al cambiar nivel de acceso')
    } finally {
      setChangingAccess(false)
    }
  }

  const getAccessLevelName = (level: string) => {
    switch (level) {
      case 'admin':
        return 'Administrador Global'
      case 'admin-club':
        return 'Admin de Club'
      case 'usuario':
        return 'Usuario'
      default:
        return level
    }
  }

  const toggleClubSelection = (clubId: string) => {
    setSelectedClubIds(prev => 
      prev.includes(clubId) 
        ? prev.filter(id => id !== clubId)
        : [...prev, clubId]
    )
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
    const matchesAccessLevel = accessLevelFilter === 'all' || user.nivelAcceso === accessLevelFilter
    return matchesSearch && matchesRole && matchesStatus && matchesAccessLevel
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

  const getAccessLevelBadge = (level: string, clubIds?: string[]) => {
    switch (level) {
      case 'admin':
        return (
          <div className="flex items-center gap-1">
            <Badge variant="default" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
              <Shield className="h-3 w-3 mr-1" />
              Admin Global
            </Badge>
          </div>
        )
      case 'admin-club':
        return (
          <div className="flex flex-col gap-1">
            <Badge variant="default" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
              <Building2 className="h-3 w-3 mr-1" />
              Admin Club
            </Badge>
            {clubIds && clubIds.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {clubIds.length} club{clubIds.length > 1 ? 'es' : ''}
              </span>
            )}
          </div>
        )
      case 'usuario':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            Usuario
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            {level}
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4 flex-wrap">
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
            <Select value={accessLevelFilter} onValueChange={setAccessLevelFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los niveles</SelectItem>
                <SelectItem value="admin">Admin Global</SelectItem>
                <SelectItem value="admin-club">Admin Club</SelectItem>
                <SelectItem value="usuario">Usuario</SelectItem>
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
                    <TableHead>Nivel de Acceso</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha de Registro</TableHead>
                    <TableHead>Último Acceso</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
                        <TableCell>
                          {isSuperAdmin ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-auto hover:bg-transparent"
                              onClick={() => openAccessDialog(user)}
                              disabled={user.id === userId}
                            >
                              {getAccessLevelBadge(user.nivelAcceso || 'usuario', user.clubIds)}
                            </Button>
                          ) : (
                            getAccessLevelBadge(user.nivelAcceso || 'usuario', user.clubIds)
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

      {/* Access Level Dialog */}
      <Dialog open={accessDialogOpen} onOpenChange={setAccessDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Cambiar Nivel de Acceso
            </DialogTitle>
            <DialogDescription>
              Configura el nivel de acceso y permisos para{' '}
              <span className="font-semibold">
                {selectedUser?.persona?.nombre} {selectedUser?.persona?.apellido}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Access Level Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Nivel de Acceso</Label>
              <div className="grid gap-3">
                <div
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedAccessLevel === 'usuario'
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-muted-foreground/30'
                  }`}
                  onClick={() => setSelectedAccessLevel('usuario')}
                >
                  <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                    selectedAccessLevel === 'usuario' ? 'border-primary' : 'border-muted-foreground/50'
                  }`}>
                    {selectedAccessLevel === 'usuario' && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Usuario</div>
                    <div className="text-sm text-muted-foreground">
                      Acceso básico. Puede hacer reservas y ver su historial.
                    </div>
                  </div>
                </div>

                <div
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedAccessLevel === 'admin-club'
                      ? 'border-orange-500 bg-orange-500/5'
                      : 'border-muted hover:border-muted-foreground/30'
                  }`}
                  onClick={() => setSelectedAccessLevel('admin-club')}
                >
                  <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                    selectedAccessLevel === 'admin-club' ? 'border-orange-500' : 'border-muted-foreground/50'
                  }`}>
                    {selectedAccessLevel === 'admin-club' && (
                      <div className="h-2 w-2 rounded-full bg-orange-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-orange-500" />
                      Admin de Club
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Puede gestionar reservas, canchas y métricas de los clubes asignados.
                    </div>
                  </div>
                </div>

                <div
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedAccessLevel === 'admin'
                      ? 'border-red-500 bg-red-500/5'
                      : 'border-muted hover:border-muted-foreground/30'
                  }`}
                  onClick={() => setSelectedAccessLevel('admin')}
                >
                  <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                    selectedAccessLevel === 'admin' ? 'border-red-500' : 'border-muted-foreground/50'
                  }`}>
                    {selectedAccessLevel === 'admin' && (
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4 text-red-500" />
                      Administrador Global
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Acceso completo al sistema. Puede gestionar todos los clubes, usuarios y configuraciones.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Club Selection (only for admin-club) */}
            {selectedAccessLevel === 'admin-club' && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Clubes Asignados
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Selecciona los clubes que este usuario podrá administrar.
                </p>
                <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1">
                  {clubs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay clubes disponibles
                    </p>
                  ) : (
                    clubs.map((club) => (
                      <div
                        key={club.id}
                        className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${
                          selectedClubIds.includes(club.id)
                            ? 'bg-orange-100 dark:bg-orange-900/20'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => toggleClubSelection(club.id)}
                      >
                        <Checkbox
                          checked={selectedClubIds.includes(club.id)}
                          onCheckedChange={() => toggleClubSelection(club.id)}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{club.nombre}</div>
                          <div className="text-xs text-muted-foreground">{club.direccion}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {selectedClubIds.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {selectedClubIds.length} club{selectedClubIds.length > 1 ? 'es' : ''} seleccionado{selectedClubIds.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAccessDialogOpen(false)}
              disabled={changingAccess}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCambiarNivelAcceso}
              disabled={changingAccess || (selectedAccessLevel === 'admin-club' && selectedClubIds.length === 0)}
            >
              {changingAccess && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default withErrorBoundary(AdminUsersPage, 'Gestión de Usuarios')
