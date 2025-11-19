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
import { Plus, Search, Edit, Trash2, MoreHorizontal, MapPin, DollarSign, RefreshCw, Image } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import apiClient, { Cancha } from '@/lib/api-client'
import { EditCanchaDialog } from '@/components/admin/edit-cancha-dialog'
import { CreateCanchaDialog } from '@/components/admin/create-cancha-dialog'
import { CanchaPhotosManager } from '@/components/admin/cancha-photos-manager'
import { withErrorBoundary } from '@/components/error/with-error-boundary'

function AdminCourtsPage() {
  const [courts, setCourts] = useState<Cancha[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [editingCourt, setEditingCourt] = useState<Cancha | null>(null)
  const [photosManagingCourt, setPhotosManagingCourt] = useState<Cancha | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [photosDialogOpen, setPhotosDialogOpen] = useState(false)

  const loadCourts = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getCanchas()
      if (response.data) {
        setCourts(response.data)
      } else {
        setCourts([])
      }
    } catch (error) {
      toast.error('Error al cargar canchas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourts()
  }, [])

  const filteredCourts = courts.filter(court =>
    court.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (court.deporte?.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (court.descripcion?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const handleEditCourt = (court: Cancha) => {
    setEditingCourt(court)
    setEditDialogOpen(true)
  }

  const handleManagePhotos = (court: Cancha) => {
    setPhotosManagingCourt(court)
    setPhotosDialogOpen(true)
  }

  const handleDeleteCourt = async (courtId: string, courtName: string) => {
    setActionLoading(courtId)
    try {
      const response = await apiClient.deleteCancha(courtId)
      
      if (response.error) {
        toast.error('Error al eliminar', {
          description: response.error
        })
        return
      }

      setCourts(prev => prev.filter(court => court.id !== courtId))
      toast.success('Cancha eliminada', {
        description: `La cancha "${courtName}" ha sido eliminada exitosamente.`
      })
    } catch (error) {
      toast.error('Error', {
        description: 'No se pudo eliminar la cancha. Inténtalo de nuevo.'
      })
    } finally {
      setActionLoading(null)
    }
  }

  const toggleCourtStatus = async (court: Cancha) => {
    setActionLoading(court.id)
    try {
      const response = await apiClient.updateCancha(court.id, {
        activa: !court.activa
      })

      if (response.error) {
        toast.error('Error al actualizar', {
          description: response.error
        })
        return
      }

      setCourts(prev => prev.map(c => 
        c.id === court.id 
          ? { ...c, activa: !c.activa }
          : c
      ))
      toast.success('Estado actualizado', {
        description: `La cancha "${court.nombre}" ha sido ${court.activa ? 'desactivada' : 'activada'}.`
      })
    } catch (error) {
      toast.error('Error', {
        description: 'No se pudo actualizar el estado de la cancha.'
      })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Gestión de Canchas</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Administra las canchas deportivas del sistema
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={loadCourts}
              variant="outline"
              className="border-gray-200 dark:border-gray-700"
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva Cancha
            </Button>
          </div>
        </div>

        {/* Search and Filters Card */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-md">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Canchas Registradas
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {courts.length} {courts.length === 1 ? 'cancha registrada' : 'canchas registradas'} en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {/* Search Bar */}
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="h-4 w-4 text-gray-400 dark:text-gray-500 absolute left-3 top-3" />
                <Input
                  placeholder="Buscar por nombre, deporte o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-900">
                  <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <TableHead className="font-semibold">Nombre</TableHead>
                    <TableHead className="font-semibold">Deporte</TableHead>
                    <TableHead className="font-semibold">Club</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="font-semibold">Precio/Hora</TableHead>
                    <TableHead className="font-semibold">Superficie</TableHead>
                    <TableHead className="font-semibold text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                          <p className="text-gray-500">Cargando canchas...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredCourts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <MapPin className="h-12 w-12 text-gray-300 dark:text-gray-700" />
                          <p className="text-gray-500 dark:text-gray-400">
                            {searchTerm ? 'No se encontraron canchas con ese criterio' : 'No hay canchas registradas'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCourts.map((court) => (
                      <TableRow 
                        key={court.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                      >
                        <TableCell className="font-semibold text-gray-900 dark:text-white">
                          {court.nombre}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium">
                            {court.deporte?.nombre || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {court.club?.nombre || '-'}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => toggleCourtStatus(court)}
                            disabled={actionLoading === court.id}
                            className="cursor-pointer transition-transform hover:scale-105"
                          >
                            {court.activa ? (
                              <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
                                ✓ Activa
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
                                ✕ Inactiva
                              </Badge>
                            )}
                          </button>
                        </TableCell>
                        <TableCell className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          {court.precioPorHora.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {court.tipoSuperficie || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                                disabled={actionLoading === court.id}
                              >
                                <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => handleEditCourt(court)}
                                className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar Cancha
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleManagePhotos(court)}
                                className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                              >
                                <Image className="mr-2 h-4 w-4" />
                                Gestionar Fotos
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem 
                                    onSelect={(e) => e.preventDefault()}
                                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción no se puede deshacer. La cancha &quot;{court.nombre}&quot; será eliminada permanentemente del sistema.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteCourt(court.id, court.nombre)}
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                      {actionLoading === court.id ? 'Eliminando...' : 'Sí, Eliminar'}
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
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <CreateCanchaDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={loadCourts}
      />

      {/* Edit Dialog */}
      <EditCanchaDialog
        cancha={editingCourt}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={loadCourts}
      />

      {/* Photos Manager */}
      <CanchaPhotosManager
        cancha={photosManagingCourt}
        open={photosDialogOpen}
        onOpenChange={setPhotosDialogOpen}
      />
    </>
  )
}

export default withErrorBoundary(AdminCourtsPage, 'Gestión de Canchas')