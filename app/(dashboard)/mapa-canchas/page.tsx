'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import apiClient, { Cancha } from '@/lib/api-client'
import { MapPin, Loader2, Search } from 'lucide-react'
import { geocodeAddress, needsGeocoding, getSuggestedAddressImprovements } from '@/lib/geocoding'
import { GeocodingHintsDialog } from '@/components/geocoding-hints-dialog'

// Dynamic import to avoid SSR issues with Leaflet
const LeafletCourtsMap = dynamic(
  () => import('@/components/maps/leaflet-courts-map').then(mod => ({
    default: mod.LeafletCourtsMap
  })),
  {
    loading: () => (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Cargando mapa...</p>
          </div>
        </CardContent>
      </Card>
    ),
    ssr: false,
  }
)

export default function CourtsMapPage() {
  const router = useRouter()
  const [courts, setCourts] = useState<Cancha[]>([])
  const [filteredCourts, setFilteredCourts] = useState<Cancha[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geocodingProgress, setGeocodingProgress] = useState({ current: 0, total: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDeporte, setSelectedDeporte] = useState<string>('all')
  const [deportes, setDeportes] = useState<{ id: string; nombre: string }[]>([])
  const [hintsDialogOpen, setHintsDialogOpen] = useState(false)
  const [failedCourt, setFailedCourt] = useState<Cancha | null>(null)
  const [failedCourtHints, setFailedCourtHints] = useState<string[]>([])

  useEffect(() => {
    loadCourts()
    loadDeportes()
  }, [])

  const geocodeCourts = useCallback(async () => {
    setIsGeocoding(true)
    try {
      // Find courts that need geocoding
      const courtsToGeocode = courts.filter(
        c => needsGeocoding(c.ubicacion, (c as any).latitude, (c as any).longitude)
      )

      if (courtsToGeocode.length === 0) {
        setIsGeocoding(false)
        return
      }

      // Set initial progress
      setGeocodingProgress({ current: 0, total: courtsToGeocode.length })

      // Geocode addresses with progress tracking
      const geocodeMap = new Map()
      for (let i = 0; i < courtsToGeocode.length; i++) {
        const court = courtsToGeocode[i]
        const result = await geocodeAddress(court.ubicacion)
        geocodeMap.set(court.id, result)

        // Update progress
        setGeocodingProgress({ current: i + 1, total: courtsToGeocode.length })

        // Add delay to respect API rate limits (1 request per second)
        if (i < courtsToGeocode.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      // Update courts with geocoded coordinates
      const updatedCourts = courts.map(court => {
        const geocodeResult = geocodeMap.get(court.id)
        if (geocodeResult) {
          return {
            ...court,
            latitude: geocodeResult.latitude,
            longitude: geocodeResult.longitude,
          } as Cancha
        }
        return court
      })

      setCourts(updatedCourts)
      setFilteredCourts(updatedCourts)

      // Count successful geocodes
      const successCount = Array.from(geocodeMap.values()).filter(r => r !== null).length
      const failedCount = courtsToGeocode.length - successCount

      if (successCount > 0) {
        toast.success(`${successCount} cancha(s) ubicada(s) en el mapa`)
      }

      // Show hints for the first failed court
      if (failedCount > 0) {
        const firstFailedCourt = courtsToGeocode.find(c => geocodeMap.get(c.id) === null)
        if (firstFailedCourt) {
          const hints = getSuggestedAddressImprovements(firstFailedCourt.ubicacion)
          setFailedCourt(firstFailedCourt)
          setFailedCourtHints(hints)
          setHintsDialogOpen(true)

          if (failedCount === 1) {
            toast.info('1 cancha no pudo ser ubicada. Intenta mejorar la dirección.')
          } else {
            toast.info(
              `${failedCount} cancha(s) no pudieron ser ubicadas. Intenta con direcciones más específicas.`
            )
          }
        }
      }
    } catch (error) {
      console.error('Error geocoding courts:', error)
      toast.error('Error al buscar ubicaciones de canchas')
    } finally {
      setIsGeocoding(false)
      setGeocodingProgress({ current: 0, total: 0 })
    }
  }, [courts])

  // Geocode courts that don't have coordinates
  useEffect(() => {
    if (courts.length > 0) {
      geocodeCourts()
    }
  }, [courts, geocodeCourts])

  const loadCourts = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.getCanchas()
      if (response.error) {
        toast.error(response.error)
        return
      }

      if (response.data) {
        // Filter only active courts
        const activeCourts = response.data.filter(c => c.activa)
        setCourts(activeCourts)
        setFilteredCourts(activeCourts)
      }
    } catch (error) {
      console.error('Error loading courts:', error)
      toast.error('No se pudieron cargar las canchas')
    } finally {
      setIsLoading(false)
    }
  }

  const loadDeportes = async () => {
    try {
      const response = await apiClient.getDeportes()
      if (response.error) {
        console.error('Error loading sports:', response.error)
        return
      }

      if (response.data) {
        setDeportes(response.data)
      }
    } catch (error) {
      console.error('Error loading sports:', error)
    }
  }

  useEffect(() => {
    // Filter courts based on search and sport selection
    let filtered = courts

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        c =>
          c.nombre.toLowerCase().includes(query) ||
          c.club.nombre.toLowerCase().includes(query) ||
          c.ubicacion.toLowerCase().includes(query) ||
          c.deporte.nombre.toLowerCase().includes(query)
      )
    }

    // Filter by sport
    if (selectedDeporte !== 'all') {
      filtered = filtered.filter(c => c.deporte.id === selectedDeporte)
    }

    setFilteredCourts(filtered)
  }, [searchQuery, selectedDeporte, courts])

  const handleCourtClick = (court: Cancha) => {
    router.push(`/cancha/${court.id}`)
  }

  const handleAddressUpdate = (court: Cancha, latitude: number, longitude: number) => {
    // Update the court with new coordinates
    const updatedCourts = courts.map(c => {
      if (c.id === court.id) {
        return {
          ...c,
          latitude,
          longitude,
        } as Cancha
      }
      return c
    })

    setCourts(updatedCourts)
    setFilteredCourts(updatedCourts)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Mapa de Canchas</h1>
        </div>
        <p className="text-muted-foreground">
          Explora todas las canchas disponibles en tu zona
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Buscar cancha</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nombre, club, ubicación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Deporte</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedDeporte === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedDeporte('all')}
                className="rounded-full"
              >
                Todos
              </Button>
              {deportes.map(deporte => (
                <Button
                  key={deporte.id}
                  variant={selectedDeporte === deporte.id ? 'default' : 'outline'}
                  onClick={() => setSelectedDeporte(deporte.id)}
                  className="rounded-full"
                >
                  {deporte.nombre}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Mostrando {filteredCourts.length} de {courts.length} canchas
            </div>
            {isGeocoding && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>
                  Localizando canchas... {geocodingProgress.current} de {geocodingProgress.total}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Map and Courts */}
      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Cargando canchas...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredCourts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No se encontraron canchas con esos filtros</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <LeafletCourtsMap
          courts={filteredCourts}
          onCourt={handleCourtClick}
          height="600px"
        />
      )}

      {/* Geocoding Hints Dialog */}
      <GeocodingHintsDialog
        court={failedCourt}
        open={hintsDialogOpen}
        onOpenChange={setHintsDialogOpen}
        hints={failedCourtHints}
        onAddressUpdate={handleAddressUpdate}
      />
    </div>
  )
}
