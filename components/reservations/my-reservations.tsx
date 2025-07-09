"use client"

import { useState } from "react"
import Link from "next/link"
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
import { MapPin, Calendar, Clock, CheckCircle, AlertCircle, Timer, Plus, CalendarDays } from "lucide-react"
import { format, isAfter, isBefore, addHours, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { confirmReservationAction, cancelReservationAction } from "@/lib/actions"
import { Reservation } from "@/lib/api-client"

interface MyReservationsProps {
  reservations: Reservation[]
  userId: string
}

export function MyReservations({ reservations, userId }: MyReservationsProps) {
  const [isConfirming, setIsConfirming] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState<string | null>(null)
  const { toast } = useToast()

  const handleConfirmAttendance = async (reservationId: string) => {
    setIsConfirming(reservationId)
    try {
      const result = await confirmReservationAction(reservationId)

      if (result.success) {
        toast({
          title: "¡Asistencia confirmada!",
          description: "Tu asistencia ha sido registrada correctamente.",
        })
        // Refresh page to update data
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo confirmar la asistencia.",
          variant: "destructive",
        })
      }
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

  const handleCancelReservation = async (reservationId: string) => {
    setIsCancelling(reservationId)
    try {
      const result = await cancelReservationAction(reservationId)

      if (result.success) {
        toast({
          title: "Reserva cancelada",
          description: "Tu reserva ha sido cancelada exitosamente.",
        })
        // Refresh page to update data
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo cancelar la reserva.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cancelar la reserva. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(null)
    }
  }

  const formatDateTime = (fecha: string, hora: string) => {
    const dateTimeString = `${fecha}T${hora}`
    const dateTime = parseISO(dateTimeString)
    return {
      date: format(dateTime, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es }),
      time: format(dateTime, "HH:mm", { locale: es }),
      dateTime
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getStatusBadge = (reservation: Reservation) => {
    if (reservation.confirmada) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmada</Badge>
    }

    switch (reservation.estado) {
      case "CONFIRMADA":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Reservada</Badge>
      case "PENDIENTE":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-700">
            Pendiente
          </Badge>
        )
      case "CANCELADA":
        return <Badge variant="destructive">Cancelada</Badge>
      case "LIBERADA":
        return <Badge variant="secondary">Liberada</Badge>
      default:
        return <Badge variant="secondary">{reservation.estado}</Badge>
    }
  }

  const canConfirmReservation = (reservation: Reservation) => {
    if (reservation.confirmada || reservation.estado !== 'PENDIENTE') {
      return false
    }

    const { dateTime } = formatDateTime(reservation.fecha, reservation.horaInicio)
    const twoHoursBefore = addHours(dateTime, -2)
    const now = new Date()

    return isAfter(twoHoursBefore, now)
  }

  const canCancelReservation = (reservation: Reservation) => {
    if (reservation.estado === 'CANCELADA' || reservation.estado === 'LIBERADA') {
      return false
    }

    const { dateTime } = formatDateTime(reservation.fecha, reservation.horaInicio)
    const now = new Date()

    return isAfter(dateTime, now)
  }

  const getTimeUntilDeadline = (reservation: Reservation) => {
    if (reservation.confirmada || reservation.estado !== 'PENDIENTE') {
      return null
    }

    const { dateTime } = formatDateTime(reservation.fecha, reservation.horaInicio)
    const deadline = addHours(dateTime, -2)
    const now = new Date()

    if (isBefore(deadline, now)) {
      return null // Deadline passed
    }

    const diffInMs = deadline.getTime() - now.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const hours = Math.floor(diffInMinutes / 60)
    const minutes = diffInMinutes % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const ReservationCard = ({
    reservation,
    showConfirmButton = false,
  }: { reservation: Reservation; showConfirmButton?: boolean }) => {
    const { date, time } = formatDateTime(reservation.fecha, reservation.horaInicio)
    const timeUntilDeadline = getTimeUntilDeadline(reservation)
    
    return (
      <Card key={reservation.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{reservation.cancha.nombre}</h3>
                <Badge variant="outline">{reservation.cancha.deporte.nombre}</Badge>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="capitalize">{date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{time} - {reservation.horaFin} hs</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{reservation.cancha.club.nombre} - {reservation.cancha.club.direccion}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {getStatusBadge(reservation)}
                <span className="font-bold text-primary">{formatPrice(reservation.precio)}</span>
              </div>

              {timeUntilDeadline && (
                <div className="flex items-center gap-2 text-sm">
                  <Timer className="h-4 w-4 text-yellow-600" />
                  <span className="text-yellow-700">
                    Confirma en {timeUntilDeadline} o se liberará automáticamente
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
              {showConfirmButton && canConfirmReservation(reservation) && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" className="w-full sm:w-auto">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmar asistencia
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar asistencia</AlertDialogTitle>
                      <AlertDialogDescription>
                        ¿Confirmas que asistirás a tu reserva en {reservation.cancha.nombre} el {date} a las {time}?
                        Una vez confirmada, no podrás cancelar la reserva.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleConfirmAttendance(reservation.id)}
                        disabled={isConfirming === reservation.id}
                      >
                        {isConfirming === reservation.id ? "Confirmando..." : "Confirmar"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {canCancelReservation(reservation) && !reservation.confirmada && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      Cancelar reserva
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancelar reserva</AlertDialogTitle>
                      <AlertDialogDescription>
                        ¿Estás seguro que quieres cancelar tu reserva en {reservation.cancha.nombre} para el {date} a las {time}?
                        Esta acción no se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>No cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleCancelReservation(reservation.id)}
                        disabled={isCancelling === reservation.id}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isCancelling === reservation.id ? "Cancelando..." : "Sí, cancelar"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <Link href={`/cancha/${reservation.cancha.id}`}>
                <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                  Ver cancha
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Filter reservations
  const activeReservations = reservations.filter(
    (r) => r.estado === 'PENDIENTE' || r.estado === 'CONFIRMADA'
  )
  
  const completedReservations = reservations.filter(
    (r) => r.estado === 'CANCELADA' || r.estado === 'LIBERADA' || 
    (r.estado === 'CONFIRMADA' && isBefore(parseISO(`${r.fecha}T${r.horaFin}`), new Date()))
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis Reservas</h1>
          <p className="text-muted-foreground">Gestiona tus reservas de canchas deportivas</p>
        </div>
        <Link href="/">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva reserva
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Próximas ({activeReservations.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Historial ({completedReservations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Próximas reservas</h2>
            {activeReservations.length > 0 ? (
              <div className="space-y-4">
                {activeReservations
                  .sort((a, b) => {
                    const dateA = parseISO(`${a.fecha}T${a.horaInicio}`)
                    const dateB = parseISO(`${b.fecha}T${b.horaInicio}`)
                    return dateA.getTime() - dateB.getTime()
                  })
                  .map((reservation) => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      showConfirmButton={true}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tienes reservas próximas</h3>
                <p className="text-muted-foreground mb-6">
                  ¡Es hora de reservar tu próxima cancha y disfrutar del deporte!
                </p>
                <Link href="/">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Hacer nueva reserva
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Historial de reservas</h2>
            {completedReservations.length > 0 ? (
              <div className="space-y-4">
                {completedReservations
                  .sort((a, b) => {
                    const dateA = parseISO(`${a.fecha}T${a.horaInicio}`)
                    const dateB = parseISO(`${b.fecha}T${b.horaInicio}`)
                    return dateB.getTime() - dateA.getTime() // Most recent first
                  })
                  .map((reservation) => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      showConfirmButton={false}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sin historial aún</h3>
                <p className="text-muted-foreground">
                  Aquí aparecerán tus reservas pasadas y canceladas.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
