"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Users, 
  DollarSign,
  MapPin,
  Download,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import apiClient from "@/lib/api-client"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function AdminReportesPage() {
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [reports, setReports] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadReports()
  }, [period])

  const loadReports = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getReports(period)
      if (response.data) {
        setReports(response.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los reportes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Mock data for demonstration when API doesn't return data
  const mockData = {
    reservasTotales: 247,
    ingresosTotales: 1875000,
    ocupacionPromedio: 78,
    canchasMasReservadas: [
      { cancha: "Club Atlético Central", reservas: 45 },
      { cancha: "Complejo Norte", reservas: 38 },
      { cancha: "Polideportivo Sur", reservas: 32 },
      { cancha: "Tennis Club", reservas: 28 },
      { cancha: "Futsal Arena", reservas: 24 },
    ]
  }

  const data = reports || mockData

  const kpiData = [
    {
      title: "Reservas Totales",
      value: data.reservasTotales?.toString() || "0",
      change: "+12.5%",
      trend: "up",
      icon: Calendar,
      description: `en el último ${period === 'week' ? 'semana' : period === 'month' ? 'mes' : 'año'}`,
    },
    {
      title: "Ingresos Totales",
      value: formatPrice(data.ingresosTotales || 0),
      change: "+8.3%",
      trend: "up",
      icon: DollarSign,
      description: `en el último ${period === 'week' ? 'semana' : period === 'month' ? 'mes' : 'año'}`,
    },
    {
      title: "Ocupación Promedio",
      value: `${data.ocupacionPromedio || 0}%`,
      change: "+5.2%",
      trend: "up",
      icon: TrendingUp,
      description: "de las canchas disponibles",
    },
    {
      title: "Usuarios Activos",
      value: "1,247",
      change: "+15.1%",
      trend: "up",
      icon: Users,
      description: "usuarios únicos",
    },
  ]

  // Chart data
  const reservationTrendData = [
    { name: 'Ene', reservas: 45, ingresos: 360000 },
    { name: 'Feb', reservas: 52, ingresos: 416000 },
    { name: 'Mar', reservas: 48, ingresos: 384000 },
    { name: 'Abr', reservas: 61, ingresos: 488000 },
    { name: 'May', reservas: 55, ingresos: 440000 },
    { name: 'Jun', reservas: 67, ingresos: 536000 },
  ]

  const sportDistributionData = [
    { name: 'Fútbol 5', value: 40, reservas: 98 },
    { name: 'Pádel', value: 30, reservas: 74 },
    { name: 'Tenis', value: 15, reservas: 37 },
    { name: 'Básquet', value: 10, reservas: 25 },
    { name: 'Vóley', value: 5, reservas: 13 },
  ]

  const timeSlotData = [
    { hora: '08:00', ocupacion: 20 },
    { hora: '10:00', ocupacion: 35 },
    { hora: '12:00', ocupacion: 45 },
    { hora: '14:00', ocupacion: 60 },
    { hora: '16:00', ocupacion: 75 },
    { hora: '18:00', ocupacion: 95 },
    { hora: '20:00', ocupacion: 100 },
    { hora: '22:00', ocupacion: 85 },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reportes y Análisis</h1>
          <p className="text-muted-foreground">Métricas y estadísticas del sistema</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando reportes...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reportes y Análisis</h1>
          <p className="text-muted-foreground">Métricas y estadísticas del sistema</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={(value: 'week' | 'month' | 'year') => setPeriod(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mes</SelectItem>
              <SelectItem value="year">Último año</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={loadReports}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {kpi.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={kpi.trend === "up" ? "text-green-500" : "text-red-500"}>{kpi.change}</span>
                  <span className="ml-1">{kpi.description}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reservation Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Reservas</CardTitle>
          </CardHeader>
                     <CardContent>
             <div className="flex items-center justify-center h-[300px] text-muted-foreground">
               <p>Gráfico de tendencia de reservas (en desarrollo)</p>
             </div>
           </CardContent>
        </Card>

        {/* Sports Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Deporte</CardTitle>
          </CardHeader>
                     <CardContent>
             <div className="flex items-center justify-center h-[300px] text-muted-foreground">
               <p>Gráfico de distribución por deporte (en desarrollo)</p>
             </div>
           </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Ingresos Mensuales</CardTitle>
          </CardHeader>
                     <CardContent>
             <div className="flex items-center justify-center h-[300px] text-muted-foreground">
               <p>Gráfico de ingresos mensuales (en desarrollo)</p>
             </div>
           </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Horarios de Mayor Demanda</CardTitle>
          </CardHeader>
                     <CardContent>
             <div className="flex items-center justify-center h-[300px] text-muted-foreground">
               <p>Gráfico de horarios de mayor demanda (en desarrollo)</p>
             </div>
           </CardContent>
        </Card>
      </div>

      {/* Top Courts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Canchas Más Reservadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.canchasMasReservadas?.map((court: any, index: number) => (
              <div key={court.cancha} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                    <span className="text-sm font-bold text-primary">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium">{court.cancha}</div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {court.reservas} reservas
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(court.reservas / Math.max(...data.canchasMasReservadas.map((c: any) => c.reservas))) * 100}%` }}
                    />
                  </div>
                  <div className="text-sm font-medium w-16 text-right">{court.reservas}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 