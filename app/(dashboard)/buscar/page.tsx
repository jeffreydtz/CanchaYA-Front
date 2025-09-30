/**
 * Search Page for CanchaYA
 * Advanced search and filtering for courts and clubs
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  MapPin, 
  Clock, 
  Star, 
  Filter,
  Grid3X3,
  List,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Box
} from 'lucide-react'
import apiClient, { Cancha, Club, Deporte } from '@/lib/api-client'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Navbar from '@/components/navbar/navbar'
import dynamic from 'next/dynamic'

// Importación dinámica del mapa 3D
const LocationMap3D = dynamic(() => import('@/components/3d/LocationMap3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-900 rounded-lg flex items-center justify-center">
      <div className="text-white">Cargando mapa 3D...</div>
    </div>
  ),
})

interface SearchFilters {
  search: string
  deporte: string
  club: string
  ubicacion: string
  precioMin: string
  precioMax: string
  rating: string
}

function CourtCard({ cancha }: { cancha: Cancha }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative h-48 overflow-hidden">
        <Image
          src="/cancha.jpeg"
          alt={cancha.nombre}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4">
          <Badge className="bg-primary text-white">
            {cancha.deporte?.nombre}
          </Badge>
        </div>
        {cancha.precioPorHora && (
          <div className="absolute bottom-4 left-4">
            <Badge className="bg-black/80 text-white">
              <DollarSign className="h-3 w-3 mr-1" />
              ${cancha.precioPorHora}/hr
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
              {cancha.nombre}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {cancha.club?.nombre}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>24/7</span>
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1 text-blue-500" />
                <span>4.5</span>
              </div>
            </div>
            
            <Link href={`/cancha/${cancha.id}`}>
              <Button size="sm" className="font-semibold">
                Ver Detalles
              </Button>
            </Link>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-300">
            <p className="flex items-center mb-1">
              <MapPin className="h-3 w-3 mr-1" />
              {cancha.ubicacion}
            </p>
            {cancha.club?.telefono && (
              <p className="flex items-center mb-1">
                <Phone className="h-3 w-3 mr-1" />
                {cancha.club.telefono}
              </p>
            )}
            {cancha.club?.email && (
              <p className="flex items-center">
                <Mail className="h-3 w-3 mr-1" />
                {cancha.club.email}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function BuscarPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    deporte: 'all',
    club: 'all',
    ubicacion: '',
    precioMin: '',
    precioMax: '',
    rating: '0'
  })
  
  const [canchas, setCanchas] = useState<Cancha[]>([])
  const [clubs, setClubes] = useState<Club[]>([])
  const [deportes, setDeportes] = useState<Deporte[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | '3d'>('grid')
  
  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [canchasResponse, clubsResponse, deportesResponse] = await Promise.all([
          apiClient.getCanchas(),
          apiClient.getClubes(),
          apiClient.getDeportes()
        ])
        
        if (canchasResponse.data) {
          setCanchas(canchasResponse.data)
        }
        if (clubsResponse.data) {
          setClubes(clubsResponse.data)
        }
        if (deportesResponse.data) {
          setDeportes(deportesResponse.data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Error al cargar los datos')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }
  
  const handleSearch = async () => {
    setSearching(true)
    try {
      // Simular búsqueda filtrada
      const response = await apiClient.getCanchas()
      if (response.data) {
        let filtered = response.data
        
        // Filtrar por búsqueda de texto
        if (filters.search) {
          filtered = filtered.filter(cancha => 
            cancha.nombre?.toLowerCase().includes(filters.search.toLowerCase()) ||
            cancha.club?.nombre?.toLowerCase().includes(filters.search.toLowerCase()) ||
            cancha.ubicacion?.toLowerCase().includes(filters.search.toLowerCase())
          )
        }
        
        // Filtrar por deporte
        if (filters.deporte !== 'all') {
          filtered = filtered.filter(cancha => cancha.deporteId === filters.deporte)
        }
        
        // Filtrar por club
        if (filters.club !== 'all') {
          filtered = filtered.filter(cancha => cancha.clubId === filters.club)
        }
        
        // Filtrar por ubicación
        if (filters.ubicacion) {
          filtered = filtered.filter(cancha => 
            cancha.ubicacion?.toLowerCase().includes(filters.ubicacion.toLowerCase())
          )
        }
        
        // Filtrar por precio mínimo
        if (filters.precioMin && parseFloat(filters.precioMin) > 0) {
          filtered = filtered.filter(cancha => 
            cancha.precioPorHora >= parseFloat(filters.precioMin)
          )
        }
        
        // Filtrar por precio máximo
        if (filters.precioMax && parseFloat(filters.precioMax) > 0) {
          filtered = filtered.filter(cancha => 
            cancha.precioPorHora <= parseFloat(filters.precioMax)
          )
        }
        
        setCanchas(filtered)
      }
    } catch (error) {
      console.error('Error searching:', error)
      toast.error('Error al buscar canchas')
    } finally {
      setSearching(false)
    }
  }
  
  const clearFilters = () => {
    setFilters({
      search: '',
      deporte: 'all',
      club: 'all',
      ubicacion: '',
      precioMin: '',
      precioMax: '',
      rating: '0'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
      <Navbar />
      
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed bottom-6 right-6 z-50">
        <ThemeToggle />
      </div>
      
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            Buscar Canchas
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Encuentra la cancha perfecta para tu próximo partido
          </p>
        </div>
        
        {/* Search Filters */}
        <Card className="mb-8 border-0 shadow-xl bg-white dark:bg-gray-900/95 backdrop-blur-sm">
          <CardContent className="p-6">
            {/* Main Search */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
                <Input
                  placeholder="Buscar por nombre, club o ubicación..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-12 pr-4 h-12 text-base font-medium border-2 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-xl transition-all duration-200"
                />
              </div>
              
              <Select value={filters.deporte} onValueChange={(value) => handleFilterChange('deporte', value)}>
                <SelectTrigger className="h-12 min-w-[160px] rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-medium">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
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
              
              <Button 
                onClick={handleSearch} 
                size="lg" 
                className="h-12 px-8 rounded-xl font-semibold"
                disabled={searching}
              >
                <Search className="h-5 w-5 mr-2" />
                {searching ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
            
            {/* Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Club</Label>
                <Select value={filters.club} onValueChange={(value) => handleFilterChange('club', value)}>
                  <SelectTrigger className="rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 font-medium">
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
              
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Ubicación</Label>
                <Input
                  placeholder="Zona, barrio..."
                  value={filters.ubicacion}
                  onChange={(e) => handleFilterChange('ubicacion', e.target.value)}
                  className="rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 font-medium"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Precio Mín.</Label>
                <Input
                  type="number"
                  placeholder="$0"
                  value={filters.precioMin}
                  onChange={(e) => handleFilterChange('precioMin', e.target.value)}
                  className="rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 font-medium"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Precio Máx.</Label>
                <Input
                  type="number"
                  placeholder="$10000"
                  value={filters.precioMax}
                  onChange={(e) => handleFilterChange('precioMax', e.target.value)}
                  className="rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 font-medium"
                />
              </div>
            </div>
            
            {/* Filter Actions */}
            <div className="flex justify-between items-center mt-4">
              <Button variant="ghost" onClick={clearFilters} className="text-gray-600 dark:text-gray-300 font-medium hover:text-destructive dark:hover:text-destructive">
                <Filter className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  title="Vista de Grilla"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  title="Vista de Lista"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === '3d' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('3d')}
                  title="Mapa 3D"
                >
                  <Box className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Results */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Resultados ({canchas.length})
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {canchas.length} {canchas.length === 1 ? 'cancha encontrada' : 'canchas encontradas'}
            </p>
          </div>
        </div>
        
        {/* Courts Grid/List/3D */}
        {loading ? (
          <LoadingSkeleton />
        ) : canchas.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No se encontraron canchas</h3>
              <p className="text-gray-600 mb-4">
                Prueba ajustando tus filtros de búsqueda
              </p>
              <Button onClick={clearFilters}>
                Limpiar Filtros
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === '3d' ? (
          <LocationMap3D
            locations={canchas.map((cancha, index) => ({
              id: cancha.id,
              name: cancha.nombre || `Cancha ${index + 1}`,
              position: [
                (index % 5) * 4 - 8,
                0,
                Math.floor(index / 5) * 4 - 8
              ] as [number, number, number],
              color: cancha.deporte?.nombre?.toLowerCase().includes('fútbol') ? '#10b981' :
                    cancha.deporte?.nombre?.toLowerCase().includes('tenis') ? '#f59e0b' :
                    cancha.deporte?.nombre?.toLowerCase().includes('pádel') ? '#3b82f6' :
                    cancha.deporte?.nombre?.toLowerCase().includes('básquet') ? '#ef4444' : '#8b5cf6',
              available: Math.floor(Math.random() * 10) + 1,
              total: 15
            }))}
            onLocationClick={(location) => {
              const cancha = canchas.find(c => c.id === location.id)
              if (cancha) {
                window.location.href = `/cancha/${cancha.id}`
              }
            }}
          />
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {canchas.map((cancha) => (
              <CourtCard key={cancha.id} cancha={cancha} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}