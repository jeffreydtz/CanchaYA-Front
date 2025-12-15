'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

interface LocationMap2DProps {
  initialLat?: number
  initialLng?: number
  onLocationSelect?: (location: any) => void
}

export function LocationMap2D({ initialLat = -32.9442, initialLng = -60.6560, onLocationSelect }: LocationMap2DProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  useEffect(() => {
    // Dynamically load Leaflet only on client side
    if (typeof window === 'undefined') return
    if (!mapRef.current) return

    // Import Leaflet
    import('leaflet').then((L) => {
      // Guard against null ref
      if (!mapRef.current) return

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

      // Create map only if not already created
      if (mapInstanceRef.current) return

      // Initialize map
      const map = L.map(mapRef.current as HTMLElement, {
        center: [initialLat, initialLng],
        zoom: 13,
        zoomControl: true
      })

      mapInstanceRef.current = map

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map)

      // Add initial marker if provided
      if (initialLat && initialLng) {
        markerRef.current = L.marker([initialLat, initialLng], { icon: defaultIcon })
          .addTo(map)
          .bindPopup('Ubicación seleccionada')
          .openPopup()
      }

      // Handle map clicks
      const handleMapClick = (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng

        // Remove old marker
        if (markerRef.current) {
          map.removeLayer(markerRef.current)
        }

        // Add new marker
        markerRef.current = L.marker([lat, lng], { icon: defaultIcon })
          .addTo(map)
          .bindPopup(`<strong>Ubicación seleccionada</strong><br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`)
          .openPopup()

        // Call callback
        if (onLocationSelect) {
          const latValue = typeof lat === 'number' && !isNaN(lat) ? lat.toFixed(6) : '0.000000'
          const lngValue = typeof lng === 'number' && !isNaN(lng) ? lng.toFixed(6) : '0.000000'

          onLocationSelect({
            lat,
            lon: lng,
            display_name: `${latValue}, ${lngValue}`,
            name: `${latValue}, ${lngValue}`
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
    }).catch((err) => {
      // Silently handle Leaflet loading error
    })
  }, [])

  // Update marker when initial coordinates change
  useEffect(() => {
    if (!mapInstanceRef.current || !initialLat || !initialLng) return
    if (markerRef.current) return // Don't update if marker already exists

    import('leaflet').then((L) => {
      const defaultIcon = L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })

      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current)
      }

      mapInstanceRef.current.setView([initialLat, initialLng], 13)
      markerRef.current = L.marker([initialLat, initialLng], { icon: defaultIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup('Ubicación de la cancha')
        .openPopup()
    })
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
