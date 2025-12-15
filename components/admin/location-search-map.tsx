'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { MapPin, Search, Loader2, X } from 'lucide-react'
import dynamic from 'next/dynamic'

interface LocationData {
  address: string
  latitude: number
  longitude: number
}

interface LocationSearchMapProps {
  onLocationSelect: (location: LocationData) => void
  initialAddress?: string
  initialLat?: number
  initialLng?: number
}

// Dynamically import Leaflet map to avoid SSR issues
const DynamicMap = dynamic(() => import('./location-map-2d'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Cargando mapa...</p>
      </div>
    </div>
  )
})

export function LocationSearchMap({
  onLocationSelect,
  initialAddress = '',
  initialLat,
  initialLng
}: LocationSearchMapProps) {
  const [address, setAddress] = useState(initialAddress)
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    initialLat && initialLng ? { address: initialAddress, latitude: initialLat, longitude: initialLng } : null
  )
  const [isSearching, setIsSearching] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Geocodificar dirección usando Nominatim (OpenStreetMap)
  const geocodeAddress = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      )
      const data = await response.json()
      setSuggestions(data)
      setShowSuggestions(true)
    } catch (error) {
      toast.error('Error al buscar la ubicación')
      setSuggestions([])
    } finally {
      setIsSearching(false)
    }
  }

  // Manejar cambio en input con debounce
  const handleAddressChange = (value: string) => {
    setAddress(value)

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      geocodeAddress(value)
    }, 500)
  }

  // Seleccionar sugerencia
  const selectSuggestion = (suggestion: any) => {
    const location: LocationData = {
      address: suggestion.display_name || suggestion.name,
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon)
    }
    setSelectedLocation(location)
    setAddress(location.address)
    setSuggestions([])
    setShowSuggestions(false)
    onLocationSelect(location)
  }

  // Buscar ubicación actual
  const handleSearch = () => {
    if (address.trim()) {
      geocodeAddress(address)
    }
  }

  // Limpiar selección
  const clearSelection = () => {
    setSelectedLocation(null)
    setAddress('')
    setSuggestions([])
    setShowSuggestions(false)
  }

  return (
    <div className="space-y-4">
      {/* Búsqueda de dirección */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Buscar Ubicación
        </label>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder="Ej: Av. Principal 123, Rosario, Argentina"
              className="border-gray-200 dark:border-gray-700"
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            />

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectSuggestion(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {suggestion.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {suggestion.display_name}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={handleSearch}
            disabled={isSearching || !address.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Mapa 2D */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Ubicación en Mapa
        </label>
        <DynamicMap
          initialLat={selectedLocation?.latitude}
          initialLng={selectedLocation?.longitude}
          onLocationSelect={selectSuggestion}
        />
      </div>

      {/* Ubicación seleccionada */}
      {selectedLocation && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Ubicación Seleccionada
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                  {selectedLocation.address}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white dark:bg-gray-800 p-2 rounded">
                <p className="text-xs text-gray-500 dark:text-gray-400">Latitud</p>
                <p className="text-sm font-mono text-gray-900 dark:text-white">
                  {typeof selectedLocation.latitude === 'number' ? selectedLocation.latitude.toFixed(6) : '0.000000'}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded">
                <p className="text-xs text-gray-500 dark:text-gray-400">Longitud</p>
                <p className="text-sm font-mono text-gray-900 dark:text-white">
                  {typeof selectedLocation.longitude === 'number' ? selectedLocation.longitude.toFixed(6) : '0.000000'}
                </p>
              </div>
            </div>

            <Badge className="w-full justify-center bg-green-600 hover:bg-green-700">
              ✓ Ubicación confirmada
            </Badge>
          </div>
        </Card>
      )}
    </div>
  )
}

export default LocationSearchMap
