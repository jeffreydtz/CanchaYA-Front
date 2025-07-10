'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react'

interface DashboardData {
  period: string
  reservations: number
  revenue: number
  users: number
}

const mockData: DashboardData[] = [
  { period: 'Lun', reservations: 25, revenue: 1250000, users: 12 },
  { period: 'Mar', reservations: 30, revenue: 1500000, users: 15 },
  { period: 'Mié', reservations: 35, revenue: 1750000, users: 18 },
  { period: 'Jue', reservations: 40, revenue: 2000000, users: 20 },
  { period: 'Vie', reservations: 45, revenue: 2250000, users: 22 },
  { period: 'Sáb', reservations: 50, revenue: 2500000, users: 25 },
  { period: 'Dom', reservations: 55, revenue: 2750000, users: 28 }
]

export function AdminDashboard() {
  const totalReservations = mockData.reduce((sum, item) => sum + item.reservations, 0)
  const totalRevenue = mockData.reduce((sum, item) => sum + item.revenue, 0)
  const totalUsers = mockData.reduce((sum, item) => sum + item.users, 0)
  const averageReservations = Math.round(totalReservations / mockData.length)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
        <p className="text-muted-foreground">Resumen del rendimiento del sistema</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas Totales</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReservations}</div>
            <p className="text-xs text-muted-foreground">
              Promedio: {averageReservations} por día
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalRevenue / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">
              Promedio: ${(totalRevenue / mockData.length / 1000000).toFixed(1)}M por día
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Promedio: {Math.round(totalUsers / mockData.length)} por día
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Crecimiento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% vs semana anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Reservas por Día</CardTitle>
            <CardDescription>Evolución de las reservas durante la semana</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="reservations" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ingresos por Día</CardTitle>
            <CardDescription>Análisis de los ingresos generados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
