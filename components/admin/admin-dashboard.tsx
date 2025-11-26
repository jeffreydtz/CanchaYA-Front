'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter } from 'recharts'
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
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/analytics/formatters'
import apiClient, { AdminResumen, TopJugador, CanchaMasUsada, PersonaConDeuda, ReservasAggregate } from '@/lib/api-client'

// Helper function to format currency with proper abbreviations
const formatCurrencyCompact = (value: number): string => {
  // Validate input
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return '$0'
  }
  
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 2)}M`
  }
  if (value >= 1000) {
    return `$${Math.round(value / 1000)}K`
  }
  return formatCurrency(value)
}

// Default mock data for demonstration
const defaultMockData = {
  resumen: {
    totalUsuarios: 1255,
    totalReservas: 3890,
    totalCanchas: 45,
    deudaTotalPendiente: 125000
  },
  topJugadores: [
    { personaId: '1', nombre: 'Juan Pérez', email: 'juan@example.com', ranking: 1 },
    { personaId: '2', nombre: 'María García', email: 'maria@example.com', ranking: 2 },
    { personaId: '3', nombre: 'Carlos López', email: 'carlos@example.com', ranking: 3 },
  ],
  canchasMasUsadas: [
    { canchaId: '1', nombre: 'Cancha Central', totalReservas: 89 },
    { canchaId: '2', nombre: 'Polideportivo Norte', totalReservas: 76 },
    { canchaId: '3', nombre: 'Complejo Sur', totalReservas: 65 },
  ]
}

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

export function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')
  const [resumen, setResumen] = useState<AdminResumen | null>(null)
  const [topJugadores, setTopJugadores] = useState<TopJugador[]>([])
  const [canchasMasUsadas, setCanchasMasUsadas] = useState<CanchaMasUsada[]>([])
  const [personasConDeuda, setPersonasConDeuda] = useState<PersonaConDeuda[]>([])
  const [reservasData, setReservasData] = useState<ReservasAggregate[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [period])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Calculate date range based on period
      const endDate = new Date()
      const startDate = new Date()

      if (period === '7d') {
        startDate.setDate(endDate.getDate() - 7)
      } else if (period === '30d') {
        startDate.setDate(endDate.getDate() - 30)
      } else if (period === '90d') {
        startDate.setDate(endDate.getDate() - 90)
      } else {
        startDate.setFullYear(endDate.getFullYear() - 1)
      }

      const fromDate = startDate.toISOString().split('T')[0]
      const toDate = endDate.toISOString().split('T')[0]

      // Fetch all data in parallel
      const [
        resumenRes,
        topJugadoresRes,
        canchasMasUsadasRes,
        deudaRes,
        reservasRes
      ] = await Promise.all([
        apiClient.getAdminResumen(),
        apiClient.getAdminTopJugadores(fromDate, toDate),
        apiClient.getAdminCanchasMasUsadas(fromDate, toDate),
        apiClient.getAdminPersonasConDeuda(),
        apiClient.getAdminReservasAggregate('day', fromDate, toDate)
      ])

      if (!resumenRes.error && resumenRes.data) {
        setResumen(resumenRes.data)
      }
      if (!topJugadoresRes.error && topJugadoresRes.data) {
        setTopJugadores(topJugadoresRes.data.slice(0, 5))
      }
      if (!canchasMasUsadasRes.error && canchasMasUsadasRes.data) {
        setCanchasMasUsadas(canchasMasUsadasRes.data.slice(0, 5))
      }
      if (!deudaRes.error && deudaRes.data) {
        setPersonasConDeuda(deudaRes.data.slice(0, 5))
      }
      if (!reservasRes.error && reservasRes.data) {
        setReservasData(reservasRes.data)
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Error al cargar los datos del dashboard')
      // Use mock data on error
      setResumen(defaultMockData.resumen)
      setTopJugadores(defaultMockData.topJugadores)
      setCanchasMasUsadas(defaultMockData.canchasMasUsadas)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    fetchDashboardData()
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
          <div className="flex items-center space-x-1">
            <Button
              variant={period === '7d' ? 'default' : 'outline'}
              onClick={() => setPeriod('7d')}
              size="sm"
              className="text-xs"
            >
              7d
            </Button>
            <Button
              variant={period === '30d' ? 'default' : 'outline'}
              onClick={() => setPeriod('30d')}
              size="sm"
              className="text-xs"
            >
              30d
            </Button>
            <Button
              variant={period === '90d' ? 'default' : 'outline'}
              onClick={() => setPeriod('90d')}
              size="sm"
              className="text-xs"
            >
              90d
            </Button>
            <Button
              variant={period === '1y' ? 'default' : 'outline'}
              onClick={() => setPeriod('1y')}
              size="sm"
              className="text-xs"
            >
              1a
            </Button>
          </div>
          <Button variant="outline" onClick={refreshData} disabled={loading} className="border-gray-200 hover:bg-gray-50">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-2 p-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-gray-200 rounded mb-2" />
                <div className="h-6 bg-gray-100 rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-600 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Reservas Totales</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{resumen ? formatNumber(resumen.totalReservas) : '—'}</div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span>En el período seleccionado</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-600 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Deuda Pendiente</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{resumen ? formatCurrencyCompact(resumen.deudaTotalPendiente) : '—'}</div>
              <div className="flex items-center space-x-2 text-sm text-red-600 mt-2">
                <TrendingUp className="h-4 w-4" />
                <span>Total pendiente por cobrar</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-600 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Usuarios Registrados</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{resumen ? formatNumber(resumen.totalUsuarios) : '—'}</div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2">
                <Activity className="h-4 w-4 text-purple-600" />
                <span>En total en el sistema</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-600 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Canchas Disponibles</CardTitle>
              <Trophy className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{resumen ? formatNumber(resumen.totalCanchas) : '—'}</div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span>Canchas activas</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
                <CardDescription>Tendencia diaria de reservas</CardDescription>
              </CardHeader>
              <CardContent>
                {reservasData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={reservasData}>
                      <defs>
                        <linearGradient id="colorReservations" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="bucket" axisLine={false} tickLine={false} height={40} tick={{fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        formatter={(value: any) => formatNumber(value)}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#colorReservations)"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[350px] flex items-center justify-center text-gray-500">
                    Sin datos disponibles
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Top Canchas
                </CardTitle>
                <CardDescription>Canchas más usadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {canchasMasUsadas.length > 0 ? (
                    canchasMasUsadas.map((cancha, index) => (
                      <div key={cancha.canchaId} className="flex items-center justify-between p-2 rounded-lg border-b">
                        <div className="flex items-center space-x-3">
                          <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600">
                            #{index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{cancha.nombre}</p>
                            <p className="text-xs text-muted-foreground">{cancha.totalReservas} reservas</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">Sin datos</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Top Jugadores
                </CardTitle>
                <CardDescription>Jugadores con mayor ranking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topJugadores.length > 0 ? (
                    topJugadores.map((jugador, index) => (
                      <div key={jugador.personaId} className="flex items-center justify-between p-2 rounded-lg border-b hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center text-xs font-semibold text-purple-600">
                            #{index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{jugador.nombre}</p>
                            <p className="text-xs text-muted-foreground">{jugador.email}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-purple-50">
                          Ranking #{jugador.ranking}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">Sin datos</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Personas con Deuda
                </CardTitle>
                <CardDescription>Cuentas con deuda pendiente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {personasConDeuda.length > 0 ? (
                    personasConDeuda.map((persona) => (
                      <div key={persona.personaId} className="flex items-center justify-between p-3 rounded-lg border-l-4 border-l-red-400 bg-red-50">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{persona.nombre}</p>
                          <p className="text-xs text-muted-foreground">{persona.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-red-700">{formatCurrencyCompact(persona.totalDeuda)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">Sin deudas pendientes</p>
                  )}
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
                <LineChart data={reservasData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#22c55e" strokeWidth={3} />
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
                  {topJugadores && topJugadores.length > 0 ? (
                    topJugadores.map((player, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Top Jugador #{player.ranking}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {player.nombre} - {player.email}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No hay datos disponibles</p>
                  )}
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
