"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import apiClient, { Cancha } from '@/lib/api-client'

export default function AdminCourtsPage() {
  const [courts, setCourts] = useState<Cancha[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCourts = async () => {
      setLoading(true)
      const response = await apiClient.getCanchas()
      if (response.data) {
        setCourts(response.data)
      } else {
        setCourts([])
      }
      setLoading(false)
    }
    loadCourts()
  }, [])

  const filteredCourts = courts.filter(court =>
    court.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (court.deporte?.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (court.ubicacion?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: Cancha['status']) => {
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Cargando canchas...
                  </TableCell>
                </TableRow>
              ) : filteredCourts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No se encontraron canchas.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourts.map((court) => (
                  <TableRow key={court.id}>
                    <TableCell className="font-medium">{court.nombre}</TableCell>
                    <TableCell>{court.deporte}</TableCell>
                    <TableCell>{getStatusBadge(court.status)}</TableCell>
                    <TableCell>${court.precio.toLocaleString()}</TableCell>
                    <TableCell>{court.ubicacion}</TableCell>
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 