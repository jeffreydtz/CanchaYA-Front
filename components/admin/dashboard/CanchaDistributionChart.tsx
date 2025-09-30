/**
 * CanchaDistributionChart Component
 * Gráfico de barras horizontales mostrando reservas por cancha
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts'
import { MapPin } from 'lucide-react'

interface CanchaData {
  name: string
  reservations: number
  sport: string
  color: string
}

interface CanchaDistributionChartProps {
  data: CanchaData[]
  loading?: boolean
  onBarClick?: (cancha: CanchaData) => void
}

const SPORT_COLORS: Record<string, string> = {
  'Fútbol': '#3b82f6',
  'Tenis': '#10b981',
  'Paddle': '#f59e0b',
  'Básquet': '#ef4444',
  'Vóley': '#8b5cf6',
  default: '#6b7280'
}

export function CanchaDistributionChart({ 
  data, 
  loading = false,
  onBarClick 
}: CanchaDistributionChartProps) {
  
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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {data.name}
          </p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium text-gray-600 dark:text-gray-400">Deporte:</span>{' '}
              <span className="text-gray-900 dark:text-white">{data.sport}</span>
            </p>
            <p className="text-sm">
              <span className="font-medium text-gray-600 dark:text-gray-400">Reservas:</span>{' '}
              <span className="text-primary font-bold">{data.reservations}</span>
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
              <MapPin className="h-5 w-5 text-primary" />
              Distribución por Cancha
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
              Cantidad de reservas por cancha y deporte
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={data} 
            layout="horizontal"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
            <XAxis 
              type="number"
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              type="category"
              dataKey="name" 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
            <Bar 
              dataKey="reservations" 
              radius={[0, 8, 8, 0]}
              cursor="pointer"
              onClick={(data) => onBarClick?.(data)}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={SPORT_COLORS[entry.sport] || SPORT_COLORS.default} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 justify-center">
          {Array.from(new Set(data.map(d => d.sport))).map((sport) => (
            <div key={sport} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: SPORT_COLORS[sport] || SPORT_COLORS.default }}
              />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {sport}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
