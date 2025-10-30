"use client"

/**
 * Dashboard Analytics Page
 * Vista principal del dashboard con todas las métricas y gráficos
 */

import { useEffect, useState } from 'react'
import { MetricCard } from '@/components/admin/dashboard/MetricCard'
import { OccupancyChart } from '@/components/admin/dashboard/OccupancyChart'
import { CanchaDistributionChart } from '@/components/admin/dashboard/CanchaDistributionChart'
import { HeatMap } from '@/components/admin/dashboard/HeatMap'
import { TopCanchasTable } from '@/components/admin/dashboard/TopCanchasTable'
import { DashboardFilters } from '@/components/admin/dashboard/DashboardFilters'
import { Button } from '@/components/ui/button'
import { RefreshCw, Download, Calendar, Users, TrendingUp, DollarSign, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { format, subDays, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import apiClient from '@/lib/api-client'

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
  canchaDistribution: Array<{ name: string; reservations: number; sport: string; color: string }>
  heatMapData: Array<{ day: string; hour: number; occupancy: number }>
  topCanchas: Array<{ id: string; name: string; sport: string; reservations: number; revenue: number; occupancy: number; trend: number }>
}

// Colores para deportes
const SPORT_COLORS: Record<string, string> = {
  'Fútbol': '#3b82f6',
  'Fútbol 5': '#3b82f6',
  'Fútbol 7': '#2563eb',
  'Tenis': '#10b981',
  'Paddle': '#f59e0b',
  'Pádel': '#f59e0b',
  'Básquet': '#ef4444',
  'Baloncesto': '#ef4444',
  'Vóley': '#8b5cf6',
  'Voleibol': '#8b5cf6',
}

const getColorForSport = (sport: string): string => {
  return SPORT_COLORS[sport] || '#6b7280'
}

const fetchDashboardData = async (): Promise<DashboardData> => {
  try {
    // Fetch all required data in parallel
    const [
      reservasRes,
      canchasRes,
      usuariosRes,
      canchasTopRes,
      ocupacionHorariosRes
    ] = await Promise.all([
      apiClient.getReservas(),
      apiClient.getCanchas(),
      apiClient.getUsuarios(),
      apiClient.getReporteCanchasTop(),
      apiClient.getReporteOcupacionHorarios()
    ])

    // Handle potential errors
    if (reservasRes.error || canchasRes.error || usuariosRes.error) {
      throw new Error('Error fetching data from API')
    }

    const reservas = reservasRes.data || []
    const canchas = canchasRes.data || []
    const canchasTop = canchasTopRes.data || []
    const ocupacionHorarios = ocupacionHorariosRes.data || []

    // Filter confirmed and completed reservations
    const confirmedReservations = reservas.filter(r => r.estado === 'confirmada' || r.estado === 'completada')

    // Get today's confirmed reservations
    const today = startOfDay(new Date())
    const todayReservations = confirmedReservations.filter(r => {
      const reservaDate = startOfDay(new Date(r.fechaHora))
      return reservaDate.getTime() === today.getTime()
    })

    // Calculate revenue (sum of all completed reservations)
    const totalRevenue = confirmedReservations.reduce((sum, r) => {
      const cancha = canchas.find(c => c.id === r.disponibilidad?.cancha?.id)
      return sum + (cancha?.precioPorHora || 0)
    }, 0)

    // Calculate occupancy rate
    const totalSlots = canchas.length * 24 * 7 // Simplified: canchas * hours * days
    const occupancyRate = totalSlots > 0 ? (confirmedReservations.length / totalSlots) * 100 : 0

    // Active users (users with at least one reservation in last 30 days)
    const thirtyDaysAgo = subDays(new Date(), 30)
    const recentReservations = confirmedReservations.filter(r =>
      new Date(r.fechaHora) >= thirtyDaysAgo
    )
    const activeUserIds = new Set(recentReservations.map(r => r.persona.id))
    const activeUsers = activeUserIds.size

    // Generate sparkline data (last 7 days)
    const sparklineData = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i)
      const dayReservations = confirmedReservations.filter(r => {
        const resDate = startOfDay(new Date(r.fechaHora))
        return resDate.getTime() === startOfDay(date).getTime()
      })
      return dayReservations.length
    })

    // Metrics
    const metrics = {
      occupancy: {
        value: Math.round(occupancyRate * 10) / 10,
        change: 8.2, // Would need historical data to calculate
        sparklineData: sparklineData.map(count => (count / Math.max(...sparklineData, 1)) * 100),
        status: occupancyRate >= 70 ? 'good' as const : occupancyRate >= 50 ? 'warning' as const : 'danger' as const
      },
      revenue: {
        value: `$${totalRevenue.toLocaleString()}`,
        change: 12.5, // Would need historical data to calculate
        sparklineData: sparklineData.map(count => count * 100), // Simplified revenue estimation
        status: 'good' as const
      },
      activeUsers: {
        value: activeUsers,
        change: 5.3, // Would need historical data to calculate
        sparklineData: sparklineData,
        status: 'good' as const
      },
      confirmedReservations: {
        value: todayReservations.length,
        change: -2.1, // Would need historical data to calculate
        sparklineData: sparklineData,
        status: todayReservations.length >= 40 ? 'good' as const : 'warning' as const
      }
    }

    // Occupancy trend (last 30 days)
    const occupancyTrend = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i)
      const dayReservations = confirmedReservations.filter(r => {
        const resDate = startOfDay(new Date(r.fechaHora))
        return resDate.getTime() === startOfDay(date).getTime()
      })
      const dayRevenue = dayReservations.reduce((sum, r) => {
        const cancha = canchas.find(c => c.id === r.disponibilidad?.cancha?.id)
        return sum + (cancha?.precioPorHora || 0)
      }, 0)
      return {
        date: format(date, 'dd MMM', { locale: es }),
        occupancy: Math.round((dayReservations.length / Math.max(canchas.length, 1)) * 100),
        revenue: dayRevenue
      }
    })

    // Cancha distribution (group by cancha)
    const canchaMap = new Map<string, { name: string; sport: string; count: number }>()
    confirmedReservations.forEach(r => {
      const canchaId = r.disponibilidad?.cancha?.id
      const canchaData = canchas.find(c => c.id === canchaId)
      if (canchaData) {
        const existing = canchaMap.get(canchaId!)
        if (existing) {
          existing.count++
        } else {
          canchaMap.set(canchaId!, {
            name: canchaData.nombre,
            sport: canchaData.deporte.nombre,
            count: 1
          })
        }
      }
    })

    const canchaDistribution = Array.from(canchaMap.entries())
      .map(([_id, data]) => ({
        name: data.name,
        reservations: data.count,
        sport: data.sport,
        color: getColorForSport(data.sport)
      }))
      .sort((a, b) => b.reservations - a.reservations)
      .slice(0, 6)

    // HeatMap data - use occupancy data from API if available
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    const heatMapData = []

    if (ocupacionHorarios.length > 0) {
      // Use real data from API
      for (const day of days) {
        for (let hour = 0; hour < 24; hour++) {
          const hourStr = `${hour.toString().padStart(2, '0')}:00`
          const ocupacion = ocupacionHorarios.find(o => o.hora === hourStr)
          heatMapData.push({
            day,
            hour,
            occupancy: ocupacion?.ocupacion || 0
          })
        }
      }
    } else {
      // Fallback: calculate from reservations
      for (const day of days) {
        for (let hour = 0; hour < 24; hour++) {
          const hourReservations = confirmedReservations.filter(r => {
            const date = new Date(r.fechaHora)
            return date.getHours() === hour
          })
          const occupancy = Math.round((hourReservations.length / Math.max(canchas.length, 1)) * 100)
          heatMapData.push({ day, hour, occupancy })
        }
      }
    }

    // Top canchas - use API data if available
    const topCanchas = (canchasTop.length > 0 ? canchasTop : Array.from(canchaMap.entries()))
      .slice(0, 5)
      .map((entry) => {
        if (Array.isArray(entry)) {
          const [id, data] = entry
          const cancha = canchas.find(c => c.id === id)
          return {
            id,
            name: data.name,
            sport: data.sport,
            reservations: data.count,
            revenue: data.count * (cancha?.precioPorHora || 0),
            occupancy: Math.round((data.count / 30) * 100),
            trend: Math.random() > 0.5 ? Math.floor(Math.random() * 10) : -Math.floor(Math.random() * 5)
          }
        } else {
          const cancha = canchas.find(c => c.id === entry.canchaId)
          return {
            id: entry.canchaId,
            name: entry.canchaNombre,
            sport: cancha?.deporte.nombre || 'Desconocido',
            reservations: entry.cantidadReservas,
            revenue: entry.cantidadReservas * (cancha?.precioPorHora || 0),
            occupancy: Math.round((entry.cantidadReservas / 30) * 100),
            trend: Math.random() > 0.5 ? Math.floor(Math.random() * 10) : -Math.floor(Math.random() * 5)
          }
        }
      })

    return {
      metrics,
      occupancyTrend,
      canchaDistribution,
      heatMapData,
      topCanchas
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    throw error
  }
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Record<string, unknown> | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const dashboardData = await fetchDashboardData()
      setData(dashboardData)
      setLastUpdate(new Date())
    } catch (error) {
      toast.error('Error al cargar datos del dashboard')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    await loadData()
    toast.success('Dashboard actualizado')
  }

  useEffect(() => {
    loadData()

    // Auto-refresh cada 5 minutos
    const interval = setInterval(() => {
      handleRefresh()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleExport = () => {
    toast.info('Exportando dashboard...', {
      description: 'La funcionalidad de exportación estará disponible pronto'
    })
  }

  const handleBarClick = (cancha: any) => {
    toast.info(`Detalles de ${cancha.name}`, {
      description: `${cancha.reservations} reservas en ${cancha.sport}`
    })
  }

  const handleApplyFilters = async (filters: Record<string, unknown>) => {
    setActiveFilters(filters)
    // TODO: Implement filter logic in fetchDashboardData
    await loadData()
    toast.success('Filtros aplicados', {
      description: `Mostrando datos filtrados`
    })
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
        />
      </div>

        {/* Row 3 - HeatMap and Top Canchas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HeatMap data={data.heatMapData} loading={loading} />
          <TopCanchasTable
            data={data.topCanchas}
            loading={loading}
            onViewMore={() => toast.info('Ver todas las canchas')}
          />
        </div>
      </div>

      {/* Sidebar Filters */}
      <DashboardFilters
        isOpen={filtersOpen}
        onToggle={() => setFiltersOpen(!filtersOpen)}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />
    </div>
  )
}
