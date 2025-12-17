/**
 * OccupancyChart Component
 * Gráfico de línea mostrando la tendencia de ocupación en el tiempo
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  LineChart, 
  Line, 
  Area,
  AreaChart,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'
import { TrendingUp } from 'lucide-react'

interface OccupancyData {
  date: string
  occupancy: number
  revenue: number
}

interface OccupancyChartProps {
  data: OccupancyData[]
  loading?: boolean
}

export function OccupancyChart({ data, loading = false }: OccupancyChartProps) {
  if (loading) {
    return (
      <Card className="col-span-1 animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </CardContent>
      </Card>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const occupancy = payload[0]?.value
      const revenue = payload[1]?.value

      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              <span className="font-medium">Ocupación:</span> {typeof occupancy === 'number' && !isNaN(occupancy) ? `${occupancy.toFixed(1)}%` : 'N/A'}
            </p>
            <p className="text-sm text-green-600 dark:text-green-400">
              <span className="font-medium">Ingresos:</span> ${typeof revenue === 'number' && !isNaN(revenue) ? revenue.toLocaleString() : '0'}
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="col-span-1 border-gray-200 dark:border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Tendencia de Ocupación
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
              Últimos 30 días - Ocupación y revenue
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!data || data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            No hay datos disponibles
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
            <defs>
              <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }}
              iconType="circle"
            />
            <Area
              type="monotone"
              dataKey="occupancy"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#colorOccupancy)"
              name="Ocupación (%)"
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="Ingresos ($)"
            />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
