'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import apiClient, { Desafio, Persona } from '@/lib/api-client'
import { useAuth } from '@/components/auth/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trophy, Calendar, MapPin, Users, UserPlus, XCircle, CheckCircle, Star, ArrowLeft, Clock, Flame } from 'lucide-react'

export default function DesafioDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [desafio, setDesafio] = useState<Desafio | null>(null)
  const [todosDesafios, setTodosDesafios] = useState<Desafio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showFinalizarModal, setShowFinalizarModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Persona[]>([])
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([])
  const [inviteSide, setInviteSide] = useState<'creador' | 'desafiado'>('creador')

  // Finalizar desafío form
  const [ganadorLado, setGanadorLado] = useState<'creador' | 'desafiado'>('creador')
  const [resultado, setResultado] = useState('')
  const [valoracion, setValoracion] = useState<number>(0)

  const { isAuthenticated, personaId, isAdmin } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (id) {
      loadDesafio()
      loadTodosDesafios()
    }
  }, [id, router, isAuthenticated])

  const loadDesafio = async () => {
    setLoading(true)
    setError(null)
    const response = await apiClient.getDesafio(id)

    if (response.error) {
      setError(response.error)
    } else if (response.data) {
      setDesafio(response.data)
    }
    setLoading(false)
  }

  const loadTodosDesafios = async () => {
    const response = await apiClient.getDesafios()
    if (response.data) {
      setTodosDesafios(response.data)
    }
  }

  const handleSearch = async (query: string) => {
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

  const handleInvite = async () => {
    if (!desafio || selectedPersonas.length === 0) return

    const response = await apiClient.agregarJugadoresDesafio(desafio.id, {
      lado: inviteSide,
      accion: 'invitar',
      jugadoresIds: selectedPersonas
    })

    if (response.error) {
      alert(response.error)
    } else {
      setShowInviteModal(false)
      setSelectedPersonas([])
      setSearchQuery('')
      setSearchResults([])
      loadDesafio()
    }
  }

  const handleRemovePlayer = async (personaId: string, lado: 'creador' | 'desafiado') => {
    if (!desafio) return

    const response = await apiClient.agregarJugadoresDesafio(desafio.id, {
      lado,
      accion: 'remover',
      jugadoresIds: [personaId]
    })

    if (response.error) {
      alert(response.error)
    } else {
      loadDesafio()
    }
  }

  const handleCancelar = async () => {
    if (!desafio) return

    if (!confirm('¿Estás seguro de que quieres cancelar este desafío?')) return

    const response = await apiClient.cancelarDesafio(desafio.id)

    if (response.error) {
      alert(response.error)
    } else {
      router.push('/desafios')
    }
  }

  const handleFinalizar = async () => {
    if (!desafio) return

    const response = await apiClient.finalizarDesafio(desafio.id, {
      ganadorLado,
      resultado: resultado || undefined,
      valoracion: valoracion > 0 ? valoracion : undefined
    })

    if (response.error) {
      alert(response.error)
    } else {
      setShowFinalizarModal(false)
      loadDesafio()
    }
  }

  const handleAccept = async () => {
    if (!desafio) return
    const response = await apiClient.aceptarDesafio(desafio.id)
    if (response.error) {
      alert(response.error)
    } else {
      loadDesafio()
    }
  }

  const handleReject = async () => {
    if (!desafio) return
    const response = await apiClient.rechazarDesafio(desafio.id)
    if (response.error) {
      alert(response.error)
    } else {
      router.push('/desafios')
    }
  }

  const canInvite = (lado: 'creador' | 'desafiado'): boolean => {
    if (!desafio || !personaId) return false
    if (isAdmin) return true

    if (lado === 'creador') {
      return (
        desafio.creador?.id === personaId ||
        desafio.jugadoresCreador?.some(j => j.id === personaId) || false
      )
    } else {
      return desafio.jugadoresDesafiados?.some(j => j.id === personaId) || false
    }
  }

  const canCancel = (): boolean => {
    if (!desafio || !personaId) return false
    if (isAdmin) return true
    return desafio.creador?.id === personaId
  }

  const canFinalize = (): boolean => {
    if (!desafio || !personaId) return false
    if (desafio.estado !== 'aceptado') return false

    const isPast = desafio.reserva?.fechaHora ? new Date(desafio.reserva.fechaHora) < new Date() : false
    if (!isPast) return false

    const isParticipant =
      desafio.jugadoresCreador?.some(j => j.id === personaId) ||
      desafio.jugadoresDesafiados?.some(j => j.id === personaId) ||
      false

    return isParticipant
  }

  const isInvited = (): boolean => {
    if (!desafio || !personaId) return false
    return (
      desafio.invitadosCreador?.some(i => i.id === personaId) ||
      desafio.invitadosDesafiados?.some(i => i.id === personaId) ||
      false
    )
  }

  const getEstadoBadge = (estado: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive', icon: any, label: string, color: string }> = {
      pendiente: { variant: 'secondary', icon: Clock, label: 'PENDIENTE', color: 'bg-yellow-500' },
      aceptado: { variant: 'default', icon: CheckCircle, label: 'ACEPTADO', color: 'bg-green-500' },
      finalizado: { variant: 'outline', icon: Trophy, label: 'FINALIZADO', color: 'bg-blue-500' },
      cancelado: { variant: 'destructive', icon: XCircle, label: 'CANCELADO', color: 'bg-red-500' }
    }

    const { variant, icon: Icon, label, color } = config[estado] || config.pendiente

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    )
  }

  // Obtener últimos resultados reales del jugador basado en desafíos finalizados
  const getPlayerStats = (personaIdParam: string): boolean[] => {
    // Filtrar solo desafíos finalizados
    const desafiosFinalizados = todosDesafios.filter(d => d.estado === 'finalizado' && d.ganador)
    
    // Encontrar los desafíos donde este jugador participó
    const desafiosDelJugador = desafiosFinalizados.filter(d => {
      const esCreador = d.creador?.id === personaIdParam
      const esJugadorCreador = d.jugadoresCreador?.some(j => j.id === personaIdParam)
      const esJugadorDesafiado = d.jugadoresDesafiados?.some(j => j.id === personaIdParam)
      
      return esCreador || esJugadorCreador || esJugadorDesafiado
    })

    // Ordenar por fecha (más recientes primero)
    const desafiosOrdenados = desafiosDelJugador.sort((a, b) => {
      const fechaA = a.reserva?.fechaHora ? new Date(a.reserva.fechaHora).getTime() : 0
      const fechaB = b.reserva?.fechaHora ? new Date(b.reserva.fechaHora).getTime() : 0
      return fechaB - fechaA // Más reciente primero
    })

    // Tomar máximo 3 resultados
    const ultimosDesafios = desafiosOrdenados.slice(0, 3)

    // Determinar si ganó cada partido
    const resultados = ultimosDesafios.map(d => {
      const esDelEquipoCreador = 
        d.creador?.id === personaIdParam || 
        d.jugadoresCreador?.some(j => j.id === personaIdParam)
      
      // Si es del equipo creador y el ganador es 'creador', ganó
      // Si es del equipo desafiado y el ganador es 'desafiado', ganó
      if (esDelEquipoCreador) {
        return d.ganador === 'creador'
      } else {
        return d.ganador === 'desafiado'
      }
    })

    return resultados
  }

  const renderPlayerAvatar = (persona: any, size: 'sm' | 'md' | 'lg' = 'md', showStats: boolean = true) => {
    if (!persona) return null
    
    const initials = `${persona.nombre?.[0] || ''}${persona.apellido?.[0] || ''}`.toUpperCase()
    const stats = showStats ? getPlayerStats(persona.id) : []
    const wins = stats.filter(w => w).length
    const losses = stats.length - wins
    
    const sizeClasses = {
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base'
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="relative">
                <Avatar className={`${sizeClasses[size]} border-2 border-background ring-2 ring-primary/20 hover:ring-primary/50 transition-all`}>
                  <AvatarImage src={persona.avatarUrl || `/placeholder-user.png`} alt={`${persona.nombre} ${persona.apellido}`} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-primary-foreground font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                
                {showStats && stats.length > 0 && (
                  <div className="absolute -bottom-1 -right-1 flex gap-0.5 z-10">
                    {stats.slice(0, 3).map((isWin, idx) => (
                      <div
                        key={idx}
                        className={`h-2 w-2 rounded-full ${
                          isWin ? 'bg-green-500' : 'bg-red-500'
                        } ring-1 ring-background shadow-sm`}
                      />
                    ))}
                  </div>
                )}
              </div>
              <span className="font-medium">{persona.nombre} {persona.apellido}</span>
            </div>
          </TooltipTrigger>
          {showStats && stats.length > 0 && (
            <TooltipContent className="z-50 bg-popover border border-border shadow-xl">
              <div className="space-y-1">
                <p className="font-semibold">{persona.nombre} {persona.apellido}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-green-500 font-medium">{wins}W</span>
                  <span className="text-muted-foreground">-</span>
                  <span className="text-red-500 font-medium">{losses}L</span>
                  <span className="text-muted-foreground">(últimos {stats.length})</span>
                </div>
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Trophy className="h-12 w-12 mx-auto animate-bounce text-primary" />
            <p className="text-muted-foreground">Cargando desafío...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !desafio) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardContent className="py-16 text-center">
            <XCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
            <p className="text-xl font-semibold mb-2">Error al cargar el desafío</p>
            <p className="text-muted-foreground mb-6">{error || 'Desafío no encontrado'}</p>
            <Button onClick={() => router.push('/desafios')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Desafíos
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header mejorado con gradiente */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 border border-primary/20">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="relative flex justify-between items-start">
          <div className="space-y-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/desafios')}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-xl">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Detalle del Desafío</h1>
                <p className="text-lg text-muted-foreground">{desafio.deporte?.nombre || 'Sin deporte'}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getEstadoBadge(desafio.estado)}
          </div>
        </div>
      </div>

      {/* Información del partido y acciones */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Información del Partido - 2 columnas */}
        <Card className="lg:col-span-2 border-2">
          <CardHeader className="bg-gradient-to-br from-muted/50 to-background">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Información del Partido
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Ubicación */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase">
                  <MapPin className="h-4 w-4" />
                  Ubicación
                </div>
                <div className="pl-6">
                  <p className="font-bold text-lg">{desafio.reserva?.disponibilidad?.cancha?.club?.nombre || 'Club'}</p>
                  <p className="text-muted-foreground">{desafio.reserva?.disponibilidad?.cancha?.nombre || 'Cancha'}</p>
                </div>
              </div>

              {/* Fecha y Hora */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase">
                  <Calendar className="h-4 w-4" />
                  Fecha y Hora
                </div>
                <div className="pl-6">
                  <p className="font-bold text-lg">
                    {desafio.reserva?.fechaHora ? new Date(desafio.reserva.fechaHora).toLocaleDateString('es-AR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    }) : 'Fecha no disponible'}
                  </p>
                  <p className="text-muted-foreground">
                    {desafio.reserva?.disponibilidad?.horario?.horaInicio || '--:--'} - {desafio.reserva?.disponibilidad?.horario?.horaFin || '--:--'}
                  </p>
                </div>
              </div>
            </div>

            {/* Resultado Final */}
            {desafio.estado === 'finalizado' && desafio.ganador && (
              <div className="mt-6 pt-6 border-t">
                <div className="bg-gradient-to-br from-yellow-500/10 to-transparent rounded-xl p-6 border border-yellow-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-8 w-8 text-yellow-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Ganador</p>
                        <p className="text-2xl font-bold">
                          {desafio.ganador === 'creador' ? 'Equipo Creador' : 'Equipo Desafiado'}
                        </p>
                      </div>
                    </div>
                    {desafio.golesCreador !== null && desafio.golesDesafiado !== null && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Resultado</p>
                        <p className="text-4xl font-bold">
                          {desafio.golesCreador} - {desafio.golesDesafiado}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Acciones - 1 columna */}
        <Card className="border-2">
          <CardHeader className="bg-gradient-to-br from-muted/50 to-background">
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              Acciones
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            {isInvited() && desafio.estado === 'pendiente' && (
              <div className="space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm font-semibold">Has sido invitado a este desafío</p>
                <div className="flex gap-2">
                  <Button onClick={handleAccept} className="flex-1 bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aceptar
                  </Button>
                  <Button onClick={handleReject} variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50">
                    <XCircle className="h-4 w-4 mr-2" />
                    Rechazar
                  </Button>
                </div>
              </div>
            )}

            {canFinalize() && (
              <Dialog open={showFinalizarModal} onOpenChange={setShowFinalizarModal}>
                <DialogTrigger asChild>
                  <Button className="w-full" size="lg">
                    <Trophy className="h-5 w-5 mr-2" />
                    Cargar Resultado
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      Finalizar Desafío
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>¿Quién ganó?</Label>
                      <Select value={ganadorLado} onValueChange={(v: any) => setGanadorLado(v)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="creador">Equipo Creador</SelectItem>
                          <SelectItem value="desafiado">Equipo Desafiado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Resultado (opcional)</Label>
                      <Input
                        className="mt-2"
                        placeholder="7-5"
                        value={resultado}
                        onChange={(e) => setResultado(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Formato: goles creador - goles desafiado
                      </p>
                    </div>

                    <div>
                      <Label>Valoración del rival (opcional)</Label>
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setValoracion(star)}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <Star
                              className={`h-7 w-7 ${
                                star <= valoracion ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button onClick={handleFinalizar} className="w-full" size="lg">
                      Finalizar Desafío
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {canCancel() && desafio.estado !== 'finalizado' && desafio.estado !== 'cancelado' && (
              <Button onClick={handleCancelar} variant="destructive" className="w-full">
                <XCircle className="h-4 w-4 mr-2" />
                Cancelar Desafío
              </Button>
            )}

            {!isInvited() && !canFinalize() && !canCancel() && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay acciones disponibles</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Equipos */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Equipo Creador */}
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-br from-blue-500/10 to-background border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Equipo Creador
                <Badge variant="secondary" className="ml-2">
                  {(desafio.jugadoresCreador?.length || 0) + 1}
                </Badge>
              </CardTitle>
              {canInvite('creador') && desafio.estado !== 'finalizado' && desafio.estado !== 'cancelado' && (
                <Dialog open={showInviteModal && inviteSide === 'creador'} onOpenChange={(open) => {
                  if (open) setInviteSide('creador')
                  setShowInviteModal(open)
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invitar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invitar Jugadores</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Buscar jugadores</Label>
                        <Input
                          className="mt-2"
                          placeholder="Nombre, apellido o email..."
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                        />
                      </div>

                      {searchResults.length > 0 && (
                        <div className="max-h-60 overflow-y-auto space-y-2">
                          {searchResults.map((persona) => (
                            <div
                              key={persona.id}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                            >
                              <span className="font-medium">{persona.nombre} {persona.apellido}</span>
                              <input
                                type="checkbox"
                                checked={selectedPersonas.includes(persona.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedPersonas([...selectedPersonas, persona.id])
                                  } else {
                                    setSelectedPersonas(selectedPersonas.filter(id => id !== persona.id))
                                  }
                                }}
                                className="h-4 w-4"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <Button onClick={handleInvite} disabled={selectedPersonas.length === 0} className="w-full">
                        Invitar Seleccionados ({selectedPersonas.length})
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {/* Capitán */}
              <div className="p-3 bg-gradient-to-r from-blue-500/10 to-transparent rounded-lg border border-blue-500/20">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Capitán</p>
                {renderPlayerAvatar(desafio.creador, 'md')}
              </div>

              {/* Jugadores confirmados */}
              {desafio.jugadoresCreador && desafio.jugadoresCreador.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Jugadores confirmados</p>
                  <div className="space-y-2">
                    {desafio.jugadoresCreador.map((jugador) => (
                      <div key={jugador.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                        {renderPlayerAvatar(jugador, 'sm')}
                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemovePlayer(jugador.id, 'creador')}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invitados pendientes */}
              {desafio.invitadosCreador && desafio.invitadosCreador.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Invitados pendientes</p>
                  <div className="space-y-2">
                    {desafio.invitadosCreador.map((invitado) => (
                      <div key={invitado.id} className="flex items-center justify-between p-3 border rounded-lg opacity-60 bg-muted/30">
                        {renderPlayerAvatar(invitado, 'sm')}
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Pendiente
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Equipo Desafiado */}
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-br from-red-500/10 to-background border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-red-500" />
                Equipo Desafiado
                <Badge variant="secondary" className="ml-2">
                  {desafio.jugadoresDesafiados?.length || 0}
                </Badge>
              </CardTitle>
              {canInvite('desafiado') && desafio.estado !== 'finalizado' && desafio.estado !== 'cancelado' && (
                <Dialog open={showInviteModal && inviteSide === 'desafiado'} onOpenChange={(open) => {
                  if (open) setInviteSide('desafiado')
                  setShowInviteModal(open)
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invitar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invitar Jugadores</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Buscar jugadores</Label>
                        <Input
                          className="mt-2"
                          placeholder="Nombre, apellido o email..."
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                        />
                      </div>

                      {searchResults.length > 0 && (
                        <div className="max-h-60 overflow-y-auto space-y-2">
                          {searchResults.map((persona) => (
                            <div
                              key={persona.id}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                            >
                              <span className="font-medium">{persona.nombre} {persona.apellido}</span>
                              <input
                                type="checkbox"
                                checked={selectedPersonas.includes(persona.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedPersonas([...selectedPersonas, persona.id])
                                  } else {
                                    setSelectedPersonas(selectedPersonas.filter(id => id !== persona.id))
                                  }
                                }}
                                className="h-4 w-4"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <Button onClick={handleInvite} disabled={selectedPersonas.length === 0} className="w-full">
                        Invitar Seleccionados ({selectedPersonas.length})
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {desafio.jugadoresDesafiados && desafio.jugadoresDesafiados.length > 0 ? (
                <>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Jugadores confirmados</p>
                  <div className="space-y-2">
                    {desafio.jugadoresDesafiados.map((jugador) => (
                      <div key={jugador.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                        {renderPlayerAvatar(jugador, 'sm')}
                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemovePlayer(jugador.id, 'desafiado')}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground font-medium">No hay jugadores confirmados aún</p>
                  <p className="text-xs text-muted-foreground mt-1">Invita jugadores para formar el equipo</p>
                </div>
              )}

              {/* Invitados pendientes */}
              {desafio.invitadosDesafiados && desafio.invitadosDesafiados.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 mt-4">Invitados pendientes</p>
                  <div className="space-y-2">
                    {desafio.invitadosDesafiados.map((invitado) => (
                      <div key={invitado.id} className="flex items-center justify-between p-3 border rounded-lg opacity-60 bg-muted/30">
                        {renderPlayerAvatar(invitado, 'sm')}
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Pendiente
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
