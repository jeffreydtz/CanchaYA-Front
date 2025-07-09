/**
 * Hero Section Component for CanchaYA Dashboard
 * Main landing section with personalized content and search
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Search, MapPin, Clock, Users, ArrowRight } from 'lucide-react'

interface HeroSectionProps {
  isAuthenticated: boolean
  userName?: string
}

export function HeroSection({ isAuthenticated, userName }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/?busqueda=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary-400 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-secondary-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-primary-300 rounded-full blur-2xl"></div>
      </div>

      <div className="relative container mx-auto px-4 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            {isAuthenticated && userName ? (
              <div className="space-y-4">
                <div className="inline-flex items-center bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Conectado
                </div>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  ¡Hola, <span className="text-primary-600">{userName}!</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Encuentra y reserva tu cancha favorita en segundos. 
                  Más de <span className="font-semibold text-primary-600">50 canchas</span> disponibles en Rosario.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Reservá tu cancha en{' '}
                  <span className="text-primary-600 relative">
                    3 clics
                    <div className="absolute -bottom-2 left-0 w-full h-3 bg-primary-200 -z-10 transform -rotate-1"></div>
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  La plataforma más fácil para reservar canchas deportivas en Rosario. 
                  Confirmación inmediata y disponibilidad en tiempo real.
                </p>
              </div>
            )}

            {/* Search Bar */}
            <Card className="p-2 shadow-lg border-0 bg-white/80 backdrop-blur">
              <form onSubmit={handleSearch}>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Buscar canchas, deportes o clubes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-0 bg-transparent text-lg h-12 focus:ring-0"
                    />
                  </div>
                  <Button type="submit" size="lg" className="h-12 px-8">
                    <Search className="mr-2 h-5 w-5" />
                    Buscar
                  </Button>
                </div>
              </form>
            </Card>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4">
              {isAuthenticated ? (
                <>
                  <Link href="/mis-reservas">
                    <Button variant="outline" className="group">
                      <Clock className="mr-2 h-4 w-4" />
                      Mis Reservas
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/?deporte=futbol">
                    <Button variant="ghost">
                      Canchas de Fútbol
                    </Button>
                  </Link>
                  <Link href="/?deporte=padel">
                    <Button variant="ghost">
                      Canchas de Pádel
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/register">
                    <Button size="lg" className="group">
                      Crear cuenta gratis
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg">
                      Iniciar sesión
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">50+</div>
                <div className="text-sm text-gray-600">Canchas disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">15</div>
                <div className="text-sm text-gray-600">Clubes asociados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">1000+</div>
                <div className="text-sm text-gray-600">Reservas mensuales</div>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="relative z-10">
              <Card className="shadow-2xl border-0 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-64 sm:h-80 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="h-10 w-10" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">+5,000 jugadores</h3>
                      <p className="text-primary-100">confían en CanchaYA</p>
                    </div>
                    
                    {/* Floating elements */}
                    <div className="absolute top-4 left-4 bg-white rounded-lg p-3 shadow-lg animate-pulse">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Disponible</span>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-4 right-4 bg-white rounded-lg p-3 shadow-lg">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-primary-600" />
                        <span className="text-sm font-medium">Rosario</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Background decoration */}
            <div className="absolute top-4 -right-4 w-24 h-24 bg-primary-200 rounded-full blur-xl opacity-60"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary-200 rounded-full blur-xl opacity-60"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
