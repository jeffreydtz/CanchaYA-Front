/**
 * ClubAnalyticsCard Component
 * Card para mostrar análisis por club con drill-down a canchas
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  MapPin,
  TrendingUp,
  DollarSign,
  MousePointerClick,
  ChevronRight,
  Calendar
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { toast } from 'sonner'
import type { Club, Cancha, Reserva } from '@/lib/api-client'
import { formatCompactNumber } from '@/lib/analytics/formatters'

interface ClubStats {
  id: string
  nombre: string
  direccion?: string
  totalCanchas: number
  totalReservas: number
  ingresos: number
  ocupacion: number
  deportes: string[]
}

interface ClubAnalyticsCardProps {
  loading?: boolean
  onClubClick?: (clubId: string, clubName: string) => void
  onCanchaClick?: (canchaId: string, canchaName: string) => void
  filters?: Record<string, any> | null
}

export function ClubAnalyticsCard({
  loading: externalLoading = false,
  onClubClick,
  onCanchaClick,
  filters
}: ClubAnalyticsCardProps) {
  const [loading, setLoading] = useState(true)
  const [clubStats, setClubStats] = useState<ClubStats[]>([])
  const [expandedClub, setExpandedClub] = useState<string | null>(null)
  const [clubCanchas, setClubCanchas] = useState<Record<string, Cancha[]>>({})

  const loadClubAnalytics = useCallback(async () => {
    try {
      setLoading(true)

      // Fetch data
      const [clubsRes, canchasRes, reservasRes] = await Promise.all([
        apiClient.getClubes(),
        apiClient.getCanchas(),
        apiClient.getReservas()
      ])

      if (clubsRes.error || canchasRes.error || reservasRes.error) {
        throw new Error('Error fetching data')
      }

      const clubs: Club[] = clubsRes.data || []
      let canchas: Cancha[] = canchasRes.data || []
      let reservas: Reserva[] = reservasRes.data || []

      // Apply filters if provided
      if (filters) {
        // Filter by cancha
        if (filters.cancha && filters.cancha !== 'all') {
          canchas = canchas.filter(c => c.id === filters.cancha)
          const canchaIds = canchas.map(c => c.id)
          reservas = reservas.filter(r => canchaIds.includes(r.disponibilidad?.cancha?.id))
        }

        // Filter by deporte
        if (filters.deporte && filters.deporte !== 'all') {
          canchas = canchas.filter(c => c.deporte.nombre.toLowerCase() === filters.deporte.toLowerCase())
          const canchaIds = canchas.map(c => c.id)
          reservas = reservas.filter(r => canchaIds.includes(r.disponibilidad?.cancha?.id))
        }

        // Filter by date range
        if (filters.dateRange && filters.dateRange.from) {
          const fromDate = new Date(filters.dateRange.from)
          const toDate = filters.dateRange.to ? new Date(filters.dateRange.to) : new Date()
          reservas = reservas.filter(r => {
            const reservaDate = new Date(r.fechaHora)
            return reservaDate >= fromDate && reservaDate <= toDate
          })
        } else if (filters.periodo && filters.periodo !== 'month') {
          // Apply periodo filter
          const today = new Date()
          let fromDate: Date

          switch (filters.periodo) {
            case 'today':
              fromDate = new Date(today)
              fromDate.setHours(0, 0, 0, 0)
              break
            case 'week':
              fromDate = new Date(today)
              fromDate.setDate(fromDate.getDate() - 7)
              break
            case 'quarter':
              fromDate = new Date(today)
              fromDate.setDate(fromDate.getDate() - 90)
              break
            case 'year':
              fromDate = new Date(today)
              fromDate.setDate(fromDate.getDate() - 365)
              break
            default:
              fromDate = new Date(today)
              fromDate.setDate(fromDate.getDate() - 30) // month
          }

          reservas = reservas.filter(r => new Date(r.fechaHora) >= fromDate)
        }
      }

      // Calculate stats for each club
      const stats: ClubStats[] = clubs.map((club: Club) => {
        const clubCanchasData = canchas.filter((c: Cancha) => c.club?.id === club.id)
        const clubCanchaIds = clubCanchasData.map((c: Cancha) => c.id)
        const clubReservas = reservas.filter((r: Reserva) =>
          r.disponibilidad?.cancha?.id && clubCanchaIds.includes(r.disponibilidad.cancha.id)
        )

        const confirmedReservas = clubReservas.filter(
          (r: Reserva) => r.estado === 'confirmada' || r.estado === 'completada'
        )

        const ingresos = confirmedReservas.reduce((sum: number, r: Reserva) => {
          const cancha = clubCanchasData.find((c: Cancha) => c.id === r.disponibilidad?.cancha?.id)
          return sum + (cancha?.precioPorHora || 0)
        }, 0)

        const deportes = Array.from(new Set(clubCanchasData.map((c: Cancha) => c.deporte.nombre)))

        const totalSlots = clubCanchasData.length * 24 * 7 // canchas * hours * days
        const ocupacion = totalSlots > 0 ? Math.round((confirmedReservas.length / totalSlots) * 100) : 0

        return {
          id: club.id,
          nombre: club.nombre,
          direccion: club.direccion,
          totalCanchas: clubCanchasData.length,
          totalReservas: clubReservas.length,
          ingresos,
          ocupacion,
          deportes
        }
      }).sort((a: ClubStats, b: ClubStats) => b.ingresos - a.ingresos)

      // Store canchas by club for expansion
      const canchasByClub: Record<string, Cancha[]> = {}
      clubs.forEach((club: Club) => {
        canchasByClub[club.id] = canchas.filter((c: Cancha) => c.club?.id === club.id)
      })

      setClubStats(stats)
      setClubCanchas(canchasByClub)
    } catch (error) {
      console.error('Error loading club analytics:', error)
      toast.error('Error al cargar análisis de clubes')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadClubAnalytics()
  }, [loadClubAnalytics])

  const handleClubClick = (club: ClubStats) => {
    onClubClick?.(club.id, club.nombre)
  }

  const handleExpandClub = (clubId: string) => {
    setExpandedClub(expandedClub === clubId ? null : clubId)
  }

  const handleCanchaClick = (canchaId: string, canchaName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onCanchaClick?.(canchaId, canchaName)
  }

  if (loading || externalLoading) {
    return (
      <Card className="col-span-2 animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-2 border-gray-200 dark:border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Análisis por Club
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
              <MousePointerClick className="h-4 w-4" />
              Rendimiento de clubes - Click para drill-down
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-sm">
            {clubStats.length} clubes
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {clubStats.map((club, index) => (
            <div key={club.id} className="space-y-2">
              {/* Club Header */}
              <div
                className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-colors cursor-pointer"
                onClick={() => handleClubClick(club)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={index < 3 ? 'default' : 'outline'}
                        className="text-xs"
                      >
                        #{index + 1}
                      </Badge>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                          {club.nombre}
                        </h3>
                        {club.direccion && (
                          <p className="text-xs text-gray-500 mt-1">{club.direccion}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-xs text-gray-500">Canchas</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {club.totalCanchas}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-xs text-gray-500">Reservas</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {club.totalReservas}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-xs text-gray-500">Ingresos</p>
                          <p className="text-lg font-bold text-green-600">
                            ${formatCompactNumber(club.ingresos)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                        <div>
                          <p className="text-xs text-gray-500">Ocupación</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {club.ocupacion}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-gray-500">Deportes:</span>
                      {club.deportes.map((deporte: string) => (
                        <Badge key={deporte} variant="secondary" className="text-xs">
                          {deporte}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleExpandClub(club.id)
                      }}
                      className="text-xs"
                    >
                      {expandedClub === club.id ? 'Ocultar' : 'Ver'} Canchas
                      <ChevronRight
                        className={`h-4 w-4 ml-1 transition-transform ${
                          expandedClub === club.id ? 'rotate-90' : ''
                        }`}
                      />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleClubClick(club)
                      }}
                      className="text-xs"
                    >
                      Análisis Completo
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expanded Canchas List */}
              {expandedClub === club.id && clubCanchas[club.id] && (
                <div className="ml-6 space-y-2">
                  {clubCanchas[club.id].map((cancha: Cancha) => (
                    <div
                      key={cancha.id}
                      className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-colors cursor-pointer"
                      onClick={(e) => handleCanchaClick(cancha.id, cancha.nombre, e)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-primary" />
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {cancha.nombre}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {cancha.deporte.nombre}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                ${formatCompactNumber(cancha.precioPorHora)}/h
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs">
                          Ver Detalles
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Hint */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <MousePointerClick className="h-4 w-4" />
            <span>
              <strong>Tip:</strong> Click en un club para ver análisis completo, o expande para ver canchas individuales
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
