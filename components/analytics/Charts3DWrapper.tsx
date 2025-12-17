/**
 * Charts 3D Wrapper - Fallback to 2D visualizations
 * 
 * Three.js has compatibility issues with React 18.3 + Next.js 15.
 * Using elegant 2D fallbacks until the ecosystem stabilizes.
 */

'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts'

// ============================================================================
// REVENUE BAR CHART (2D Fallback)
// ============================================================================

interface Revenue3DBarChartProps {
  data: Array<{ label: string; value: number; color?: string }>
  maxValue?: number
}

export function Revenue3DBarChart({ data }: Revenue3DBarChartProps) {
  const chartData = useMemo(() => 
    data.map(d => ({
      name: d.label,
      value: d.value,
      color: d.color || '#3b82f6'
    })), [data]
  )

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[400px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl flex items-center justify-center">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    )
  }

  return (
    <div className="w-full h-[400px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={60}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ingresos']}
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ============================================================================
// HEATMAP (2D Fallback using grid of colored cells)
// ============================================================================

interface Heatmap3DProps {
  data: number[][]
  dayLabels: string[]
  hourLabels: string[]
}

const getHeatmapColor = (value: number): string => {
  if (value > 75) return '#ef4444' // Red - High
  if (value > 50) return '#f59e0b' // Amber - Medium  
  if (value > 25) return '#3b82f6' // Blue - Low
  return '#e5e7eb' // Gray - Very low
}

export function Heatmap3D({ data, dayLabels, hourLabels }: Heatmap3DProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[400px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl flex items-center justify-center">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    )
  }

  // Show only every other hour label to avoid crowding
  const displayHours = hourLabels.filter((_, i) => i % 2 === 0)

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-4 overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Hour labels */}
        <div className="flex mb-2 ml-12">
          {displayHours.map((hour, i) => (
            <div 
              key={`hour-${i}`} 
              className="text-xs text-gray-500 dark:text-gray-400"
              style={{ width: `${100 / displayHours.length}%`, textAlign: 'center' }}
            >
              {hour}
            </div>
          ))}
        </div>

        {/* Grid */}
        {data.map((row, dayIndex) => (
          <div key={`day-${dayIndex}`} className="flex items-center mb-1">
            {/* Day label */}
            <div className="w-12 text-xs text-gray-600 dark:text-gray-400 font-medium">
              {dayLabels[dayIndex]}
            </div>
            
            {/* Cells */}
            <div className="flex flex-1 gap-0.5">
              {row.map((value, hourIndex) => (
                <div
                  key={`cell-${dayIndex}-${hourIndex}`}
                  className="flex-1 h-8 rounded-sm transition-all hover:scale-110 hover:z-10 cursor-pointer group relative"
                  style={{ backgroundColor: getHeatmapColor(value) }}
                  title={`${dayLabels[dayIndex]} ${hourLabels[hourIndex]}: ${value.toFixed(0)}%`}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                    {value.toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#e5e7eb' }}></div>
            <span className="text-xs text-gray-500">0-25%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
            <span className="text-xs text-gray-500">25-50%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
            <span className="text-xs text-gray-500">50-75%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
            <span className="text-xs text-gray-500">75-100%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// COURT SPHERE (2D Fallback using cards/bubbles)
// ============================================================================

interface Court3DSphereProps {
  courts: Array<{
    id: string
    name: string
    sport: string
    occupancy: number
    revenue: number
    color: string
  }>
}

export function Court3DSphere({ courts }: Court3DSphereProps) {
  if (!courts || courts.length === 0) {
    return (
      <div className="w-full h-[400px] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:to-purple-900 rounded-xl flex items-center justify-center">
        <p className="text-gray-500">No hay canchas disponibles</p>
      </div>
    )
  }

  return (
    <div className="w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:to-purple-900 rounded-xl p-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {courts.map((court) => {
          const size = Math.max(80, Math.min(140, 60 + court.occupancy))
          
          return (
            <div
              key={court.id}
              className="flex flex-col items-center justify-center p-4 rounded-xl transition-all hover:scale-105 cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${court.color}20, ${court.color}40)`,
                border: `2px solid ${court.color}60`
              }}
            >
              {/* Circle representing occupancy */}
              <div
                className="rounded-full flex items-center justify-center mb-3 transition-all"
                style={{
                  width: size,
                  height: size,
                  background: `radial-gradient(circle at 30% 30%, ${court.color}80, ${court.color})`,
                  boxShadow: `0 8px 32px ${court.color}40`
                }}
              >
                <span className="text-white font-bold text-lg">
                  {court.occupancy.toFixed(0)}%
                </span>
              </div>
              
              {/* Info */}
              <h4 className="font-semibold text-gray-900 dark:text-white text-center text-sm">
                {court.name}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {court.sport}
              </p>
              <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-1">
                ${court.revenue.toLocaleString()}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
