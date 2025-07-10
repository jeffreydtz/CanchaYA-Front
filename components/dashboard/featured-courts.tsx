/**
 * Featured Courts Component for CanchaYA
 * Displays a grid of available courts with search and booking functionality
 */

'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, MapPin, Clock } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface Court {
  id: string
  name: string
  sport: string
  location: string
  price: number
  rating: number
  image: string
  available: boolean
}

const mockCourts: Court[] = [
  {
    id: '1',
    name: 'Cancha de Fútbol 11 - Club Deportivo Central',
    sport: 'Fútbol',
    location: 'Zona Norte',
    price: 15000,
    rating: 4.5,
    image: '/placeholder.jpg',
    available: true,
  },
  {
    id: '2',
    name: 'Cancha de Tenis - Club Atlético',
    sport: 'Tenis',
    location: 'Zona Sur',
    price: 8000,
    rating: 4.8,
    image: '/placeholder.jpg',
    available: true,
  },
  {
    id: '3',
    name: 'Cancha de Paddle - Centro Deportivo',
    sport: 'Paddle',
    location: 'Zona Este',
    price: 6000,
    rating: 4.2,
    image: '/placeholder.jpg',
    available: false,
  },
]

// Función para formatear números de manera consistente
const formatPrice = (price: number): string => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export default function FeaturedCourts() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Canchas Destacadas
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubre las mejores canchas disponibles para tu deporte favorito.
            Reserva con facilidad y disfruta de instalaciones de primera calidad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(mockCourts || []).map((court) => (
            <Card key={court.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <Image
                  src={court.image}
                  alt={court.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant={court.available ? "default" : "secondary"}>
                    {court.available ? "Disponible" : "Ocupada"}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                    {court.name}
                  </h3>
                </div>
                
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {court.location}
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium">{court.rating}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>1 hora</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-green-600">
                    ${isClient ? (court.price || 0).toLocaleString() : formatPrice(court.price || 0)}
                  </div>
                  <Link href={`/cancha/${court.id}`}>
                    <Button size="sm" disabled={!court.available}>
                      {court.available ? "Reservar" : "No disponible"}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/">
            <Button variant="outline" size="lg">
              Ver Todas las Canchas
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
