'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import apiClient, { Reserva, Deporte, Persona } from '@/lib/api-client'
import { Search, UserPlus, X, Calendar, MapPin } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate, formatTime } from '@/lib/date-utils'

interface CreateChallengeDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateChallengeDialog({
  open,
  onClose,
  onSuccess,
}: CreateChallengeDialogProps) {
  const [step, setStep] = useState(1)
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [deportes, setDeportes] = useState<Deporte[]>([])
  const [selectedReserva, setSelectedReserva] = useState<string>('')
  const [selectedDeporte, setSelectedDeporte] = useState<string>('')
  const [invitados, setInvitados] = useState<Persona[]>([])
  const [compañeros, setCompañeros] = useState<Persona[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Persona[]>([])
  const [searchMode, setSearchMode] = useState<'invitados' | 'compañeros'>('invitados')
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load reservas and deportes on mount
  useEffect(() => {
    if (open) {
      loadInitialData()
    }
  }, [open])

  const loadInitialData = async () => {
    setIsLoading(true)
    try {
      // Load user's reservas
      const reservasResponse = await apiClient.getReservas()
      if (reservasResponse.error) {
        toast.error('Error al cargar reservas: ' + reservasResponse.error)
      } else if (reservasResponse.data) {
        // Filter: only future reservas, confirmed or pending
        const futureReservas = reservasResponse.data.filter(r => {
          const reservaDate = new Date(r.fechaHora)
          return reservaDate > new Date() && (r.estado === 'confirmada' || r.estado === 'pendiente')
        })
        setReservas(futureReservas)
      }

      // Load deportes
      const deportesResponse = await apiClient.getDeportes()
      if (deportesResponse.error) {
        toast.error('Error al cargar deportes: ' + deportesResponse.error)
      } else if (deportesResponse.data) {
        setDeportes(deportesResponse.data)
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
      toast.error('Error al cargar datos')
    } finally {
      setIsLoading(false)
    }
  }

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const response = await apiClient.searchPersonas(searchQuery)
        if (response.error) {
          toast.error(response.error)
          return
        }

        if (response.data) {
          // Filter out already selected players
          const selectedIds = [
            ...invitados.map(p => p.id),
            ...compañeros.map(p => p.id),
          ]
          const filtered = response.data.filter(p => !selectedIds.includes(p.id))
          setSearchResults(filtered)
        }
      } catch (error) {
        console.error('Error searching personas:', error)
        toast.error('Error al buscar jugadores')
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, invitados, compañeros])

  const handleAddPlayer = (player: Persona) => {
    if (searchMode === 'invitados') {
      setInvitados(prev => [...prev, player])
    } else {
      setCompañeros(prev => [...prev, player])
    }
    setSearchResults(prev => prev.filter(p => p.id !== player.id))
    setSearchQuery('')
  }

  const handleRemoveInvitado = (playerId: string) => {
    setInvitados(prev => prev.filter(p => p.id !== playerId))
  }

  const handleRemoveCompañero = (playerId: string) => {
    setCompañeros(prev => prev.filter(p => p.id !== playerId))
  }

  const handleNext = () => {
    if (step === 1) {
      if (!selectedReserva) {
        toast.error('Debes seleccionar una reserva')
        return
      }
      if (!selectedDeporte) {
        toast.error('Debes seleccionar un deporte')
        return
      }
      setStep(2)
    }
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
    }
  }

  const handleSubmit = async () => {
    if (invitados.length === 0) {
      toast.error('Debes invitar al menos un jugador')
      return
    }

    setIsSubmitting(true)
    try {
      const data = {
        reservaId: selectedReserva,
        deporteId: selectedDeporte,
        invitadosDesafiadosIds: invitados.map(p => p.id),
        jugadoresCreadorIds: compañeros.length > 0 ? compañeros.map(p => p.id) : undefined,
      }

      const response = await apiClient.createDesafio(data)

      if (response.error) {
        // Show specific error messages
        if (response.error.includes('Ya hay un desafío')) {
          toast.error('Ya existe un desafío para esta reserva')
        } else if (response.error.includes('reserva pasada')) {
          toast.error('No se puede crear un desafío con una reserva pasada')
        } else {
          toast.error(response.error)
        }
        return
      }

      toast.success('Desafío creado exitosamente')
      onSuccess()
      handleClose()
    } catch (error) {
      console.error('Error creating challenge:', error)
      toast.error('No se pudo crear el desafío')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setStep(1)
    setSelectedReserva('')
    setSelectedDeporte('')
    setInvitados([])
    setCompañeros([])
    setSearchQuery('')
    setSearchResults([])
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear nuevo desafío</DialogTitle>
          <DialogDescription>
            {step === 1 ? 'Selecciona una reserva y deporte' : 'Invita jugadores a tu desafío'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Cargando...
          </div>
        ) : (
          <>
            {/* Step 1: Select reservation and sport */}
            {step === 1 && (
              <div className="space-y-4 py-4">
                {/* Reservation selector */}
                <div className="space-y-2">
                  <Label>Selecciona una reserva</Label>
                  {reservas.length === 0 ? (
                    <div className="text-sm text-muted-foreground p-4 border rounded-lg text-center">
                      No tienes reservas futuras disponibles.
                      <br />
                      <Button variant="link" asChild className="mt-2">
                        <a href="/dashboard/reservations">Crear reserva</a>
                      </Button>
                    </div>
                  ) : (
                    <Select value={selectedReserva} onValueChange={setSelectedReserva}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una reserva" />
                      </SelectTrigger>
                      <SelectContent>
                        {reservas.map(reserva => (
                          <SelectItem key={reserva.id} value={reserva.id}>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {formatDate(reserva.fechaHora)} - {formatTime(reserva.fechaHora)}
                              <MapPin className="h-4 w-4 ml-2" />
                              {reserva.disponibilidad?.cancha?.nombre}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Sport selector */}
                <div className="space-y-2">
                  <Label>Selecciona el deporte</Label>
                  {deportes.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No hay deportes disponibles
                    </div>
                  ) : (
                    <Select value={selectedDeporte} onValueChange={setSelectedDeporte}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un deporte" />
                      </SelectTrigger>
                      <SelectContent>
                        {deportes.map(deporte => (
                          <SelectItem key={deporte.id} value={deporte.id}>
                            {deporte.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Invite players */}
            {step === 2 && (
              <div className="space-y-4 py-4">
                {/* Search mode selector */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={searchMode === 'invitados' ? 'default' : 'outline'}
                    onClick={() => setSearchMode('invitados')}
                    className="flex-1"
                  >
                    Invitar rivales
                  </Button>
                  <Button
                    type="button"
                    variant={searchMode === 'compañeros' ? 'default' : 'outline'}
                    onClick={() => setSearchMode('compañeros')}
                    className="flex-1"
                  >
                    Agregar compañeros
                  </Button>
                </div>

                {/* Search input */}
                <div className="space-y-2">
                  <Label htmlFor="search">
                    {searchMode === 'invitados' ? 'Buscar rivales' : 'Buscar compañeros'}
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Nombre, apellido o email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Search results */}
                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-lg p-2">
                    {searchResults.map(person => (
                      <div
                        key={person.id}
                        className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                        onClick={() => handleAddPlayer(person)}
                      >
                        <div>
                          <div className="font-medium text-sm">
                            {person.nombre} {person.apellido}
                          </div>
                          <div className="text-xs text-muted-foreground">{person.email}</div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {isSearching && (
                  <div className="text-sm text-muted-foreground text-center">
                    Buscando...
                  </div>
                )}

                {/* Invited players */}
                <div className="space-y-2">
                  <Label>
                    Rivales invitados ({invitados.length})
                    {invitados.length === 0 && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {invitados.length === 0 ? (
                    <div className="text-sm text-muted-foreground p-3 border rounded-lg text-center">
                      Debes invitar al menos un rival
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {invitados.map(player => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <div className="text-sm">
                            {player.nombre} {player.apellido}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveInvitado(player.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Teammates (optional) */}
                {compañeros.length > 0 && (
                  <div className="space-y-2">
                    <Label>Compañeros de equipo ({compañeros.length})</Label>
                    <div className="space-y-1">
                      {compañeros.map(player => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <div className="text-sm">
                            {player.nombre} {player.apellido}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveCompañero(player.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <DialogFooter>
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleNext}
                disabled={!selectedReserva || !selectedDeporte || isLoading}
              >
                Siguiente
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                Atrás
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={invitados.length === 0 || isSubmitting}
              >
                {isSubmitting ? 'Creando...' : 'Crear desafío'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
