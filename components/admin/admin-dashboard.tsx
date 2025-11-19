'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  Clock,
  Trophy,
  Star,
  ArrowUpRight,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'
import { formatCurrency } from '@/lib/analytics/formatters'

// Helper function to format currency with proper abbreviations
const formatCurrencyCompact = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 2)}M`
  }
  if (value >= 1000) {
    return `$${Math.round(value / 1000)}K`
  }
  return formatCurrency(value)
}

// Mock data for demonstration - replace with real API data
const revenueData = [
  { month: 'Ene', revenue: 45000, reservations: 120, users: 89 },
  { month: 'Feb', revenue: 52000, reservations: 140, users: 95 },
  { month: 'Mar', revenue: 48000, reservations: 135, users: 92 },
  { month: 'Abr', revenue: 61000, reservations: 165, users: 108 },
  { month: 'May', revenue: 55000, reservations: 150, users: 102 },
  { month: 'Jun', revenue: 67000, reservations: 180, users: 115 },
]

const hourlyData = [
  { hour: '08:00', reservations: 12 },
  { hour: '10:00', reservations: 25 },
  { hour: '12:00', reservations: 35 },
  { hour: '14:00', reservations: 42 },
  { hour: '16:00', reservations: 38 },
  { hour: '18:00', reservations: 45 },
  { hour: '20:00', reservations: 32 },
  { hour: '22:00', reservations: 18 },
]

const sportData = [
  { name: 'Fútbol', value: 45, color: '#2563eb' },
  { name: 'Baloncesto', value: 30, color: '#dc2626' },
  { name: 'Tenis', value: 15, color: '#16a34a' },
  { name: 'Pádel', value: 10, color: '#8b5cf6' }
]

const topCourts = [
  { name: 'Cancha Central', reservations: 89, revenue: 12500, rating: 4.8, status: 'active' },
  { name: 'Polideportivo Norte', reservations: 76, revenue: 9800, rating: 4.6, status: 'active' },
  { name: 'Complejo Sur', reservations: 65, revenue: 8200, rating: 4.4, status: 'maintenance' },
  { name: 'Club Atlético', reservations: 58, revenue: 7600, rating: 4.2, status: 'active' },
]

const recentActivity = [
  { type: 'reservation', user: 'Juan Pérez', court: 'Cancha Central', time: '2 min ago', status: 'confirmed' },
  { type: 'cancellation', user: 'María García', court: 'Polideportivo Norte', time: '5 min ago', status: 'cancelled' },
  { type: 'payment', user: 'Carlos López', amount: '$85', time: '10 min ago', status: 'completed' },
  { type: 'registration', user: 'Ana Martínez', time: '15 min ago', status: 'active' },
]

export function AdminDashboard() {
  const [loading, setLoading] = useState(false)
  const [period, setPeriod] = useState('7d')
  const [stats, setStats] = useState({
    totalReservations: 1255,
    totalRevenue: 328500,
    activeUsers: 892,
    occupancyRate: 78.5,
    growthRate: 12.5,
    cancellationRate: 8.2
  })

  const refreshData = async () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => setLoading(false), 1000)
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-lg">Panel de control administrativo</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={refreshData} disabled={loading} className="border-gray-200 hover:bg-gray-50">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button className="bg-gray-900 hover:bg-gray-800 text-white">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-gray-800 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Reservas Totales</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +12%
              </Badge>
              <Calendar className="h-4 w-4 text-gray-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalReservations.toLocaleString()}</div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2">
              <TrendingUp className="h-4 w-4 text-gray-600" />
              <span>+156 vs mes anterior</span>
            </div>
            <Progress value={75} className="mt-3 h-2 bg-gray-100" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-700 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ingresos Totales</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +18%
              </Badge>
              <DollarSign className="h-4 w-4 text-gray-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{formatCurrencyCompact(stats.totalRevenue)}</div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2">
              <TrendingUp className="h-4 w-4 text-gray-600" />
              <span>+$45K vs mes anterior</span>
            </div>
            <Progress value={85} className="mt-3 h-2 bg-gray-100" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-600 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Usuarios Activos</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +8%
              </Badge>
              <Users className="h-4 w-4 text-gray-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.activeUsers.toLocaleString()}</div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2">
              <Activity className="h-4 w-4 text-gray-600" />
              <span>+67 nuevos usuarios</span>
            </div>
            <Progress value={68} className="mt-3 h-2 bg-gray-100" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-500 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tasa de Ocupación</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +5%
              </Badge>
              <Activity className="h-4 w-4 text-gray-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.occupancyRate}%</div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <span>Promedio semanal</span>
            </div>
            <Progress value={stats.occupancyRate} className="mt-3 h-2 bg-gray-100" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full lg:w-[600px] grid-cols-4 bg-gray-100">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">Resumen</TabsTrigger>
          <TabsTrigger value="revenue" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">Ingresos</TabsTrigger>
          <TabsTrigger value="usage" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">Uso</TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">Analíticas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Evolución de Reservas
                </CardTitle>
                <CardDescription>Tendencia de reservas en los últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorReservations" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="reservations" 
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#colorReservations)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Deportes Populares
                </CardTitle>
                <CardDescription>Distribución por tipo de deporte</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={sportData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${(Number(percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={120}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Actividad por Hora
                </CardTitle>
                <CardDescription>Distribución de reservas durante el día</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="hour" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '8px' 
                      }} 
                    />
                    <Bar dataKey="reservations" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Top Canchas
                </CardTitle>
                <CardDescription>Canchas más populares este mes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCourts.map((court, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{court.name}</p>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Star className="h-3 w-3 fill-current text-gray-400" />
                            <span>{court.rating}</span>
                            <span>•</span>
                            <span>{court.reservations} reservas</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${court.revenue.toLocaleString()}</p>
                        <Badge 
                          variant={court.status === 'active' ? 'default' : 'secondary'}
                          className={court.status === 'active' ? 'bg-green-100 text-green-700' : ''}
                        >
                          {court.status === 'active' ? 'Activa' : 'Mantenimiento'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Ingresos</CardTitle>
              <CardDescription>Ingresos detallados por período</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Uso por Hora</CardTitle>
                <CardDescription>Patrones de uso durante el día</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="reservations" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>Últimas actividades del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {activity.type === 'reservation' && 'Nueva reserva'}
                          {activity.type === 'cancellation' && 'Cancelación'}
                          {activity.type === 'payment' && 'Pago procesado'}
                          {activity.type === 'registration' && 'Nuevo usuario'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.user} {activity.court && `- ${activity.court}`} {activity.amount}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tasa de Conversión</p>
                    <p className="text-2xl font-bold">24.3%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tiempo Promedio</p>
                    <p className="text-2xl font-bold">2.4h</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Satisfacción</p>
                    <p className="text-2xl font-bold">4.7/5</p>
                  </div>
                  <Star className="h-8 w-8 text-gray-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
