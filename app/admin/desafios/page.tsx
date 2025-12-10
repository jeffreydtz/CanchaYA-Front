'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import apiClient, { Desafio, FiltroDesafioDto, Deporte, Persona } from '@/lib/api-client'
import { useAuth } from '@/components/auth/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Shield, Search, Eye, XCircle, Filter, RefreshCw } from 'lucide-react'

export default function AdminDesafiosPage() {
  const router = useRouter()
  const { isAuthenticated, isAdmin } = useAuth()

  const [desafios, setDesafios] = useState<Desafio[]>([])
  const [deportes, setDeportes] = useState<Deporte[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [filtroDeporte, setFiltroDeporte] = useState<string>('todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Persona[]>([])
  const [selectedJugador, setSelectedJugador] = useState<Persona | null>(null)

  const [selectedDesafio, setSelectedDesafio] = useState<Desafio | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (!isAdmin) {
      router.push('/dashboard')
      return
    }

    loadDeportes()
    loadDesafios()
  }, [router, isAuthenticated, isAdmin])

  const loadDeportes = async () => {
    const response = await apiClient.getDeportes()
    if (response.data) {
      setDeportes(response.data)
    }
  }

  const loadDesafios = async (filtro?: FiltroDesafioDto) => {
    setLoading(true)
    setError(null)

    const response = await apiClient.getDesafios(filtro)

    if (response.error) {
      setError(response.error)
    } else if (response.data) {
      setDesafios(response.data)
    }
    setLoading(false)
  }

  const handleApplyFilters = () => {
    const filtro: FiltroDesafioDto = {}

    if (filtroEstado !== 'todos') {
      filtro.estado = filtroEstado as 'pendiente' | 'aceptado' | 'cancelado' | 'finalizado'
    }

    if (filtroDeporte !== 'todos') {
      filtro.deporteId = filtroDeporte
    }

    if (selectedJugador) {
      filtro.jugadorId = selectedJugador.id
    }

    loadDesafios(filtro)
  }

  const handleClearFilters = () => {
    setFiltroEstado('todos')
    setFiltroDeporte('todos')
    setSelectedJugador(null)
    setSearchQuery('')
    loadDesafios()
  }

  const handleSearchJugador = async (query: string) => {
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    const response = await apiClient.searchPersonas(query)
    if (response.data) {
      setSearchResults(response.data)
    }
  }

  const handleSelectJugador = (persona: Persona) => {
    setSelectedJugador(persona)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleCancelarDesafio = async (desafioId: string) => {
    if (!confirm('¿Estás seguro de que deseas cancelar este desafío?')) return

    const response = await apiClient.cancelarDesafio(desafioId)

    if (response.error) {
      alert(response.error)
    } else {
      handleApplyFilters()
    }
  }

  const handleViewDetail = (desafio: Desafio) => {
    setSelectedDesafio(desafio)
    setShowDetailModal(true)
  }

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      pendiente: 'secondary',
      aceptado: 'default',
      finalizado: 'outline',
      cancelado: 'destructive'
    }

    return <Badge variant={variants[estado] || 'default'}>{estado.toUpperCase()}</Badge>
  }

  const estadisticas = {
    total: desafios.length,
    pendientes: desafios.filter(d => d.estado === 'pendiente').length,
    aceptados: desafios.filter(d => d.estado === 'aceptado').length,
    finalizados: desafios.filter(d => d.estado === 'finalizado').length,
    cancelados: desafios.filter(d => d.estado === 'cancelado').length
  }

  if (loading && desafios.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8 text-blue-600" />
          Administración de Desafíos
        </h1>
        <p className="text-muted-foreground mt-2">
          Panel de gestión completo de todos los desafíos del sistema
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{estadisticas.pendientes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Aceptados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{estadisticas.aceptados}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Finalizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{estadisticas.finalizados}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{estadisticas.cancelados}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>Estado</Label>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="aceptado">Aceptado</SelectItem>
                  <SelectItem value="finalizado">Finalizado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Deporte</Label>
              <Select value={filtroDeporte} onValueChange={setFiltroDeporte}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {deportes.map((deporte) => (
                    <SelectItem key={deporte.id} value={deporte.id}>
                      {deporte.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label>Jugador</Label>
              <div className="relative">
                <Input
                  placeholder="Buscar por jugador..."
                  value={selectedJugador ? `${selectedJugador.nombre} ${selectedJugador.apellido}` : searchQuery}
                  onChange={(e) => handleSearchJugador(e.target.value)}
                  onFocus={() => {
                    if (selectedJugador) {
                      setSelectedJugador(null)
                      setSearchQuery('')
                    }
                  }}
                />
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {searchResults.map((persona) => (
                      <div
                        key={persona.id}
                        className="p-2 hover:bg-accent cursor-pointer"
                        onClick={() => handleSelectJugador(persona)}
                      >
                        {persona.nombre} {persona.apellido}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleApplyFilters}>
              <Search className="h-4 w-4 mr-2" />
              Aplicar Filtros
            </Button>
            <Button variant="outline" onClick={handleClearFilters}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Desafíos */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Desafíos ({desafios.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {desafios.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No hay desafíos que coincidan con los filtros
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Deporte</TableHead>
                  <TableHead>Cancha</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Creador</TableHead>
                  <TableHead>Equipos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {desafios.map((desafio) => (
                  <TableRow key={desafio.id}>
                    <TableCell className="font-mono text-xs">
                      {desafio.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>{desafio.deporte.nombre}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{desafio.reserva.disponibilidad.cancha.nombre}</p>
                        <p className="text-muted-foreground text-xs">
                          {desafio.reserva.disponibilidad.cancha.club.nombre}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(desafio.reserva.fechaHora).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {desafio.creador.nombre} {desafio.creador.apellido}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {desafio.jugadoresCreador.length} vs {desafio.jugadoresDesafiados.length}
                      </div>
                    </TableCell>
                    <TableCell>{getEstadoBadge(desafio.estado)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewDetail(desafio)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {desafio.estado !== 'finalizado' && desafio.estado !== 'cancelado' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCancelarDesafio(desafio.id)}
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/desafios/${desafio.id}`)}
                        >
                          Ver Detalle
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

      {/* Modal de Detalle Rápido */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle del Desafío</DialogTitle>
          </DialogHeader>

          {selectedDesafio && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Deporte</p>
                  <p className="font-semibold">{selectedDesafio.deporte.nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  {getEstadoBadge(selectedDesafio.estado)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cancha</p>
                  <p className="font-semibold">{selectedDesafio.reserva.disponibilidad.cancha.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedDesafio.reserva.disponibilidad.cancha.club.nombre}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-semibold">
                    {new Date(selectedDesafio.reserva.fechaHora).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm font-semibold mb-2">Equipo Creador</p>
                  <p className="text-xs text-muted-foreground mb-1">Capitán:</p>
                  <p className="text-sm">
                    {selectedDesafio.creador.nombre} {selectedDesafio.creador.apellido}
                  </p>
                  {selectedDesafio.jugadoresCreador.length > 0 && (
                    <>
                      <p className="text-xs text-muted-foreground mt-2 mb-1">Jugadores:</p>
                      <ul className="text-sm space-y-1">
                        {selectedDesafio.jugadoresCreador.map((j) => (
                          <li key={j.id}>• {j.nombre} {j.apellido}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  {selectedDesafio.invitadosCreador.length > 0 && (
                    <>
                      <p className="text-xs text-muted-foreground mt-2 mb-1">Invitados:</p>
                      <ul className="text-sm space-y-1 opacity-60">
                        {selectedDesafio.invitadosCreador.map((i) => (
                          <li key={i.id}>• {i.nombre} {i.apellido} (pendiente)</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">Equipo Desafiado</p>
                  {selectedDesafio.jugadoresDesafiados.length > 0 ? (
                    <>
                      <p className="text-xs text-muted-foreground mb-1">Jugadores:</p>
                      <ul className="text-sm space-y-1">
                        {selectedDesafio.jugadoresDesafiados.map((j) => (
                          <li key={j.id}>• {j.nombre} {j.apellido}</li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sin jugadores confirmados</p>
                  )}
                  {selectedDesafio.invitadosDesafiados.length > 0 && (
                    <>
                      <p className="text-xs text-muted-foreground mt-2 mb-1">Invitados:</p>
                      <ul className="text-sm space-y-1 opacity-60">
                        {selectedDesafio.invitadosDesafiados.map((i) => (
                          <li key={i.id}>• {i.nombre} {i.apellido} (pendiente)</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>

              {selectedDesafio.estado === 'finalizado' && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-semibold mb-2">Resultado</p>
                  <p className="text-lg font-bold">
                    Ganador: {selectedDesafio.ganador === 'creador' ? 'Equipo Creador' : 'Equipo Desafiado'}
                  </p>
                  {selectedDesafio.golesCreador !== null && selectedDesafio.golesDesafiado !== null && (
                    <p className="text-2xl font-bold text-muted-foreground">
                      {selectedDesafio.golesCreador} - {selectedDesafio.golesDesafiado}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/desafios/${selectedDesafio.id}`)}
                  className="flex-1"
                >
                  Ver Página Completa
                </Button>
                {selectedDesafio.estado !== 'finalizado' && selectedDesafio.estado !== 'cancelado' && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setShowDetailModal(false)
                      handleCancelarDesafio(selectedDesafio.id)
                    }}
                    className="flex-1"
                  >
                    Cancelar Desafío
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
