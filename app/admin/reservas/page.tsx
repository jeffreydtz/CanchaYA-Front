"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  DollarSign, 
  Search,
  CalendarDays,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import apiClient, { Reservation } from "@/lib/api-client"

export default function AdminReservasPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    loadReservations()
  }, [])

  const loadReservations = async () => {
    try {
      const response = await apiClient.getAllReservations()
      if (response.data) {
        setReservations(response.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las reservas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (fecha: string, hora: string) => {
    const dateTimeString = `${fecha}T${hora}`
    const dateTime = parseISO(dateTimeString)
    return {
      date: format(dateTime, "dd/MM/yyyy", { locale: es }),
      time: format(dateTime, "HH:mm", { locale: es }),
      fullDate: format(dateTime, "dd/MM/yyyy HH:mm", { locale: es })
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getStatusBadge = (reservation: Reservation) => {
    if (reservation.confirmada) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        <CheckCircle className="h-3 w-3 mr-1" />
        Confirmada
      </Badge>
    }

    switch (reservation.estado) {
      case "CONFIRMADA":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <CalendarDays className="h-3 w-3 mr-1" />
          Reservada
        </Badge>
      case "PENDIENTE":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">
          <AlertCircle className="h-3 w-3 mr-1" />
          Pendiente
        </Badge>
      case "CANCELADA":
        return <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Cancelada
        </Badge>
      case "LIBERADA":
        return <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          Liberada
        </Badge>
      default:
        return <Badge variant="secondary">{reservation.estado}</Badge>
    }
  }

  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch = 
      reservation.usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.usuario.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.cancha.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.cancha.club.nombre.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || reservation.estado === statusFilter

    const matchesDate = (() => {
      if (dateFilter === "all") return true
      
      const reservationDate = parseISO(reservation.fecha)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      switch (dateFilter) {
        case "today":
          return reservationDate.toDateString() === today.toDateString()
        case "tomorrow":
          return reservationDate.toDateString() === tomorrow.toDateString()
        case "this_week":
          const weekStart = new Date(today)
          weekStart.setDate(today.getDate() - today.getDay())
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 6)
          return reservationDate >= weekStart && reservationDate <= weekEnd
        default:
          return true
      }
    })()

    return matchesSearch && matchesStatus && matchesDate
  })

  // Calculate stats
  const stats = {
    total: reservations.length,
    pendientes: reservations.filter(r => r.estado === 'PENDIENTE').length,
    confirmadas: reservations.filter(r => r.estado === 'CONFIRMADA' || r.confirmada).length,
    canceladas: reservations.filter(r => r.estado === 'CANCELADA').length,
    ingresos: reservations
      .filter(r => r.estado === 'CONFIRMADA' || r.confirmada)
      .reduce((sum, r) => sum + r.precio, 0)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Reservas</h1>
          <p className="text-muted-foreground">Administra las reservas del sistema</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando reservas...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Reservas</h1>
        <p className="text-muted-foreground">Administra las reservas del sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendientes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmadas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.canceladas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(stats.ingresos)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por usuario, cancha o club..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="PENDIENTE">Pendiente</SelectItem>
            <SelectItem value="CONFIRMADA">Confirmada</SelectItem>
            <SelectItem value="CANCELADA">Cancelada</SelectItem>
            <SelectItem value="LIBERADA">Liberada</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Fecha" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las fechas</SelectItem>
            <SelectItem value="today">Hoy</SelectItem>
            <SelectItem value="tomorrow">Mañana</SelectItem>
            <SelectItem value="this_week">Esta semana</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Reservas ({filteredReservations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Cancha</TableHead>
                <TableHead>Fecha & Hora</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Creada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations
                .sort((a, b) => {
                  const dateA = parseISO(`${a.fecha}T${a.horaInicio}`)
                  const dateB = parseISO(`${b.fecha}T${b.horaInicio}`)
                  return dateB.getTime() - dateA.getTime()
                })
                .map((reservation) => {
                  const { date, time } = formatDateTime(reservation.fecha, reservation.horaInicio)
                  const createdDate = format(parseISO(reservation.fechaCreacion), "dd/MM/yyyy HH:mm", { locale: es })
                  
                  return (
                    <TableRow key={reservation.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {reservation.usuario.nombre} {reservation.usuario.apellido}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {reservation.usuario.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{reservation.cancha.nombre}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {reservation.cancha.club.nombre}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {date}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {time} - {reservation.horaFin}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(reservation)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(reservation.precio)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {createdDate}
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
          
          {filteredReservations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || statusFilter !== "all" || dateFilter !== "all" 
                ? "No se encontraron reservas con esos criterios" 
                : "No hay reservas registradas"
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 