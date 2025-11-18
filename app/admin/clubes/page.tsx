"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Plus, Search, Edit, Trash2, MoreHorizontal, Building2, RefreshCw, MapPin, Phone, Mail } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import apiClient, { Club } from '@/lib/api-client'
import { CreateClubDialog } from '@/components/admin/create-club-dialog'
import { EditClubDialog } from '@/components/admin/edit-club-dialog'

export default function AdminClubesPage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [editingClub, setEditingClub] = useState<Club | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const loadClubs = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getClubes()
      if (response.data) {
        setClubs(response.data)
      } else {
        setClubs([])
      }
    } catch (error) {
      toast.error('Error al cargar clubes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClubs()
  }, [])

  const filteredClubs = clubs.filter(club =>
    club.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (club.direccion?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (club.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const handleEditClub = (club: Club) => {
    setEditingClub(club)
    setEditDialogOpen(true)
  }

  const handleDeleteClub = async (clubId: string, clubName: string) => {
    setActionLoading(clubId)
    try {
      const response = await apiClient.deleteClub(clubId)

      if (response.error) {
        toast.error('Error al eliminar', {
          description: response.error
        })
        return
      }

      setClubs(prev => prev.filter(club => club.id !== clubId))
      toast.success('Club eliminado', {
        description: `El club "${clubName}" ha sido eliminado exitosamente.`
      })
    } catch (error) {
      toast.error('Error', {
        description: 'No se pudo eliminar el club. Inténtalo de nuevo.'
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
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Gestión de Clubes</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Administra los clubes deportivos del sistema
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={loadClubs}
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
              Nuevo Club
            </Button>
          </div>
        </div>

        {/* Search and Table Card */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-md">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Clubes Registrados
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {clubs.length} {clubs.length === 1 ? 'club registrado' : 'clubes registrados'} en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {/* Search Bar */}
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="h-4 w-4 text-gray-400 dark:text-gray-500 absolute left-3 top-3" />
                <Input
                  placeholder="Buscar por nombre, dirección o email..."
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
                    <TableHead className="font-semibold">Dirección</TableHead>
                    <TableHead className="font-semibold">Teléfono</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                          <p className="text-gray-500">Cargando clubes...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredClubs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Building2 className="h-12 w-12 text-gray-300 dark:text-gray-700" />
                          <p className="text-gray-500 dark:text-gray-400">
                            {searchTerm ? 'No se encontraron clubes con ese criterio' : 'No hay clubes registrados'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClubs.map((club) => (
                      <TableRow
                        key={club.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                      >
                        <TableCell className="font-semibold text-gray-900 dark:text-white">
                          {club.nombre}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {club.direccion || '-'}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {club.telefono || '-'}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {club.email || '-'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                                disabled={actionLoading === club.id}
                              >
                                <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => handleEditClub(club)}
                                className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar Club
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
                                      Esta acción no se puede deshacer. El club &quot;{club.nombre}&quot; será eliminado permanentemente del sistema.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteClub(club.id, club.nombre)}
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                      {actionLoading === club.id ? 'Eliminando...' : 'Sí, Eliminar'}
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
      <CreateClubDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={loadClubs}
      />

      {/* Edit Dialog */}
      <EditClubDialog
        club={editingClub}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={loadClubs}
      />
    </>
  )
}
