"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search } from 'lucide-react'
import apiClient, { Reserva } from '@/lib/api-client'

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reserva[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadReservations = async () => {
      setLoading(true)
      const response = await apiClient.getReservas()
      if (response.data) {
        setReservations(response.data)
      } else {
        setReservations([])
      }
      setLoading(false)
    }
    loadReservations()
  }, [])

  const filteredReservations = reservations.filter(reservation =>
    (reservation.disponibilidad?.cancha?.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (reservation.persona?.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (estado: Reserva['estado']) => {
    switch (estado) {
      case 'confirmada':
        return <Badge variant="default" className="bg-green-100 text-green-800">Confirmada</Badge>
      case 'pendiente':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Pendiente</Badge>
      case 'cancelada':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Cancelada</Badge>
      case 'completada':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Completada</Badge>
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

  if (reservations.length === 0) {
    return (
      <div className="text-center py-8">
        <p>No hay reservas registradas en el sistema.</p>
      </div>
    )
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
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Precio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.map((reservation) => {
                const { fecha, hora } = formatDateTime(reservation.fechaHora)
                return (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-medium">{reservation.disponibilidad?.cancha?.nombre || '-'}</TableCell>
                    <TableCell>{reservation.persona?.nombre || '-'}</TableCell>
                    <TableCell>{fecha}</TableCell>
                    <TableCell>{hora}</TableCell>
                    <TableCell>{getStatusBadge(reservation.estado)}</TableCell>
                    <TableCell>-</TableCell>
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