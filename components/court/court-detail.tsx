"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  MapPin,
  Star,
  Clock,
  Users,
  Wifi,
  Car,
  Coffee,
  ShowerHeadIcon as Shower,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle,
  ArrowLeft,
  Phone,
  Mail,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { createReservationAction } from "@/lib/actions"
import { Court } from "@/lib/api-client"
import apiClient from "@/lib/api-client"
import { cn } from "@/lib/utils"

interface CourtDetailProps {
  court: Court
  availability: Array<{
    hora: string
    disponible: boolean
    precio: number
  }>
  isAuthenticated: boolean
  userId?: string
}

interface TimeSlot {
  hora: string
  disponible: boolean
  precio: number
}

const amenityIcons = {
  Vestuarios: Users,
  Estacionamiento: Car,
  Buffet: Coffee,
  Duchas: Shower,
  WiFi: Wifi,
}

export function CourtDetail({ court, availability: initialAvailability, isAuthenticated, userId }: CourtDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [availability, setAvailability] = useState<TimeSlot[]>(initialAvailability)
  const [isReserving, setIsReserving] = useState(false)
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const { toast } = useToast()

  // Load availability when date changes
  useEffect(() => {
    const loadAvailability = async () => {
      setIsLoadingAvailability(true)
      try {
        const dateStr = selectedDate.toISOString().split('T')[0]
        const response = await apiClient.getCourtAvailability(court.id, dateStr)
        
        if (response.data?.horarios) {
          setAvailability(response.data.horarios)
        } else {
          setAvailability([])
        }
      } catch (error) {
        console.error('Error loading availability:', error)
        setAvailability([])
      } finally {
        setIsLoadingAvailability(false)
      }
    }

    loadAvailability()
  }, [selectedDate, court.id])

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % court.imagenes.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + court.imagenes.length) % court.imagenes.length)
  }

  const handleSlotSelection = (slot: TimeSlot) => {
    if (!slot.disponible) return
    setSelectedSlot(slot)
    setShowBookingModal(true)
  }

  const handleReservation = async () => {
    if (!selectedSlot || !isAuthenticated) return

    setIsReserving(true)
    try {
      const formData = new FormData()
      formData.append("canchaId", court.id)
      formData.append("fecha", selectedDate.toISOString().split('T')[0])
      formData.append("horaInicio", selectedSlot.hora)
      
      // Calculate end time (assuming 1-hour slots)
      const [hours, minutes] = selectedSlot.hora.split(':').map(Number)
      const endTime = `${String(hours + 1).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
      formData.append("horaFin", endTime)

      const result = await createReservationAction({ success: false }, formData)

      if (result.success) {
        toast({
          title: "¡Reserva confirmada!",
          description: `Tu reserva para el ${format(selectedDate, 'dd/MM/yyyy', { locale: es })} a las ${selectedSlot.hora} ha sido confirmada.`,
        })
        setShowBookingModal(false)
        setSelectedSlot(null)
        
        // Reload availability
        const dateStr = selectedDate.toISOString().split('T')[0]
        const response = await apiClient.getCourtAvailability(court.id, dateStr)
        if (response.data?.horarios) {
          setAvailability(response.data.horarios)
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo procesar la reserva. Intenta nuevamente.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar la reserva. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsReserving(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getImageUrl = (url: string) => {
    if (!url || url.includes('placeholder')) {
      return '/placeholder.jpg'
    }
    return url.startsWith('http') ? url : `/uploads/${url}`
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Back Navigation */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a canchas
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Image Gallery */}
        <div className="lg:w-2/3">
          <div className="relative">
            <div className="aspect-video relative overflow-hidden rounded-lg">
              <Image
                src={getImageUrl(court.imagenes[currentImageIndex] || '/placeholder.jpg')}
                alt={`${court.nombre} - Imagen ${currentImageIndex + 1}`}
                fill
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.jpg'
                }}
              />
              {court.imagenes.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            {court.imagenes.length > 1 && (
              <div className="flex justify-center mt-4 gap-2">
                {court.imagenes.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentImageIndex ? "bg-primary" : "bg-muted"
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Court Info */}
        <div className="lg:w-1/3">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{court.nombre}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge>{court.deporte.nombre}</Badge>
                    <Badge variant={court.disponible ? "default" : "secondary"}>
                      {court.disponible ? "Disponible" : "No disponible"}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{formatPrice(court.precio)}</div>
                  <div className="text-sm text-muted-foreground">por hora</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">{court.club.direccion}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Users className="h-4 w-4 mr-2" />
                  <span className="text-sm">{court.club.nombre}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Descripción</h4>
                <p className="text-sm text-muted-foreground">{court.descripcion}</p>
              </div>

              <Separator />

              {/* Date Selection */}
              <div className="space-y-4">
                <h4 className="font-semibold">Seleccionar fecha</h4>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Selecciona una fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Slots */}
              <div className="space-y-4">
                <h4 className="font-semibold">Horarios disponibles</h4>
                {isLoadingAvailability ? (
                  <div className="grid grid-cols-2 gap-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-10 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : availability.length > 0 ? (
                  <ScrollArea className="h-48">
                    <div className="grid grid-cols-2 gap-2">
                      {availability.map((slot) => (
                        <Button
                          key={slot.hora}
                          variant={slot.disponible ? "outline" : "secondary"}
                          className={cn(
                            "h-auto p-3 flex flex-col items-center",
                            !slot.disponible && "opacity-50 cursor-not-allowed"
                          )}
                          disabled={!slot.disponible || !isAuthenticated}
                          onClick={() => handleSlotSelection(slot)}
                        >
                          <span className="font-medium">{slot.hora}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatPrice(slot.precio)}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No hay horarios disponibles para esta fecha</p>
                  </div>
                )}
              </div>

              {!isAuthenticated && (
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Inicia sesión para reservar
                  </p>
                  <div className="flex gap-2">
                    <Link href="/login" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Iniciar sesión
                      </Button>
                    </Link>
                    <Link href="/register" className="flex-1">
                      <Button size="sm" className="w-full">
                        Registrarse
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar reserva</DialogTitle>
            <DialogDescription>
              Revisa los detalles de tu reserva antes de confirmar.
            </DialogDescription>
          </DialogHeader>
          
          {selectedSlot && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cancha:</span>
                      <span className="font-medium">{court.nombre}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fecha:</span>
                      <span className="font-medium">
                        {format(selectedDate, 'dd/MM/yyyy', { locale: es })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Horario:</span>
                      <span className="font-medium">{selectedSlot.hora}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Precio:</span>
                      <span className="font-bold text-primary text-lg">
                        {formatPrice(selectedSlot.precio)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800 mb-1">
                      Recuerda confirmar tu asistencia
                    </p>
                    <p className="text-yellow-700">
                      Debes confirmar tu asistencia 2 horas antes del turno o será liberado automáticamente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookingModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleReservation} disabled={isReserving}>
              {isReserving ? "Procesando..." : "Confirmar reserva"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
