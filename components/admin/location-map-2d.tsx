'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

interface LocationMap2DProps {
  initialLat?: number
  initialLng?: number
  onLocationSelect?: (location: any) => void
}

// Fix for Leaflet default markers
const defaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

L.Marker.prototype.setIcon(defaultIcon)

export function LocationMap2D({ initialLat = -32.9442, initialLng = -60.6560, onLocationSelect }: LocationMap2DProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Inicializar mapa
    const map = L.map(mapRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: true
    })

    mapInstanceRef.current = map

    // Agregar OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map)

    // Agregar marcador inicial si se proporciona ubicación
    if (initialLat && initialLng) {
      markerRef.current = L.marker([initialLat, initialLng], { icon: defaultIcon })
        .addTo(map)
        .bindPopup('Ubicación seleccionada')
        .openPopup()
    }

    // Manejar clicks en el mapa
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng

      // Remover marcador anterior
      if (markerRef.current) {
        map.removeLayer(markerRef.current)
      }

      // Agregar nuevo marcador
      markerRef.current = L.marker([lat, lng], { icon: defaultIcon })
        .addTo(map)
        .bindPopup(`<strong>Ubicación seleccionada</strong><br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`)
        .openPopup()

      // Callback con información de ubicación
      if (onLocationSelect) {
        onLocationSelect({
          lat,
          lon: lng,
          display_name: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          name: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        })
      }
    }

    map.on('click', handleMapClick)

    // Cleanup
    return () => {
      map.off('click', handleMapClick)
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Actualizar marcador cuando cambia la ubicación inicial
  useEffect(() => {
    if (mapInstanceRef.current && initialLat && initialLng && !markerRef.current) {
      mapInstanceRef.current.setView([initialLat, initialLng], 13)
      markerRef.current = L.marker([initialLat, initialLng], { icon: defaultIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup('Ubicación de la cancha')
        .openPopup()
    }
  }, [initialLat, initialLng])

  return (
    <div
      ref={mapRef}
      className="w-full h-[300px] rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
      style={{ zIndex: 1 }}
    />
  )
}

export default LocationMap2D
