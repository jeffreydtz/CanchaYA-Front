'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import apiClient, { Desafio, FiltroDesafioDto, Deporte } from '@/lib/api-client'
import { useAuth } from '@/components/auth/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Trophy, Calendar, MapPin, Users, Plus, Filter, CheckCircle, XCircle, Clock, Flame, TrendingUp, TrendingDown } from 'lucide-react'
import Image from 'next/image'

export default function DesafiosPage() {
  const router = useRouter()
  const { isAuthenticated, personaId } = useAuth()
  const [desafios, setDesafios] = useState<Desafio[]>([])
  const [deportes, setDeportes] = useState<Deporte[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<FiltroDesafioDto>({})
  const [activeTab, setActiveTab] = useState<string>('todos')
  const [selectedDeporte, setSelectedDeporte] = useState<string>('todos')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadDeportes()
  }, [isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      loadDesafios()
    }
  }, [filtro, isAuthenticated])

  const loadDeportes = async () => {
    const response = await apiClient.getDeportes()
    if (response.data) {
      setDeportes(response.data)
    }
  }

  const loadDesafios = async () => {
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

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const newFiltro: FiltroDesafioDto = {}

    if (selectedDeporte !== 'todos') {
      newFiltro.deporteId = selectedDeporte
    }

    if (value === 'pendientes') {
      newFiltro.estado = 'pendiente'
    } else if (value === 'aceptados') {
      newFiltro.estado = 'aceptado'
    } else if (value === 'finalizados') {
      newFiltro.estado = 'finalizado'
    } else if (value === 'cancelados') {
      newFiltro.estado = 'cancelado'
    }

    setFiltro(newFiltro)
  }

  const handleDeporteChange = (value: string) => {
    setSelectedDeporte(value)
    const newFiltro: FiltroDesafioDto = {}

    if (activeTab === 'pendientes') {
      newFiltro.estado = 'pendiente'
    } else if (activeTab === 'aceptados') {
      newFiltro.estado = 'aceptado'
    } else if (activeTab === 'finalizados') {
      newFiltro.estado = 'finalizado'
    } else if (activeTab === 'cancelados') {
      newFiltro.estado = 'cancelado'
    }

    if (value !== 'todos') {
      newFiltro.deporteId = value
    }

    setFiltro(newFiltro)
  }

  const getEstadoBadge = (estado: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive', icon: any, label: string }> = {
      pendiente: { variant: 'secondary', icon: Clock, label: 'PENDIENTE' },
      aceptado: { variant: 'default', icon: CheckCircle, label: 'ACEPTADO' },
      finalizado: { variant: 'outline', icon: Trophy, label: 'FINALIZADO' },
      cancelado: { variant: 'destructive', icon: XCircle, label: 'CANCELADO' }
    }

    const { variant, icon: Icon, label } = config[estado] || config.pendiente

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    )
  }

  const getUserRole = (desafio: Desafio): string => {
    if (!personaId) return 'Espectador'

    if (desafio.creador?.id === personaId) return 'Creador'

    if (desafio.jugadoresCreador?.some(j => j.id === personaId)) return 'Equipo Creador'
    if (desafio.jugadoresDesafiados?.some(j => j.id === personaId)) return 'Equipo Desafiado'

    if (desafio.invitadosCreador?.some(i => i.id === personaId)) return 'Invitado (Creador)'
    if (desafio.invitadosDesafiados?.some(i => i.id === personaId)) return 'Invitado (Desafiado)'

    return 'Espectador'
  }

  const handleAccept = async (desafioId: string) => {
    const response = await apiClient.aceptarDesafio(desafioId)
    if (response.error) {
      alert(response.error)
    } else {
      loadDesafios()
    }
  }

  const handleReject = async (desafioId: string) => {
    const response = await apiClient.rechazarDesafio(desafioId)
    if (response.error) {
      alert(response.error)
    } else {
      loadDesafios()
    }
  }

  // Obtener últimos resultados reales del jugador basado en desafíos finalizados
  const getPlayerStats = (personaId: string): boolean[] => {
    // Filtrar solo desafíos finalizados
    const desafiosFinalizados = desafios.filter(d => d.estado === 'finalizado' && d.ganador)
    
    // Encontrar los desafíos donde este jugador participó
    const desafiosDelJugador = desafiosFinalizados.filter(d => {
      const esCreador = d.creador?.id === personaId
      const esJugadorCreador = d.jugadoresCreador?.some(j => j.id === personaId)
      const esJugadorDesafiado = d.jugadoresDesafiados?.some(j => j.id === personaId)
      
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
        d.creador?.id === personaId || 
        d.jugadoresCreador?.some(j => j.id === personaId)
      
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

  const renderPlayerAvatar = (persona: any, showStats: boolean = true) => {
    if (!persona) return null
    
    const initials = `${persona.nombre?.[0] || ''}${persona.apellido?.[0] || ''}`.toUpperCase()
    const stats = showStats ? getPlayerStats(persona.id) : []
    const wins = stats.filter(w => w).length
    const losses = stats.length - wins

    return (
      <TooltipProvider>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <div className="relative cursor-pointer">
              <Avatar className="h-10 w-10 border-2 border-background ring-2 ring-primary/20 hover:ring-primary/50 transition-all">
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
          </TooltipTrigger>
          <TooltipContent 
            side="bottom" 
            align="center"
            sideOffset={5}
            className="z-[100] bg-popover border border-border shadow-xl px-3 py-2"
          >
            <div className="space-y-1">
              <p className="font-semibold text-sm whitespace-nowrap">{persona.nombre} {persona.apellido}</p>
              {showStats && stats.length > 0 && (
                <div className="flex items-center gap-2 text-xs whitespace-nowrap">
                  <span className="text-green-500 font-medium">{wins}W</span>
                  <span className="text-muted-foreground">-</span>
                  <span className="text-red-500 font-medium">{losses}L</span>
                  <span className="text-muted-foreground">(últimos {stats.length})</span>
                </div>
              )}
            </div>
          </TooltipContent>
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
            <p className="text-muted-foreground">Cargando desafíos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header con gradiente */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 border border-primary/20">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="relative flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/20 rounded-xl">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              Mis Desafíos
            </h1>
            <p className="text-muted-foreground text-lg">
              Gestiona tus partidos competitivos y desafía a otros jugadores
            </p>
          </div>
          <Button 
            size="lg"
            onClick={() => router.push('/desafios/crear')}
            className="shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-5 w-5 mr-2" />
            Crear Desafío
          </Button>
        </div>
      </div>

      {/* Filtros mejorados */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-card rounded-xl p-4 border shadow-sm">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="todos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <span className="hidden sm:inline">Todos</span>
              <span className="sm:hidden">📋</span>
            </TabsTrigger>
            <TabsTrigger value="pendientes" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white">
              <Clock className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Pendientes</span>
            </TabsTrigger>
            <TabsTrigger value="aceptados" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <CheckCircle className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Aceptados</span>
            </TabsTrigger>
            <TabsTrigger value="finalizados" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Trophy className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Finalizados</span>
            </TabsTrigger>
            <TabsTrigger value="cancelados" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
              <XCircle className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Cancelados</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="w-full md:w-64">
          <Select value={selectedDeporte} onValueChange={handleDeporteChange}>
            <SelectTrigger className="h-10">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filtrar por deporte" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">🏆 Todos los deportes</SelectItem>
              {deportes.map((deporte) => (
                <SelectItem key={deporte.id} value={deporte.id}>
                  {deporte.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid de desafíos mejorado */}
      <div className="mt-6">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {(() => {
          // Aplicar filtros locales adicionales
          let desafiosFiltrados = desafios

          // Filtrar por estado si está seleccionado
          if (activeTab === 'pendientes') {
            desafiosFiltrados = desafiosFiltrados.filter(d => d.estado === 'pendiente')
          } else if (activeTab === 'aceptados') {
            desafiosFiltrados = desafiosFiltrados.filter(d => d.estado === 'aceptado')
          } else if (activeTab === 'finalizados') {
            desafiosFiltrados = desafiosFiltrados.filter(d => d.estado === 'finalizado')
          } else if (activeTab === 'cancelados') {
            desafiosFiltrados = desafiosFiltrados.filter(d => d.estado === 'cancelado')
          }

          // Filtrar por deporte si está seleccionado
          if (selectedDeporte !== 'todos') {
            desafiosFiltrados = desafiosFiltrados.filter(d => d.deporte?.id === selectedDeporte)
          }

          return desafiosFiltrados.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <Trophy className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-xl font-semibold mb-2">No hay desafíos {activeTab !== 'todos' ? activeTab : ''}</p>
                <p className="text-muted-foreground mb-6">
                  {activeTab === 'todos' 
                    ? '¡Crea tu primer desafío y comienza a competir!'
                    : 'Intenta cambiar los filtros o crea un nuevo desafío'}
                </p>
                <Button onClick={() => router.push('/desafios/crear')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Desafío
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {desafiosFiltrados.map((desafio) => {
              const userRole = getUserRole(desafio)
              const isInvited = userRole.includes('Invitado')
              const canAcceptReject = isInvited && desafio.estado === 'pendiente'
              const isCreator = userRole === 'Creador'

              return (
                <Card 
                  key={desafio.id} 
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50 overflow-hidden"
                >
                  {/* Header con deporte y estado */}
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 border-b">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-background rounded-lg">
                          <Trophy className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{desafio.deporte?.nombre || 'Sin deporte'}</h3>
                          <Badge variant="outline" className="mt-1">
                            {userRole}
                          </Badge>
                        </div>
                      </div>
                      {getEstadoBadge(desafio.estado)}
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-4">
                    {/* Ubicación y fecha */}
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {desafio.reserva?.disponibilidad?.cancha?.club?.nombre || 'Club'}
                          </p>
                          <p className="text-muted-foreground text-xs truncate">
                            {desafio.reserva?.disponibilidad?.cancha?.nombre || 'Cancha'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">
                          {desafio.reserva?.fechaHora ? new Date(desafio.reserva.fechaHora).toLocaleDateString('es-AR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Fecha no disponible'}
                        </span>
                      </div>
                    </div>

                    {/* Equipos con avatares */}
                    <div className="space-y-3 pt-3 border-t">
                      {/* Equipo Creador */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-muted-foreground uppercase">Equipo Creador</span>
                          <Badge variant="secondary" className="text-xs">
                            {(desafio.jugadoresCreador?.length || 0) + 1}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                          {desafio.creador && renderPlayerAvatar(desafio.creador, true)}
                          {desafio.jugadoresCreador?.slice(0, 4).map((jugador) => (
                            <div key={jugador.id}>
                              {renderPlayerAvatar(jugador, true)}
                            </div>
                          ))}
                          {desafio.jugadoresCreador && desafio.jugadoresCreador.length > 4 && (
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                              +{desafio.jugadoresCreador.length - 4}
                            </div>
                          )}
                          {desafio.invitadosCreador && desafio.invitadosCreador.length > 0 && (
                            <Badge variant="outline" className="text-xs ml-2">
                              +{desafio.invitadosCreador.length} invitado{desafio.invitadosCreador.length > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* VS */}
                      <div className="flex items-center justify-center">
                        <div className="px-3 py-1 bg-primary/10 rounded-full text-primary font-bold text-sm">
                          VS
                        </div>
                      </div>

                      {/* Equipo Desafiado */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-muted-foreground uppercase">Equipo Desafiado</span>
                          <Badge variant="secondary" className="text-xs">
                            {desafio.jugadoresDesafiados?.length || 0}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                          {desafio.jugadoresDesafiados && desafio.jugadoresDesafiados.length > 0 ? (
                            <>
                              {desafio.jugadoresDesafiados.slice(0, 5).map((jugador) => (
                                <div key={jugador.id}>
                                  {renderPlayerAvatar(jugador, true)}
                                </div>
                              ))}
                              {desafio.jugadoresDesafiados.length > 5 && (
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                                  +{desafio.jugadoresDesafiados.length - 5}
                                </div>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">Esperando jugadores...</p>
                          )}
                          {desafio.invitadosDesafiados && desafio.invitadosDesafiados.length > 0 && (
                            <Badge variant="outline" className="text-xs ml-2">
                              +{desafio.invitadosDesafiados.length} invitado{desafio.invitadosDesafiados.length > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Resultado final */}
                    {desafio.estado === 'finalizado' && desafio.ganador && (
                      <div className="pt-3 border-t bg-gradient-to-br from-primary/5 to-transparent rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            <div>
                              <p className="text-xs text-muted-foreground">Ganador</p>
                              <p className="font-bold text-sm">
                                {desafio.ganador === 'creador' ? 'Equipo Creador' : 'Equipo Desafiado'}
                              </p>
                            </div>
                          </div>
                          {desafio.golesCreador !== null && desafio.golesDesafiado !== null && (
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Resultado</p>
                              <p className="text-2xl font-bold">
                                {desafio.golesCreador} - {desafio.golesDesafiado}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="flex gap-2 pt-2">
                      {canAcceptReject && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAccept(desafio.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aceptar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(desafio.id)}
                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rechazar
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant={canAcceptReject ? "ghost" : "default"}
                        onClick={() => router.push(`/desafios/${desafio.id}`)}
                        className={canAcceptReject ? 'w-auto' : 'w-full'}
                      >
                        Ver Detalle
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
              })}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
