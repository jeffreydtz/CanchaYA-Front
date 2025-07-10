"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'

interface Court {
  id: string
  name: string
  sport: string
  status: 'available' | 'maintenance' | 'reserved'
  price: number
  location: string
}

const mockCourts: Court[] = [
  {
    id: '1',
    name: 'Cancha de Fútbol 1',
    sport: 'Fútbol',
    status: 'available',
    price: 50000,
    location: 'Zona Norte'
  },
  {
    id: '2',
    name: 'Cancha de Baloncesto 1',
    sport: 'Baloncesto',
    status: 'maintenance',
    price: 30000,
    location: 'Zona Sur'
  },
  {
    id: '3',
    name: 'Cancha de Tenis 1',
    sport: 'Tenis',
    status: 'reserved',
    price: 40000,
    location: 'Zona Este'
  }
]

export default function AdminCourtsPage() {
  const [courts, setCourts] = useState<Court[]>(mockCourts)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCourts = courts.filter(court =>
    court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    court.sport.toLowerCase().includes(searchTerm.toLowerCase()) ||
    court.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: Court['status']) => {
    switch (status) {
      case 'available':
        return <Badge variant="default" className="bg-green-100 text-green-800">Disponible</Badge>
      case 'maintenance':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Mantenimiento</Badge>
      case 'reserved':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Reservada</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Canchas</h1>
          <p className="text-muted-foreground">Administra las canchas deportivas del sistema</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Cancha
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Canchas Registradas</CardTitle>
          <CardDescription>
            Lista de todas las canchas deportivas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar canchas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Deporte</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourts.map((court) => (
                <TableRow key={court.id}>
                  <TableCell className="font-medium">{court.name}</TableCell>
                  <TableCell>{court.sport}</TableCell>
                  <TableCell>{getStatusBadge(court.status)}</TableCell>
                  <TableCell>${court.price.toLocaleString()}</TableCell>
                  <TableCell>{court.location}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 