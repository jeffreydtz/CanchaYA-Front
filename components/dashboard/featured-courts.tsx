/**
 * Featured Courts Component for CanchaYA
 * Displays a grid of available courts with search and booking functionality
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  DollarSign, 
  Star, 
  Users,
  Calendar,
  Clock,
  AlertCircle
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { Court } from '@/lib/api-client'
import { formatPrice } from '@/lib/utils'

export default function FeaturedCourts() {
  const [courts, setCourts] = useState<Court[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadFeaturedCourts = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.getCourts({ featured: true })
      if (response.data) {
        setCourts(response.data)
      }
    } catch (err) {
      console.error('Error loading featured courts:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFeaturedCourts()
  }, [loadFeaturedCourts])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg"></div>
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Canchas Destacadas</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubre las mejores canchas deportivas con instalaciones de primer nivel
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courts.map((court) => (
            <Card key={court.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={court.imagen}
                  alt={court.nombre}
                  className="w-full h-48 object-cover"
                />
                {court.featured && (
                  <Badge className="absolute top-2 right-2 bg-yellow-500">
                    <Star className="h-3 w-3 mr-1" />
                    Destacada
                  </Badge>
                )}
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{court.nombre}</h3>
                    <p className="text-gray-600 text-sm">{court.club}</p>
                  </div>
                  <Badge variant="secondary">{court.deporte}</Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {court.direccion}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {court.horarios}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    {formatPrice(court.precio)} por hora
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/cancha/${court.id}`} className="flex-1">
                    <Button className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Reservar
                    </Button>
                  </Link>
                  <Link href={`/cancha/${court.id}`}>
                    <Button variant="outline" size="icon">
                      <AlertCircle className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {courts.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No se encontraron canchas destacadas</p>
          </div>
        )}
      </div>
    </section>
  )
}
