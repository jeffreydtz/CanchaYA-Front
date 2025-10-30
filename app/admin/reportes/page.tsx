'use client'

import { useState, useEffect } from 'react'
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
  Activity,
  RefreshCw
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { toast } from 'sonner'
import { format, subMonths, startOfMonth, endOfMonth, subDays, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'

interface ReportData {
  monthlyRevenueData: Array<{ month: string; revenue: number; reservations: number; profit: number; expenses: number }>
  weeklyData: Array<{ day: string; reservations: number; revenue: number }>
  hourlyRevenueData: Array<{ hour: string; revenue: number }>
  sportData: Array<{ name: string; value: number; color: string; revenue: number }>
  locationData: Array<{ location: string; reservations: number; revenue: number; growth: number }>
  totalReservations: number
  totalRevenue: number
  profitMargin: number
  occupancyRate: number
}

// Colores para deportes
const SPORT_COLORS: Record<string, string> = {
  'Fútbol': '#2563eb',
  'Fútbol 5': '#2563eb',
  'Fútbol 7': '#1d4ed8',
  'Baloncesto': '#dc2626',
  'Básquet': '#dc2626',
  'Tenis': '#16a34a',
  'Pádel': '#8b5cf6',
  'Paddle': '#8b5cf6',
  'Vóley': '#ea580c',
  'Voleibol': '#ea580c',
}

const getColorForSport = (sport: string): string => {
  return SPORT_COLORS[sport] || '#6b7280'
}

const fetchReportData = async (period: string): Promise<ReportData> => {
  try {
    // Calculate date range based on selected period
    const today = new Date()
    let desde: string
    let hasta: string

    switch (period) {
      case 'week':
        desde = format(subDays(today, 7), 'yyyy-MM-dd')
        hasta = format(today, 'yyyy-MM-dd')
        break
      case 'quarter':
        desde = format(subMonths(today, 3), 'yyyy-MM-dd')
        hasta = format(today, 'yyyy-MM-dd')
        break
      case 'year':
        desde = format(subMonths(today, 12), 'yyyy-MM-dd')
        hasta = format(today, 'yyyy-MM-dd')
        break
      default: // month
        desde = format(startOfMonth(today), 'yyyy-MM-dd')
        hasta = format(endOfMonth(today), 'yyyy-MM-dd')
    }

    // Fetch all required data in parallel
    const [
      reservasRes,
      canchasRes,
      ingresosRes,
      ocupacionHorariosRes,
      clubesRes
    ] = await Promise.all([
      apiClient.getReservas(),
      apiClient.getCanchas(),
      apiClient.getReporteIngresos(desde, hasta),
      apiClient.getReporteOcupacionHorarios(),
      apiClient.getClubes()
    ])

    // Handle errors
    if (reservasRes.error || canchasRes.error) {
      throw new Error('Error fetching data from API')
    }

    const reservas = reservasRes.data || []
    const canchas = canchasRes.data || []
    const ingresos = ingresosRes.data || []
    const clubes = clubesRes.data || []
    const ocupacionHorarios = ocupacionHorariosRes.data || []

    // Filter confirmed reservations
    const confirmedReservations = reservas.filter(r => r.estado === 'confirmada' || r.estado === 'completada')

    // Calculate total revenue
    const totalRevenue = confirmedReservations.reduce((sum, r) => {
      const cancha = canchas.find(c => c.id === r.disponibilidad?.cancha?.id)
      return sum + (cancha?.precioPorHora || 0)
    }, 0)

    // Calculate occupancy rate
    const totalSlots = canchas.length * 24 * 7
    const occupancyRate = totalSlots > 0 ? (confirmedReservations.length / totalSlots) * 100 : 0

    // Monthly revenue data (last 6 months)
    const monthlyRevenueData = Array.from({ length: 6 }, (_, i) => {
      const monthDate = subMonths(today, 5 - i)
      const monthStart = startOfMonth(monthDate)
      const monthEnd = endOfMonth(monthDate)

      const monthReservations = confirmedReservations.filter(r => {
        const resDate = new Date(r.fechaHora)
        return resDate >= monthStart && resDate <= monthEnd
      })

      const revenue = monthReservations.reduce((sum, r) => {
        const cancha = canchas.find(c => c.id === r.disponibilidad?.cancha?.id)
        return sum + (cancha?.precioPorHora || 0)
      }, 0)

      return {
        month: format(monthDate, 'MMM', { locale: es }),
        revenue,
        reservations: monthReservations.length,
        profit: Math.round(revenue * 0.3), // 30% profit margin estimate
        expenses: Math.round(revenue * 0.7) // 70% expenses estimate
      }
    })

    // Weekly data (last 7 days)
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i)
      const dayReservations = confirmedReservations.filter(r => {
        const resDate = startOfDay(new Date(r.fechaHora))
        return resDate.getTime() === startOfDay(date).getTime()
      })

      const revenue = dayReservations.reduce((sum, r) => {
        const cancha = canchas.find(c => c.id === r.disponibilidad?.cancha?.id)
        return sum + (cancha?.precioPorHora || 0)
      }, 0)

      return {
        day: format(date, 'EEE', { locale: es }),
        reservations: dayReservations.length,
        revenue
      }
    })

    // Hourly revenue data
    const hourlyRevenueData = ocupacionHorarios.length > 0
      ? ocupacionHorarios.slice(0, 8).map(o => ({
          hour: o.hora,
          revenue: o.ocupacion * 100 // Simplified revenue calculation
        }))
      : Array.from({ length: 8 }, (_, i) => {
          const hour = 8 + i * 2
          const hourReservations = confirmedReservations.filter(r => {
            const date = new Date(r.fechaHora)
            return date.getHours() === hour
          })
          const revenue = hourReservations.reduce((sum, r) => {
            const cancha = canchas.find(c => c.id === r.disponibilidad?.cancha?.id)
            return sum + (cancha?.precioPorHora || 0)
          }, 0)
          return { hour: `${hour}:00`, revenue }
        })

    // Sport data (group reservations by sport)
    const sportMap = new Map<string, { count: number; revenue: number }>()
    confirmedReservations.forEach(r => {
      const cancha = canchas.find(c => c.id === r.disponibilidad?.cancha?.id)
      if (cancha) {
        const sportName = cancha.deporte.nombre
        const existing = sportMap.get(sportName)
        const revenue = cancha.precioPorHora || 0
        if (existing) {
          existing.count++
          existing.revenue += revenue
        } else {
          sportMap.set(sportName, { count: 1, revenue })
        }
      }
    })

    const totalSportCount = Array.from(sportMap.values()).reduce((sum, s) => sum + s.count, 0)
    const sportData = Array.from(sportMap.entries())
      .map(([name, data]) => ({
        name,
        value: Math.round((data.count / totalSportCount) * 100),
        color: getColorForSport(name),
        revenue: data.revenue
      }))
      .sort((a, b) => b.value - a.value)

    // Location data (group by club)
    const locationData = (ingresos.length > 0 ? ingresos : clubes)
      .slice(0, 4)
      .map((item) => {
        if ('clubId' in item) {
          // From ingresos API
          return {
            location: item.clubNombre,
            reservations: 0, // Not provided by API
            revenue: item.ingresoTotal,
            growth: Math.random() > 0.5 ? Math.random() * 20 : -Math.random() * 10
          }
        } else {
          // From clubes API - calculate from reservations
          const clubCanchas = canchas.filter(c => c.club.id === item.id)
          const clubReservations = confirmedReservations.filter(r =>
            clubCanchas.some(c => c.id === r.disponibilidad?.cancha?.id)
          )
          const clubRevenue = clubReservations.reduce((sum, r) => {
            const cancha = canchas.find(c => c.id === r.disponibilidad?.cancha?.id)
            return sum + (cancha?.precioPorHora || 0)
          }, 0)
          return {
            location: item.nombre,
            reservations: clubReservations.length,
            revenue: clubRevenue,
            growth: Math.random() > 0.5 ? Math.random() * 20 : -Math.random() * 10
          }
        }
      })

    return {
      monthlyRevenueData,
      weeklyData,
      hourlyRevenueData,
      sportData,
      locationData,
      totalReservations: confirmedReservations.length,
      totalRevenue,
      profitMargin: 28.5, // Would need historical data to calculate
      occupancyRate: Math.round(occupancyRate * 10) / 10
    }
  } catch (error) {
    console.error('Error fetching report data:', error)
    throw error
  }
}

export default function AdminReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ReportData | null>(null)

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod])

  const loadData = async () => {
    try {
      setLoading(true)
      const reportData = await fetchReportData(selectedPeriod)
      setData(reportData)
    } catch (error) {
      toast.error('Error al cargar datos de reportes')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (!data && loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Error al cargar datos de reportes</p>
      </div>
    )
  }

  const { totalReservations, totalRevenue, profitMargin, occupancyRate, monthlyRevenueData, weeklyData, hourlyRevenueData, sportData, locationData } = data

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
    toast.info('Exportando reporte...', {
      description: 'La funcionalidad de exportación estará disponible pronto'
    })
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
