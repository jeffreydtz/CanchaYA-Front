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
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Datos ficticios para el dashboard
const generateMockData = () => {
  // Métricas principales
  const metrics = {
    occupancy: {
      value: 75.5,
      change: 8.2,
      sparklineData: [65, 68, 70, 72, 74, 75, 73, 75.5],
      status: 'good' as const
    },
    revenue: {
      value: '$45,000',
      change: 12.5,
      sparklineData: [38000, 40000, 42000, 41000, 43000, 44000, 45000],
      status: 'good' as const
    },
    activeUsers: {
      value: 234,
      change: 5.3,
      sparklineData: [210, 215, 220, 225, 228, 230, 234],
      status: 'good' as const
    },
    confirmedReservations: {
      value: 45,
      change: -2.1,
      sparklineData: [50, 48, 47, 46, 44, 45, 45],
      status: 'warning' as const
    }
  }

  // Datos de tendencia de ocupación (30 días)
  const occupancyTrend = Array.from({ length: 30 }, (_, i) => ({
    date: format(new Date(2025, 0, i + 1), 'dd MMM', { locale: es }),
    occupancy: Math.floor(60 + Math.random() * 30),
    revenue: Math.floor(30000 + Math.random() * 20000)
  }))

  // Distribución por cancha
  const canchaDistribution = [
    { name: 'Cancha 1', reservations: 156, sport: 'Fútbol', color: '#3b82f6' },
    { name: 'Cancha 2', reservations: 142, sport: 'Fútbol', color: '#3b82f6' },
    { name: 'Cancha 3', reservations: 128, sport: 'Tenis', color: '#10b981' },
    { name: 'Cancha 4', reservations: 98, sport: 'Paddle', color: '#f59e0b' },
    { name: 'Cancha 5', reservations: 87, sport: 'Básquet', color: '#ef4444' },
    { name: 'Cancha 6', reservations: 72, sport: 'Vóley', color: '#8b5cf6' }
  ]

  // HeatMap data
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  const heatMapData = []
  for (const day of days) {
    for (let hour = 0; hour < 24; hour++) {
      // Simular más ocupación en horas pico (18:00-22:00)
      let baseOccupancy = 20
      if (hour >= 18 && hour <= 22) baseOccupancy = 70
      else if (hour >= 15 && hour <= 17) baseOccupancy = 50
      else if (hour >= 8 && hour <= 14) baseOccupancy = 40
      else if (hour < 6 || hour > 23) baseOccupancy = 0

      // Más ocupación en fin de semana
      if (day === 'Sáb' || day === 'Dom') baseOccupancy *= 1.2

      heatMapData.push({
        day,
        hour,
        occupancy: Math.min(100, baseOccupancy + Math.floor(Math.random() * 20))
      })
    }
  }

  // Top 5 canchas
  const topCanchas = [
    { id: '1', name: 'Cancha Principal', sport: 'Fútbol', reservations: 156, revenue: 23400, occupancy: 92, trend: 5 },
    { id: '2', name: 'Cancha Tenis 1', sport: 'Tenis', reservations: 142, revenue: 21300, occupancy: 85, trend: 3 },
    { id: '3', name: 'Cancha Fútbol 2', sport: 'Fútbol', reservations: 128, revenue: 19200, occupancy: 78, trend: -2 },
    { id: '4', name: 'Cancha Paddle 1', sport: 'Paddle', reservations: 98, revenue: 14700, occupancy: 65, trend: 8 },
    { id: '5', name: 'Cancha Básquet', sport: 'Básquet', reservations: 87, revenue: 13050, occupancy: 58, trend: 1 }
  ]

  return {
    metrics,
    occupancyTrend,
    canchaDistribution,
    heatMapData,
    topCanchas
  }
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(generateMockData())
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<any>(null)

  useEffect(() => {
    // Simular carga inicial
    setTimeout(() => {
      setLoading(false)
    }, 1000)

    // Auto-refresh cada 5 minutos
    const interval = setInterval(() => {
      handleRefresh()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      setData(generateMockData())
      setLastUpdate(new Date())
      setLoading(false)
      toast.success('Dashboard actualizado')
    }, 1000)
  }

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

  const handleApplyFilters = (filters: any) => {
    setActiveFilters(filters)
    setLoading(true)
    setTimeout(() => {
      setData(generateMockData())
      setLoading(false)
      toast.success('Filtros aplicados', {
        description: `Mostrando datos filtrados`
      })
    }, 800)
  }

  const handleClearFilters = () => {
    setActiveFilters(null)
    setLoading(true)
    setTimeout(() => {
      setData(generateMockData())
      setLoading(false)
      toast.info('Filtros limpiados')
    }, 800)
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
