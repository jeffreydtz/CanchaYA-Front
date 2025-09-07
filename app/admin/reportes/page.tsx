'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  MapPin,
  Star,
  Activity
} from 'lucide-react'

// Enhanced mock data
const monthlyRevenueData = [
  { month: 'Ene', revenue: 45000, reservations: 320, profit: 12000, expenses: 33000 },
  { month: 'Feb', revenue: 52000, reservations: 380, profit: 16000, expenses: 36000 },
  { month: 'Mar', revenue: 48000, reservations: 350, profit: 14000, expenses: 34000 },
  { month: 'Abr', revenue: 61000, reservations: 420, profit: 19000, expenses: 42000 },
  { month: 'May', revenue: 55000, reservations: 390, profit: 17000, expenses: 38000 },
  { month: 'Jun', revenue: 67000, reservations: 480, profit: 22000, expenses: 45000 },
]

const weeklyData = [
  { day: 'Lun', reservations: 45, revenue: 3200 },
  { day: 'Mar', reservations: 52, revenue: 3800 },
  { day: 'Mié', reservations: 48, revenue: 3500 },
  { day: 'Jue', reservations: 61, revenue: 4200 },
  { day: 'Vie', reservations: 75, revenue: 5100 },
  { day: 'Sáb', reservations: 89, revenue: 6200 },
  { day: 'Dom', reservations: 67, revenue: 4800 },
]

const hourlyRevenueData = [
  { hour: '8:00', revenue: 1200 },
  { hour: '10:00', revenue: 2100 },
  { hour: '12:00', revenue: 3200 },
  { hour: '14:00', revenue: 4100 },
  { hour: '16:00', revenue: 3800 },
  { hour: '18:00', revenue: 4500 },
  { hour: '20:00', revenue: 3200 },
  { hour: '22:00', revenue: 1800 },
]

const sportData = [
  { name: 'Fútbol', value: 45, color: '#2563eb', revenue: 125000 },
  { name: 'Baloncesto', value: 30, color: '#dc2626', revenue: 89000 },
  { name: 'Tenis', value: 15, color: '#16a34a', revenue: 45000 },
  { name: 'Pádel', value: 10, color: '#ca8a04', revenue: 32000 }
]

const locationData = [
  { location: 'Zona Norte', reservations: 450, revenue: 125000, growth: 12.5 },
  { location: 'Centro', reservations: 380, revenue: 98000, growth: 8.2 },
  { location: 'Zona Sur', reservations: 320, revenue: 87000, growth: -2.1 },
  { location: 'Zona Este', reservations: 290, revenue: 76000, growth: 15.8 },
]

export default function AdminReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [loading, setLoading] = useState(false)
  
  // Enhanced stats
  const totalReservations = 1255
  const totalRevenue = 328500
  const totalUsers = 892
  const averageReservations = 180
  const profitMargin = 28.5
  const cancellationRate = 8.2
  const occupancyRate = 78.5

  const exportReport = () => {
    // Export functionality
    console.log('Exporting report...')
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Reportes y Analíticas</h1>
          <p className="text-muted-foreground text-lg">Análisis detallado del rendimiento empresarial</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mes</SelectItem>
              <SelectItem value="quarter">Este trimestre</SelectItem>
              <SelectItem value="year">Este año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ingresos Totales</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +12.5%
              </Badge>
              <DollarSign className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">${(totalRevenue / 1000).toFixed(0)}K</div>
            <p className="text-sm text-muted-foreground mt-1">
              +$45K vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Reservas Totales</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +8.3%
              </Badge>
              <Calendar className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{totalReservations.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground mt-1">
              +156 vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ocupación Promedio</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +5.2%
              </Badge>
              <Activity className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{occupancyRate}%</div>
            <p className="text-sm text-muted-foreground mt-1">
              Promedio semanal
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Margen de Ganancia</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                -2.1%
              </Badge>
              <TrendingUp className="h-5 w-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{profitMargin}%</div>
            <p className="text-sm text-muted-foreground mt-1">
              vs mes anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full lg:w-[500px] grid-cols-4">
          <TabsTrigger value="revenue">Ingresos</TabsTrigger>
          <TabsTrigger value="usage">Uso</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Análisis de Ingresos Mensuales
                </CardTitle>
                <CardDescription>Ingresos, ganancias y gastos por mes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={monthlyRevenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
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
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                      }} 
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stackId="1"
                      stroke="#22c55e" 
                      fill="url(#colorRevenue)" 
                      name="Ingresos"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="profit" 
                      stackId="2"
                      stroke="#3b82f6" 
                      fill="url(#colorProfit)" 
                      name="Ganancia"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ingresos por Deporte</CardTitle>
                <CardDescription>Distribución de ingresos por categoría</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={sportData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sportData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [
                      `$${sportData.find(s => s.name === name)?.revenue?.toLocaleString()}`, 
                      'Ingresos'
                    ]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ingresos por Hora</CardTitle>
                <CardDescription>Picos de ingresos durante el día</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={hourlyRevenueData}>
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
                    <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Reservas Semanales</CardTitle>
                <CardDescription>Patrones de uso semanal</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="reservations" 
                      stroke="#f59e0b" 
                      strokeWidth={3}
                      dot={{ fill: '#f59e0b', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rendimiento por Ubicación</CardTitle>
                <CardDescription>Comparativa entre ubicaciones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {locationData.map((location, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-gray-50/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{location.location}</p>
                          <p className="text-sm text-muted-foreground">{location.reservations} reservas</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${(location.revenue / 1000).toFixed(0)}K</p>
                        <div className="flex items-center space-x-1">
                          {location.growth > 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                          <span className={`text-xs ${
                            location.growth > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {location.growth > 0 ? '+' : ''}{location.growth}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Eficiencia Operativa</p>
                    <p className="text-3xl font-bold text-green-600">94.2%</p>
                    <p className="text-xs text-green-600 mt-1">+3.2% vs mes anterior</p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-green-500 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Satisfacción Cliente</p>
                    <p className="text-3xl font-bold text-blue-600">4.7/5</p>
                    <p className="text-xs text-blue-600 mt-1">+0.2 vs mes anterior</p>
                  </div>
                  <Star className="h-12 w-12 text-blue-500 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Tiempo Respuesta</p>
                    <p className="text-3xl font-bold text-purple-600">1.2s</p>
                    <p className="text-xs text-purple-600 mt-1">-0.3s vs mes anterior</p>
                  </div>
                  <Clock className="h-12 w-12 text-purple-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tendencias de Crecimiento</CardTitle>
              <CardDescription>Análisis predictivo basado en datos históricos</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={monthlyRevenueData}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="reservations" 
                    stroke="#8b5cf6" 
                    fillOpacity={1} 
                    fill="url(#colorTrend)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}