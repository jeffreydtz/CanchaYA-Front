/**
 * Court Filters Component for CanchaYA
 * Modern search interface with advanced filtering and real-time search
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Search, Filter, MapPin, Clock, Sliders, X, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import apiClient, { Club, Deporte } from '@/lib/api-client'
import { formatDateForInput } from '@/lib/date-utils'
import { useSearch } from '@/lib/search-context'
import { toast } from 'sonner'

export default function CourtFilters() {
  const { filters, setFilters, applyFilters, clearFilters: clearSearchFilters, isLoading } = useSearch()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [clubs, setClubes] = useState<Club[]>([])
  const [deportes, setDeportes] = useState<Deporte[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch clubs and sports data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [clubsResponse, deportesResponse] = await Promise.all([
          apiClient.getClubes(),
          apiClient.getDeportes()
        ])
        
        if (clubsResponse.data) {
          setClubes(clubsResponse.data)
        }
        if (deportesResponse.data) {
          setDeportes(deportesResponse.data)
        }
      } catch (error) {
        console.error('Error fetching filter data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleFilterChange = (key: string, value: string | number | number[] | Date | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    try {
      applyFilters()
      // Check if any filters are applied for different toast messages
      const hasActiveFilters = 
        filters.search.trim() !== '' ||
        filters.deporte !== 'all' ||
        filters.club !== 'all' ||
        filters.fecha !== undefined ||
        filters.hora !== '' ||
        (filters.precio[0] !== 0 || filters.precio[1] !== 10000) ||
        filters.rating > 0

      if (hasActiveFilters) {
        toast.success('Filtros aplicados correctamente')
      } else {
        toast.info('Mostrando todas las canchas disponibles')
      }
    } catch (error) {
      toast.error('Error al aplicar filtros')
      console.error('Error applying filters:', error)
    }
  }

  const clearFilters = () => {
    clearSearchFilters()
    toast.info('Filtros limpiados')
  }

  const activeFiltersCount = Object.values(filters).filter(value => {
    if (value === '' || value === 'all' || value === undefined || value === null) return false
    if (Array.isArray(value)) return value[0] !== 0 || value[1] !== 10000
    return value !== 0
  }).length

  const hasActiveFilters = 
    filters.search.trim() !== '' ||
    filters.deporte !== 'all' ||
    filters.club !== 'all' ||
    filters.fecha !== undefined ||
    filters.hora !== '' ||
    (filters.precio[0] !== 0 || filters.precio[1] !== 10000) ||
    filters.rating > 0

  return (
    <div className="w-full space-y-6 mb-8">
      {/* Main Search Bar */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Buscar canchas por nombre, ubicación o deporte..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-12 pr-4 h-12 text-lg border-2 border-gray-200 focus:border-primary rounded-xl"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-col sm:flex-row gap-3 lg:w-auto">
              <Select value={filters.deporte} onValueChange={(value) => handleFilterChange('deporte', value)}>
                <SelectTrigger className="h-12 min-w-[160px] rounded-xl border-2 border-muted">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Deporte" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los deportes</SelectItem>
                  {deportes.map((deporte) => (
                    <SelectItem key={deporte.id} value={deporte.id}>
                      {deporte.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <DatePicker
                date={filters.fecha}
                onDateChange={(date) => handleFilterChange('fecha', date)}
                placeholder="Seleccionar fecha"
                className="h-12 min-w-[200px] rounded-xl border-2 border-muted"
                disablePastDates
              />

              <Button 
                onClick={handleSearch} 
                size="lg" 
                className="h-12 px-8 rounded-xl font-semibold"
                disabled={isLoading}
              >
                <Search className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Buscando...' : hasActiveFilters ? 'Buscar' : 'Ver Todas'}
              </Button>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              <Sliders className="h-4 w-4 mr-2" />
              Filtros avanzados
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-sm text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <Card className="border-0 shadow-lg animate-fade-in-up">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Club Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Club
                </Label>
                <Select value={filters.club} onValueChange={(value) => handleFilterChange('club', value)}>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Seleccionar club" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los clubs</SelectItem>
                    {clubs.map((club) => (
                      <SelectItem key={club.id} value={club.id}>
                        {club.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Horario
                </Label>
                <Select value={filters.hora} onValueChange={(value) => handleFilterChange('hora', value)}>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Cualquier hora" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">🌅 Mañana (6:00 - 12:00)</SelectItem>
                    <SelectItem value="afternoon">☀️ Tarde (12:00 - 18:00)</SelectItem>
                    <SelectItem value="evening">🌆 Noche (18:00 - 24:00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">
                  Precio por hora: ${filters.precio[0].toLocaleString()} - ${filters.precio[1].toLocaleString()}
                </Label>
                <div className="px-3 py-2">
                  <Slider
                    value={filters.precio}
                    onValueChange={(value) => handleFilterChange('precio', value)}
                    max={10000}
                    min={0}
                    step={500}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>$0</span>
                  <span>$10,000+</span>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Calificación mínima
                </Label>
                <Select 
                  value={filters.rating.toString()} 
                  onValueChange={(value) => handleFilterChange('rating', parseInt(value))}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Cualquier calificación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Cualquier calificación</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ 3+ estrellas</SelectItem>
                    <SelectItem value="4">⭐⭐⭐⭐ 4+ estrellas</SelectItem>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ 5 estrellas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Apply Filters Button */}
            <div className="flex justify-center mt-6">
              <Button 
                onClick={handleSearch} 
                size="lg" 
                className="px-12 rounded-xl font-semibold"
                disabled={isLoading}
              >
                <Filter className={`h-5 w-5 mr-2 ${isLoading ? 'animate-pulse' : ''}`} />
                {isLoading ? 'Aplicando...' : hasActiveFilters ? 'Aplicar Filtros' : 'Mostrar Todas'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 animate-fade-in">
          {filters.deporte && filters.deporte !== 'all' && (
            <Badge variant="secondary" className="px-3 py-1">
              {deportes.find(d => d.id === filters.deporte)?.nombre || filters.deporte}
              <X 
                className="h-3 w-3 ml-2 cursor-pointer" 
                onClick={() => handleFilterChange('deporte', 'all')}
              />
            </Badge>
          )}
          {filters.club && filters.club !== 'all' && (
            <Badge variant="secondary" className="px-3 py-1">
              {clubs.find(c => c.id === filters.club)?.nombre || filters.club}
              <X 
                className="h-3 w-3 ml-2 cursor-pointer" 
                onClick={() => handleFilterChange('club', 'all')}
              />
            </Badge>
          )}
          {filters.fecha && (
            <Badge variant="secondary" className="px-3 py-1">
              📅 {formatDateForInput(filters.fecha)}
              <X 
                className="h-3 w-3 ml-2 cursor-pointer" 
                onClick={() => handleFilterChange('fecha', undefined)}
              />
            </Badge>
          )}
          {filters.hora && (
            <Badge variant="secondary" className="px-3 py-1">
              ⏰ {filters.hora === 'morning' ? 'Mañana' : filters.hora === 'afternoon' ? 'Tarde' : filters.hora === 'evening' ? 'Noche' : filters.hora}
              <X 
                className="h-3 w-3 ml-2 cursor-pointer" 
                onClick={() => handleFilterChange('hora', '')}
              />
            </Badge>
          )}
          {(filters.precio[0] !== 0 || filters.precio[1] !== 10000) && (
            <Badge variant="secondary" className="px-3 py-1">
              💰 ${filters.precio[0].toLocaleString()} - ${filters.precio[1].toLocaleString()}
              <X 
                className="h-3 w-3 ml-2 cursor-pointer" 
                onClick={() => handleFilterChange('precio', [0, 10000])}
              />
            </Badge>
          )}
          {filters.rating > 0 && (
            <Badge variant="secondary" className="px-3 py-1">
              ⭐ {filters.rating}+ estrellas
              <X 
                className="h-3 w-3 ml-2 cursor-pointer" 
                onClick={() => handleFilterChange('rating', 0)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}