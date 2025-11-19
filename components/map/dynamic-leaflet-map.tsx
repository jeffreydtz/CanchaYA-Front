/**
 * Dynamic Leaflet Map Component
 * Client-side only map rendering with marker placement
 */

'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface DynamicLeafletMapProps {
  latitude: number
  longitude: number
  clubName: string
  address?: string
  zoom?: number
  height?: string
}

// Fix Leaflet icon issue with Next.js
const markerIconPNG = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png'
const shadowPNG = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png'

const markerIcon = L.icon({
  iconUrl: markerIconPNG,
  shadowUrl: shadowPNG,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

export default function DynamicLeafletMap({
  latitude,
  longitude,
  clubName,
  address,
  zoom = 15,
  height = '400px',
}: DynamicLeafletMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Initialize map
    map.current = L.map(mapContainer.current).setView([latitude, longitude], zoom)

    // Add tile layer from OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map.current)

    // Add marker with club information
    const popupContent = `
      <div class="p-2">
        <h3 class="font-bold text-sm">${clubName}</h3>
        ${address ? `<p class="text-xs text-gray-600">${address}</p>` : ''}
        <p class="text-xs text-gray-500 mt-1">${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
      </div>
    `

    L.marker([latitude, longitude], { icon: markerIcon })
      .addTo(map.current)
      .bindPopup(popupContent, { maxWidth: 250 })
      .openPopup()

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [latitude, longitude, clubName, address, zoom])

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: height,
        borderRadius: '8px',
      }}
    />
  )
}
