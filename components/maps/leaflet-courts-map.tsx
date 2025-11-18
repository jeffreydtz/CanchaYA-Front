'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader, MapPin } from 'lucide-react'
import { Cancha } from '@/lib/api-client'
import 'leaflet/dist/leaflet.css'

interface LeafletCourtsMapProps {
  courts: Cancha[]
  onCourt?: (court: Cancha) => void
  height?: string
}

// Fix Leaflet default icons
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const selectedIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [32, 50],
  iconAnchor: [16, 50],
  popupAnchor: [1, -40],
  shadowSize: [41, 41],
})

L.Marker.prototype.setIcon(defaultIcon)

interface CanchaMapsData extends Cancha {
  latitude?: number
  longitude?: number
}

export function LeafletCourtsMap({
  courts,
  onCourt,
  height = '600px',
}: LeafletCourtsMapProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Default center (Buenos Aires, Argentina)
  const defaultCenter: [number, number] = [-34.6037, -58.3816]

  // Get center based on courts with coordinates
  const courtsWithCoords = courts.filter(
    c => (c as CanchaMapsData).latitude && (c as CanchaMapsData).longitude
  )

  let center = defaultCenter
  if (courtsWithCoords.length > 0) {
    const latSum = courtsWithCoords.reduce((sum, c) => sum + ((c as CanchaMapsData).latitude || 0), 0)
    const lngSum = courtsWithCoords.reduce((sum, c) => sum + ((c as CanchaMapsData).longitude || 0), 0)
    center = [latSum / courtsWithCoords.length, lngSum / courtsWithCoords.length]
  }

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Mapa de Canchas
            </span>
            {isLoading && <Loader className="h-5 w-5 animate-spin text-muted-foreground" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full rounded-lg overflow-hidden border border-gray-200">
            {courtsWithCoords.length === 0 ? (
              <div
                className="w-full flex items-center justify-center bg-gray-100"
                style={{ height }}
              >
                <div className="text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 font-medium">
                    No hay canchas con coordenadas disponibles
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Contacta al administrador para agregar ubicaciones
                  </p>
                </div>
              </div>
            ) : (
              <MapContainer
                center={center}
                zoom={13}
                style={{ height, width: '100%' }}
                className="rounded-lg"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {courtsWithCoords.map(court => {
                  const canchaMaps = court as CanchaMapsData
                  const position: [number, number] = [
                    canchaMaps.latitude || 0,
                    canchaMaps.longitude || 0,
                  ]

                  return (
                    <Marker
                      key={court.id}
                      position={position}
                      icon={selectedId === court.id ? selectedIcon : defaultIcon}
                      eventHandlers={{
                        click: () => setSelectedId(court.id),
                      }}
                    >
                      <Popup maxWidth={300} className="leaflet-popup">
                        <div className="p-2">
                          <h3 className="font-semibold text-sm mb-2">{court.nombre}</h3>
                          <div className="space-y-1 text-xs">
                            <p>
                              <strong>Club:</strong> {court.club.nombre}
                            </p>
                            <p>
                              <strong>Deporte:</strong> {court.deporte.nombre}
                            </p>
                            <p>
                              <strong>Superficie:</strong> {court.tipoSuperficie}
                            </p>
                            <p>
                              <strong>Precio:</strong> ${court.precioPorHora}/hora
                            </p>
                            <p>
                              <strong>Ubicación:</strong> {court.ubicacion}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="w-full mt-3 h-7 text-xs"
                            onClick={() => onCourt?.(court)}
                          >
                            Ver detalles
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  )
                })}
              </MapContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Courts list */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Canchas en el mapa</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courtsWithCoords.map(court => (
            <Card
              key={court.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedId === court.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => {
                setSelectedId(court.id)
                onCourt?.(court)
              }}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-start justify-between gap-2">
                  <span>{court.nombre}</span>
                  <Badge variant="outline" className="whitespace-nowrap text-xs">
                    {court.deporte.nombre}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <strong>Club:</strong> {court.club.nombre}
                </div>
                <div>
                  <strong>Superficie:</strong> {court.tipoSuperficie}
                </div>
                <div>
                  <strong>Precio:</strong> ${court.precioPorHora}/hora
                </div>
                <div className="text-muted-foreground text-xs pt-2 border-t">
                  {court.ubicacion}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
