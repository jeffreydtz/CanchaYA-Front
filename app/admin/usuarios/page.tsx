"use client"

import { useState, useEffect, useCallback } from "react"
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
import { toast } from "sonner"

interface User {
  id: string
  nombre: string
  email: string
  rol: string
  estado: 'activo' | 'inactivo' | 'pendiente'
  fechaRegistro: string
  ultimoAcceso: string
}

const mockUsers: User[] = [
  {
    id: '1',
    nombre: 'Juan Pérez',
    email: 'juan@example.com',
    rol: 'USUARIO',
    estado: 'activo',
    fechaRegistro: '2024-01-15',
    ultimoAcceso: '2024-01-20'
  },
  {
    id: '2',
    nombre: 'María García',
    email: 'maria@example.com',
    rol: 'ADMINISTRADOR',
    estado: 'activo',
    fechaRegistro: '2024-01-10',
    ultimoAcceso: '2024-01-21'
  },
  {
    id: '3',
    nombre: 'Carlos López',
    email: 'carlos@example.com',
    rol: 'USUARIO',
    estado: 'pendiente',
    fechaRegistro: '2024-01-18',
    ultimoAcceso: '2024-01-19'
  }
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const loadUsers = useCallback(async () => {
    try {
      // For now, we'll use mock data instead of API call to avoid type conflicts
      // const response = await apiClient.getUsers()
      // if (response.data) {
      //   setUsers(response.data)
      // }
      setUsers(mockUsers)
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Error al cargar usuarios')
    } finally {
      // setLoading(false) // Removed loading state
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.rol === roleFilter
    const matchesStatus = statusFilter === "all" || user.estado === statusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const getStatusBadge = (status: User['estado']) => {
    switch (status) {
      case 'activo':
        return <Badge variant="default" className="bg-green-100 text-green-800">Activo</Badge>
      case 'inactivo':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactivo</Badge>
      case 'pendiente':
        return <Badge variant="destructive" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMINISTRADOR':
        return <Badge variant="default" className="bg-purple-100 text-purple-800">Administrador</Badge>
      case 'USUARIO':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Usuario</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
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
                <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                <SelectItem value="USUARIO">Usuario</SelectItem>
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
                  <TableCell className="font-medium">{user.nombre}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.rol)}</TableCell>
                  <TableCell>{getStatusBadge(user.estado)}</TableCell>
                  <TableCell>{user.fechaRegistro}</TableCell>
                  <TableCell>{user.ultimoAcceso}</TableCell>
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