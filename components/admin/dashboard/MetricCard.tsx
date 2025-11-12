/**
 * MetricCard Component
 * Tarjeta de métrica con valor, tendencia y mini gráfico sparkline
 */

'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

interface MetricCardProps {
  title: string
  value: string | number
  unit?: string
  change: number
  sparklineData: number[]
  status?: 'good' | 'warning' | 'danger' | 'neutral'
  icon?: React.ReactNode
  loading?: boolean
}

export function MetricCard({
  title,
  value,
  unit,
  change,
  sparklineData,
  status = 'neutral',
  icon,
  loading = false
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (!change || change === 0 || isNaN(change)) return <Minus className="h-4 w-4" />
    if (change > 0) return <TrendingUp className="h-4 w-4" />
    if (change < 0) return <TrendingDown className="h-4 w-4" />
    return <Minus className="h-4 w-4" />
  }

  const getStatusColor = () => {
    switch(status) {
      case 'good': return 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
      case 'warning': return 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
      case 'danger': return 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700'
    }
  }

  const getChangeColor = () => {
    if (!change || change === 0 || isNaN(change)) return 'text-gray-600 dark:text-gray-400'
    if (change > 0) return 'text-green-600 dark:text-green-400'
    if (change < 0) return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getLineColor = () => {
    if (change > 0) return '#10b981'
    if (change < 0) return '#ef4444'
    return '#9ca3af'
  }

  const chartData = sparklineData.map((value, index) => ({ value, index }))

  if (loading) {
    return (
      <Card className="overflow-hidden animate-pulse">
        <CardContent className="p-6">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-gray-800">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            {icon && (
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                {icon}
              </div>
            )}
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              {title}
            </h3>
          </div>
          <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor()}`}>
            {status === 'good' && '✓ Óptimo'}
            {status === 'warning' && '⚠ Alerta'}
            {status === 'danger' && '✕ Crítico'}
            {status === 'neutral' && '● Normal'}
          </span>
        </div>
        
        {/* Value */}
        <div className="flex items-baseline mb-3">
          <span className="text-4xl font-black text-gray-900 dark:text-white">
            {value}
          </span>
          {unit && (
            <span className="ml-2 text-lg font-medium text-gray-500 dark:text-gray-400">
              {unit}
            </span>
          )}
        </div>
        
        {/* Trend and Sparkline */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className={getChangeColor()}>
              {getTrendIcon()}
            </div>
            <span className={`text-sm font-semibold ${getChangeColor()}`}>
              {!change || isNaN(change) ? 'Sin cambios' : `${change > 0 ? '+' : ''}${change.toFixed(1)}%`}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              vs anterior
            </span>
          </div>
          
          {/* Sparkline */}
          <div className="w-24 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={getLineColor()} 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
