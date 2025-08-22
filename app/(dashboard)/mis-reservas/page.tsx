/**
 * Mis Reservas Page for CanchaYA
 * User's reservations management with real-time data from backend
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
  Plus,
  MoreVertical
} from 'lucide-react'
import { useAuth } from '@/components/auth/auth-context'
import apiClient, { Reserva } from '@/lib/api-client'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import Link from 'next/link'
import Image from 'next/image'

function ReservationCard({ reserva, onCancel }: { reserva: Reserva; onCancel: (id: string) => void }) {
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'CONFIRMADA':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'PENDIENTE':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'CANCELADA':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'CONFIRMADA':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'CANCELADA':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const response = await apiClient.cancelReserva(reserva.id)
      if (response.error) {
        toast.error(response.error)
      } else {
        toast.success('Reserva cancelada exitosamente')
        onCancel(reserva.id)
      }
    } catch (error) {
      toast.error('Error al cancelar la reserva')
    } finally {
      setCancelling(false)
      setShowCancelDialog(false)
    }
  }

  const canCancel = reserva.estado === 'PENDIENTE' || reserva.estado === 'CONFIRMADA'
  const reservationDate = new Date(`${reserva.fecha}T${reserva.hora}`)
  const isUpcoming = reservationDate > new Date()

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Court Image */}
            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src="/cancha.jpeg"
                alt={reserva.cancha?.nombre || 'Cancha'}
                fill
                className="object-cover"
              />
            </div>

            {/* Reservation Details */}
            <div className="flex-1 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    {reserva.cancha?.nombre}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {reserva.cancha?.club?.nombre}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`px-3 py-1 ${getStatusColor(reserva.estado)}`}>
                    {getStatusIcon(reserva.estado)}
                    <span className="ml-1 font-medium">{reserva.estado}</span>
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/cancha/${reserva.canchaId}`}>
                          Ver cancha
                        </Link>
                      </DropdownMenuItem>
                      {canCancel && isUpcoming && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setShowCancelDialog(true)}
                            className="text-red-600"
                          >
                            Cancelar reserva
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  <span>{new Date(reserva.fecha).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Clock className="h-4 w-4 mr-2 text-primary" />
                  <span>{reserva.hora}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  <span>{reserva.cancha?.ubicacion}</span>
                </div>
                {reserva.monto && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <CreditCard className="h-4 w-4 mr-2 text-primary" />
                    <span>${reserva.monto.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {isUpcoming && reserva.estado === 'CONFIRMADA' && (
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline">
                    Modificar
                  </Button>
                  <Button size="sm" variant="outline">
                    Contactar Club
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La reserva será cancelada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mantener reserva</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelling ? 'Cancelando...' : 'Sí, cancelar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Skeleton className="w-20 h-20 rounded-lg" />
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function MisReservasPage() {
  const { user, isAuthenticated } = useAuth()
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (!isAuthenticated) return

    const fetchReservas = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await apiClient.getReservas()
        if (response.data) {
          setReservas(response.data)
        } else {
          setError(response.error || 'Error al cargar las reservas')
        }
      } catch (error) {
        setError('Error de conexión al servidor')
      } finally {
        setLoading(false)
      }
    }

    fetchReservas()
  }, [isAuthenticated])

  const handleCancelReservation = (reservaId: string) => {
    setReservas(prev => prev.filter(r => r.id !== reservaId))
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Inicia sesión para ver tus reservas</h2>
            <p className="text-gray-600 mb-4">
              Necesitas estar autenticado para acceder a esta página.
            </p>
            <Link href="/login">
              <Button>Iniciar Sesión</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filterReservas = (reservas: Reserva[], filter: string) => {
    const now = new Date()
    switch (filter) {
      case 'upcoming':
        return reservas.filter(r => {
          const reservationDate = new Date(`${r.fecha}T${r.hora}`)
          return reservationDate > now && (r.estado === 'CONFIRMADA' || r.estado === 'PENDIENTE')
        })
      case 'past':
        return reservas.filter(r => {
          const reservationDate = new Date(`${r.fecha}T${r.hora}`)
          return reservationDate <= now
        })
      case 'cancelled':
        return reservas.filter(r => r.estado === 'CANCELADA')
      default:
        return reservas
    }
  }

  const filteredReservas = filterReservas(reservas, activeTab)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                Mis Reservas
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Gestiona todas tus reservas de canchas deportivas
              </p>
            </div>
            <Link href="/">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Reserva
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {reservas.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {reservas.filter(r => r.estado === 'CONFIRMADA').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Confirmadas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {reservas.filter(r => r.estado === 'PENDIENTE').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Pendientes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {reservas.filter(r => r.estado === 'CANCELADA').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Canceladas</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="upcoming">Próximas</TabsTrigger>
            <TabsTrigger value="past">Pasadas</TabsTrigger>
            <TabsTrigger value="cancelled">Canceladas</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <LoadingSkeleton />
            ) : error ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
                  <h3 className="text-xl font-semibold mb-2">Error al cargar las reservas</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>
                    Reintentar
                  </Button>
                </CardContent>
              </Card>
            ) : filteredReservas.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">
                    {activeTab === 'all' ? 'No tienes reservas' : 
                     activeTab === 'upcoming' ? 'No tienes reservas próximas' :
                     activeTab === 'past' ? 'No tienes reservas pasadas' :
                     'No tienes reservas canceladas'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {activeTab === 'all' ? 'Comienza reservando tu primera cancha deportiva.' :
                     activeTab === 'upcoming' ? 'Reserva una cancha para tus próximos partidos.' :
                     activeTab === 'past' ? 'Aquí aparecerán tus reservas completadas.' :
                     'Aquí aparecerán las reservas que hayas cancelado.'}
                  </p>
                  <Link href="/">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Hacer Reserva
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredReservas.map((reserva) => (
                  <ReservationCard
                    key={reserva.id}
                    reserva={reserva}
                    onCancel={handleCancelReservation}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}