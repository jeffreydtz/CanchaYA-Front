"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search } from 'lucide-react'
import apiClient, { Reserva } from '@/lib/api-client'
import { withErrorBoundary } from '@/components/error/with-error-boundary'

function AdminReservationsPage() {
  const { isAuthenticated, loading: authLoading, nivelAcceso, clubIds } = useAuth()
  const [reservations, setReservations] = useState<Reserva[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  const isAdminClub = nivelAcceso === 'admin-club'
  const hasNoClubScope = isAdminClub && (!clubIds || clubIds.length === 0)

  useEffect(() => {
    if (!isAuthenticated || authLoading) {
      setLoading(false)
      return
    }

    // If admin-club user has no assigned clubs, don't request reservations (backend devolvería vacío igualmente)
    if (hasNoClubScope) {
      setReservations([])
      setLoading(false)
      return
    }

    let isMounted = true

    const loadReservations = async () => {
      setLoading(true)
      try {
        const response = await apiClient.getReservas()
        if (!isMounted) return
        if (response.data) {
          setReservations(response.data)
        } else {
          setReservations([])
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error loading reservations:', error)
          setReservations([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    loadReservations()

    return () => {
      isMounted = false
    }
  }, [isAuthenticated, authLoading, hasNoClubScope])

  const filteredReservations = reservations.filter(reservation =>
    (reservation.disponibilidad?.cancha?.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (reservation.persona?.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (reservation.persona?.apellido?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (reservation.persona?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (estado: Reserva['estado']) => {
    switch (estado) {
      case 'confirmada':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">Confirmada</Badge>
      case 'pendiente':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">Pendiente</Badge>
      case 'cancelada':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">Cancelada</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const formatDateTime = (fechaHora: string) => {
    try {
      const date = new Date(fechaHora)
      return {
        fecha: date.toLocaleDateString('es-ES'),
        hora: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      }
    } catch {
      return { fecha: '-', hora: '-' }
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando reservas...</div>
  }

  const emptyStateContent = hasNoClubScope ? (
    <div className="text-center py-8 space-y-2">
      <p className="font-semibold">No tenés reservas para mostrar todavía.</p>
      <p className="text-sm text-muted-foreground">
        Sos <strong>Admin Club</strong> pero no tenés clubes asignados. Un admin global debe asignarte clubes para que puedas ver y gestionar reservas.
      </p>
    </div>
  ) : (
    <div className="text-center py-8">
      <p>No hay reservas registradas en el sistema.</p>
    </div>
  )

  if (reservations.length === 0) {
    return emptyStateContent
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Reservas</h1>
        <p className="text-muted-foreground">Administra todas las reservas del sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reservas Registradas</CardTitle>
          <CardDescription>
            Lista de todas las reservas realizadas por los usuarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar reservas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cancha</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Horario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Creada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.map((reservation) => {
                const { fecha, hora } = formatDateTime(reservation.fechaHora)
                const { fecha: fechaCreacion } = formatDateTime(reservation.creadaEl)
                const fullName = `${reservation.persona?.nombre || ''} ${reservation.persona?.apellido || ''}`.trim()
                const horario = reservation.disponibilidad?.horario
                  ? `${reservation.disponibilidad.horario.horaInicio} - ${reservation.disponibilidad.horario.horaFin}`
                  : '-'

                return (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-medium">{reservation.disponibilidad?.cancha?.nombre || '-'}</TableCell>
                    <TableCell>{fullName || '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{reservation.persona?.email || '-'}</TableCell>
                    <TableCell>{fecha}</TableCell>
                    <TableCell>{hora}</TableCell>
                    <TableCell className="text-sm">{horario}</TableCell>
                    <TableCell>{getStatusBadge(reservation.estado)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fechaCreacion}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default withErrorBoundary(AdminReservationsPage, 'Gestión de Reservas')