"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from '@/components/ui/use-toast'
import { Plus, Search, Edit, Trash2, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import apiClient, { Cancha } from '@/lib/api-client'

export default function AdminCourtsPage() {
  const [courts, setCourts] = useState<Cancha[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    const loadCourts = async () => {
      setLoading(true)
      const response = await apiClient.getCanchas()
      if (response.data) {
        setCourts(response.data)
      } else {
        setCourts([])
      }
      setLoading(false)
    }
    loadCourts()
  }, [])

  const filteredCourts = courts.filter(court =>
    court.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (court.deporte?.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (court.ubicacion?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const handleEditCourt = (court: Cancha) => {
    // TODO: Abrir modal de edición
    toast({
      title: "Funcionalidad en desarrollo",
      description: `Editar cancha: ${court.nombre}`,
    })
  }

  const handleDeleteCourt = async (courtId: string, courtName: string) => {
    setActionLoading(courtId)
    try {
      // TODO: Implementar eliminación real
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simular API call
      setCourts(prev => prev.filter(court => court.id !== courtId))
      toast({
        title: "Cancha eliminada",
        description: `La cancha "${courtName}" ha sido eliminada exitosamente.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la cancha. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleCreateCourt = () => {
    // TODO: Abrir modal de creación
    toast({
      title: "Funcionalidad en desarrollo",
      description: "Crear nueva cancha",
    })
  }

  const toggleCourtStatus = async (court: Cancha) => {
    setActionLoading(court.id)
    try {
      // TODO: Implementar cambio de estado real
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simular API call
      setCourts(prev => prev.map(c => 
        c.id === court.id 
          ? { ...c, disponible: !c.disponible }
          : c
      ))
      toast({
        title: "Estado actualizado",
        description: `La cancha "${court.nombre}" ha sido ${court.disponible ? 'desactivada' : 'activada'}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la cancha.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Canchas</h1>
          <p className="text-gray-600">Administra las canchas deportivas del sistema</p>
        </div>
        <Button onClick={handleCreateCourt} className="bg-gray-900 hover:bg-gray-800 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Cancha
        </Button>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-gray-900">Canchas Registradas</CardTitle>
          <CardDescription className="text-gray-600">
            Lista de todas las canchas deportivas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative max-w-sm">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
              <Input
                placeholder="Buscar canchas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus:border-gray-400 focus:ring-gray-400"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Deporte</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Cargando canchas...
                  </TableCell>
                </TableRow>
              ) : filteredCourts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No se encontraron canchas.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourts.map((court) => (
                  <TableRow key={court.id}>
                    <TableCell className="font-medium">{court.nombre}</TableCell>
                    <TableCell className="text-gray-600">{court.deporte?.nombre || '-'}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => toggleCourtStatus(court)}
                        disabled={actionLoading === court.id}
                        className="cursor-pointer"
                      >
                        {court.disponible ? (
                          <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                            Disponible
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100">
                            No disponible
                          </Badge>
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">${court.precioPorHora.toLocaleString()}</TableCell>
                    <TableCell className="text-gray-600">{court.ubicacion}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                            disabled={actionLoading === court.id}
                          >
                            <MoreHorizontal className="h-4 w-4 text-gray-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem 
                            onClick={() => handleEditCourt(court)}
                            className="text-gray-700 hover:bg-gray-50"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                onSelect={(e) => e.preventDefault()}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. La cancha "{court.nombre}" será eliminada permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-gray-200 hover:bg-gray-50">
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteCourt(court.id, court.nombre)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  {actionLoading === court.id ? 'Eliminando...' : 'Eliminar'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 