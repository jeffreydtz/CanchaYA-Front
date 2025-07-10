'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '@/components/auth/auth-context'
import { useToast } from '@/hooks/use-toast'
import apiClient from '@/lib/api-client'
import Link from 'next/link'

interface Reservation {
  id: string
  courtName: string
  courtId: string
  date: string
  time: string
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  price: number
  createdAt: string
}

export default function MyReservations() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadReservations = async () => {
      if (!user?.id) return

      try {
        const response = await apiClient.getUserReservations(user.id)
        if (response.data) {
          setReservations(response.data)
        }
      } catch (error) {
        console.error('Error loading reservations:', error)
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las reservas',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadReservations()
  }, [user?.id, toast])

  const handleConfirmReservation = async (reservationId: string) => {
    try {
      const response = await apiClient.confirmReservation(reservationId)
      if (response.data) {
        setReservations(prev => 
          prev.map(r => r.id === reservationId ? { ...r, status: 'confirmed' as const } : r)
        )
        toast({
          title: 'Reserva confirmada',
          description: 'Tu reserva ha sido confirmada exitosamente',
        })
      }
    } catch (error) {
      console.error('Error confirming reservation:', error)
      toast({
        title: 'Error',
        description: 'No se pudo confirmar la reserva',
        variant: 'destructive',
      })
    }
  }

  const handleCancelReservation = async (reservationId: string) => {
    try {
      const response = await apiClient.cancelReservation(reservationId)
      if (response.data) {
        setReservations(prev => 
          prev.map(r => r.id === reservationId ? { ...r, status: 'cancelled' as const } : r)
        )
        toast({
          title: 'Reserva cancelada',
          description: 'Tu reserva ha sido cancelada',
        })
      }
    } catch (error) {
      console.error('Error cancelling reservation:', error)
      toast({
        title: 'Error',
        description: 'No se pudo cancelar la reserva',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmada
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelada
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Completada
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (timeString: string) => {
    return timeString
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mis Reservas</h1>
        <p className="text-muted-foreground">
          Gestiona todas tus reservas de canchas deportivas
        </p>
      </div>

      {reservations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tienes reservas</h3>
            <p className="text-muted-foreground mb-4">
              Aún no has realizado ninguna reserva. ¡Explora nuestras canchas y reserva tu espacio!
            </p>
            <Button asChild>
              <Link href="/">Ver Canchas</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Reservas Activas</CardTitle>
            <CardDescription>
              Lista de todas tus reservas de canchas deportivas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cancha</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                        {reservation.courtName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                        {formatDate(reservation.date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                        {formatTime(reservation.time)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                    <TableCell>${reservation.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {reservation.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleConfirmReservation(reservation.id)}
                            >
                              Confirmar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelReservation(reservation.id)}
                            >
                              Cancelar
                            </Button>
                          </>
                        )}
                        {reservation.status === 'confirmed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelReservation(reservation.id)}
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
