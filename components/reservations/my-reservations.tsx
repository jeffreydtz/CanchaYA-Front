"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { MapPin, Calendar, Clock, CheckCircle, AlertCircle, Timer } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { confirmAttendanceAction } from "@/lib/actions"

interface Reservation {
  id: string
  courtName: string
  sport: string
  date: string
  time: string
  price: number
  status: "confirmed" | "pending" | "cancelled"
  location: string
  confirmed: boolean
  canConfirm: boolean
  timeUntilDeadline?: number // minutes
}

const mockReservations: Reservation[] = [
  {
    id: "1",
    courtName: "Club Atlético Central",
    sport: "Fútbol 5",
    date: "2024-01-20",
    time: "20:00",
    price: 8000,
    status: "pending",
    location: "Centro",
    confirmed: false,
    canConfirm: true,
    timeUntilDeadline: 45,
  },
  {
    id: "2",
    courtName: "Complejo Deportivo Norte",
    sport: "Pádel",
    date: "2024-01-22",
    time: "19:00",
    price: 6000,
    status: "confirmed",
    location: "Zona Norte",
    confirmed: true,
    canConfirm: false,
  },
  {
    id: "3",
    courtName: "Polideportivo Sur",
    sport: "Básquet",
    date: "2024-01-25",
    time: "21:00",
    price: 5000,
    status: "pending",
    location: "Zona Sur",
    confirmed: false,
    canConfirm: true,
    timeUntilDeadline: 180,
  },
]

const mockHistoryReservations: Reservation[] = [
  {
    id: "4",
    courtName: "Tennis Club Rosario",
    sport: "Tenis",
    date: "2024-01-15",
    time: "18:00",
    price: 7000,
    status: "confirmed",
    location: "Pichincha",
    confirmed: true,
    canConfirm: false,
  },
  {
    id: "5",
    courtName: "Futsal Arena",
    sport: "Fútbol 5",
    date: "2024-01-10",
    time: "20:00",
    price: 9000,
    status: "cancelled",
    location: "Echesortu",
    confirmed: false,
    canConfirm: false,
  },
]

export function MyReservations() {
  const [reservations, setReservations] = useState(mockReservations)
  const [isConfirming, setIsConfirming] = useState<string | null>(null)
  const { toast } = useToast()

  const handleConfirmAttendance = async (reservationId: string) => {
    setIsConfirming(reservationId)
    try {
      await confirmAttendanceAction(reservationId)

      setReservations((prev) =>
        prev.map((res) =>
          res.id === reservationId ? { ...res, confirmed: true, status: "confirmed" as const, canConfirm: false } : res,
        ),
      )

      toast({
        title: "¡Asistencia confirmada!",
        description: "Tu asistencia ha sido registrada correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo confirmar la asistencia. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsConfirming(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string, confirmed: boolean) => {
    if (confirmed) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmada</Badge>
    }

    switch (status) {
      case "confirmed":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Reservada</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-700">
            Pendiente
          </Badge>
        )
      case "cancelled":
        return <Badge variant="destructive">Cancelada</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const ReservationCard = ({
    reservation,
    showConfirmButton = false,
  }: { reservation: Reservation; showConfirmButton?: boolean }) => (
    <Card key={reservation.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{reservation.courtName}</h3>
              <Badge variant="outline">{reservation.sport}</Badge>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(reservation.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{reservation.time} hs</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{reservation.location}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {getStatusBadge(reservation.status, reservation.confirmed)}
              <span className="font-bold text-primary">${reservation.price.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {showConfirmButton && reservation.canConfirm && !reservation.confirmed && (
              <>
                {reservation.timeUntilDeadline && reservation.timeUntilDeadline < 120 && (
                  <div className="flex items-center gap-1 text-sm text-orange-600 mb-2">
                    <Timer className="h-4 w-4" />
                    <span>Confirma en {reservation.timeUntilDeadline} min</span>
                  </div>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="min-touch-target">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmar asistencia
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar asistencia</AlertDialogTitle>
                      <AlertDialogDescription>
                        ¿Confirmas que vas a asistir a tu reserva en {reservation.courtName}
                        el {formatDate(reservation.date)} a las {reservation.time}?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleConfirmAttendance(reservation.id)}
                        disabled={isConfirming === reservation.id}
                      >
                        {isConfirming === reservation.id ? "Confirmando..." : "Sí, confirmar"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}

            {reservation.confirmed && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="h-4 w-4" />
                <span>Asistencia confirmada</span>
              </div>
            )}

            {!reservation.confirmed && !reservation.canConfirm && reservation.status === "pending" && (
              <div className="flex items-center gap-2 text-orange-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Tiempo de confirmación expirado</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mis Reservas</h1>
        <p className="text-muted-foreground">Gestiona tus reservas y confirma tu asistencia</p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming" className="min-touch-target">
            Próximas ({reservations.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="min-touch-target">
            Historial ({mockHistoryReservations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {reservations.length > 0 ? (
            <>
              {reservations.some((r) => r.canConfirm && !r.confirmed) && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-orange-800">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">
                        Tienes reservas pendientes de confirmación. Recuerda confirmar tu asistencia hasta 2 horas
                        antes.
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {reservations.map((reservation) => (
                  <ReservationCard key={reservation.id} reservation={reservation} showConfirmButton={true} />
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No tienes reservas próximas</h3>
                <p className="text-muted-foreground mb-4">¡Es hora de reservar tu próxima cancha!</p>
                <Button asChild>
                  <a href="/">Explorar canchas</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {mockHistoryReservations.length > 0 ? (
            <div className="space-y-4">
              {mockHistoryReservations.map((reservation) => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Sin historial de reservas</h3>
                <p className="text-muted-foreground">Tus reservas pasadas aparecerán aquí</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
