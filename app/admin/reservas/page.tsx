"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Calendar, Clock, User } from 'lucide-react'

interface Reservation {
  id: string
  courtName: string
  userName: string
  date: string
  time: string
  status: 'confirmed' | 'pending' | 'cancelled'
  price: number
}

const mockReservations: Reservation[] = [
  {
    id: '1',
    courtName: 'Cancha de Fútbol 1',
    userName: 'Juan Pérez',
    date: '2024-01-15',
    time: '14:00 - 16:00',
    status: 'confirmed',
    price: 50000
  },
  {
    id: '2',
    courtName: 'Cancha de Baloncesto 1',
    userName: 'María García',
    date: '2024-01-16',
    time: '18:00 - 20:00',
    status: 'pending',
    price: 30000
  },
  {
    id: '3',
    courtName: 'Cancha de Tenis 1',
    userName: 'Carlos López',
    date: '2024-01-17',
    time: '10:00 - 12:00',
    status: 'cancelled',
    price: 40000
  }
]

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredReservations = reservations.filter(reservation =>
    reservation.courtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.userName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Confirmada</Badge>
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case 'cancelled':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Cancelada</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
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
                  <TableCell className="font-medium">{reservation.courtName}</TableCell>
                  <TableCell>{reservation.userName}</TableCell>
                  <TableCell>{reservation.date}</TableCell>
                  <TableCell>{reservation.time}</TableCell>
                  <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                  <TableCell>${reservation.price.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 