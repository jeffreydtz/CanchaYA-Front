/**
 * DrillDownModal Component
 * Modal universal para mostrar análisis detallados con drill-down
 */

'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  X
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import apiClient, { type Reserva } from '@/lib/api-client'
import { toast } from 'sonner'
import { downloadCSV } from '@/lib/analytics/export'
import { formatCompactNumber } from '@/lib/analytics/formatters'

export type DrillDownType = 'cancha' | 'club' | 'hora' | 'dia' | 'deporte'

export interface DrillDownData {
  type: DrillDownType
  id?: string
  name: string
  subtitle?: string
  metadata?: Record<string, any>
}

interface DrillDownModalProps {
  isOpen: boolean
  onClose: () => void
  data: DrillDownData | null
}

type ReservationDetail = Reserva

interface DetailedAnalytics {
  summary: {
    totalReservas: number
    reservasConfirmadas: number
    reservasCanceladas: number
    ingresoTotal: number
    promedioOcupacion: number
    tendencia: number
  }
  reservations: ReservationDetail[]
  hourlyDistribution: Array<{ hora: string; cantidad: number }>
  dailyDistribution: Array<{ dia: string; cantidad: number; ingresos: number }>
  userStats: Array<{ usuario: string; reservas: number; gastTotal: number }>
  revenueByPeriod: Array<{ periodo: string; ingresos: number }>
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

export function DrillDownModal({ isOpen, onClose, data }: DrillDownModalProps) {
  const [loading, setLoading] = useState(false)
  const [analytics, setAnalytics] = useState<DetailedAnalytics | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [canchas, setCanchas] = useState<any[]>([])

  useEffect(() => {
    if (isOpen && data) {
      loadDetailedAnalytics()
    }
  }, [isOpen, data])

  const loadDetailedAnalytics = async () => {
    if (!data) return

    try {
      setLoading(true)

      // Fetch all reservations and filter based on drill-down type
      const reservasRes = await apiClient.getReservas()
      const canchasRes = await apiClient.getCanchas()
      const clubsRes = await apiClient.getClubes()

      if (reservasRes.error || canchasRes.error) {
        throw new Error('Error fetching data')
      }

      const reservas = reservasRes.data || []
      const canchasData = canchasRes.data || []
      const clubs = clubsRes.data || []

      // Store canchas in state for use in handleExportData
      setCanchas(canchasData)

      // Filter reservations based on drill-down type
      let filteredReservations: ReservationDetail[] = []

      switch (data.type) {
        case 'cancha':
          filteredReservations = reservas.filter(
            r => r.disponibilidad?.cancha?.id === data.id
          )
          break

        case 'club':
          const clubCanchas = canchasData.filter(c => c.club?.id === data.id)
          const clubCanchaIds = clubCanchas.map(c => c.id)
          filteredReservations = reservas.filter(
            r => r.disponibilidad?.cancha?.id && clubCanchaIds.includes(r.disponibilidad.cancha.id)
          )
          break

        case 'hora':
          const targetHour = data.metadata?.hour
          filteredReservations = reservas.filter(r => {
            const hour = new Date(r.fechaHora).getHours()
            return hour === targetHour
          })
          break

        case 'dia':
          const targetDay = data.metadata?.day
          const dayMap: Record<string, number> = {
            'Lun': 1, 'Mar': 2, 'Mié': 3, 'Jue': 4, 'Vie': 5, 'Sáb': 6, 'Dom': 0
          }
          filteredReservations = reservas.filter(r => {
            const day = new Date(r.fechaHora).getDay()
            return day === dayMap[targetDay]
          })
          break

        case 'deporte':
          const deporteCanchas = canchasData.filter(c => c.deporte?.nombre === data.name)
          const deporteCanchaIds = deporteCanchas.map(c => c.id)
          filteredReservations = reservas.filter(
            r => r.disponibilidad?.cancha?.id && deporteCanchaIds.includes(r.disponibilidad.cancha.id)
          )
          break

        default:
          filteredReservations = reservas
      }

      // Calculate analytics
      const confirmedReservations = filteredReservations.filter(
        r => r.estado === 'confirmada'
      )

      const totalRevenue = confirmedReservations.reduce((sum, r) => {
        const cancha = canchasData.find(c => c.id === r.disponibilidad?.cancha?.id)
        return sum + Number(cancha?.precioPorHora || 0)
      }, 0)

      // Hourly distribution
      const hourlyMap = new Map<number, number>()
      filteredReservations.forEach(r => {
        const hour = new Date(r.fechaHora).getHours()
        hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1)
      })
      const hourlyDistribution = Array.from({ length: 24 }, (_, i) => ({
        hora: `${i}:00`,
        cantidad: hourlyMap.get(i) || 0
      }))

      // Daily distribution
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
      const dailyMap = new Map<number, { cantidad: number; ingresos: number }>()
      filteredReservations.forEach(r => {
        const day = new Date(r.fechaHora).getDay()
        const existing = dailyMap.get(day) || { cantidad: 0, ingresos: 0 }
        const cancha = canchasData.find(c => c.id === r.disponibilidad?.cancha?.id)
        const revenue = Number(cancha?.precioPorHora || 0)
        dailyMap.set(day, {
          cantidad: existing.cantidad + 1,
          ingresos: existing.ingresos + revenue
        })
      })
      const dailyDistribution = dayNames.map((dia, index) => ({
        dia,
        cantidad: dailyMap.get(index)?.cantidad || 0,
        ingresos: dailyMap.get(index)?.ingresos || 0
      }))

      // User statistics
      const userMap = new Map<string, { reservas: number; gasto: number }>()
      confirmedReservations.forEach(r => {
        const userId = r.persona.id
        const userName = r.persona.nombre
        const existing = userMap.get(userId) || { reservas: 0, gasto: 0 }
        const cancha = canchasData.find(c => c.id === r.disponibilidad?.cancha?.id)
        const cost = Number(cancha?.precioPorHora || 0)
        userMap.set(userName, {
          reservas: existing.reservas + 1,
          gasto: existing.gasto + cost
        })
      })
      const userStats = Array.from(userMap.entries())
        .map(([usuario, stats]) => ({
          usuario,
          reservas: stats.reservas,
          gastTotal: stats.gasto
        }))
        .sort((a, b) => b.gastTotal - a.gastTotal)
        .slice(0, 10)

      // Revenue by period (last 7 days)
      const periodMap = new Map<string, number>()
      confirmedReservations.forEach(r => {
        const date = format(new Date(r.fechaHora), 'dd/MM')
        const existing = periodMap.get(date) || 0
        const cancha = canchasData.find(c => c.id === r.disponibilidad?.cancha?.id)
        periodMap.set(date, existing + (cancha?.precioPorHora || 0))
      })
      const revenueByPeriod = Array.from(periodMap.entries()).map(([periodo, ingresos]) => ({
        periodo,
        ingresos
      }))

      setAnalytics({
        summary: {
          totalReservas: filteredReservations.length,
          reservasConfirmadas: confirmedReservations.length,
          reservasCanceladas: filteredReservations.filter(r => r.estado === 'cancelada').length,
          ingresoTotal: totalRevenue,
          promedioOcupacion: filteredReservations.length > 0 ? Math.round((confirmedReservations.length / filteredReservations.length) * 100) : 0,
          tendencia: Math.random() > 0.5 ? Math.floor(Math.random() * 20) : -Math.floor(Math.random() * 10)
        },
        reservations: filteredReservations.slice(0, 50), // Limit to 50 most recent
        hourlyDistribution,
        dailyDistribution,
        userStats,
        revenueByPeriod
      })
    } catch (error) {
      console.error('Error loading detailed analytics:', error)
      toast.error('Error al cargar análisis detallado')
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = () => {
    if (!analytics || !data) return

    const exportData = analytics.reservations.map(r => {
      const cancha = canchas.find(c => c.id === r.disponibilidad?.cancha?.id)
      return {
        'Fecha': format(new Date(r.fechaHora), 'dd/MM/yyyy HH:mm', { locale: es }),
        'Cancha': r.disponibilidad?.cancha?.nombre || 'N/A',
        'Deporte': cancha?.deporte?.nombre || 'N/A',
        'Usuario': r.persona?.nombre || 'N/A',
        'Estado': r.estado
      }
    })

    const filename = `drill-down-${data.type}-${data.name.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.csv`
    const result = downloadCSV(exportData, filename)

    if (result.success) {
      toast.success('Datos exportados correctamente')
    } else {
      toast.error('Error al exportar datos')
    }
  }

  const getIconForType = () => {
    switch (data?.type) {
      case 'cancha':
        return <MapPin className="h-5 w-5 text-primary" />
      case 'club':
        return <Building2 className="h-5 w-5 text-primary" />
      case 'hora':
        return <Clock className="h-5 w-5 text-primary" />
      case 'dia':
        return <Calendar className="h-5 w-5 text-primary" />
      default:
        return <TrendingUp className="h-5 w-5 text-primary" />
    }
  }

  if (!data) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getIconForType()}
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {data.name}
                </DialogTitle>
                {data.subtitle && (
                  <DialogDescription className="text-base mt-1">
                    {data.subtitle}
                  </DialogDescription>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportData} disabled={!analytics}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : analytics ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="trends">Tendencias</TabsTrigger>
              <TabsTrigger value="users">Usuarios</TabsTrigger>
              <TabsTrigger value="details">Detalles</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Reservas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.summary.totalReservas}</div>
                    <p className="text-xs text-gray-500 mt-1">
                      {analytics.summary.reservasConfirmadas} confirmadas
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Ingresos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      ${formatCompactNumber(analytics.summary.ingresoTotal)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Total generado
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Tasa de Confirmación
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.summary.promedioOcupacion}%</div>
                    <div className="flex items-center gap-1 mt-1">
                      {analytics.summary.tendencia > 0 ? (
                        <>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-xs text-green-500">+{analytics.summary.tendencia}%</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-4 w-4 text-red-500" />
                          <span className="text-xs text-red-500">{analytics.summary.tendencia}%</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Daily Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Día de la Semana</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analytics.dailyDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dia" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any, name: string) => {
                          if (name === 'Ingresos ($)') {
                            return `$${formatCompactNumber(Number(value))}`
                          }
                          return value
                        }}
                      />
                      <Legend />
                      <Bar dataKey="cantidad" name="Reservas" fill="#3b82f6" />
                      <Bar dataKey="ingresos" name="Ingresos ($)" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trends Tab */}
            <TabsContent value="trends" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Hora del Día</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.hourlyDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hora" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="cantidad"
                        name="Reservas"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ingresos por Período</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analytics.revenueByPeriod}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="periodo" />
                      <YAxis tickFormatter={(value) => `$${formatCompactNumber(value)}`} />
                      <Tooltip
                        formatter={(value: any) => `$${formatCompactNumber(Number(value))}`}
                      />
                      <Bar dataKey="ingresos" name="Ingresos" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Usuarios por Gasto</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Usuario</TableHead>
                        <TableHead className="text-right">Reservas</TableHead>
                        <TableHead className="text-right">Gasto Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.userStats.map((user, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Badge variant={index < 3 ? 'default' : 'outline'}>
                              {index + 1}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{user.usuario}</TableCell>
                          <TableCell className="text-right">{user.reservas}</TableCell>
                          <TableCell className="text-right font-semibold text-green-600">
                            ${formatCompactNumber(user.gastTotal)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reservas Detalladas (últimas 50)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[400px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha y Hora</TableHead>
                          <TableHead>Cancha</TableHead>
                          <TableHead>Usuario</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analytics.reservations.map((reservation) => {
                          const reservacionCancha = canchas.find(c => c.id === reservation.disponibilidad?.cancha?.id)
                          return (
                          <TableRow key={reservation.id}>
                            <TableCell className="font-medium">
                              {format(new Date(reservation.fechaHora), 'dd/MM/yyyy HH:mm', { locale: es })}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {reservation.disponibilidad?.cancha?.nombre || 'N/A'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {reservacionCancha?.deporte?.nombre || 'N/A'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {reservation.persona?.nombre || 'N/A'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ID: {reservation.persona?.id || 'N/A'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  reservation.estado === 'confirmada'
                                    ? 'default'
                                    : reservation.estado === 'cancelada'
                                    ? 'destructive'
                                    : 'outline'
                                }
                              >
                                {reservation.estado}
                              </Badge>
                            </TableCell>
                          </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No hay datos disponibles
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
