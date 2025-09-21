'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
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
  { name: 'Pádel', value: 10, color: '#8b5cf6', revenue: 32000 }
]

const locationData = [
  { location: 'Zona Norte', reservations: 450, revenue: 125000, growth: 12.5 },
  { location: 'Centro', reservations: 380, revenue: 98000, growth: 8.2 },
  { location: 'Zona Sur', reservations: 320, revenue: 87000, growth: -2.1 },
  { location: 'Zona Este', reservations: 290, revenue: 76000, growth: 15.8 },
]

export default function AdminReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  
  // Enhanced stats
  const totalReservations = 1255
  const totalRevenue = 328500
  const profitMargin = 28.5
  const occupancyRate = 78.5

  const overviewCards = [
    {
      id: 'revenue',
      title: 'Ingresos totales',
      value: `$${(totalRevenue / 1000).toFixed(0)}K`,
      description: '+$45K vs mes anterior',
      delta: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      iconClasses: 'bg-indigo-100 text-indigo-600',
    },
    {
      id: 'reservations',
      title: 'Reservas totales',
      value: totalReservations.toLocaleString(),
      description: '+156 vs mes anterior',
      delta: '+8.3%',
      trend: 'up',
      icon: Calendar,
      iconClasses: 'bg-sky-100 text-sky-600',
    },
    {
      id: 'occupancy',
      title: 'Ocupación promedio',
      value: `${occupancyRate}%`,
      description: 'Promedio semanal',
      delta: '+5.2%',
      trend: 'up',
      icon: Activity,
      iconClasses: 'bg-teal-100 text-teal-600',
    },
    {
      id: 'profit',
      title: 'Margen de ganancia',
      value: `${profitMargin}%`,
      description: 'vs mes anterior',
      delta: '-2.1%',
      trend: 'down',
      icon: TrendingUp,
      iconClasses: 'bg-rose-100 text-rose-500',
    },
  ]

  const performanceHighlights = [
    {
      id: 'efficiency',
      title: 'Eficiencia operativa',
      value: '94.2%',
      description: '+3.2% vs mes anterior',
      icon: TrendingUp,
      accent: 'bg-emerald-100 text-emerald-600',
    },
    {
      id: 'satisfaction',
      title: 'Satisfacción cliente',
      value: '4.7/5',
      description: '+0.2 vs mes anterior',
      icon: Star,
      accent: 'bg-indigo-100 text-indigo-600',
    },
    {
      id: 'response',
      title: 'Tiempo de respuesta',
      value: '1.2s',
      description: '-0.3s vs mes anterior',
      icon: Clock,
      accent: 'bg-purple-100 text-purple-600',
    },
  ]

  const exportReport = () => {
    // Export functionality
    console.log('Exporting report...')
  }

  return (
    <div className="min-h-screen space-y-10 bg-slate-50/60 p-6 pb-16 lg:p-10">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-8 shadow-sm">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex w-fit items-center rounded-full border border-indigo-100 bg-white/70 px-3 py-1 text-xs font-medium tracking-wide text-indigo-500">
              Panel inteligente
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 lg:text-4xl">
              Reportes & Analíticas
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-slate-600">
              Visión clara del rendimiento de tu club con métricas esenciales y tendencias en una vista limpia.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="h-11 min-w-[180px] rounded-xl border-slate-200 bg-white/70 text-sm font-medium text-slate-600 shadow-sm focus:ring-2 focus:ring-indigo-200 focus:ring-offset-0">
                <SelectValue placeholder="Selecciona periodo" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-slate-100 bg-white shadow-lg">
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="quarter">Este trimestre</SelectItem>
                <SelectItem value="year">Este año</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={exportReport}
              className="h-11 rounded-xl border-slate-200 bg-white/80 text-sm font-medium text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-white"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button className="h-11 rounded-xl bg-slate-900 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => {
          const Icon = card.icon
          const DeltaIcon = card.trend === 'up' ? ArrowUpRight : ArrowDownRight
          const deltaColor =
            card.trend === 'up'
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-rose-50 text-rose-500'

          return (
            <Card
              key={card.id}
              className="relative overflow-hidden border border-slate-200 bg-white/80 shadow-none backdrop-blur transition-shadow hover:shadow-lg"
            >
              <CardHeader className="flex h-full flex-col gap-6 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.iconClasses}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <CardTitle className="text-sm font-medium text-slate-500">{card.title}</CardTitle>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${deltaColor}`}>
                    <DeltaIcon className="h-3.5 w-3.5" />
                    {card.delta}
                  </span>
                </div>
                <div>
                  <div className="text-3xl font-semibold text-slate-900">{card.value}</div>
                  <p className="mt-2 text-sm text-slate-500">{card.description}</p>
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </section>

      <Tabs defaultValue="revenue" className="space-y-8">
        <TabsList className="w-full max-w-3xl rounded-full border border-slate-200 bg-white/80 p-1.5 shadow-sm backdrop-blur">
          <TabsTrigger value="revenue" className="rounded-full px-5 py-2 text-sm font-medium text-slate-500 transition data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow">
            Ingresos
          </TabsTrigger>
          <TabsTrigger value="usage" className="rounded-full px-5 py-2 text-sm font-medium text-slate-500 transition data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow">
            Uso
          </TabsTrigger>
          <TabsTrigger value="performance" className="rounded-full px-5 py-2 text-sm font-medium text-slate-500 transition data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow">
            Rendimiento
          </TabsTrigger>
          <TabsTrigger value="trends" className="rounded-full px-5 py-2 text-sm font-medium text-slate-500 transition data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow">
            Tendencias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <Card className="border border-slate-200 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <DollarSign className="h-5 w-5 text-slate-500" />
                Ingresos mensuales
              </CardTitle>
              <CardDescription className="text-slate-500">
                Ingresos, ganancias y gastos por periodo seleccionado
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 pb-6 sm:px-6">
              <ResponsiveContainer width="100%" height={380}>
                <AreaChart data={monthlyRevenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 16,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 20px 45px -20px rgba(15, 23, 42, 0.25)',
                      background: 'rgba(255, 255, 255, 0.98)',
                    }}
                    labelStyle={{ color: '#475569', fontWeight: 600 }}
                  />
                  <Legend iconType="circle" verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: 12 }} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorRevenue)" name="Ingresos" />
                  <Area type="monotone" dataKey="profit" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#colorProfit)" name="Ganancia" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="border border-slate-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-slate-900">Ingresos por deporte</CardTitle>
                <CardDescription className="text-slate-500">
                  Distribución de ingresos por categoría
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2 pb-6 sm:px-6">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={sportData}
                      cx="50%"
                      cy="50%"
                      innerRadius={72}
                      outerRadius={120}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {sportData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={1} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [
                        `$${sportData.find((s) => s.name === name)?.revenue?.toLocaleString()}`,
                        name,
                      ]}
                      contentStyle={{
                        borderRadius: 16,
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 10px 30px -15px rgba(15, 23, 42, 0.25)',
                        background: 'rgba(255,255,255,0.95)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-slate-900">Ingresos por hora</CardTitle>
                <CardDescription className="text-slate-500">
                  Picos de ingresos durante el día
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2 pb-6 sm:px-6">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={hourlyRevenueData}>
                    <CartesianGrid stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 16,
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 12px 35px -18px rgba(15, 23, 42, 0.25)',
                        background: 'rgba(255,255,255,0.97)',
                      }}
                    />
                    <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 4, 4]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="border border-slate-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-slate-900">Reservas semanales</CardTitle>
                <CardDescription className="text-slate-500">
                  Patrones de uso semanal
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2 pb-6 sm:px-6">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 16,
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 12px 30px -18px rgba(15, 23, 42, 0.25)',
                        background: 'rgba(255,255,255,0.97)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="reservations"
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, stroke: '#ffffff', fill: '#6366f1' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-slate-900">Rendimiento por ubicación</CardTitle>
                <CardDescription className="text-slate-500">
                  Comparativa entre ubicaciones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {locationData.map((location, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{location.location}</p>
                        <p className="text-sm text-slate-500">{location.reservations} reservas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">${(location.revenue / 1000).toFixed(0)}K</p>
                      <div className="mt-1 flex items-center justify-end gap-1">
                        {location.growth > 0 ? (
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
                        )}
                        <span
                          className={`text-xs font-medium ${
                            location.growth > 0 ? 'text-emerald-600' : 'text-rose-500'
                          }`}
                        >
                          {location.growth > 0 ? '+' : ''}
                          {location.growth}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {performanceHighlights.map((highlight) => {
              const Icon = highlight.icon

              return (
                <Card
                  key={highlight.id}
                  className="border border-slate-200 bg-white/80 shadow-none backdrop-blur transition-shadow hover:shadow-lg"
                >
                  <CardContent className="flex flex-col gap-6 p-6">
                    <div className="flex items-center justify-between">
                      <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${highlight.accent}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        Último mes
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">{highlight.title}</p>
                      <p className="mt-3 text-3xl font-semibold text-slate-900">{highlight.value}</p>
                      <p className="mt-2 text-xs font-medium text-slate-500">{highlight.description}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Card className="border border-slate-200 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-slate-900">Tendencias de crecimiento</CardTitle>
              <CardDescription className="text-slate-500">
                Proyección basada en datos históricos y comportamiento reciente
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 pb-6 sm:px-6">
              <ResponsiveContainer width="100%" height={360}>
                <AreaChart data={monthlyRevenueData}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 16,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 12px 30px -18px rgba(15, 23, 42, 0.25)',
                      background: 'rgba(255,255,255,0.97)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="reservations"
                    stroke="#818cf8"
                    strokeWidth={2.5}
                    fill="url(#colorTrend)"
                    name="Reservas"
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
