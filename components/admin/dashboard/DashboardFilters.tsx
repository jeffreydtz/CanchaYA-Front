/**
 * DashboardFilters Component
 * Panel de filtros lateral para el dashboard con date picker y selectores
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Filter, Calendar as CalendarIcon, X, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

interface DashboardFiltersProps {
  onApplyFilters: (filters: any) => void
  onClearFilters: () => void
  isOpen: boolean
  onToggle: () => void
}

// Datos ficticios para los selectores
const CANCHAS = [
  { id: 'all', name: 'Todas las canchas' },
  { id: '1', name: 'Cancha Principal' },
  { id: '2', name: 'Cancha Tenis 1' },
  { id: '3', name: 'Cancha Fútbol 2' },
  { id: '4', name: 'Cancha Paddle 1' },
  { id: '5', name: 'Cancha Básquet' },
]

const DEPORTES = [
  { id: 'all', name: 'Todos los deportes' },
  { id: 'futbol', name: 'Fútbol' },
  { id: 'tenis', name: 'Tenis' },
  { id: 'paddle', name: 'Paddle' },
  { id: 'basquet', name: 'Básquet' },
  { id: 'voley', name: 'Vóley' },
]

const PERIODOS = [
  { id: 'today', name: 'Hoy' },
  { id: 'week', name: 'Esta semana' },
  { id: 'month', name: 'Este mes' },
  { id: 'quarter', name: 'Este trimestre' },
  { id: 'year', name: 'Este año' },
  { id: 'custom', name: 'Personalizado' },
]

export function DashboardFilters({ 
  onApplyFilters, 
  onClearFilters,
  isOpen,
  onToggle
}: DashboardFiltersProps) {
  const [selectedCancha, setSelectedCancha] = useState('all')
  const [selectedDeporte, setSelectedDeporte] = useState('all')
  const [selectedPeriodo, setSelectedPeriodo] = useState('month')
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  })

  const handleApply = () => {
    onApplyFilters({
      cancha: selectedCancha,
      deporte: selectedDeporte,
      periodo: selectedPeriodo,
      dateRange: dateRange,
    })
  }

  const handleClear = () => {
    setSelectedCancha('all')
    setSelectedDeporte('all')
    setSelectedPeriodo('month')
    setDateRange({ from: undefined, to: undefined })
    onClearFilters()
  }

  const hasActiveFilters = 
    selectedCancha !== 'all' || 
    selectedDeporte !== 'all' || 
    selectedPeriodo !== 'month' ||
    dateRange.from !== undefined

  return (
    <div className={cn(
      "transition-all duration-300",
      isOpen ? "w-80" : "w-0 overflow-hidden"
    )}>
      <Card className="h-full border-gray-200 dark:border-gray-800 sticky top-24">
        <CardHeader className="border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Filtros
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {hasActiveFilters && (
            <p className="text-xs text-primary mt-1">
              {[
                selectedCancha !== 'all' && '1 cancha',
                selectedDeporte !== 'all' && '1 deporte',
                selectedPeriodo !== 'month' && '1 período',
                dateRange.from && '1 rango'
              ].filter(Boolean).join(', ')} aplicado(s)
            </p>
          )}
        </CardHeader>
        <CardContent className="p-4 space-y-6">
          {/* Período */}
          <div className="space-y-2">
            <Label htmlFor="periodo" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Período
            </Label>
            <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
              <SelectTrigger id="periodo" className="bg-white dark:bg-gray-800">
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                {PERIODOS.map((periodo) => (
                  <SelectItem key={periodo.id} value={periodo.id}>
                    {periodo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rango de fechas personalizado */}
          {selectedPeriodo === 'custom' && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Rango de Fechas
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd MMM", { locale: es })} -{" "}
                          {format(dateRange.to, "dd MMM", { locale: es })}
                        </>
                      ) : (
                        format(dateRange.from, "dd MMM yyyy", { locale: es })
                      )
                    ) : (
                      <span>Seleccionar rango</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range: any) => setDateRange(range || { from: undefined, to: undefined })}
                    numberOfMonths={2}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Cancha */}
          <div className="space-y-2">
            <Label htmlFor="cancha" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Cancha
            </Label>
            <Select value={selectedCancha} onValueChange={setSelectedCancha}>
              <SelectTrigger id="cancha" className="bg-white dark:bg-gray-800">
                <SelectValue placeholder="Seleccionar cancha" />
              </SelectTrigger>
              <SelectContent>
                {CANCHAS.map((cancha) => (
                  <SelectItem key={cancha.id} value={cancha.id}>
                    {cancha.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Deporte */}
          <div className="space-y-2">
            <Label htmlFor="deporte" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Deporte
            </Label>
            <Select value={selectedDeporte} onValueChange={setSelectedDeporte}>
              <SelectTrigger id="deporte" className="bg-white dark:bg-gray-800">
                <SelectValue placeholder="Seleccionar deporte" />
              </SelectTrigger>
              <SelectContent>
                {DEPORTES.map((deporte) => (
                  <SelectItem key={deporte.id} value={deporte.id}>
                    {deporte.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Acciones */}
          <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Button 
              onClick={handleApply} 
              className="w-full bg-primary hover:bg-primary/90"
            >
              <Filter className="mr-2 h-4 w-4" />
              Aplicar Filtros
            </Button>
            {hasActiveFilters && (
              <Button 
                onClick={handleClear} 
                variant="outline"
                className="w-full"
              >
                <X className="mr-2 h-4 w-4" />
                Limpiar Filtros
              </Button>
            )}
          </div>

          {/* Info */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-400">
              💡 Los filtros afectan todas las métricas y gráficos del dashboard
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
