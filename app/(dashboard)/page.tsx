/**
 * Dashboard Page for CanchaYA
 * Main landing page with hero section, search filters, and featured courts
 * Implements authentication checks and real-time updates
 */

import { Suspense } from 'react'
import { getServerUser } from '@/lib/auth-server'
import { Navbar } from '@/components/navbar'
import { HeroSection } from '@/components/dashboard/hero-section'
import { CourtFilters } from '@/components/dashboard/court-filters'
import { FeaturedCourts } from '@/components/dashboard/featured-courts'
import { Loader } from '@/components/ui/loader'
import apiClient from '@/lib/api-client'

interface SearchParams {
  deporte?: string
  club?: string
  fecha?: string
  busqueda?: string
}

interface DashboardPageProps {
  searchParams: Promise<SearchParams>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await getServerUser()
  const resolvedSearchParams = await searchParams

  // Fetch courts based on search parameters
  const filters = {
    disponible: true,
    deporte: resolvedSearchParams.deporte,
    club: resolvedSearchParams.club,
    fecha: resolvedSearchParams.fecha,
  }

  // Remove undefined values
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined)
  )

  const courtsResponse = await apiClient.getCourts(cleanFilters)
  const courts = courtsResponse.data || []

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      <main>
        {/* Hero Section */}
        <HeroSection 
          isAuthenticated={!!user} 
          userName={user ? `${user.nombre} ${user.apellido}` : undefined}
        />

        {/* Search and Filters Section */}
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-center mb-2">
                Encuentra tu cancha ideal
              </h2>
              <p className="text-muted-foreground text-center">
                Busca y reserva canchas disponibles en tu zona
              </p>
            </div>
            
            <Suspense fallback={<Loader className="mx-auto" />}>
              <CourtFilters initialFilters={resolvedSearchParams} />
            </Suspense>
          </div>
        </section>

        {/* Courts Listing Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                              <h2 className="text-2xl font-bold">
                {resolvedSearchParams.busqueda || Object.keys(cleanFilters).length > 1 
                  ? 'Resultados de búsqueda' 
                  : 'Canchas destacadas'
                }
                </h2>
                <p className="text-muted-foreground">
                  {courts.length === 0 
                    ? 'No se encontraron canchas disponibles'
                    : `${courts.length} cancha${courts.length !== 1 ? 's' : ''} disponible${courts.length !== 1 ? 's' : ''}`
                  }
                </p>
              </div>
              
              {/* Quick Stats */}
              {user && (
                <div className="hidden md:flex gap-4 text-sm text-muted-foreground">
                  <div className="text-center">
                    <div className="font-bold text-lg text-primary-600">15</div>
                    <div>Clubs disponibles</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg text-primary-600">{courts.length}</div>
                    <div>Canchas activas</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg text-primary-600">5</div>
                    <div>Deportes</div>
                  </div>
                </div>
              )}
            </div>

            <Suspense fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-muted rounded-lg h-64" />
                ))}
              </div>
            }>
              <FeaturedCourts 
                courts={courts}
                isAuthenticated={!!user}
                searchQuery={resolvedSearchParams.busqueda}
              />
            </Suspense>
          </div>
        </section>

        {/* Call to Action Section */}
        {!user && (
          <section className="py-16 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-4">
                ¿Listo para reservar tu cancha?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Únete a miles de jugadores que ya confían en CanchaYA
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/register"
                  className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Crear cuenta gratis
                </a>
                <a 
                  href="/login"
                  className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Iniciar sesión
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">¿Por qué elegir CanchaYA?</h2>
              <p className="text-muted-foreground text-lg">
                La plataforma más completa para reservar canchas deportivas
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Reserva en 3 clics</h3>
                <p className="text-muted-foreground">
                  Proceso super simple y rápido. Desde elegir cancha hasta confirmar, solo 3 pasos.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19l3-3 5.5 5.5L21 12l-3-3m-10 10l4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Tiempo real</h3>
                <p className="text-muted-foreground">
                  Ve disponibilidad actualizada al instante y recibe notificaciones de turnos liberados.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">100% confiable</h3>
                <p className="text-muted-foreground">
                  Sistema de confirmación automático y gestión inteligente de reservas.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-secondary-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">CanchaYA</h3>
              <p className="text-gray-300">
                La mejor plataforma para reservar canchas deportivas en Rosario.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Enlaces</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/about" className="hover:text-white">Acerca de</a></li>
                <li><a href="/contact" className="hover:text-white">Contacto</a></li>
                <li><a href="/help" className="hover:text-white">Ayuda</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/terms" className="hover:text-white">Términos</a></li>
                <li><a href="/privacy" className="hover:text-white">Privacidad</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <p className="text-gray-300">
                📧 info@canchaya.com<br />
                📞 +54 341 123-4567<br />
                📍 Rosario, Santa Fe
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2025 CanchaYA. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
