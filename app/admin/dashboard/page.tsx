"use client"

/**
 * Dashboard Analytics Page
 * Vista principal del dashboard con todas las métricas y gráficos
 */

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/auth-context'
import { MetricCard } from '@/components/admin/dashboard/MetricCard'
import { OccupancyChart } from '@/components/admin/dashboard/OccupancyChart'
import { CanchaDistributionChart } from '@/components/admin/dashboard/CanchaDistributionChart'
import { HeatMap } from '@/components/admin/dashboard/HeatMap'
import { TopCanchasTable } from '@/components/admin/dashboard/TopCanchasTable'
import { DashboardFilters } from '@/components/admin/dashboard/DashboardFilters'
import { DrillDownModal, type DrillDownData } from '@/components/admin/dashboard/DrillDownModal'
import { ClubAnalyticsCard } from '@/components/admin/dashboard/ClubAnalyticsCard'
import { TopCanchasPieChart } from '@/components/admin/dashboard/TopCanchasPieChart'
import { AnalyticsLegend } from '@/components/analytics/AnalyticsLegend'
import { Button } from '@/components/ui/button'
import { RefreshCw, Download, Calendar, Users, TrendingUp, DollarSign, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { format, subDays, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import apiClient from '@/lib/api-client'
import { downloadExcel, generateFilename } from '@/lib/analytics/export'
import { formatCompactNumber } from '@/lib/analytics/formatters'
import { SPORTS_COLORS } from '@/lib/analytics/constants'
import { withErrorBoundary } from '@/components/error/with-error-boundary'
import dynamic from 'next/dynamic'

// Lazy load 3D components to avoid SSR issues with Three.js
const Revenue3DBarChart = dynamic(
  () => import('@/components/analytics/Charts3D').then(mod => ({ default: mod.Revenue3DBarChart })),
  { ssr: false, loading: () => <div className="h-[500px] animate-pulse bg-slate-100 rounded-xl" /> }
)
const Heatmap3D = dynamic(
  () => import('@/components/analytics/Charts3D').then(mod => ({ default: mod.Heatmap3D })),
  { ssr: false, loading: () => <div className="h-[600px] animate-pulse bg-slate-100 rounded-xl" /> }
)
const Court3DSphere = dynamic(
  () => import('@/components/analytics/Charts3D').then(mod => ({ default: mod.Court3DSphere })),
  { ssr: false, loading: () => <div className="h-[600px] animate-pulse bg-slate-100 rounded-xl" /> }
)

interface DashboardData {
  metrics: {
    occupancy: {
      value: number
      change: number
      sparklineData: number[]
      status: 'good' | 'warning' | 'danger' | 'neutral'
    }
    revenue: {
      value: string
      change: number
      sparklineData: number[]
      status: 'good' | 'warning' | 'danger' | 'neutral'
    }
    activeUsers: {
      value: number
      change: number
      sparklineData: number[]
      status: 'good' | 'warning' | 'danger' | 'neutral'
    }
    confirmedReservations: {
      value: number
      change: number
      sparklineData: number[]
      status: 'good' | 'warning' | 'danger' | 'neutral'
    }
  }
  occupancyTrend: Array<{ date: string; occupancy: number; revenue: number }>
  canchaDistribution: Array<{ id?: string; name: string; reservations: number; sport: string; color: string }>
  heatMapData: Array<{ day: string; hour: number; occupancy: number }>
  topCanchas: Array<{ id: string; name: string; sport: string; reservations: number; revenue: number; occupancy: number; trend: number }>
}

// Use centralized sports colors from analytics constants
const getColorForSport = (sport: string): string => {
  return SPORTS_COLORS[sport] || '#6b7280'
}

const fetchDashboardData = async (filters?: Record<string, unknown> | null): Promise<DashboardData> => {
  try {
    // Prepare date range for API calls
    const today = new Date()
    let fromDate: Date
    let toDate = today

    // Apply periodo filter
    if (filters?.periodo && filters.periodo !== 'month') {
      switch (filters.periodo) {
        case 'today':
          fromDate = startOfDay(today)
          break
        case 'week':
          fromDate = subDays(today, 7)
          break
        case 'quarter':
          fromDate = subDays(today, 90)
          break
        case 'year':
          fromDate = subDays(today, 365)
          break
        default:
          fromDate = subDays(today, 30) // month
      }
    } else if (filters?.dateRange && typeof filters.dateRange === 'object' && filters.dateRange !== null && 'from' in filters.dateRange) {
      const dateRange = filters.dateRange as { from: string | Date; to?: string | Date }
      fromDate = new Date(dateRange.from)
      toDate = dateRange.to ? new Date(dateRange.to) : new Date()
    } else {
      fromDate = subDays(today, 30) // default to last 30 days
    }

    const fromStr = format(fromDate, 'yyyy-MM-dd')
    const toStr = format(toDate, 'yyyy-MM-dd')
    const tz = 'America/Argentina/Cordoba'

    // Calculate previous period for comparison
    const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
    const prevFromDate = subDays(fromDate, daysDiff)
    const prevToDate = fromDate
    const prevFromStr = format(prevFromDate, 'yyyy-MM-dd')
    const prevToStr = format(prevToDate, 'yyyy-MM-dd')

    // Extract clubId from filters if present
    const clubId = filters?.clubId as string | undefined

    // Fetch all data including canchas for real sports and prices
    const [
      adminResumenRes,
      canchasTopRes,
      canchasRes,
      ocupacionRes,
      heatmapRes,
      reservasAggregateRes,
      prevReservasAggregateRes
    ] = await Promise.all([
      apiClient.getAdminResumen(),
      apiClient.getAdminCanchasMasUsadas(fromStr, toStr, tz, clubId).catch(() => ({ data: [], error: null })),
      apiClient.getCanchas().catch(() => ({ data: [], error: null })),
      apiClient.getAdminOcupacion('cancha', fromStr, toStr, tz, clubId).catch(() => ({ data: [], error: null })),
      apiClient.getAdminReservasHeatmap(clubId, fromStr, toStr, tz).catch(() => ({ data: [], error: null })),
      apiClient.getAdminReservasAggregate('day', fromStr, toStr, tz, clubId).catch(() => ({ data: [], error: null })),
      apiClient.getAdminReservasAggregate('day', prevFromStr, prevToStr, tz, clubId).catch(() => ({ data: [], error: null }))
    ])

    // Handle potential errors
    if (adminResumenRes.error) {
      throw new Error('Error fetching data from API')
    }

    const resumen = adminResumenRes.data
    if (!resumen) {
      throw new Error('No data available')
    }

    const canchasTop = canchasTopRes.data || []
    const canchasData = canchasRes.data || []
    const ocupacionData = ocupacionRes.data || []
    const heatmapData = heatmapRes.data || []
    const reservasAggregate = reservasAggregateRes.data || []
    const prevReservasAggregate = prevReservasAggregateRes.data || []

    // Create a map of cancha ID -> cancha data for quick lookup
    const canchaMap = new Map(canchasData.map(c => [c.id, c]))

    // Calculate metrics from admin endpoints data
    const totalReservas = resumen.totalReservas || 0
    const totalCanchas = resumen.totalCanchas || 0
    const totalUsuarios = resumen.totalUsuarios || 0

    // Calculate average occupancy from ocupacionData
    const avgOccupancy = ocupacionData.length > 0
      ? ocupacionData.reduce((sum, item) => sum + (item.ocupacion || 0), 0) / ocupacionData.length
      : 0
    const occupancyRate = avgOccupancy * 100

    // Calculate REAL revenue by matching canchas with reservations
    // We'll estimate based on canchas top which has actual reservation counts
    let totalRevenue = 0
    canchasTop.forEach(cancha => {
      const canchaData = canchaMap.get(cancha.canchaId)
      if (canchaData) {
        // Multiply reservations by actual price per hour
        totalRevenue += cancha.totalReservas * (canchaData.precioPorHora || 0)
      }
    })

    // Validate revenue
    const validRevenue = isNaN(totalRevenue) || !isFinite(totalRevenue) ? 0 : totalRevenue

    // Active users - use totalUsuarios as proxy (real data from backend)
    const activeUsers = totalUsuarios

    // Today's reservations
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    const todayData = reservasAggregate.find(item => item.bucket === todayStr)
    const todayReservations = todayData?.confirmadas || 0

    // Calculate previous period metrics for real comparisons
    const prevTotalReservas = prevReservasAggregate.reduce((sum, item) => sum + (item.confirmadas || 0), 0)
    const currentTotalReservas = reservasAggregate.reduce((sum, item) => sum + (item.confirmadas || 0), 0)

    // Calculate real change percentages
    const calculateChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    const reservationsChange = calculateChange(currentTotalReservas, prevTotalReservas)
    const occupancyChange = calculateChange(occupancyRate, avgOccupancy * 100) // Simplified

    // Generate sparkline data from reservasAggregate (last 7 days)
    const sparklineData = reservasAggregate.slice(-7).map(item => item.confirmadas || 0)

    // Metrics with real comparisons
    const maxSparkline = Math.max(...sparklineData, 1)
    const metrics = {
      occupancy: {
        value: Math.round(occupancyRate * 10) / 10,
        change: Math.round(occupancyChange * 10) / 10,
        sparklineData: sparklineData.map(count => (count / maxSparkline) * 100),
        status: occupancyRate >= 70 ? 'good' as const : occupancyRate >= 50 ? 'warning' as const : 'danger' as const
      },
      revenue: {
        value: validRevenue >= 10000 ? `$${formatCompactNumber(validRevenue)}` : `$${validRevenue.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        change: 0, // We don't have historical revenue data yet
        sparklineData: sparklineData.map(count => count * 100),
        status: 'good' as const
      },
      activeUsers: {
        value: activeUsers,
        change: 0, // We don't have historical user count
        sparklineData: sparklineData,
        status: 'good' as const
      },
      confirmedReservations: {
        value: todayReservations,
        change: Math.round(reservationsChange * 10) / 10,
        sparklineData: sparklineData,
        status: todayReservations >= 40 ? 'good' as const : 'warning' as const
      }
    }

    // Occupancy trend with REAL revenue
    const occupancyTrend = reservasAggregate.map(item => {
      // Calculate average price from all canchas
      const avgPrice = canchasData.length > 0
        ? canchasData.reduce((sum, c) => sum + (c.precioPorHora || 0), 0) / canchasData.length
        : 0

      return {
        date: format(new Date(item.bucket), 'dd MMM', { locale: es }),
        occupancy: Math.round(((item.confirmadas || 0) / Math.max(totalCanchas, 1)) * 100),
        revenue: (item.confirmadas || 0) * avgPrice
      }
    })

    // Cancha distribution with REAL sports
    const canchaDistribution = canchasTop.slice(0, 6).map(cancha => {
      const canchaData = canchaMap.get(cancha.canchaId)
      const sport = canchaData?.deporte?.nombre || 'Otro'

      return {
        id: cancha.canchaId,
        name: cancha.nombre,
        reservations: cancha.totalReservas,
        sport: sport,
        color: getColorForSport(sport)
      }
    })

    // HeatMap data - only show hours with activity (8am to 11pm)
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const processedHeatMapData = []

    if (heatmapData.length > 0) {
      // Only process hours from 8 to 23 (8am to 11pm)
      for (let dow = 0; dow < 7; dow++) {
        for (let hour = 8; hour <= 23; hour++) {
          const hourStr = `${hour.toString().padStart(2, '0')}:00`
          const dataPoint = heatmapData.find(h => h.dow === dow && h.hora === hourStr)
          processedHeatMapData.push({
            day: days[dow],
            hour,
            occupancy: dataPoint?.reservas || 0
          })
        }
      }
    } else {
      // Fallback: empty heatmap for operational hours only
      for (const day of days) {
        for (let hour = 8; hour <= 23; hour++) {
          processedHeatMapData.push({ day, hour, occupancy: 0 })
        }
      }
    }

    // Top canchas with REAL data - no fake trends
    const topCanchas = canchasTop.slice(0, 5).map(cancha => {
      const canchaData = canchaMap.get(cancha.canchaId)
      const sport = canchaData?.deporte?.nombre || 'Otro'
      const revenue = cancha.totalReservas * (canchaData?.precioPorHora || 0)

      // Calculate real occupancy: reservations / total available slots in period
      const hoursPerDay = 16 // Operational hours (8am-12am)
      const totalSlots = daysDiff * hoursPerDay
      const occupancyPercent = totalSlots > 0 ? (cancha.totalReservas / totalSlots) * 100 : 0

      return {
        id: cancha.canchaId,
        name: cancha.nombre,
        sport: sport,
        reservations: cancha.totalReservas,
        revenue: revenue,
        occupancy: Math.round(occupancyPercent * 10) / 10,
        trend: 0 // Remove fake trends - we don't have historical comparison yet
      }
    })

    return {
      metrics,
      occupancyTrend,
      canchaDistribution,
      heatMapData: processedHeatMapData,
      topCanchas
    }
  } catch (error) {
    throw error
  }
}

function DashboardPage() {
  const { isAuthenticated, loading: authLoading, isAdminClub, clubIds } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Record<string, unknown> | null>(null)

  // Drill-down modal state
  const [drillDownOpen, setDrillDownOpen] = useState(false)
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const dashboardData = await fetchDashboardData(activeFilters)
      setData(dashboardData)
      setLastUpdate(new Date())
    } catch {
      toast.error('Error al cargar datos del dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    await loadData()
    toast.success('Dashboard actualizado')
  }

  useEffect(() => {
    if (!isAuthenticated || authLoading) return

    loadData()

    // Auto-refresh cada 5 minutos
    const interval = setInterval(() => {
      handleRefresh()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading])

  const handleExport = () => {
    if (!data) {
      toast.error('No hay datos para exportar')
      return
    }

    try {
      // Prepare data for export
      const exportData = [
        {
          'Métrica': 'Tasa de Ocupación',
          'Valor': `${data.metrics.occupancy.value}%`,
          'Cambio': `${data.metrics.occupancy.change > 0 ? '+' : ''}${data.metrics.occupancy.change}%`,
          'Estado': data.metrics.occupancy.status
        },
        {
          'Métrica': 'Ingresos del Mes',
          'Valor': data.metrics.revenue.value,
          'Cambio': `${data.metrics.revenue.change > 0 ? '+' : ''}${data.metrics.revenue.change}%`,
          'Estado': data.metrics.revenue.status
        },
        {
          'Métrica': 'Usuarios Activos',
          'Valor': data.metrics.activeUsers.value.toString(),
          'Cambio': `${data.metrics.activeUsers.change > 0 ? '+' : ''}${data.metrics.activeUsers.change}%`,
          'Estado': data.metrics.activeUsers.status
        },
        {
          'Métrica': 'Reservas Confirmadas (hoy)',
          'Valor': data.metrics.confirmedReservations.value.toString(),
          'Cambio': `${data.metrics.confirmedReservations.change > 0 ? '+' : ''}${data.metrics.confirmedReservations.change}%`,
          'Estado': data.metrics.confirmedReservations.status
        }
      ]

      // Add top canchas data
      const topCanchasData = data.topCanchas.map(cancha => ({
        'Cancha': cancha.name || 'N/A',
        'Deporte': cancha.sport || 'N/A',
        'Reservas': (cancha.reservations !== undefined ? cancha.reservations.toString() : '0'),
        'Ingresos': `$${cancha.revenue !== undefined ? cancha.revenue : 0}`,
        'Ocupación': `${cancha.occupancy !== undefined ? cancha.occupancy : 0}%`,
        'Tendencia': `${cancha.trend > 0 ? '+' : ''}${cancha.trend}%`
      }))

      // Export as Excel
      const filename = generateFilename('dashboard-analytics', 'xlsx')
      const result = downloadExcel([...exportData, ...topCanchasData], filename, 'Dashboard Analytics')

      if (result.success) {
        toast.success('Dashboard exportado', {
          description: 'Los datos se han descargado correctamente'
        })
      } else {
        throw new Error(result.error || 'Error al exportar')
      }
    } catch (error) {
      toast.error('Error al exportar', {
        description: error instanceof Error ? error.message : 'Error desconocido'
      })
    }
  }

  // Drill-down handlers
  const handleCanchaClick = (canchaId: string, canchaName: string) => {
    setDrillDownData({
      type: 'cancha',
      id: canchaId,
      name: canchaName,
      subtitle: 'Análisis detallado de la cancha'
    })
    setDrillDownOpen(true)
  }

  const handleBarClick = (cancha: { id?: string; name?: string; reservations?: number; sport?: string }) => {
    if (cancha.id && cancha.name) {
      handleCanchaClick(cancha.id, cancha.name)
    } else if (cancha.name) {
      toast.info(`Detalles de ${cancha.name}`, {
        description: cancha.reservations !== undefined ? `${cancha.reservations} reservas en ${cancha.sport || 'N/A'}` : 'Información no disponible'
      })
    }
  }

  const handleSportClick = (sport: string) => {
    setDrillDownData({
      type: 'deporte',
      name: sport,
      subtitle: `Análisis de todas las canchas de ${sport}`
    })
    setDrillDownOpen(true)
  }

  const handleHeatMapCellClick = (cell: { day: string; hour: number; occupancy: number }) => {
    setDrillDownData({
      type: 'hora',
      name: `${cell.day} - ${cell.hour}:00`,
      subtitle: `Reservas para ${cell.day} a las ${cell.hour}:00`,
      metadata: { hour: cell.hour, day: cell.day }
    })
    setDrillDownOpen(true)
  }

  const handleDayClick = (day: string) => {
    setDrillDownData({
      type: 'dia',
      name: day,
      subtitle: `Todas las reservas del ${day}`,
      metadata: { day }
    })
    setDrillDownOpen(true)
  }

  const handleTopCanchaClick = (cancha: { id: string; name: string }) => {
    handleCanchaClick(cancha.id, cancha.name)
  }

  const handleClubClick = (clubId: string, clubName: string) => {
    setDrillDownData({
      type: 'club',
      id: clubId,
      name: clubName,
      subtitle: 'Análisis completo del club'
    })
    setDrillDownOpen(true)
  }

  const closeDrillDown = () => {
    setDrillDownOpen(false)
    setDrillDownData(null)
  }

  const handleApplyFilters = async (filters: Record<string, unknown>) => {
    setActiveFilters(filters)
    try {
      setLoading(true)
      const dashboardData = await fetchDashboardData(filters)
      setData(dashboardData)
      toast.success('Filtros aplicados', {
        description: `Mostrando datos filtrados`
      })
    } catch (error) {
      toast.error('Error al aplicar filtros')
    } finally {
      setLoading(false)
    }
  }

  const handleClearFilters = async () => {
    setActiveFilters(null)
    await loadData()
    toast.info('Filtros limpiados')
  }

  // Don't render until data is loaded
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
        <p className="text-gray-500">Error al cargar datos del dashboard</p>
      </div>
    )
  }

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">
              Dashboard Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Vista general del rendimiento - {format(lastUpdate, "PPP 'a las' HH:mm", { locale: es })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setFiltersOpen(!filtersOpen)}
              variant="outline"
              className={`border-gray-200 dark:border-gray-700 ${filtersOpen ? 'bg-primary/10 border-primary' : ''}`}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtros
              {activeFilters && (
                <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                  ✓
                </span>
              )}
            </Button>
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="border-gray-200 dark:border-gray-700"
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button
              onClick={handleExport}
              className="bg-primary hover:bg-primary/90"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Warning banner for admin-club without clubs */}
        {isAdminClub && clubIds.length === 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                  No tenés clubes asignados
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                  Para ver datos en el dashboard, pedí a un administrador global que te asigne clubes desde la sección de Usuarios.
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Row 1 - Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Tasa de Ocupación"
          value={data.metrics.occupancy.value}
          unit="%"
          change={data.metrics.occupancy.change}
          sparklineData={data.metrics.occupancy.sparklineData}
          status={data.metrics.occupancy.status}
          icon={<TrendingUp className="h-5 w-5" />}
          loading={loading}
        />
        <MetricCard
          title="Ingresos del Mes"
          value={data.metrics.revenue.value}
          change={data.metrics.revenue.change}
          sparklineData={data.metrics.revenue.sparklineData}
          status={data.metrics.revenue.status}
          icon={<DollarSign className="h-5 w-5" />}
          loading={loading}
        />
        <MetricCard
          title="Usuarios Activos"
          value={data.metrics.activeUsers.value}
          change={data.metrics.activeUsers.change}
          sparklineData={data.metrics.activeUsers.sparklineData}
          status={data.metrics.activeUsers.status}
          icon={<Users className="h-5 w-5" />}
          loading={loading}
        />
        <MetricCard
          title="Reservas Confirmadas"
          value={data.metrics.confirmedReservations.value}
          unit="hoy"
          change={data.metrics.confirmedReservations.change}
          sparklineData={data.metrics.confirmedReservations.sparklineData}
          status={data.metrics.confirmedReservations.status}
          icon={<Calendar className="h-5 w-5" />}
          loading={loading}
        />
      </div>

      {/* Row 2 - Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OccupancyChart data={data.occupancyTrend} loading={loading} />
        <CanchaDistributionChart
          data={data.canchaDistribution}
          loading={loading}
          onBarClick={handleBarClick}
          onSportClick={handleSportClick}
        />
      </div>

        {/* Row 3 - HeatMap and Top Canchas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HeatMap
            data={data.heatMapData}
            loading={loading}
            onCellClick={handleHeatMapCellClick}
            onDayClick={handleDayClick}
          />
          <TopCanchasTable
            data={data.topCanchas}
            loading={loading}
            onViewMore={() => toast.info('Ver todas las canchas')}
            onRowClick={handleTopCanchaClick}
          />
        </div>

        {/* Row 3.5 - Top 5 Canchas Pie Chart */}
        <div className="grid grid-cols-1 gap-6">
          <TopCanchasPieChart
            data={data.topCanchas}
            loading={loading}
            onSliceClick={handleTopCanchaClick}
          />
        </div>

        {/* Row 4 - Club Analytics */}
        <div className="grid grid-cols-1 gap-6">
          <ClubAnalyticsCard
            loading={loading}
            onClubClick={handleClubClick}
            onCanchaClick={handleCanchaClick}
            filters={activeFilters}
          />
        </div>

        {/* 3D Visualizations Section */}
        <div className="mt-12 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Visualizaciones 3D Interactivas</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Explora tus datos en 3D - Usa el mouse para rotar, zoom y explorar
              </p>
            </div>
          </div>

          {/* 3D Revenue Bar Chart */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Ingresos por Cancha (3D)
            </h3>
            <Revenue3DBarChart
              data={data.topCanchas.map(cancha => ({
                label: cancha.name.length > 10 ? cancha.name.substring(0, 10) + '...' : cancha.name,
                value: cancha.revenue,
                color: cancha.sport ? (SPORTS_COLORS[cancha.sport] || '#3b82f6') : '#3b82f6'
              }))}
            />
          </div>

          {/* 3D Heatmap */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Mapa de Calor 3D - Ocupación por Día y Hora
            </h3>
            <Heatmap3D
              data={(() => {
                // Convert heatMapData to matrix format
                const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
                const hours = Array.from({ length: 16 }, (_, i) => `${i + 8}:00`)
                const matrix: number[][] = Array(7).fill(0).map(() => Array(16).fill(0))

                data.heatMapData.forEach(item => {
                  const dayIndex = days.indexOf(item.day)
                  const hourIndex = item.hour - 8
                  if (dayIndex >= 0 && hourIndex >= 0 && hourIndex < 16) {
                    matrix[dayIndex][hourIndex] = item.occupancy
                  }
                })

                return matrix
              })()}
              dayLabels={['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']}
              hourLabels={Array.from({ length: 16 }, (_, i) => `${i + 8}:00`)}
            />
          </div>

          {/* 3D Court Sphere Visualization */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Universo de Canchas (3D)
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cada esfera representa una cancha. El tamaño indica la ocupación y giran automáticamente.
            </p>
            <Court3DSphere
              courts={data.topCanchas.map(cancha => ({
                id: cancha.id,
                name: cancha.name,
                sport: cancha.sport,
                occupancy: cancha.occupancy,
                revenue: cancha.revenue,
                color: SPORTS_COLORS[cancha.sport] || '#3b82f6'
              }))}
            />
          </div>
        </div>

        {/* Analytics Legend - Help Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <AnalyticsLegend />
        </div>
      </div>

      {/* Sidebar Filters */}
      <DashboardFilters
        isOpen={filtersOpen}
        onToggle={() => setFiltersOpen(!filtersOpen)}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Drill-Down Modal */}
      <DrillDownModal
        isOpen={drillDownOpen}
        onClose={closeDrillDown}
        data={drillDownData}
      />
    </div>
  )
}

export default withErrorBoundary(DashboardPage, 'Dashboard Analytics')

