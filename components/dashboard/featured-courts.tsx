/**
 * Featured Courts Component for CanchaYA
 * Displays a grid of available courts with search and booking functionality
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { 
  MapPin, 
  Star, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  ArrowRight
} from 'lucide-react'
import { Court } from '@/lib/api-client'

interface FeaturedCourtsProps {
  courts: Court[]
  isAuthenticated: boolean
  searchQuery?: string
}

export function FeaturedCourts({ courts, isAuthenticated, searchQuery }: FeaturedCourtsProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  const handleImageError = (courtId: string) => {
    setImageErrors(prev => new Set(prev).add(courtId))
  }

  const getCourtImage = (court: Court) => {
    if (imageErrors.has(court.id) || !court.imagenes || court.imagenes.length === 0) {
      return '/placeholder.jpg'
    }
    return court.imagenes[0]
  }

  const getDeporteIcon = (deporte: string) => {
    const icons: Record<string, string> = {
      futbol: '⚽',
      padel: '🎾',
      tenis: '🎾',
      basquet: '🏀',
      voley: '🏐',
    }
    return icons[deporte.toLowerCase()] || '🏃'
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (courts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {searchQuery ? 'No se encontraron canchas' : 'No hay canchas disponibles'}
        </h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          {searchQuery 
            ? `No encontramos canchas que coincidan con "${searchQuery}". Intenta con otros términos de búsqueda.`
            : 'No hay canchas disponibles en este momento. Vuelve a intentar más tarde.'
          }
        </p>
        {searchQuery && (
          <Button asChild variant="outline">
            <Link href="/">Ver todas las canchas</Link>
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      {searchQuery && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <p className="text-primary-800">
            <strong>{courts.length}</strong> cancha{courts.length !== 1 ? 's' : ''} encontrada{courts.length !== 1 ? 's' : ''} para "{searchQuery}"
          </p>
        </div>
      )}

      {/* Courts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courts.map((court) => (
          <Card key={court.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white overflow-hidden">
            <div className="relative">
              <AspectRatio ratio={16 / 10}>
                <Image
                  src={getCourtImage(court)}
                  alt={court.nombre}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={() => handleImageError(court.id)}
                />
              </AspectRatio>
              
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <Badge
                  variant={court.disponible ? "default" : "secondary"}
                  className={court.disponible 
                    ? "bg-green-500 hover:bg-green-600 text-white shadow-lg" 
                    : "bg-gray-500 text-white"
                  }
                >
                  {court.disponible ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Disponible
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 mr-1" />
                      Ocupada
                    </>
                  )}
                </Badge>
              </div>

              {/* Sport Icon */}
              <div className="absolute top-3 left-3">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 text-lg">
                  {getDeporteIcon(court.deporte.nombre)}
                </div>
              </div>

              {/* Price Badge */}
              <div className="absolute bottom-3 left-3">
                <Badge variant="secondary" className="bg-white/90 text-gray-900 font-semibold">
                  {formatPrice(court.precio)}/hora
                </Badge>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="space-y-3">
                {/* Title and Rating */}
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {court.nombre}
                  </h3>
                  <div className="flex items-center ml-2 text-sm text-yellow-600">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="ml-1 font-medium">4.8</span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="line-clamp-1">{court.club.nombre} - {court.club.direccion}</span>
                </div>

                {/* Sport and Description */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {court.deporte.nombre}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Users className="w-3 h-3 mr-1" />
                      8-10 jugadores
                    </Badge>
                  </div>
                  
                  {court.descripcion && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {court.descripcion}
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1 text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded-full">Iluminación LED</span>
                  <span className="bg-gray-100 px-2 py-1 rounded-full">Vestuarios</span>
                  <span className="bg-gray-100 px-2 py-1 rounded-full">Estacionamiento</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-6 pt-0">
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex-1"
                >
                  <Link href={`/cancha/${court.id}`}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Ver horarios
                  </Link>
                </Button>
                
                {isAuthenticated ? (
                  <Button
                    size="sm"
                    asChild
                    className="flex-1 group"
                    disabled={!court.disponible}
                  >
                    <Link href={`/cancha/${court.id}?action=reserve`}>
                      Reservar
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    asChild
                    className="flex-1"
                  >
                    <Link href="/login">
                      Iniciar sesión
                    </Link>
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {courts.length >= 6 && (
        <div className="text-center pt-8">
          <Button variant="outline" size="lg">
            Ver más canchas
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Empty State for Search */}
      {courts.length > 0 && !searchQuery && (
        <div className="text-center pt-8 border-t">
          <p className="text-gray-600 mb-4">
            ¿No encuentras lo que buscas?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" asChild>
              <Link href="/#filtros">Usar filtros avanzados</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">Solicitar nueva cancha</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
