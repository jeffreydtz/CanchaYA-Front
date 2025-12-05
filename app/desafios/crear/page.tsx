'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import apiClient, { Reserva, Deporte, Persona, CrearDesafioDto } from '@/lib/api-client'
import { useAuth } from '@/components/auth/auth-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Trophy, Calendar, MapPin, Users, UserPlus, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const createDesafioSchema = z.object({
  reservaId: z.string().min(1, 'Debe seleccionar una reserva'),
  deporteId: z.string().min(1, 'Debe seleccionar un deporte'),
  invitadosDesafiadosIds: z.array(z.string()).min(1, 'Debe invitar al menos un jugador rival'),
  jugadoresCreadorIds: z.array(z.string()).optional()
})

type CreateDesafioForm = z.infer<typeof createDesafioSchema>

export default function CrearDesafioPage() {
  const router = useRouter()
  const { isAuthenticated, personaId } = useAuth()

  const [reservas, setReservas] = useState<Reserva[]>([])
  const [deportes, setDeportes] = useState<Deporte[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Search states
  const [searchQueryRival, setSearchQueryRival] = useState('')
  const [searchResultsRival, setSearchResultsRival] = useState<Persona[]>([])
  const [selectedRivales, setSelectedRivales] = useState<Persona[]>([])

  const [searchQueryCompaneros, setSearchQueryCompaneros] = useState('')
  const [searchResultsCompaneros, setSearchResultsCompaneros] = useState<Persona[]>([])
  const [selectedCompaneros, setSelectedCompaneros] = useState<Persona[]>([])

  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<CreateDesafioForm>({
    resolver: zodResolver(createDesafioSchema),
    defaultValues: {
      invitadosDesafiadosIds: [],
      jugadoresCreadorIds: []
    }
  })

  const reservaId = watch('reservaId')
  const deporteId = watch('deporteId')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadInitialData()
  }, [router])

  useEffect(() => {
    if (reservaId) {
      const reserva = reservas.find(r => r.id === reservaId)
      setSelectedReserva(reserva || null)
    }
  }, [reservaId, reservas])

  const loadInitialData = async () => {
    setLoading(true)
    setError(null)

    // Load reservas and deportes in parallel
    const [reservasRes, deportesRes] = await Promise.all([
      apiClient.getReservas(),
      apiClient.getDeportes()
    ])

    if (reservasRes.error) {
      setError(reservasRes.error)
    } else if (reservasRes.data) {
      // Filter only confirmed, future reservas without challenges
      const now = new Date()
      const availableReservas = reservasRes.data.filter(r => {
        const fechaReserva = new Date(r.fechaHora)
        return r.estado === 'confirmada' && fechaReserva > now
      })
      setReservas(availableReservas)
    }

    if (deportesRes.data) {
      setDeportes(deportesRes.data)
    }

    setLoading(false)
  }

  const handleSearchRival = async (query: string) => {
    setSearchQueryRival(query)
    if (query.length < 2) {
      setSearchResultsRival([])
      return
    }

    const response = await apiClient.searchPersonas(query)
    if (response.data) {
      // Filter out already selected rivals, companions, and self
      const filtered = response.data.filter(p =>
        p.id !== personaId &&
        !selectedRivales.some(r => r.id === p.id) &&
        !selectedCompaneros.some(c => c.id === p.id)
      )
      setSearchResultsRival(filtered)
    }
  }

  const handleSearchCompaneros = async (query: string) => {
    setSearchQueryCompaneros(query)
    if (query.length < 2) {
      setSearchResultsCompaneros([])
      return
    }

    const response = await apiClient.searchPersonas(query)
    if (response.data) {
      // Filter out already selected companions, rivals, and self
      const filtered = response.data.filter(p =>
        p.id !== personaId &&
        !selectedCompaneros.some(c => c.id === p.id) &&
        !selectedRivales.some(r => r.id === p.id)
      )
      setSearchResultsCompaneros(filtered)
    }
  }

  const handleAddRival = (persona: Persona) => {
    const updated = [...selectedRivales, persona]
    setSelectedRivales(updated)
    setValue('invitadosDesafiadosIds', updated.map(p => p.id))
    setSearchQueryRival('')
    setSearchResultsRival([])
  }

  const handleRemoveRival = (personaId: string) => {
    const updated = selectedRivales.filter(p => p.id !== personaId)
    setSelectedRivales(updated)
    setValue('invitadosDesafiadosIds', updated.map(p => p.id))
  }

  const handleAddCompanero = (persona: Persona) => {
    const updated = [...selectedCompaneros, persona]
    setSelectedCompaneros(updated)
    setValue('jugadoresCreadorIds', updated.map(p => p.id))
    setSearchQueryCompaneros('')
    setSearchResultsCompaneros([])
  }

  const handleRemoveCompanero = (personaId: string) => {
    const updated = selectedCompaneros.filter(p => p.id !== personaId)
    setSelectedCompaneros(updated)
    setValue('jugadoresCreadorIds', updated.map(p => p.id))
  }

  const onSubmit = async (data: CreateDesafioForm) => {
    setSubmitting(true)
    setError(null)

    const payload: CrearDesafioDto = {
      reservaId: data.reservaId,
      deporteId: data.deporteId,
      invitadosDesafiadosIds: data.invitadosDesafiadosIds,
      jugadoresCreadorIds: data.jugadoresCreadorIds
    }

    const response = await apiClient.createDesafio(payload)

    if (response.error) {
      setError(response.error)
      setSubmitting(false)
    } else if (response.data) {
      // Success - redirect to the created challenge
      router.push(`/desafios/${response.data.id}`)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/desafios')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Crear Nuevo Desafío
          </h1>
          <p className="text-muted-foreground mt-2">
            Desafía a otros jugadores en un partido competitivo
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Seleccionar Reserva */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              1. Selecciona tu Reserva
            </CardTitle>
            <CardDescription>
              Elige una reserva confirmada y futura para crear el desafío
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reservas.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No tienes reservas confirmadas disponibles
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push('/reservar')}
                >
                  Crear Reserva
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="reservaId">Reserva *</Label>
                  <Select
                    value={reservaId}
                    onValueChange={(value) => setValue('reservaId', value)}
                  >
                    <SelectTrigger id="reservaId">
                      <SelectValue placeholder="Selecciona una reserva" />
                    </SelectTrigger>
                    <SelectContent>
                      {reservas.map((reserva) => (
                        <SelectItem key={reserva.id} value={reserva.id}>
                          {reserva.disponibilidad.cancha.nombre} -{' '}
                          {new Date(reserva.fechaHora).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.reservaId && (
                    <p className="text-sm text-red-600 mt-1">{errors.reservaId.message}</p>
                  )}
                </div>

                {selectedReserva && (
                  <div className="p-4 border rounded-lg bg-accent/50 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {selectedReserva.disponibilidad.cancha.nombre}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(selectedReserva.fechaHora).toLocaleDateString('es-AR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Horario: </span>
                      <span className="font-medium">
                        {selectedReserva.disponibilidad.horario.horaInicio} -{' '}
                        {selectedReserva.disponibilidad.horario.horaFin}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Seleccionar Deporte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              2. Selecciona el Deporte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="deporteId">Deporte *</Label>
              <Select
                value={deporteId}
                onValueChange={(value) => setValue('deporteId', value)}
              >
                <SelectTrigger id="deporteId">
                  <SelectValue placeholder="Selecciona un deporte" />
                </SelectTrigger>
                <SelectContent>
                  {deportes.map((deporte) => (
                    <SelectItem key={deporte.id} value={deporte.id}>
                      {deporte.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.deporteId && (
                <p className="text-sm text-red-600 mt-1">{errors.deporteId.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Invitar Rivales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              3. Invita a tus Rivales
            </CardTitle>
            <CardDescription>
              Mínimo 1 jugador del equipo contrario
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="searchRival">Buscar jugadores</Label>
              <Input
                id="searchRival"
                placeholder="Nombre, apellido o email..."
                value={searchQueryRival}
                onChange={(e) => handleSearchRival(e.target.value)}
              />
            </div>

            {searchResultsRival.length > 0 && (
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {searchResultsRival.map((persona) => (
                  <div
                    key={persona.id}
                    className="flex items-center justify-between p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                    onClick={() => handleAddRival(persona)}
                  >
                    <span>
                      {persona.nombre} {persona.apellido}
                    </span>
                    <Button size="sm" variant="ghost" type="button">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {selectedRivales.length > 0 && (
              <div className="space-y-2">
                <Label>Rivales invitados ({selectedRivales.length})</Label>
                <div className="space-y-2">
                  {selectedRivales.map((persona) => (
                    <div
                      key={persona.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-red-50"
                    >
                      <span className="font-medium">
                        {persona.nombre} {persona.apellido}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={() => handleRemoveRival(persona.id)}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {errors.invitadosDesafiadosIds && (
              <p className="text-sm text-red-600">{errors.invitadosDesafiadosIds.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Invitar Compañeros (Opcional) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              4. Invita a tus Compañeros (Opcional)
            </CardTitle>
            <CardDescription>
              Jugadores de tu equipo. Tú serás agregado automáticamente como capitán.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="searchCompaneros">Buscar compañeros</Label>
              <Input
                id="searchCompaneros"
                placeholder="Nombre, apellido o email..."
                value={searchQueryCompaneros}
                onChange={(e) => handleSearchCompaneros(e.target.value)}
              />
            </div>

            {searchResultsCompaneros.length > 0 && (
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {searchResultsCompaneros.map((persona) => (
                  <div
                    key={persona.id}
                    className="flex items-center justify-between p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                    onClick={() => handleAddCompanero(persona)}
                  >
                    <span>
                      {persona.nombre} {persona.apellido}
                    </span>
                    <Button size="sm" variant="ghost" type="button">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {selectedCompaneros.length > 0 && (
              <div className="space-y-2">
                <Label>Compañeros invitados ({selectedCompaneros.length})</Label>
                <div className="space-y-2">
                  {selectedCompaneros.map((persona) => (
                    <div
                      key={persona.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-green-50"
                    >
                      <span className="font-medium">
                        {persona.nombre} {persona.apellido}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={() => handleRemoveCompanero(persona.id)}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen y Crear */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Resumen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Equipo Creador</p>
                <p className="font-semibold">
                  {personaId && (
                    <Badge variant="default" className="mr-2">Tú (Capitán)</Badge>
                  )}
                  {selectedCompaneros.length > 0 && `+ ${selectedCompaneros.length}`}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Equipo Rival</p>
                <p className="font-semibold">
                  {selectedRivales.length} {selectedRivales.length === 1 ? 'jugador' : 'jugadores'} invitados
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.push('/desafios')}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={submitting || reservas.length === 0}
              >
                {submitting ? 'Creando...' : 'Crear Desafío'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
