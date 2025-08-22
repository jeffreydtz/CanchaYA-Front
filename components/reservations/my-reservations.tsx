'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle, DollarSign } from 'lucide-react'
import { useAuth } from '@/components/auth/auth-context'
import { toast } from 'sonner'
import apiClient, { Reserva } from '@/lib/api-client'
import Link from 'next/link'

export default function MyReservations() {
  const { user, isAuthenticated } = useAuth()
  const [reservations, setReservations] = useState<Reserva[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadReservations = async () => {
      if (!isAuthenticated || !user?.id) {
        setIsLoading(false)
        return
      }

      try {
        const response = await apiClient.getReservas()
        if (response.error) {
          toast.error(response.error)
          return
        }

        if (response.data) {
          // Filter reservations for current user
          const userReservations = response.data.filter(r => r.usuarioId === user.id)
          setReservations(userReservations)
        }
      } catch (error) {
        console.error('Error loading reservations:', error)
        toast.error('No se pudieron cargar las reservas')
      } finally {
        setIsLoading(false)
      }
    }

    loadReservations()
  }, [user?.id, isAuthenticated])

  const handleConfirmReservation = async (reservationId: string) => {
    try {
      const response = await apiClient.confirmarReserva(reservationId)
      if (response.error) {
        toast.error(response.error)
        return
      }

      if (response.data) {
        setReservations(prev => 
          prev.map(r => r.id === reservationId ? { ...r, estado: 'confirmada' as const } : r)
        )
        toast.success('Tu reserva ha sido confirmada exitosamente')
      }
    } catch (error) {
      console.error('Error confirming reservation:', error)
      toast.error('No se pudo confirmar la reserva')
    }
  }

  const handleCancelReservation = async (reservationId: string) => {
    try {
      const response = await apiClient.cancelReserva(reservationId)
      if (response.error) {
        toast.error(response.error)
        return
      }

      // Remove the reservation from the list since it's deleted
      setReservations(prev => prev.filter(r => r.id !== reservationId))
      toast.success('Tu reserva ha sido cancelada')
    } catch (error) {
      console.error('Error cancelling reservation:', error)
      toast.error('No se pudo cancelar la reserva')
    }
  }

  const getStatusBadge = (status: Reserva['estado']) => {
    switch (status) {
      case 'confirmada':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmada
          </Badge>
        )
      case 'pendiente':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        )
      case 'liberada':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Liberada
          </Badge>
        )
      case 'completada':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completada
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        )
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5) // Extract HH:MM from HH:MM:SS
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Acceso Requerido</CardTitle>
            <CardDescription>
              Debes iniciar sesión para ver tus reservas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">Iniciar Sesión</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mis Reservas</h1>
        <Link href="/">
          <Button variant="outline">Hacer nueva reserva</Button>
        </Link>
      </div>

      {reservations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes reservas</h3>
            <p className="text-gray-600 mb-4">¡Comienza a reservar canchas para jugar!</p>
            <Link href="/">
              <Button>Explorar Canchas</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Card>
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
                      <TableCell>
                        <div>
                          <p className="font-medium">{reservation.cancha?.nombre || 'Cancha no especificada'}</p>
                          <p className="text-sm text-gray-600 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {reservation.cancha?.ubicacion || 'Ubicación no especificada'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(reservation.fecha)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          {formatTime(reservation.hora)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(reservation.estado)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                          {reservation.monto ? `$${reservation.monto}` : 'No especificado'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {reservation.estado === 'pendiente' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleConfirmReservation(reservation.id)}
                                className="text-xs"
                              >
                                Confirmar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelReservation(reservation.id)}
                                className="text-xs"
                              >
                                Cancelar
                              </Button>
                            </>
                          )}
                          {reservation.estado === 'confirmada' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelReservation(reservation.id)}
                              className="text-xs"
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
            </Card>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {reservations.map((reservation) => (
              <Card key={reservation.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{reservation.cancha?.nombre || 'Cancha no especificada'}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {reservation.cancha?.ubicacion || 'Ubicación no especificada'}
                      </CardDescription>
                    </div>
                    {getStatusBadge(reservation.estado)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">{formatDate(reservation.fecha)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">{formatTime(reservation.hora)}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                      <span className="text-sm">{reservation.monto ? `$${reservation.monto}` : 'No especificado'}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {reservation.estado === 'pendiente' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleConfirmReservation(reservation.id)}
                          className="flex-1"
                        >
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelReservation(reservation.id)}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                      </>
                    )}
                    {reservation.estado === 'confirmada' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelReservation(reservation.id)}
                        className="w-full"
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
