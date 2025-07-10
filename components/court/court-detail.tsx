"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Clock, DollarSign, Star } from 'lucide-react'
import { toast } from 'sonner'
import apiClient from '@/lib/api-client'
import Image from 'next/image'

interface Court {
  id: string
  name: string
  sport: string
  location: string
  price: number
  rating: number
  description: string
  image: string
  amenities: string[]
  availability: {
    [key: string]: string[]
  }
}

interface TimeSlot {
  id: string
  time: string
  available: boolean
  price?: number
}

export default function CourtDetail() {
  const { isAuthenticated } = useAuth()
  const [court, setCourt] = useState<Court | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCourtDetails = async () => {
      try {
        const response = await apiClient.getCourt('1') // Mock court ID
        if (response.data) {
          setCourt(response.data as unknown as Court)
        }
      } catch (error) {
        console.error('Error loading court details:', error)
        toast('Error: No se pudo cargar la información de la cancha')
      } finally {
        setLoading(false)
      }
    }

    loadCourtDetails()
  }, [])

  useEffect(() => {
    const loadTimeSlots = async () => {
      if (!selectedDate) return

      try {
        const dateString = selectedDate.toISOString().split('T')[0]
        const response = await apiClient.getTimeSlots('1', dateString)
        if (response.data) {
          setTimeSlots(response.data as unknown as TimeSlot[])
        }
      } catch (error) {
        console.error('Error loading time slots:', error)
        toast('Error: No se pudieron cargar los horarios disponibles')
      }
    }

    loadTimeSlots()
  }, [selectedDate])

  const handleReservation = async () => {
    if (!isAuthenticated) {
      toast('Acceso requerido: Debes iniciar sesión para hacer una reserva')
      return
    }

    if (!selectedDate || !selectedTime) {
      toast('Selección requerida: Debes seleccionar una fecha y hora')
      return
    }

    try {
      const dateString = selectedDate.toISOString().split('T')[0]
      const response = await apiClient.createReservation({
        courtId: '1',
        fecha: dateString,
        hora: selectedTime,
        duracion: 60, // 1 hora por defecto
      })

      if (response.success) {
        toast('Reserva exitosa: Tu reserva ha sido creada correctamente')
        setSelectedDate(undefined)
        setSelectedTime('')
      } else {
        toast('Error: No se pudo crear la reserva')
      }
    } catch (error) {
      console.error('Error creating reservation:', error)
      toast('Error: No se pudo crear la reserva')
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Court Image */}
        <div className="relative h-64 lg:h-96 rounded-lg overflow-hidden">
          <Image
            src={court.image}
            alt={court.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Court Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{court.name}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {court.location}
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1 text-yellow-500" />
                {court.rating}/5
              </div>
            </div>
            <p className="text-gray-700">{court.description}</p>
          </div>

          {/* Amenities */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {court.amenities.map((amenity, index) => (
                <Badge key={index} variant="secondary">
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-2xl font-bold text-green-600">${court.price}</span>
            <span className="text-gray-600">por hora</span>
          </div>
        </div>
      </div>

      {/* Reservation Section */}
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Reservar Cancha</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Fecha
                </label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  disabled={(date) => date < new Date()}
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Hora
                </label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem
                        key={slot.id}
                        value={slot.time}
                        disabled={!slot.available}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{slot.time}</span>
                          {!slot.available && (
                            <Badge variant="destructive" className="ml-2">
                              Ocupado
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleReservation}
              className="w-full mt-6"
              disabled={!selectedDate || !selectedTime}
            >
              <Clock className="h-4 w-4 mr-2" />
              Reservar Cancha
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
