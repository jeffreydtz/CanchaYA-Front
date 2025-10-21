/**
 * Featured Courts Component for CanchaYA
 * Modern court grid with skeleton loading, hover effects, and enhanced visual design
 */

'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, MapPin, Clock, Heart, Users, Wifi, Car, Coffee } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import apiClient, { Cancha } from '@/lib/api-client'
import { Skeleton } from '@/components/ui/skeleton'
import { useSearch } from '@/lib/search-context'

interface CourtCardProps {
  court: Cancha
  index: number
}

function CourtCard({ court, index }: CourtCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Mock amenities - in real app this would come from the API
  const amenities = [
    { icon: Wifi, label: 'WiFi' },
    { icon: Car, label: 'Estacionamiento' },
    { icon: Coffee, label: 'Cafetería' },
    { icon: Users, label: 'Vestuarios' },
  ]

  return (
    <Card 
      className={`group overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-0 bg-white dark:bg-gray-900 animate-fade-in-up ${
        isHovered ? 'scale-105' : ''
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-64 overflow-hidden">
        <Image
          src={'/cancha.jpeg'}
          alt={court.nombre}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Status badge */}
        <div className="absolute top-4 left-4">
          <Badge
            variant={court.activa ? "default" : "secondary"}
            className={`${
              court.activa
                ? "bg-success text-white shadow-lg"
                : "bg-gray-500 text-white shadow-lg"
            } px-3 py-1 font-semibold`}
          >
            {court.activa ? "✓ Disponible" : "● Inactiva"}
          </Badge>
        </div>

        {/* Favorite button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
          onClick={(e) => {
            e.preventDefault()
            setIsFavorite(!isFavorite)
          }}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>

        {/* Quick booking button - shows on hover */}
        <div className={`absolute bottom-4 left-4 right-4 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <Link href={`/cancha/${court.id}`}>
            <Button
              className="w-full bg-white/90 hover:bg-white text-gray-900 font-semibold backdrop-blur-sm"
              disabled={!court.activa}
            >
              {court.activa ? "Reservar Ahora" : "Ver Detalles"}
            </Button>
          </Link>
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        {/* Court name and rating */}
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary transition-colors">
            {court.nombre}
          </h3>
          <div className="flex items-center bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg ml-2">
            <Star className="h-4 w-4 text-blue-500 fill-current" />
            <span className="text-sm font-bold text-blue-700 dark:text-blue-400 ml-1">4.8</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-600 dark:text-gray-300">
          <MapPin className="h-4 w-4 mr-2 text-primary" />
          <span className="text-sm line-clamp-1">{court.ubicacion}</span>
        </div>

        {/* Sport type */}
        <div className="flex items-center">
          <Badge variant="outline" className="text-xs font-medium">
            {court.deporte?.nombre || 'Fútbol'}
          </Badge>
          <span className="text-xs text-gray-500 ml-2">• {court.tipoSuperficie}</span>
        </div>

        {/* Amenities */}
        <div className="flex items-center space-x-3">
          {amenities.slice(0, 4).map((amenity, idx) => {
            const Icon = amenity.icon
            return (
              <div 
                key={idx} 
                className="flex items-center text-gray-500 dark:text-gray-400"
                title={amenity.label}
              >
                <Icon className="h-4 w-4" />
              </div>
            )
          })}
        </div>

        {/* Price and book button */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex flex-col">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-primary">
                ${court.precioPorHora?.toLocaleString() ?? '-'}
              </span>
              <span className="text-sm text-gray-500">/hora</span>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              <span>Disponible hoy</span>
            </div>
          </div>
          
          <Link href={`/cancha/${court.id}`}>
            <Button
              size="sm"
              disabled={!court.activa}
              className="font-semibold"
            >
              {court.activa ? "Ver Más" : "No disponible"}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function CourtSkeleton({ index }: { index: number }) {
  return (
    <Card className="overflow-hidden animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
      <Skeleton className="h-64 w-full" />
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-12" />
        </div>
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <div className="flex space-x-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-4" />
          ))}
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-1">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-9 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function FeaturedCourts() {
  const { filteredCourts, allCourts, setAllCourts, setFilteredCourts, isLoading: searchLoading } = useSearch()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourts = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await apiClient.getCanchas()
        if (response.data) {
          setAllCourts(response.data)
          // Initially show all active courts
          const activeCourts = response.data.filter(court => court.activa)
          setFilteredCourts(activeCourts)
        } else {
          setError('No se pudieron cargar las canchas')
          setAllCourts([])
          setFilteredCourts([])
        }
      } catch {
        setError('Error al cargar las canchas')
        setAllCourts([])
        setFilteredCourts([])
      } finally {
        setLoading(false)
      }
    }
    fetchCourts()
  }, [])

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
            Canchas <span className="text-gradient">Destacadas</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Descubre las instalaciones deportivas más populares y mejor calificadas. 
            Reserva con confianza en canchas verificadas y de alta calidad.
          </p>
          {!loading && allCourts.length > 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              {filteredCourts.length === allCourts.length 
                ? `Mostrando todas las ${allCourts.length} canchas disponibles`
                : `Mostrando ${filteredCourts.length} de ${allCourts.length} canchas`
              }
            </p>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <CourtSkeleton key={index} index={index} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <MapPin className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Error al cargar las canchas
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Intentar de nuevo
              </Button>
            </div>
          </div>
        ) : filteredCourts.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <MapPin className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {allCourts.length === 0 ? 'No hay canchas disponibles' : 'No se encontraron canchas'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {allCourts.length === 0 
                  ? 'Parece que no hay canchas registradas en este momento.'
                  : 'No hay canchas que coincidan con los filtros aplicados. Intenta cambiar los criterios de búsqueda.'
                }
              </p>
              <Button variant="outline">
                Contactar Soporte
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {filteredCourts.map((court, index) => (
                <CourtCard key={court.id} court={court} index={index} />
              ))}
            </div>

            {/* View all button */}
            <div className="text-center animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              <Link href="/buscar">
                <Button variant="outline" size="lg" className="px-12 py-4 text-lg font-semibold">
                  Ver Todas las Canchas
                  <MapPin className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}