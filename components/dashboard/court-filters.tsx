/**
 * Court Filters Component for CanchaYA
 * Modern search interface with advanced filtering and real-time search
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Filter, MapPin, Calendar, Clock, Sliders, X, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'

export default function CourtFilters() {
  const [filters, setFilters] = useState({
    search: '',
    deporte: '',
    club: '',
    fecha: '',
    hora: '',
    precio: [0, 10000],
    rating: 0,
  })
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    console.log('Searching with filters:', filters)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      deporte: '',
      club: '',
      fecha: '',
      hora: '',
      precio: [0, 10000],
      rating: 0,
    })
  }

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== '' && (Array.isArray(value) ? value[0] !== 0 || value[1] !== 10000 : value !== 0)
  ).length

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
                className="pl-12 pr-4 h-12 text-lg border-2 border-muted focus:border-primary rounded-xl bg-background/50 backdrop-blur-sm"
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
                  <SelectItem value="futbol">⚽ Fútbol</SelectItem>
                  <SelectItem value="tenis">🎾 Tenis</SelectItem>
                  <SelectItem value="paddle">🏓 Paddle</SelectItem>
                  <SelectItem value="basquet">🏀 Básquet</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={filters.fecha}
                onChange={(e) => handleFilterChange('fecha', e.target.value)}
                className="h-12 min-w-[160px] rounded-xl border-2 border-muted"
              />

              <Button 
                onClick={handleSearch} 
                size="lg" 
                className="h-12 px-8 rounded-xl font-semibold"
              >
                <Search className="h-5 w-5 mr-2" />
                Buscar
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
                    <SelectItem value="club-central">🏟️ Club Deportivo Central</SelectItem>
                    <SelectItem value="tenis-premium">🎾 Club de Tenis Premium</SelectItem>
                    <SelectItem value="paddle-elite">🏓 Club Paddle Elite</SelectItem>
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
              >
                <Filter className="h-5 w-5 mr-2" />
                Aplicar Filtros
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
              {filters.deporte}
              <X 
                className="h-3 w-3 ml-2 cursor-pointer" 
                onClick={() => handleFilterChange('deporte', '')}
              />
            </Badge>
          )}
          {filters.club && filters.club !== 'all' && (
            <Badge variant="secondary" className="px-3 py-1">
              {filters.club}
              <X 
                className="h-3 w-3 ml-2 cursor-pointer" 
                onClick={() => handleFilterChange('club', '')}
              />
            </Badge>
          )}
          {filters.fecha && (
            <Badge variant="secondary" className="px-3 py-1">
              {filters.fecha}
              <X 
                className="h-3 w-3 ml-2 cursor-pointer" 
                onClick={() => handleFilterChange('fecha', '')}
              />
            </Badge>
          )}
          {filters.hora && (
            <Badge variant="secondary" className="px-3 py-1">
              {filters.hora}
              <X 
                className="h-3 w-3 ml-2 cursor-pointer" 
                onClick={() => handleFilterChange('hora', '')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}