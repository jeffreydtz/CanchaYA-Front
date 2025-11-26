"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2 } from "lucide-react"
import apiClient, { User } from '@/lib/api-client'
import { withErrorBoundary } from '@/components/error/with-error-boundary'

function AdminUsersPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    if (!isAuthenticated || authLoading) return

    let isMounted = true

    const loadUsers = async () => {
      try {
        const response = await apiClient.getUsuarios()
        if (!isMounted) return
        if (response.data) {
          setUsers(response.data)
        } else {
          setUsers([])
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error loading users:', error)
          setUsers([])
        }
      }
    }
    loadUsers()

    return () => {
      isMounted = false
    }
  }, [isAuthenticated, authLoading])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.persona?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.persona?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.rol?.nombre === roleFilter
    const matchesStatus = statusFilter === "all" || (statusFilter === "activo" ? user.activo : !user.activo)
    return matchesSearch && matchesRole && matchesStatus
  })

  const getStatusBadge = (activo: boolean) => {
    if (activo) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Activo</Badge>
    } else {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactivo</Badge>
    }
  }

  const getRoleBadge = (role: 'usuario' | 'admin') => {
    switch (role) {
      case 'admin':
        return <Badge variant="default" className="bg-purple-100 text-purple-800">Administrador</Badge>
      case 'usuario':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Usuario</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES')
    } catch {
      return '-'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Administra los usuarios del sistema</p>
        </div>
        <Button>
          {/* Removed UserPlus icon */}
          Nuevo Usuario
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios Registrados</CardTitle>
          <CardDescription>
            Lista de todos los usuarios en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            {/* Removed Search icon */}
            <Input
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="usuario">Usuario</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.persona?.nombre} {user.persona?.apellido}
                  </TableCell>
                  <TableCell>{user.persona?.email}</TableCell>
                  <TableCell>{getRoleBadge(user.rol?.nombre)}</TableCell>
                  <TableCell>{getStatusBadge(user.activo)}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>{formatDate(user.updatedAt)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default withErrorBoundary(AdminUsersPage, 'Gestión de Usuarios')