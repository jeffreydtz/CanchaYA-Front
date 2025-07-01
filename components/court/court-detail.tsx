"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
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
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { reserveCourtAction } from "@/lib/actions"

interface Court {
  id: number
  name: string
  sport: string
  price: number
  images: string[]
  rating: number
  location: string
  address: string
  surface: string
  hasLights: boolean
  capacity: number
  description: string
  amenities: string[]
  availableSlots: { time: string; available: boolean }[]
  reviews: {
    id: number
    user: string
    rating: number
    comment: string
    date: string
  }[]
}

interface CourtDetailProps {
  court: Court
}

const amenityIcons = {
  Vestuarios: Users,
  Estacionamiento: Car,
  Buffet: Coffee,
  Duchas: Shower,
  WiFi: Wifi,
}

export function CourtDetail({ court }: CourtDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [isReserving, setIsReserving] = useState(false)
  const { toast } = useToast()

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % court.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + court.images.length) % court.images.length)
  }

  const handleReservation = async () => {
    if (!selectedSlot) return

    setIsReserving(true)
    try {
      const formData = new FormData()
      formData.append("courtId", court.id.toString())
      formData.append("date", new Date().toISOString().split("T")[0])
      formData.append("time", selectedSlot)

      const result = await reserveCourtAction(formData)

      if (result.success) {
        toast({
          title: "¡Reserva confirmada!",
          description: `Tu reserva para las ${selectedSlot} ha sido confirmada. ID: ${result.reservationId}`,
        })
        setSelectedSlot(null)
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

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Image Gallery */}
        <div className="lg:w-2/3">
          <div className="relative">
            <div className="aspect-video relative overflow-hidden rounded-lg">
              <Image
                src={court.images[currentImageIndex] || "/placeholder.svg"}
                alt={`${court.name} - Imagen ${currentImageIndex + 1}`}
                fill
                className="object-cover"
              />
              {court.images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background min-touch-target"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background min-touch-target"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            {court.images.length > 1 && (
              <div className="flex justify-center mt-4 gap-2">
                {court.images.map((_, index) => (
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
                  <CardTitle className="text-2xl">{court.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge>{court.sport}</Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{court.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">${court.price.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">por hora</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm">{court.address}</span>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Superficie:</span>
                  <div className="font-medium">{court.surface}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Capacidad:</span>
                  <div className="font-medium">{court.capacity} jugadores</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Iluminación:</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span className="font-medium">{court.hasLights ? "Sí" : "No"}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Servicios</h4>
                <div className="grid grid-cols-2 gap-2">
                  {court.amenities.map((amenity) => {
                    const Icon = amenityIcons[amenity as keyof typeof amenityIcons] || Users
                    return (
                      <div key={amenity} className="flex items-center gap-2 text-sm">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span>{amenity}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Available Slots */}
      <Card>
        <CardHeader>
          <CardTitle>Horarios disponibles hoy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {court.availableSlots.map((slot) => (
              <Dialog key={slot.time}>
                <DialogTrigger asChild>
                  <Button
                    variant={slot.available ? "outline" : "secondary"}
                    disabled={!slot.available}
                    className="min-touch-target"
                    onClick={() => setSelectedSlot(slot.time)}
                  >
                    {slot.time}
                    {!slot.available && <span className="ml-2 text-xs">(Ocupado)</span>}
                  </Button>
                </DialogTrigger>
                {slot.available && (
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirmar reserva</DialogTitle>
                      <DialogDescription>
                        ¿Confirmas la reserva de {court.name} para las {slot.time}?
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Cancha:</span>
                            <div className="font-medium">{court.name}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Horario:</span>
                            <div className="font-medium">{slot.time}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Fecha:</span>
                            <div className="font-medium">Hoy</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total:</span>
                            <div className="font-bold text-primary">${court.price.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleReservation} disabled={isReserving} className="min-touch-target">
                        {isReserving ? "Procesando..." : "Confirmar reserva"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                )}
              </Dialog>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Description and Reviews */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Descripción</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{court.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comentarios y valoraciones</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="reviews">
                <AccordionTrigger>Ver comentarios ({court.reviews.length})</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {court.reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{review.user}</span>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{review.comment}</p>
                        <span className="text-xs text-muted-foreground">{review.date}</span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
