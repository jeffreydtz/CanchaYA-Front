/**
 * TopCanchasPieChart Component
 * Pie chart showing top 5 canchas by reservations
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { MapPin } from 'lucide-react'
import { formatCompactNumber } from '@/lib/analytics/formatters'

interface TopCanchaData {
  id: string
  name: string
  sport: string
  reservations: number
  revenue: number
  occupancy: number
  trend: number
}

interface TopCanchasPieChartProps {
  data: TopCanchaData[]
  loading?: boolean
  onSliceClick?: (cancha: TopCanchaData) => void
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function TopCanchasPieChart({ data, loading, onSliceClick }: TopCanchasPieChartProps) {
  // Validate and filter data
  const validData = (data || [])
    .filter(d => d && d.id && d.name && typeof d.reservations === 'number' && !isNaN(d.reservations) && d.reservations > 0)
    .sort((a, b) => b.reservations - a.reservations) // Sort by reservations descending

  // Take only top 5
  const top5 = validData.slice(0, 5)

  // Prepare data for pie chart
  const pieData = top5.map((cancha, index) => ({
    name: String(cancha.name || 'Sin nombre').substring(0, 25), // Limit name length
    value: Math.max(0, Number(cancha.reservations || 0)),
    revenue: Math.max(0, Number(cancha.revenue || 0)),
    sport: String(cancha.sport || 'Otro'),
    color: COLORS[index % COLORS.length],
    id: String(cancha.id)
  })).filter(d => d.value > 0) // Only include items with value > 0

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{data.sport}</p>
          <p className="text-sm font-medium text-primary mt-1">
            {data.value} reservas
          </p>
          <p className="text-sm text-green-600">
            ${formatCompactNumber(data.revenue)} ingresos
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    // Validate percent value
    const percentValue = typeof percent === 'number' && !isNaN(percent) && isFinite(percent) 
      ? (percent * 100).toFixed(0) 
      : '0'

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${percentValue}%`}
      </text>
    )
  }

  if (loading) {
    return (
      <Card className="border-gray-200 dark:border-gray-800 animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-gray-200 dark:bg-gray-700 rounded"></div>
        </CardContent>
      </Card>
    )
  }

  // Early validation
  if (!data || !Array.isArray(data) || data.length === 0 || pieData.length === 0) {
    return (
      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Top 5 Canchas
          </CardTitle>
          <CardDescription>Distribución de reservas por cancha</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            {!data || !Array.isArray(data) || data.length === 0 
              ? 'No hay datos disponibles' 
              : 'No hay datos válidos para mostrar'}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Top 5 Canchas
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          Distribución de reservas por cancha
          <span className="text-xs text-gray-500">
            • {pieData.reduce((sum, item) => sum + item.value, 0)} reservas totales
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pieData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            No hay datos válidos para mostrar
          </div>
        ) : (
          <div className="w-full" style={{ height: '300px', minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={pieData.length > 0 ? CustomLabel : false}
                  outerRadius={Math.min(100, 280 / pieData.length - 10)}
                  innerRadius={pieData.length > 3 ? 40 : 0}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  onClick={(data: any) => {
                    if (onSliceClick && data && data.id) {
                      const cancha = top5.find(c => String(c.id) === String(data.id))
                      if (cancha) onSliceClick(cancha)
                    }
                  }}
                  style={{ cursor: onSliceClick ? 'pointer' : 'default' }}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.id || index}`}
                      fill={entry.color}
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={Math.min(80, pieData.length * 20 + 20)}
                  wrapperStyle={{ fontSize: '12px' }}
                  formatter={(value: string, entry: any) => {
                    const payload = entry.payload
                    if (!payload) return value
                    return (
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        {payload.name || value} ({payload.value || 0} reservas)
                      </span>
                    )
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-500">Total Reservas</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {pieData.reduce((sum, item) => sum + item.value, 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Ingresos Totales</p>
            <p className="text-lg font-bold text-green-600">
              ${formatCompactNumber(pieData.reduce((sum, item) => sum + item.revenue, 0))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
