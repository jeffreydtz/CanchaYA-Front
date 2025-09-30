/**
 * HeatMap Component
 * Mapa de calor mostrando ocupación por día y hora
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Calendar } from 'lucide-react'

interface HeatMapCell {
  day: string
  hour: number
  occupancy: number
}

interface HeatMapProps {
  data: HeatMapCell[]
  loading?: boolean
}

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function HeatMap({ data, loading = false }: HeatMapProps) {
  const [selectedCell, setSelectedCell] = useState<HeatMapCell | null>(null)

  const getIntensityColor = (occupancy: number) => {
    if (occupancy >= 90) return 'bg-red-600'
    if (occupancy >= 75) return 'bg-orange-500'
    if (occupancy >= 50) return 'bg-yellow-500'
    if (occupancy >= 25) return 'bg-green-400'
    if (occupancy > 0) return 'bg-blue-300'
    return 'bg-gray-200 dark:bg-gray-700'
  }

  const getOpacity = (occupancy: number) => {
    if (occupancy >= 75) return 'opacity-100'
    if (occupancy >= 50) return 'opacity-75'
    if (occupancy >= 25) return 'opacity-50'
    return 'opacity-30'
  }

  const getCellData = (day: string, hour: number) => {
    return data.find(cell => cell.day === day && cell.hour === hour) || { day, hour, occupancy: 0 }
  }

  if (loading) {
    return (
      <Card className="col-span-2 animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
              <Calendar className="h-5 w-5 text-primary" />
              Mapa de Calor - Ocupación por Horario
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
              Intensidad de ocupación por día y hora (última semana)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ocupación:</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">0%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-blue-300 rounded"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">1-24%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">25-49%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">50-74%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">75-89%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">90-100%</span>
            </div>
          </div>
        </div>

        {/* HeatMap Grid */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Hour labels */}
            <div className="flex">
              <div className="w-16"></div>
              {HOURS.map(hour => (
                <div 
                  key={hour} 
                  className="flex-shrink-0 w-8 h-6 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400"
                >
                  {hour}h
                </div>
              ))}
            </div>

            {/* Grid rows */}
            {DAYS.map(day => (
              <div key={day} className="flex">
                <div className="w-16 h-8 flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  {day}
                </div>
                {HOURS.map(hour => {
                  const cellData = getCellData(day, hour)
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className={`flex-shrink-0 w-8 h-8 m-0.5 rounded cursor-pointer transition-all hover:scale-110 hover:shadow-lg ${getIntensityColor(cellData.occupancy)} ${getOpacity(cellData.occupancy)}`}
                      onClick={() => setSelectedCell(cellData)}
                      title={`${day} ${hour}:00 - ${cellData.occupancy}% ocupación`}
                    ></div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Cell Info */}
        {selectedCell && selectedCell.occupancy > 0 && (
          <div className="mt-4 p-4 bg-primary/10 dark:bg-primary/20 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {selectedCell.day} - {selectedCell.hour}:00
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Ocupación: <span className="font-bold text-primary">{selectedCell.occupancy}%</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
