/**
 * Court Filters Component for CanchaYA
 * Provides search and filtering functionality for courts
 */

'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Search, Filter, Calendar as CalendarIcon, MapPin, Zap } from 'lucide-react'

interface CourtFiltersProps {
  initialFilters?: {
    deporte?: string
    club?: string
    fecha?: string
    busqueda?: string
  }
}

const deportes = [
  { value: 'futbol', label: 'Fútbol' },
  { value: 'padel', label: 'Pádel' },
  { value: 'tenis', label: 'Tenis' },
  { value: 'basquet', label: 'Básquet' },
  { value: 'voley', label: 'Vóley' },
]

const clubes = [
  { value: 'atletico-rosario', label: 'Atlético Rosario' },
  { value: 'club-estudiantes', label: 'Club Estudiantes' },
  { value: 'newell-s', label: "Newell's Old Boys" },
  { value: 'rosario-central', label: 'Rosario Central' },
  { value: 'club-nautico', label: 'Club Náutico' },
]

export function CourtFilters({ initialFilters = {} }: CourtFiltersProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [filters, setFilters] = useState({
    busqueda: initialFilters.busqueda || '',
    deporte: initialFilters.deporte || 'all',
    club: initialFilters.club || 'all',
    fecha: initialFilters.fecha || '',
  })
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialFilters.fecha ? new Date(initialFilters.fecha) : undefined
  )
  
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setFilters(prev => ({ 
      ...prev, 
      fecha: date ? format(date, 'yyyy-MM-dd') : '' 
    }))
    setIsCalendarOpen(false)
  }

  const applyFilters = () => {
    startTransition(() => {
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value.trim() && value !== 'all') {
          params.set(key, value.trim())
        }
      })
      
      const queryString = params.toString()
      router.push(queryString ? `/?${queryString}` : '/')
    })
  }

  const clearFilters = () => {
    setFilters({
      busqueda: '',
      deporte: '',
      club: '',
      fecha: '',
    })
    setSelectedDate(undefined)
    startTransition(() => {
      router.push('/')
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value.trim() !== '')

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border-0 bg-white/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5 text-primary-600" />
          Filtrar canchas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Bar */}
        <div className="space-y-2">
          <Label htmlFor="search">Búsqueda general</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="search"
              placeholder="Buscar por nombre, club o ubicación..."
              value={filters.busqueda}
              onChange={(e) => handleFilterChange('busqueda', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sport Filter */}
          <div className="space-y-2">
            <Label>Deporte</Label>
            <Select
              value={filters.deporte}
              onValueChange={(value) => handleFilterChange('deporte', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los deportes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los deportes</SelectItem>
                {deportes.map((deporte) => (
                  <SelectItem key={deporte.value} value={deporte.value}>
                    {deporte.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Club Filter */}
          <div className="space-y-2">
            <Label>Club</Label>
            <Select
              value={filters.club}
              onValueChange={(value) => handleFilterChange('club', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los clubes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los clubes</SelectItem>
                {clubes.map((club) => (
                  <SelectItem key={club.value} value={club.value}>
                    {club.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Filter */}
          <div className="space-y-2">
            <Label>Fecha</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP", { locale: es })
                  ) : (
                    "Seleccionar fecha"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="space-y-2">
          <Label>Filtros rápidos</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDateSelect(new Date())}
              className="text-xs"
            >
              <Zap className="mr-1 h-3 w-3" />
              Hoy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                handleDateSelect(tomorrow)
              }}
              className="text-xs"
            >
              <CalendarIcon className="mr-1 h-3 w-3" />
              Mañana
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange('deporte', 'futbol')}
              className="text-xs"
            >
              ⚽ Fútbol
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange('deporte', 'padel')}
              className="text-xs"
            >
              🎾 Pádel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilters(prev => ({ ...prev, busqueda: 'centro' }))
              }}
              className="text-xs"
            >
              <MapPin className="mr-1 h-3 w-3" />
              Centro
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button 
            onClick={applyFilters} 
            disabled={isPending}
            className="flex-1"
          >
            {isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Aplicando...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Buscar canchas
              </>
            )}
          </Button>
          
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              onClick={clearFilters}
              disabled={isPending}
              className="sm:w-auto"
            >
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm text-muted-foreground">Filtros activos:</span>
            {filters.busqueda && (
              <span className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                Búsqueda: "{filters.busqueda}"
              </span>
            )}
            {filters.deporte && (
              <span className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                {deportes.find(d => d.value === filters.deporte)?.label}
              </span>
            )}
            {filters.club && (
              <span className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                {clubes.find(c => c.value === filters.club)?.label}
              </span>
            )}
            {selectedDate && (
              <span className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                {format(selectedDate, "dd/MM/yyyy")}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
