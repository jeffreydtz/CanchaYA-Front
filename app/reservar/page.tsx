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

  // Obtener personaId desde /auth/me endpoint
  useEffect(() => {
    const fetchPersonaId = async () => {
      try {
        const response = await apiClient.getMe()

        console.log('📡 Full /auth/me response:', {
          status: response.status,
          error: response.error,
          data: response.data
        })

        if (response.error) {
          console.error('❌ /auth/me endpoint error:', response.error)
          return
        }

        if (!response.data) {
          console.error('❌ /auth/me returned no data')
          return
        }

        const { personaId, id, email } = response.data

        console.log('🔍 Extracted from /auth/me:', {
          personaId,
          personaIdType: typeof personaId,
          personaIdLength: personaId ? personaId.length : 'null',
          userId: id,
          email
        })

        // Validate UUID format (basic validation)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        const isValidUUID = personaId && uuidRegex.test(personaId)

        console.log('✅ personaId validation:', {
          personaId,
          isValidUUID,
          matches: isValidUUID ? '✓ Valid UUID' : '✗ NOT a valid UUID'
        })

        if (!isValidUUID) {
          console.error('❌ personaId is not a valid UUID:', personaId)
          return
        }

        setPersonaId(personaId)
      } catch (error) {
        console.error('Error fetching personaId from /auth/me:', error)
      }
    }

    fetchPersonaId()
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
      // Build ISO datetime string with proper formatting and timezone
      // Format: YYYY-MM-DDTHH:mm:ss-03:00 (Argentina timezone)
      const [hours, minutes] = slot.horaInicio.split(':')
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      const fechaHora = `${year}-${month}-${day}T${hours}:${minutes}:00-03:00`

      // Validate slot data
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      if (slot.fecha !== dateStr) {
        console.error('❌ Slot fecha mismatch:', {
          slotFecha: slot.fecha,
          expectedFecha: dateStr,
          selectedDate: selectedDate.toISOString()
        })
        toast.error('Error de validación', {
          description: 'La fecha del slot no coincide con la fecha seleccionada'
        })
        return
      }

      // Build payload - send ONLY what backend expects
      // Backend documentation says: personaId is extracted from JWT token
      // So we should NOT send it in the payload
      const requestPayload = {
        disponibilidadId: slot.disponibilidadId,
        fechaHora: fechaHora
      }

      console.log('🔍 Datos de disponibilidad desde slot:', {
        slotId: slot.disponibilidadId,
        slotFecha: slot.fecha,
        slotHoraInicio: slot.horaInicio,
        slotHoraFin: slot.horaFin,
        slotCanchaNombre: slot.canchaNombre,
        slotDisponibilidadId: slot.disponibilidadId
      })

      console.log('📤 Creating reservation with:', {
        payload: requestPayload,
        personaId: personaId,
        horaInicio: slot.horaInicio,
        selectedDate: selectedDate.toISOString(),
        selectedDateDayOfWeek: selectedDate.getDay(),
        fullSlotData: slot,
        expectedFechaHora: fechaHora,
        personaIdStatus: personaId ? '✓ Present' : '✗ Missing (will be from JWT)',
        payloadSize: JSON.stringify(requestPayload).length
      })

      const response = await apiClient.createReserva(requestPayload)

      console.log('📥 Response from backend:', {
        error: response.error,
        status: response.status,
        data: response.data,
        fullResponse: response
      })

      if (response.error) {
        console.error('❌ Backend error response:', {
          error: response.error,
          status: response.status,
          payload: requestPayload
        })
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
          {/* Debug info */}
          {personaId && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 font-mono">
              👤 PersonaID: {personaId.substring(0, 8)}...
            </p>
          )}
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
