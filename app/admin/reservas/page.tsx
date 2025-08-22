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
    (reservation.cancha?.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (reservation.usuario?.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (estado: Reserva['estado']) => {
    switch (estado) {
      case 'confirmada':
        return <Badge variant="default" className="bg-green-100 text-green-800">Confirmada</Badge>
      case 'pendiente':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case 'liberada':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Liberada</Badge>
      case 'completada':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Completada</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
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
              {filteredReservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium">{reservation.cancha?.nombre}</TableCell>
                  <TableCell>{reservation.usuario?.nombre}</TableCell>
                  <TableCell>{reservation.fecha}</TableCell>
                  <TableCell>{reservation.hora}</TableCell>
                  <TableCell>{getStatusBadge(reservation.estado)}</TableCell>
                  <TableCell>{reservation.monto !== undefined ? `$${reservation.monto.toLocaleString()}` : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 