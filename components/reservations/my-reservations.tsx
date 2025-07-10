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
import { MapPin, Calendar, Clock, Check, AlertCircle, Plus } from "lucide-react"
import { format, isAfter, isBefore, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { confirmReservationAction, cancelReservationAction } from "@/lib/actions"
import { Reservation } from "@/lib/api-client"

interface ReservationCardProps {
  reservation: Reservation
  showConfirmButton: boolean
  onConfirm: (id: string) => void
  onCancel: (id: string) => void
  isConfirming: boolean
  isCancelling: boolean
}

export function ReservationCard({
  reservation,
  showConfirmButton,
  onConfirm,
  onCancel,
  isConfirming,
  isCancelling,
}: ReservationCardProps) {
  const startDate = parseISO(`${reservation.fecha}T${reservation.horaInicio}`)
  const endDate = parseISO(`${reservation.fecha}T${reservation.horaFin}`)
  const confirmationDeadline = parseISO(`${reservation.fecha}T${reservation.horaInicio}`)
  const isPastDeadline = isAfter(new Date(), confirmationDeadline)
  const isPastReservation = isAfter(new Date(), endDate)

  // Calculate time until deadline
  const getTimeUntilDeadline = (reservation: Reservation) => {
    const deadline = parseISO(`${reservation.fecha}T${reservation.horaInicio}`)
    const now = new Date()
    const diffInMs = deadline.getTime() - now.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const hours = Math.floor(diffInMinutes / 60)
    const minutes = diffInMinutes % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const timeUntilDeadline = getTimeUntilDeadline(reservation)

  // Get status display text
  const getStatusText = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'Pendiente'
      case 'CONFIRMADA':
        return 'Confirmada'
      case 'CANCELADA':
        return 'Cancelada'
      default:
        return estado
    }
  }

  // Get status badge variant
  const getStatusVariant = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'outline'
      case 'CONFIRMADA':
        return 'default'
      case 'CANCELADA':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{reservation.cancha.nombre}</h3>
                <Badge variant="outline">{reservation.cancha.deporte.nombre}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{reservation.cancha.club.nombre} - {reservation.cancha.club.direccion}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={
                  reservation.estado === 'PENDIENTE'
                    ? 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-yellow-500 text-yellow-700'
                    : reservation.estado === 'CONFIRMADA'
                    ? 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800'
                    : reservation.estado === 'CANCELADA'
                    ? 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-destructive text-destructive-foreground'
                    : 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold'
                }
              >
                {reservation.estado === "PENDIENTE" && (
                  <><Clock className="h-3 w-3 mr-1" /><span>&nbsp;{getStatusText(reservation.estado)}</span></>
                )}
                {reservation.estado === "CONFIRMADA" && (
                  <><Check className="h-3 w-3 mr-1" /><span>&nbsp;{getStatusText(reservation.estado)}</span></>
                )}
                {reservation.estado === "CANCELADA" && (
                  <><AlertCircle className="h-3 w-3 mr-1" /><span>&nbsp;{getStatusText(reservation.estado)}</span></>
                )}
                {["PENDIENTE", "CONFIRMADA", "CANCELADA"].indexOf(reservation.estado) === -1 && (
                  <span>{getStatusText(reservation.estado)}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(startDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }).toLocaleLowerCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")} hs
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">
              $ {reservation.precio.toLocaleString()}
            </div>
            {reservation.estado === "PENDIENTE" && !isPastDeadline && (
              <div className="text-sm text-muted-foreground">
                Confirma en {timeUntilDeadline}
              </div>
            )}
          </div>

          {reservation.estado === "PENDIENTE" && showConfirmButton && !isPastDeadline && (
            <div className="flex flex-col sm:flex-row gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    className="w-full sm:w-auto"
                    disabled={isConfirming}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Confirmar asistencia
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      ¿Confirmar asistencia a la reserva?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Al confirmar tu asistencia, te comprometes a asistir a la
                      cancha en el horario reservado.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onConfirm(reservation.id)}>
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    disabled={isCancelling}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Cancelar reserva
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Cancelar la reserva?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Al cancelar la reserva, el horario quedará disponible para
                      otros usuarios.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Volver</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onCancel(reservation.id)}>
                      Sí, cancelar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {reservation.estado === "CONFIRMADA" && !isPastReservation && (
            <div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    disabled={isCancelling}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Cancelar reserva
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Cancelar la reserva?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Al cancelar la reserva, el horario quedará disponible para
                      otros usuarios.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Volver</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onCancel(reservation.id)}>
                      Sí, cancelar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface MyReservationsProps {
  reservations: Reservation[]
  userId: string
}

export function MyReservations({ reservations, userId }: MyReservationsProps) {
  const { toast } = useToast()
  const [isConfirming, setIsConfirming] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const handleConfirmAttendance = async (id: string) => {
    try {
      setIsConfirming(true)
      const result = await confirmReservationAction(id)
      if (result.success) {
        toast({
          title: "Reserva confirmada",
          description: "Tu asistencia ha sido confirmada correctamente.",
        })
      } else {
        throw new Error("No se pudo confirmar la reserva")
      }
    } catch (error) {
      toast({
        title: "Error al confirmar",
        description: "No se pudo confirmar tu asistencia. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsConfirming(false)
    }
  }

  const handleCancelReservation = async (id: string) => {
    try {
      setIsCancelling(true)
      const result = await cancelReservationAction(id)
      if (result.success) {
        toast({
          title: "Reserva cancelada",
          description: "La reserva ha sido cancelada correctamente.",
        })
      } else {
        throw new Error("No se pudo cancelar la reserva")
      }
    } catch (error) {
      toast({
        title: "Error al cancelar",
        description: "No se pudo cancelar la reserva. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
    }
  }

  const upcomingReservations = reservations.filter((reservation) => {
    const endDate = parseISO(`${reservation.fecha}T${reservation.horaFin}`)
    return !isAfter(new Date(), endDate)
  })

  const pastReservations = reservations.filter((reservation) => {
    const endDate = parseISO(`${reservation.fecha}T${reservation.horaFin}`)
    return isAfter(new Date(), endDate)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Mis Reservas</h2>
        <Link href="/reservations/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nueva reserva
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Próximas</TabsTrigger>
          <TabsTrigger value="past">Historial</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingReservations.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">
                No tienes reservas próximas
              </p>
            </div>
          ) : (
            upcomingReservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                showConfirmButton={true}
                onConfirm={handleConfirmAttendance}
                onCancel={handleCancelReservation}
                isConfirming={isConfirming}
                isCancelling={isCancelling}
              />
            ))
          )}
        </TabsContent>
        <TabsContent value="past" className="space-y-4">
          {pastReservations.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">
                No tienes reservas pasadas
              </p>
            </div>
          ) : (
            pastReservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                showConfirmButton={false}
                onConfirm={handleConfirmAttendance}
                onCancel={handleCancelReservation}
                isConfirming={isConfirming}
                isCancelling={isCancelling}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
