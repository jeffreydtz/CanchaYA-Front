'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

interface ReportData {
  period: string
  reservations: number
  revenue: number
  users: number
}

const mockData: ReportData[] = [
  { period: 'Ene', reservations: 120, revenue: 6000000, users: 45 },
  { period: 'Feb', reservations: 150, revenue: 7500000, users: 52 },
  { period: 'Mar', reservations: 180, revenue: 9000000, users: 68 },
  { period: 'Abr', reservations: 200, revenue: 10000000, users: 75 },
  { period: 'May', reservations: 220, revenue: 11000000, users: 82 },
  { period: 'Jun', reservations: 250, revenue: 12500000, users: 90 }
]

const sportData = [
  { name: 'Fútbol', value: 45, color: '#8884d8' },
  { name: 'Baloncesto', value: 30, color: '#82ca9d' },
  { name: 'Tenis', value: 15, color: '#ffc658' },
  { name: 'Voleibol', value: 10, color: '#ff7300' }
]

export default function AdminReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  const totalReservations = mockData.reduce((sum, item) => sum + item.reservations, 0)
  const totalRevenue = mockData.reduce((sum, item) => sum + item.revenue, 0)
  const totalUsers = mockData.reduce((sum, item) => sum + item.users, 0)
  const averageReservations = Math.round(totalReservations / mockData.length)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reportes y Estadísticas</h1>
          <p className="text-muted-foreground">Análisis detallado del rendimiento del sistema</p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Semana</SelectItem>
            <SelectItem value="month">Mes</SelectItem>
            <SelectItem value="quarter">Trimestre</SelectItem>
            <SelectItem value="year">Año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReservations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Promedio: {averageReservations} por período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalRevenue / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">
              Promedio: ${(totalRevenue / mockData.length / 1000000).toFixed(1)}M por período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Promedio: {Math.round(totalUsers / mockData.length)} por período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Ocupación</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% vs período anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Reservas por Período</CardTitle>
            <CardDescription>Evolución de las reservas a lo largo del tiempo</CardDescription>
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
            <CardTitle>Distribución por Deporte</CardTitle>
            <CardDescription>Porcentaje de reservas por tipo de deporte</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sportData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sportData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ingresos por Período</CardTitle>
          <CardDescription>Análisis detallado de los ingresos generados</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
} 