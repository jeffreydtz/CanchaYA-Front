/**
 * Admin Personas Page
 * List and manage all personas in the system
 * - View all personas (admin only)
 * - Search by name, apellido, or email
 * - View/edit persona details
 * - Delete personas
 */

'use client'

import { useState, useEffect } from 'react'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Eye, Trash2, Search, User } from 'lucide-react'
import apiClient, { Persona } from '@/lib/api-client'
import { toast } from 'sonner'
import PersonaProfile from '@/components/personas/persona-profile'

export default function AdminPersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [filteredPersonas, setFilteredPersonas] = useState<Persona[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadPersonas()
  }, [])

  useEffect(() => {
    filterPersonas()
  }, [searchTerm, personas])

  const loadPersonas = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getPersonas()
      if (response.error) {
        if (response.status === 403) {
          toast.error('No tienes permiso para ver las personas')
        } else {
          toast.error(response.error)
        }
        setPersonas([])
      } else {
        setPersonas(response.data || [])
      }
    } catch (error) {
      toast.error('Error al cargar personas')
      setPersonas([])
    } finally {
      setLoading(false)
    }
  }

  const filterPersonas = () => {
    if (!searchTerm) {
      setFilteredPersonas(personas)
      return
    }

    const lowerSearch = searchTerm.toLowerCase()
    const filtered = personas.filter(
      (persona) =>
        persona.nombre.toLowerCase().includes(lowerSearch) ||
        persona.apellido.toLowerCase().includes(lowerSearch) ||
        persona.email.toLowerCase().includes(lowerSearch)
    )
    setFilteredPersonas(filtered)
  }

  const handleView = (persona: Persona) => {
    setSelectedPersona(persona)
    setViewDialogOpen(true)
  }

  const handleDeleteClick = (persona: Persona) => {
    setSelectedPersona(persona)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedPersona) return

    setDeletingId(selectedPersona.id)
    try {
      const response = await apiClient.deletePersona(selectedPersona.id)

      if (response.error) {
        if (response.status === 403) {
          toast.error('No tienes permiso para eliminar personas')
        } else if (response.status === 404) {
          toast.error('Persona no encontrada')
        } else {
          toast.error(response.error)
        }
      } else {
        toast.success('Persona eliminada correctamente')
        setPersonas(personas.filter((p) => p.id !== selectedPersona.id))
        setDeleteDialogOpen(false)
        setSelectedPersona(null)
      }
    } catch (error) {
      toast.error('Error al eliminar persona')
    } finally {
      setDeletingId(null)
    }
  }

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido?.charAt(0) || ''}`.toUpperCase()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Personas</h1>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Personas</h1>
          <p className="text-muted-foreground">
            Administra los perfiles de personas del sistema
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <User className="h-4 w-4 mr-2" />
          {personas.length} {personas.length === 1 ? 'Persona' : 'Personas'}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personas Registradas</CardTitle>
          <CardDescription>
            Lista de todos los perfiles de personas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, apellido o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredPersonas.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">
                {searchTerm
                  ? 'No se encontraron personas con ese criterio'
                  : 'No hay personas registradas'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Avatar</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Apellido</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPersonas.map((persona) => (
                  <TableRow key={persona.id}>
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={persona.avatarUrl} alt={persona.nombre} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(persona.nombre, persona.apellido)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{persona.nombre}</TableCell>
                    <TableCell>{persona.apellido}</TableCell>
                    <TableCell>{persona.email}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(persona)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(persona)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Perfil de Persona</DialogTitle>
            <DialogDescription>
              Detalles completos del perfil
            </DialogDescription>
          </DialogHeader>
          {selectedPersona && (
            <PersonaProfile
              personaId={selectedPersona.id}
              isAdmin={true}
              showEditButton={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a{' '}
              <strong>
                {selectedPersona?.nombre} {selectedPersona?.apellido}
              </strong>
              ? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deletingId !== null}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deletingId !== null}
            >
              {deletingId ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
