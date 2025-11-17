"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { toast } from 'sonner'
import apiClient, { Club, Cancha, AvailabilitySlot } from '@/lib/api-client'
import { Loader2, MapPin, Trophy, Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getCookie } from '@/lib/auth'
import { jwtDecode } from 'jwt-decode'

export default function ReservarPage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [canchas, setCanchas] = useState<Cancha[]>([])
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([])
  const [selectedClub, setSelectedClub] = useState<string>('')
  const [selectedCancha, setSelectedCancha] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [loading, setLoading] = useState(false)
  const [canchasLoading, setCanchasLoading] = useState(false)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [reserving, setReserving] = useState<string | null>(null)
  const [personaId, setPersonaId] = useState<string | null>(null)

  // Obtener personaId del token
  useEffect(() => {
    const token = getCookie('token')
    if (token) {
      try {
        const decoded: any = jwtDecode(token)
        setPersonaId(decoded.personaId || null)
      } catch (error) {
        console.error('Error decoding token:', error)
      }
    }
  }, [])

  // Cargar clubes al inicio
  useEffect(() => {
    const loadClubs = async () => {
      setLoading(true)
      try {
        const response = await apiClient.getClubes()
        if (response.data) {
          setClubs(response.data)
        }
      } catch (error) {
        toast.error('Error al cargar clubes')
      } finally {
        setLoading(false)
      }
    }
    loadClubs()
  }, [])

  // Cargar canchas cuando se selecciona un club
  useEffect(() => {
    const loadCanchas = async () => {
      if (!selectedClub) {
        setCanchas([])
        setSelectedCancha('')
        setAvailableSlots([])
        return
      }

      setCanchasLoading(true)
      try {
        const response = await apiClient.getCanchasByClub(selectedClub)
        if (response.data) {
          setCanchas(response.data)
        } else {
          setCanchas([])
        }
      } catch (error) {
        toast.error('Error al cargar canchas')
      } finally {
        setCanchasLoading(false)
      }
    }
    loadCanchas()
  }, [selectedClub])

  // Cargar disponibilidad cuando cambia la cancha o la fecha
  useEffect(() => {
    const loadAvailability = async () => {
      if (!selectedCancha || !selectedDate) {
        setAvailableSlots([])
        return
      }

      setSlotsLoading(true)
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd')
        const response = await apiClient.getDisponibilidadDinamica({
          from: dateStr,
          to: dateStr,
          canchaId: selectedCancha
        })

        if (response.data) {
          // Filtrar por la fecha seleccionada y ordenar por hora
          const slots = response.data
            .filter(slot => slot.fecha === dateStr)
            .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
          setAvailableSlots(slots)
        } else {
          setAvailableSlots([])
        }
      } catch (error) {
        toast.error('Error al cargar horarios disponibles')
        setAvailableSlots([])
      } finally {
        setSlotsLoading(false)
      }
    }
    loadAvailability()
  }, [selectedCancha, selectedDate])

  const handleReserve = async (slot: AvailabilitySlot) => {
    if (!personaId) {
      toast.error('Debes iniciar sesión para hacer una reserva')
      return
    }

    if (!selectedDate) {
      toast.error('Debes seleccionar una fecha')
      return
    }

    setReserving(slot.disponibilidadId)
    try {
      // Construir la fechaHora en formato ISO con timezone de Argentina
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const fechaHora = `${dateStr}T${slot.horaInicio}:00-03:00`

      const response = await apiClient.createReserva({
        personaId: personaId,
        disponibilidadId: slot.disponibilidadId,
        fechaHora: fechaHora
      })

      if (response.error) {
        toast.error('Error al crear reserva', {
          description: response.error
        })
        return
      }

      toast.success('¡Reserva creada exitosamente!', {
        description: `${slot.canchaNombre} - ${format(selectedDate, "dd 'de' MMMM", { locale: es })} a las ${slot.horaInicio}`
      })

      // Recargar disponibilidad
      const dateStr2 = format(selectedDate, 'yyyy-MM-dd')
      const availResponse = await apiClient.getDisponibilidadDinamica({
        from: dateStr2,
        to: dateStr2,
        canchaId: selectedCancha
      })

      if (availResponse.data) {
        const slots = availResponse.data
          .filter(s => s.fecha === dateStr2)
          .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
        setAvailableSlots(slots)
      }
    } catch (error: any) {
      toast.error('Error al crear reserva', {
        description: error.message || 'Ocurrió un error inesperado'
      })
    } finally {
      setReserving(null)
    }
  }

  const selectedCanchaObj = canchas.find(c => c.id === selectedCancha)

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Reservar Cancha</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Selecciona un club, cancha y horario para hacer tu reserva
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Club Selection */}
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Club
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedClub} onValueChange={setSelectedClub} disabled={loading}>
                  <SelectTrigger className="border-gray-200 dark:border-gray-700">
                    <SelectValue placeholder="Seleccionar club..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clubs.map((club) => (
                      <SelectItem key={club.id} value={club.id}>
                        {club.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedClub && (
                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {clubs.find(c => c.id === selectedClub)?.direccion}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cancha Selection */}
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Cancha
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedCancha}
                  onValueChange={setSelectedCancha}
                  disabled={!selectedClub || canchasLoading}
                >
                  <SelectTrigger className="border-gray-200 dark:border-gray-700">
                    <SelectValue placeholder={
                      !selectedClub
                        ? "Primero selecciona un club"
                        : canchasLoading
                        ? "Cargando..."
                        : "Seleccionar cancha..."
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {canchas.map((cancha) => (
                      <SelectItem key={cancha.id} value={cancha.id}>
                        {cancha.nombre} - {cancha.deporte.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCanchaObj && (
                  <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p><strong>Deporte:</strong> {selectedCanchaObj.deporte.nombre}</p>
                    <p><strong>Superficie:</strong> {selectedCanchaObj.tipoSuperficie}</p>
                    <p><strong>Precio:</strong> ${selectedCanchaObj.precioPorHora.toLocaleString()}/hora</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Calendar */}
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Fecha
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-md border border-gray-200 dark:border-gray-700"
                  locale={es}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Available Slots */}
          <div className="lg:col-span-2">
            <Card className="border-gray-200 dark:border-gray-800 min-h-[600px]">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Horarios Disponibles
                </CardTitle>
                <CardDescription>
                  {selectedDate && (
                    <span className="text-base font-medium">
                      {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {!selectedCancha ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
                    <Clock className="h-16 w-16 mb-4 text-gray-300 dark:text-gray-700" />
                    <p className="text-lg font-medium">Selecciona un club y una cancha</p>
                    <p className="text-sm">para ver los horarios disponibles</p>
                  </div>
                ) : slotsLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Cargando horarios...</p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
                    <CalendarIcon className="h-16 w-16 mb-4 text-gray-300 dark:text-gray-700" />
                    <p className="text-lg font-medium">No hay horarios disponibles</p>
                    <p className="text-sm">para esta fecha y cancha</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availableSlots.map((slot) => (
                      <Button
                        key={`${slot.disponibilidadId}-${slot.fecha}`}
                        onClick={() => handleReserve(slot)}
                        disabled={reserving !== null}
                        variant="outline"
                        className="h-auto py-4 flex flex-col items-center gap-2 border-2 border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all"
                      >
                        {reserving === slot.disponibilidadId ? (
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        ) : (
                          <>
                            <Clock className="h-5 w-5 text-primary" />
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {slot.horaInicio}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {slot.horaFin}
                            </span>
                          </>
                        )}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
