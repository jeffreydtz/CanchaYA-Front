/**
 * Court Filters Component for CanchaYA
 * Provides search and filtering functionality for courts
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter } from 'lucide-react'

export default function CourtFilters() {
  const [filters, setFilters] = useState({
    deporte: '',
    club: '',
    fecha: '',
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    // Implement search functionality
    console.log('Searching with filters:', filters)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros de Búsqueda
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="deporte">Deporte</Label>
            <Select value={filters.deporte} onValueChange={(value) => handleFilterChange('deporte', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar deporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los deportes</SelectItem>
                <SelectItem value="futbol">Fútbol</SelectItem>
                <SelectItem value="tenis">Tenis</SelectItem>
                <SelectItem value="paddle">Paddle</SelectItem>
                <SelectItem value="basquet">Básquet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="club">Club</Label>
            <Select value={filters.club} onValueChange={(value) => handleFilterChange('club', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar club" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los clubs</SelectItem>
                <SelectItem value="club-central">Club Deportivo Central</SelectItem>
                <SelectItem value="tenis-premium">Club de Tenis Premium</SelectItem>
                <SelectItem value="paddle-elite">Club Paddle Elite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha</Label>
            <Input
              id="fecha"
              type="date"
              value={filters.fecha}
              onChange={(e) => handleFilterChange('fecha', e.target.value)}
              placeholder="Seleccionar fecha"
            />
          </div>

          <div className="space-y-2">
            <Label>&nbsp;</Label>
            <Button onClick={handleSearch} className="w-full">
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
