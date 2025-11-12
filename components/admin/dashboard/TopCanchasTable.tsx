/**
 * TopCanchasTable Component
 * Tabla mostrando las top 5 canchas con mejores métricas y drill-down
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, Trophy, TrendingUp, TrendingDown, MousePointerClick } from 'lucide-react'

interface TopCanchaData {
  id: string
  name: string
  sport: string
  reservations: number
  revenue: number
  occupancy: number
  trend: number
}

interface TopCanchasTableProps {
  data: TopCanchaData[]
  loading?: boolean
  onViewMore?: () => void
  onRowClick?: (cancha: TopCanchaData) => void
}

type SortKey = 'reservations' | 'revenue' | 'occupancy'
type SortOrder = 'asc' | 'desc'

export function TopCanchasTable({ data, loading = false, onViewMore, onRowClick }: TopCanchasTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('revenue')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('desc')
    }
  }

  const sortedData = [...data].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1
    return (a[sortKey] - b[sortKey]) * multiplier
  })

  const getRankBadge = (index: number) => {
    if (index === 0) return <Badge className="bg-yellow-500 hover:bg-yellow-600">🥇 1°</Badge>
    if (index === 1) return <Badge className="bg-gray-400 hover:bg-gray-500">🥈 2°</Badge>
    if (index === 2) return <Badge className="bg-amber-700 hover:bg-amber-800">🥉 3°</Badge>
    return <Badge variant="outline">{index + 1}°</Badge>
  }

  const getOccupancyColor = (occupancy: number) => {
    if (occupancy >= 80) return 'bg-green-500'
    if (occupancy >= 60) return 'bg-yellow-500'
    if (occupancy >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <Card className="col-span-2 animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top 5 Canchas
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
              <MousePointerClick className="h-4 w-4" />
              Mejores canchas - Click en fila para análisis completo
            </CardDescription>
          </div>
          {onViewMore && (
            <Button variant="outline" size="sm" onClick={onViewMore}>
              Ver Todas
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-900">
              <TableRow>
                <TableHead className="w-16 text-center font-semibold">#</TableHead>
                <TableHead className="font-semibold">Cancha</TableHead>
                <TableHead className="font-semibold">Deporte</TableHead>
                <TableHead 
                  className="text-right font-semibold cursor-pointer hover:text-primary"
                  onClick={() => handleSort('reservations')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Reservas
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead 
                  className="text-right font-semibold cursor-pointer hover:text-primary"
                  onClick={() => handleSort('revenue')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Ingresos
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead 
                  className="text-right font-semibold cursor-pointer hover:text-primary"
                  onClick={() => handleSort('occupancy')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Ocupación
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.slice(0, 5).map((cancha, index) => (
                <TableRow
                  key={cancha.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer transition-colors"
                  onClick={() => onRowClick?.(cancha)}
                  onMouseEnter={() => setHoveredRow(cancha.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <TableCell className="text-center">
                    {getRankBadge(index)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {cancha.name}
                      </span>
                      {cancha.trend > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : cancha.trend < 0 ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : null}
                      {hoveredRow === cancha.id && (
                        <MousePointerClick className="h-4 w-4 text-primary animate-pulse" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-medium">
                      {cancha.sport}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-gray-900 dark:text-white">
                    {cancha.reservations}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-green-600 dark:text-green-400">
                    ${cancha.revenue.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${getOccupancyColor(cancha.occupancy)}`}
                          style={{ width: `${cancha.occupancy}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white w-12">
                        {cancha.occupancy}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Hint */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <MousePointerClick className="h-4 w-4" />
            <span>
              <strong>Tip:</strong> Haz click en cualquier fila para ver el análisis completo de la cancha con gráficos detallados
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
