/**
 * Personal Availability Page for CanchaYA
 * Allows users to set when they're available to play for player matching
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Clock,
  Calendar,
  MapPin,
  Plus,
  Trash2,
  Users,
  Trophy,
  AlertCircle
} from 'lucide-react'
import apiClient, { DisponibilidadPersona, Deporte, Club } from '@/lib/api-client'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth/auth-context'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Navbar from '@/components/navbar/navbar'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

export default function MiDisponibilidadPage() {
  const { isAuthenticated, personaId } = useAuth()
  const [disponibilidades, setDisponibilidades] = useState<DisponibilidadPersona[]>([])
  const [deportes, setDeportes] = useState<Deporte[]>([])
  const [clubes, setClubes] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [horaDesde, setHoraDesde] = useState('')
  const [horaHasta, setHoraHasta] = useState('')
  const [deporteId, setDeporteId] = useState('')
  const [selectedClubes, setSelectedClubes] = useState<string[]>([])

  useEffect(() => {
    if (isAuthenticated && personaId) {
      loadData()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, personaId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [dispResponse, deportesResponse, clubesResponse] = await Promise.all([
        apiClient.getDisponibilidades(),
        apiClient.getDeportes(),
        apiClient.getClubes(),
      ])

      if (dispResponse.data) {
        setDisponibilidades(dispResponse.data)
      }

      if (deportesResponse.data) {
        setDeportes(deportesResponse.data)
      }

      if (clubesResponse.data) {
        setClubes(clubesResponse.data)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!fechaDesde || !fechaHasta || !horaDesde || !horaHasta || !deporteId || selectedClubes.length === 0) {
      toast.error('Por favor completa todos los campos')
      return
    }

    setSubmitting(true)
    try {
      const response = await apiClient.createDisponibilidad({
        fechaDesde: new Date(fechaDesde).toISOString(),
        fechaHasta: new Date(fechaHasta).toISOString(),
        horaDesde,
        horaHasta,
        deporteId,
        clubesIds: selectedClubes,
      })

      if (response.error) {
        toast.error(response.error)
        return
      }

      if (response.data) {
        toast.success('Disponibilidad creada exitosamente')
        setShowCreateDialog(false)
        resetForm()
        loadData()
      }
    } catch (error) {
      console.error('Error creating availability:', error)
      toast.error('No se pudo crear la disponibilidad')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await apiClient.deleteDisponibilidad(id)
      if (response.error) {
        toast.error(response.error)
        return
      }

      toast.success('Disponibilidad eliminada')
      loadData()
    } catch (error) {
      console.error('Error deleting availability:', error)
      toast.error('No se pudo eliminar la disponibilidad')
    }
  }

  const resetForm = () => {
    setFechaDesde('')
    setFechaHasta('')
    setHoraDesde('')
    setHoraHasta('')
    setDeporteId('')
    setSelectedClubes([])
  }

  const toggleClub = (clubId: string) => {
    setSelectedClubes((prev) =>
      prev.includes(clubId) ? prev.filter((id) => id !== clubId) : [...prev, clubId]
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Clock className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Inicia sesión para configurar tu disponibilidad</h2>
            <p className="text-gray-600 mb-4">
              Necesitas estar autenticado para gestionar tu disponibilidad
            </p>
            <Link href="/login">
              <Button>Iniciar Sesión</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-8">
        <Navbar />
        <div className="fixed bottom-6 right-6 z-50">
          <ThemeToggle />
        </div>
        <div className="container mx-auto px-4">
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-8">
      <Navbar />

      {/* Theme Toggle - Fixed Position */}
      <div className="fixed bottom-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            Mi Disponibilidad
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Configura cuándo estás disponible para jugar y encuentra compañeros de juego
          </p>
        </div>

        {/* Info Card */}
        <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-500 rounded-lg flex-shrink-0">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  ¿Para qué sirve la disponibilidad?
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Configura tu disponibilidad para que otros jugadores puedan encontrarte y formar equipos.
                  Indica cuándo puedes jugar, qué deportes te interesan y en qué clubes prefieres jugar.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Tus Disponibilidades
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {disponibilidades.length} {disponibilidades.length === 1 ? 'configurada' : 'configuradas'}
                </p>
              </div>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Disponibilidad
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Availability List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {disponibilidades.length === 0 ? (
            <Card className="md:col-span-2">
              <CardContent className="p-12 text-center">
                <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No tienes disponibilidades configuradas
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Agrega tu primera disponibilidad para que otros jugadores te puedan encontrar
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Disponibilidad
                </Button>
              </CardContent>
            </Card>
          ) : (
            disponibilidades.map((disp) => (
              <Card key={disp.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      {disp.deporte?.nombre || 'Deporte'}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(disp.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Dates */}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {new Date(disp.fechaDesde).toLocaleDateString('es-ES')} -{' '}
                      {new Date(disp.fechaHasta).toLocaleDateString('es-ES')}
                    </span>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {disp.horaDesde} - {disp.horaHasta}
                    </span>
                  </div>

                  {/* Clubs */}
                  <div>
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Clubes:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {disp.clubes?.map((club) => (
                        <Badge key={club.id} variant="secondary">
                          {club.nombre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agregar Disponibilidad</DialogTitle>
              <DialogDescription>
                Configura cuándo estás disponible para jugar
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Range */}
              <div>
                <Label htmlFor="fechaDesde">Desde (Fecha)</Label>
                <Input
                  id="fechaDesde"
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="fechaHasta">Hasta (Fecha)</Label>
                <Input
                  id="fechaHasta"
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                />
              </div>

              {/* Time Range */}
              <div>
                <Label htmlFor="horaDesde">Desde (Hora)</Label>
                <Input
                  id="horaDesde"
                  type="time"
                  value={horaDesde}
                  onChange={(e) => setHoraDesde(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="horaHasta">Hasta (Hora)</Label>
                <Input
                  id="horaHasta"
                  type="time"
                  value={horaHasta}
                  onChange={(e) => setHoraHasta(e.target.value)}
                />
              </div>

              {/* Sport */}
              <div className="md:col-span-2">
                <Label htmlFor="deporte">Deporte</Label>
                <select
                  id="deporte"
                  value={deporteId}
                  onChange={(e) => setDeporteId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="">Selecciona un deporte</option>
                  {deportes.map((deporte) => (
                    <option key={deporte.id} value={deporte.id}>
                      {deporte.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clubs */}
              <div className="md:col-span-2">
                <Label>Clubes Preferidos</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto p-2 border rounded-md dark:border-gray-700">
                  {clubes.map((club) => (
                    <label
                      key={club.id}
                      className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                        selectedClubes.includes(club.id)
                          ? 'bg-primary/10 border-primary/50'
                          : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedClubes.includes(club.id)}
                        onChange={() => toggleClub(club.id)}
                        className="rounded"
                      />
                      <span className="text-sm">{club.nombre}</span>
                    </label>
                  ))}
                </div>
                {selectedClubes.length > 0 && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {selectedClubes.length} {selectedClubes.length === 1 ? 'club seleccionado' : 'clubes seleccionados'}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false)
                  resetForm()
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={submitting}>
                {submitting ? 'Creando...' : 'Crear Disponibilidad'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
