"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { toast } from 'sonner'
import apiClient, { Club, Cancha, AvailabilitySlotRealTime, CanchaFoto } from '@/lib/api-client'
import { Loader2, MapPin, Trophy, Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react'
import { CourtPhotosCarousel } from '@/components/court/court-photos-carousel'
import { RealtimeAvailability } from '@/components/disponibilidad/realtime-availability'
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
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlotRealTime[]>([])
  const [selectedClub, setSelectedClub] = useState<string>('')
  const [selectedCancha, setSelectedCancha] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [loading, setLoading] = useState(false)
  const [canchasLoading, setCanchasLoading] = useState(false)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [reserving, setReserving] = useState<string | null>(null)
  const [personaId, setPersonaId] = useState<string | null>(null)
  const [canchaFotos, setCanchaFotos] = useState<CanchaFoto[]>([])

  useEffect(() => {
    const fetchPersonaId = async () => {
      try {
        const response = await apiClient.getMe()
        if (response.error || !response.data) return
        setPersonaId(response.data.personaId)
      } catch (error) {
        console.error('Error fetching personaId:', error)
      }
    }
    fetchPersonaId()
  }, [])

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

  useEffect(() => {
    const loadAvailability = async () => {
      if (!selectedCancha || !selectedDate) {
        setAvailableSlots([])
        return
      }

      setSlotsLoading(true)
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd')
        const response = await apiClient.getDisponibilidadRealTime({
          from: dateStr,
          to: dateStr,
          canchaId: selectedCancha
        })

        if (response.data) {
          // Show all slots (libre and ocupado) - ocupado will be disabled in UI
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

  useEffect(() => {
    const loadCanchaFotos = async () => {
      if (!selectedCancha) {
        setCanchaFotos([])
        return
      }

      try {
        const response = await apiClient.getCanchaFotos(selectedCancha)
        if (response.data) {
          setCanchaFotos(response.data)
        } else {
          setCanchaFotos([])
        }
      } catch (error) {
        setCanchaFotos([])
      }
    }
    loadCanchaFotos()
  }, [selectedCancha])

  const handleReserve = async (slot: AvailabilitySlotRealTime) => {
    // Validate slot is free
    if (slot.ocupado || slot.estado !== 'libre') {
      toast.error('Este horario ya está ocupado')
      return
    }

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
      const [hours, minutes] = slot.horaInicio.split(':')
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      const fechaHora = `${year}-${month}-${day}T${hours}:${minutes}:00-03:00`

      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      if (slot.fecha !== dateStr) {
        toast.error('Error de validación', {
          description: 'La fecha del slot no coincide con la fecha seleccionada'
        })
        return
      }

      const requestPayload = {
        disponibilidadId: slot.disponibilidadId,
        fechaHora: fechaHora,
        personaId: personaId
      }

      const response = await apiClient.createReserva(requestPayload)

      if (response.error) {
        toast.error('Error al crear reserva', {
          description: response.error
        })
        return
      }

      toast.success('¡Reserva creada exitosamente!', {
        description: `${slot.canchaNombre} - ${format(selectedDate, "dd 'de' MMMM", { locale: es })} a las ${slot.horaInicio.substring(0, 5)}`
      })

      // Recargar disponibilidad
      const dateStr2 = format(selectedDate, 'yyyy-MM-dd')
      const availResponse = await apiClient.getDisponibilidadRealTime({
        from: dateStr2,
        to: dateStr2,
        canchaId: selectedCancha
      })

      if (availResponse.data) {
        // Show all slots (libre and ocupado) - ocupado will be disabled in UI
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
          <div className="lg:col-span-1 space-y-6">
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

            {selectedCancha && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Fotos de la Cancha</h3>
                <CourtPhotosCarousel
                  photos={canchaFotos}
                  courtName={selectedCanchaObj?.nombre || ''}
                  className="rounded-lg"
                />
              </div>
            )}

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
                ) : (
                  <RealtimeAvailability
                    slots={availableSlots}
                    selectedDate={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                    onSlotSelect={(slot) => {
                      // Only allow selection of free slots
                      if (slot.estado === 'libre' && !slot.ocupado) {
                        handleReserve(slot)
                      }
                    }}
                    selectedSlotId={reserving || undefined}
                    title="Horarios Disponibles"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
