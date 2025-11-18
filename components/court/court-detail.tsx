"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, DollarSign, Users, Calendar as CalendarIcon, Clock } from 'lucide-react'
import { toast } from 'sonner'
import apiClient, { Cancha, Horario, DisponibilidadHorario } from '@/lib/api-client'
import { getWeekdayName, isDateDisabled, getNextAvailableDate, formatDate } from '@/lib/date-utils'
import Image from 'next/image'

export default function CourtDetail() {
  const params = useParams()
  const { user, isAuthenticated, personaId } = useAuth()
  const [court, setCourt] = useState<Cancha | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(getNextAvailableDate())
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [disponibilidades, setDisponibilidades] = useState<DisponibilidadHorario[]>([])
  const [loading, setLoading] = useState(true)
  const [reserving, setReserving] = useState(false)

  const courtId = params?.id as string

  useEffect(() => {
    const loadCourtData = async () => {
      if (!courtId) return

      try {
        // Fetch court details, horarios, and disponibilidades in parallel
        const [courtResponse, horariosResponse, disponibilidadesResponse] = await Promise.all([
          apiClient.getCanchaById(courtId),
          apiClient.getHorarios(),
          apiClient.getDisponibilidadesByCancha(courtId)
        ])

        if (courtResponse.error) {
          toast.error(courtResponse.error)
          return
        }

        if (courtResponse.data) {
          setCourt(courtResponse.data)
        }

        if (horariosResponse.data) {
          // Filter schedules for this court
          const courtSchedules = horariosResponse.data.filter(h => h.canchaId === courtId)
          setHorarios(courtSchedules)
        }

        if (disponibilidadesResponse.data) {
          setDisponibilidades(disponibilidadesResponse.data)
        }
      } catch (error) {
        console.error('Error loading court details:', error)
        toast.error('No se pudo cargar la información de la cancha')
      } finally {
        setLoading(false)
      }
    }

    loadCourtData()
  }, [courtId])

  const getAvailableHours = () => {
    if (!selectedDate || horarios.length === 0) return []

    const dayName = getWeekdayName(selectedDate)
    const daySchedule = horarios.find(h => h.dia.toLowerCase() === dayName)
    
    if (!daySchedule) return []

    const hours = []
    const startTime = parseInt(daySchedule.horaInicio.split(':')[0])
    const endTime = parseInt(daySchedule.horaFin.split(':')[0])

    for (let hour = startTime; hour < endTime; hour++) {
      hours.push(`${hour.toString().padStart(2, '0')}:00`)
    }

    return hours
  }

  const handleReservation = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Debes iniciar sesión para hacer una reserva')
      return
    }

    if (!selectedDate || !selectedTime) {
      toast.error('Debes seleccionar una fecha y hora')
      return
    }

    if (!court) {
      toast.error('Información de cancha no disponible')
      return
    }

    setReserving(true)
    try {
      // 1. Find the matching disponibilidad for selected date/time
      const dayOfWeek = selectedDate.getDay() // 0 = Sunday, 6 = Saturday
      const timeHour = selectedTime.split(':')[0] + ':00'
      
      const matchingDisponibilidad = disponibilidades.find(disp => 
        disp.diaSemana === dayOfWeek && 
        disp.horario.horaInicio === timeHour
      )

      if (!matchingDisponibilidad) {
        toast.error('No hay disponibilidad para el horario seleccionado')
        return
      }

      // 2. Create ISO 8601 fechaHora from selectedDate + selectedTime
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      const fechaHora = `${year}-${month}-${day}T${selectedTime}:00-03:00`

      // 3. Validate personaId before creating reservation
      if (!personaId) {
        alert('No se encontró tu información de persona. Por favor, vuelve a iniciar sesión.')
        return
      }

      const response = await apiClient.createReserva({
        disponibilidadId: matchingDisponibilidad.id,
        fechaHora: fechaHora,
        personaId: personaId
      })

      if (response.error) {
        toast.error(response.error)
        return
      }

      if (response.data) {
        toast.success('¡Reserva creada exitosamente!')
        setSelectedDate(getNextAvailableDate())
        setSelectedTime('')
      }
    } catch (error) {
      console.error('Error creating reservation:', error)
      toast.error('No se pudo crear la reserva')
    } finally {
      setReserving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!court) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Cancha no encontrada</h1>
          <p className="text-gray-600">La cancha que buscas no existe o no está disponible.</p>
        </div>
      </div>
    )
  }

  const availableHours = getAvailableHours()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Court Image */}
        <div className="relative h-64 lg:h-96 rounded-lg overflow-hidden bg-gray-200">
          <Image
            src={'/cancha.jpeg'}
            alt={court.nombre}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {/* Court Information */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{court.nombre}</h1>
              <Badge variant={court.activa ? "default" : "destructive"}>
                {court.activa ? "Activa" : "Inactiva"}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4 text-gray-600 mb-4">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{court.ubicacion}</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                <span>${court.precioPorHora}/hora</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                <span><strong>Deporte:</strong> {court.deporte?.nombre || 'No especificado'}</span>
              </div>
              <div className="flex items-center">
                <span><strong>Superficie:</strong> {court.tipoSuperficie}</span>
              </div>
              <div className="flex items-center">
                <span><strong>Club:</strong> {court.club?.nombre || 'No especificado'}</span>
              </div>
              <div className="flex items-center">
                <span><strong>Dirección:</strong> {court.club?.direccion || 'No especificado'}</span>
              </div>
            </div>
          </div>

          {/* Reservation Section */}
          {court.activa && (
            <Card>
              <CardHeader>
                <CardTitle>Hacer Reserva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Seleccionar fecha
                  </label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => isDateDisabled(date, { disablePastDates: true })}
                    className="rounded-md border-0"
                    weekStartsOn={1}
                  />
                  {selectedDate && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Fecha seleccionada: {formatDate(selectedDate, 'LONG')}
                    </p>
                  )}
                </div>

                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Seleccionar hora
                    </label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Elige un horario" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableHours.length > 0 ? (
                          availableHours.map((hour) => (
                            <SelectItem key={hour} value={hour}>
                              {hour}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No hay horarios disponibles para este día
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {availableHours.length === 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Este día no tiene horarios configurados para esta cancha.
                      </p>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleReservation}
                  disabled={!isAuthenticated || !selectedDate || !selectedTime || reserving}
                  className="w-full"
                >
                  {reserving 
                    ? 'Creando reserva...' 
                    : !isAuthenticated 
                    ? 'Inicia sesión para reservar' 
                    : 'Reservar cancha'
                  }
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
