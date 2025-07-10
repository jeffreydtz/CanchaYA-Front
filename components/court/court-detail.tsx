"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MapPin, Clock, Users, Star, Phone, Mail } from 'lucide-react'
import { useAuth } from '@/components/auth/auth-context'
import { useToast } from '@/hooks/use-toast'
import apiClient from '@/lib/api-client'

interface Court {
  id: string
  name: string
  sport: string
  description: string
  price: number
  location: string
  image: string
  rating: number
  reviews: number
  amenities: string[]
  schedule: {
    day: string
    open: string
    close: string
  }[]
  contact: {
    phone: string
    email: string
  }
}

interface TimeSlot {
  id: string
  time: string
  available: boolean
  price: number
}

export default function CourtDetail() {
  const params = useParams()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [court, setCourt] = useState<Court | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  const courtId = params.id as string

  useEffect(() => {
    const loadCourtDetails = async () => {
      try {
        const response = await apiClient.getCourt(courtId)
        if (response.data) {
          setCourt(response.data)
        }
      } catch (error) {
        console.error('Error loading court details:', error)
        toast({
          title: 'Error',
          description: 'No se pudo cargar la información de la cancha',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (courtId) {
      loadCourtDetails()
    }
  }, [courtId, toast])

  useEffect(() => {
    const loadTimeSlots = async () => {
      if (!selectedDate) return

      try {
        const response = await apiClient.getTimeSlots(courtId, selectedDate)
        if (response.data) {
          setTimeSlots(response.data)
        }
      } catch (error) {
        console.error('Error loading time slots:', error)
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los horarios disponibles',
          variant: 'destructive',
        })
      }
    }

    loadTimeSlots()
  }, [courtId, selectedDate, toast])

  const handleReservation = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Acceso requerido',
        description: 'Debes iniciar sesión para hacer una reserva',
        variant: 'destructive',
      })
      return
    }

    if (!selectedDate || !selectedTime) {
      toast({
        title: 'Selección requerida',
        description: 'Debes seleccionar una fecha y hora',
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await apiClient.createReservation({
        courtId,
        date: selectedDate,
        time: selectedTime,
        userId: user?.id || '',
      })

      if (response.data) {
        toast({
          title: 'Reserva exitosa',
          description: 'Tu reserva ha sido creada correctamente',
        })
        // Reset selections
        setSelectedDate('')
        setSelectedTime('')
      }
    } catch (error) {
      console.error('Error creating reservation:', error)
      toast({
        title: 'Error',
        description: 'No se pudo crear la reserva',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!court) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Cancha no encontrada</h1>
          <p className="text-muted-foreground">La cancha que buscas no existe o ha sido removida.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Court Image */}
          <div className="relative">
            <img
              src={court.image}
              alt={court.name}
              className="w-full h-64 object-cover rounded-lg"
            />
            <Badge className="absolute top-4 left-4">
              {court.sport}
            </Badge>
          </div>

          {/* Court Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{court.name}</CardTitle>
              <CardDescription>{court.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{court.location}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{court.rating} ({court.reviews} reseñas)</span>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>${court.price.toLocaleString()} por hora</span>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {court.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Horarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {court.schedule.map((day, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium">{day.day}</span>
                    <span className="text-muted-foreground">
                      {day.open} - {day.close}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reservation Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hacer Reserva</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Fecha</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium mb-2">Hora</label>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot.id}
                        variant={selectedTime === slot.time ? 'default' : 'outline'}
                        onClick={() => setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className="text-sm"
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleReservation}
                disabled={!selectedDate || !selectedTime}
                className="w-full"
              >
                Reservar
              </Button>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{court.contact.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{court.contact.email}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
