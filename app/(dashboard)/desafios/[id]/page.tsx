'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import apiClient, { Desafio, Persona } from '@/lib/api-client'
import { useAuth } from '@/components/auth/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trophy, Calendar, MapPin, Users, UserPlus, XCircle, CheckCircle, Star } from 'lucide-react'

export default function DesafioDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [desafio, setDesafio] = useState<Desafio | null>(null)
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
    }
  }, [id, router])

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
        desafio.creador.id === personaId ||
        desafio.jugadoresCreador.some(j => j.id === personaId)
      )
    } else {
      return desafio.jugadoresDesafiados.some(j => j.id === personaId)
    }
  }

  const canCancel = (): boolean => {
    if (!desafio || !personaId) return false
    if (isAdmin) return true
    return desafio.creador.id === personaId
  }

  const canFinalize = (): boolean => {
    if (!desafio || !personaId) return false
    if (desafio.estado !== 'aceptado') return false

    const isPast = new Date(desafio.reserva.fechaHora) < new Date()
    if (!isPast) return false

    const isParticipant =
      desafio.jugadoresCreador.some(j => j.id === personaId) ||
      desafio.jugadoresDesafiados.some(j => j.id === personaId)

    return isParticipant
  }

  const isInvited = (): boolean => {
    if (!desafio || !personaId) return false
    return (
      desafio.invitadosCreador.some(i => i.id === personaId) ||
      desafio.invitadosDesafiados.some(i => i.id === personaId)
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p>Cargando desafío...</p>
      </div>
    )
  }

  if (error || !desafio) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600">{error || 'Desafío no encontrado'}</p>
            <Button onClick={() => router.push('/desafios')} className="mt-4">
              Volver a Desafíos
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8" />
            Detalle del Desafío
          </h1>
          <Badge className="mt-2" variant={
            desafio.estado === 'pendiente' ? 'secondary' :
            desafio.estado === 'aceptado' ? 'default' :
            desafio.estado === 'finalizado' ? 'outline' : 'destructive'
          }>
            {desafio.estado.toUpperCase()}
          </Badge>
        </div>
        <Button variant="outline" onClick={() => router.push('/desafios')}>
          Volver
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información del Partido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Deporte</p>
              <p className="font-semibold">{desafio.deporte.nombre}</p>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Ubicación</p>
                <p className="font-semibold">{desafio.reserva.disponibilidad.cancha.club.nombre}</p>
                <p className="text-sm">{desafio.reserva.disponibilidad.cancha.nombre}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Fecha y Hora</p>
                <p className="font-semibold">
                  {new Date(desafio.reserva.fechaHora).toLocaleDateString('es-AR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-sm">
                  {desafio.reserva.disponibilidad.horario.horaInicio} -{' '}
                  {desafio.reserva.disponibilidad.horario.horaFin}
                </p>
              </div>
            </div>

            {desafio.estado === 'finalizado' && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">Resultado Final</p>
                <p className="font-bold text-lg">
                  Ganador: {desafio.ganador === 'creador' ? 'Equipo Creador' : 'Equipo Desafiado'}
                </p>
                {desafio.golesCreador !== null && desafio.golesDesafiado !== null && (
                  <p className="text-xl font-semibold">
                    {desafio.golesCreador} - {desafio.golesDesafiado}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isInvited() && desafio.estado === 'pendiente' && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Has sido invitado a este desafío</p>
                <div className="flex gap-2">
                  <Button onClick={handleAccept} className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aceptar
                  </Button>
                  <Button onClick={handleReject} variant="outline" className="flex-1">
                    <XCircle className="h-4 w-4 mr-2" />
                    Rechazar
                  </Button>
                </div>
              </div>
            )}

            {canCancel() && desafio.estado !== 'finalizado' && desafio.estado !== 'cancelado' && (
              <Button onClick={handleCancelar} variant="destructive" className="w-full">
                <XCircle className="h-4 w-4 mr-2" />
                Cancelar Desafío
              </Button>
            )}

            {canFinalize() && (
              <Dialog open={showFinalizarModal} onOpenChange={setShowFinalizarModal}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Trophy className="h-4 w-4 mr-2" />
                    Cargar Resultado
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Finalizar Desafío</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>¿Quién ganó?</Label>
                      <Select value={ganadorLado} onValueChange={(v: any) => setGanadorLado(v)}>
                        <SelectTrigger>
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
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= valoracion ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button onClick={handleFinalizar} className="w-full">
                      Finalizar Desafío
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Equipo Creador</CardTitle>
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
                              className="flex items-center justify-between p-2 border rounded hover:bg-accent"
                            >
                              <span>{persona.nombre} {persona.apellido}</span>
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
          <CardContent>
            <div className="space-y-2">
              <div className="font-semibold">Capitán:</div>
              <div className="flex items-center justify-between p-2 bg-accent rounded">
                <span>{desafio.creador.nombre} {desafio.creador.apellido}</span>
                <Badge>Creador</Badge>
              </div>

              {desafio.jugadoresCreador.length > 0 && (
                <>
                  <div className="font-semibold mt-4">Jugadores confirmados:</div>
                  {desafio.jugadoresCreador.map((jugador) => (
                    <div key={jugador.id} className="flex items-center justify-between p-2 border rounded">
                      <span>{jugador.nombre} {jugador.apellido}</span>
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemovePlayer(jugador.id, 'creador')}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </>
              )}

              {desafio.invitadosCreador.length > 0 && (
                <>
                  <div className="font-semibold mt-4">Invitados pendientes:</div>
                  {desafio.invitadosCreador.map((invitado) => (
                    <div key={invitado.id} className="flex items-center justify-between p-2 border rounded opacity-60">
                      <span>{invitado.nombre} {invitado.apellido}</span>
                      <Badge variant="secondary">Pendiente</Badge>
                    </div>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Equipo Desafiado</CardTitle>
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
                              className="flex items-center justify-between p-2 border rounded hover:bg-accent"
                            >
                              <span>{persona.nombre} {persona.apellido}</span>
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
          <CardContent>
            <div className="space-y-2">
              {desafio.jugadoresDesafiados.length > 0 ? (
                <>
                  <div className="font-semibold">Jugadores confirmados:</div>
                  {desafio.jugadoresDesafiados.map((jugador) => (
                    <div key={jugador.id} className="flex items-center justify-between p-2 border rounded">
                      <span>{jugador.nombre} {jugador.apellido}</span>
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemovePlayer(jugador.id, 'desafiado')}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay jugadores confirmados aún
                </p>
              )}

              {desafio.invitadosDesafiados.length > 0 && (
                <>
                  <div className="font-semibold mt-4">Invitados pendientes:</div>
                  {desafio.invitadosDesafiados.map((invitado) => (
                    <div key={invitado.id} className="flex items-center justify-between p-2 border rounded opacity-60">
                      <span>{invitado.nombre} {invitado.apellido}</span>
                      <Badge variant="secondary">Pendiente</Badge>
                    </div>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
