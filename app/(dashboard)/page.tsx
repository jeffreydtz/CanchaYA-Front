/**
 * Dashboard Page for CanchaYA
 * Modern landing page with enhanced UX and performance optimizations
 */

import { Suspense } from 'react'
import Link from 'next/link'
import HeroSection from '@/components/dashboard/hero-section'
import CourtFilters from '@/components/dashboard/court-filters'
import FeaturedCourts from '@/components/dashboard/featured-courts'
import Navbar from '@/components/navbar/navbar'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { FooterEasterEgg } from '@/components/easter-egg/footer-easter-egg'
import { SearchProvider } from '@/lib/search-context'

function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero skeleton */}
      <div className="h-screen bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800"></div>
      
      {/* Filters skeleton */}
      <div className="container mx-auto px-4">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl mb-8"></div>
        
        {/* Courts grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <SearchProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar />
        
        {/* Theme Toggle - Fixed Position */}
        <div className="fixed bottom-6 right-6 z-50">
          <ThemeToggle />
        </div>
        
        <main className="relative">
          <Suspense fallback={<LoadingSkeleton />}>
            {/* Hero section - full viewport */}
            <HeroSection />
            
            {/* Content sections */}
            <div className="relative z-10 bg-white dark:bg-gray-900">
              <div className="container mx-auto px-4 pt-40 pb-16 space-y-16">
                {/* Search and filters */}
                <section className="animate-fade-in-up">
                  <CourtFilters />
                </section>
                
                {/* Featured courts */}
                <section className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                  <FeaturedCourts />
                </section>
              </div>
            </div>
          </Suspense>
        </main>
      
      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CY</span>
                </div>
                <span className="font-black text-xl text-gray-900 dark:text-white">CanchaYA</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                La plataforma líder para reservar canchas deportivas. 
                Conectamos jugadores con las mejores instalaciones.
              </p>
            </div>
            
            {/* Quick links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Enlaces Rápidos</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Inicio</Link></li>
                <li><Link href="/buscar" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Buscar Canchas</Link></li>
                <li><Link href="/mis-reservas" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Mis Reservas</Link></li>
                <li><Link href="/competitivo" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Competitivo</Link></li>
              </ul>
            </div>
            
            {/* Sports */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Deportes</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/buscar" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">⚽ Fútbol</Link></li>
                <li><Link href="/buscar" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">🎾 Tenis</Link></li>
                <li><Link href="/buscar" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">🏓 Paddle</Link></li>
                <li><Link href="/buscar" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">🏀 Básquet</Link></li>
              </ul>
            </div>
            
            {/* Contact */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Contacto</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>📧 info@canchaya.com</li>
                <li>📱 +54 11 1234-5678</li>
                <li>📍 Buenos Aires, Argentina</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8">
            {/* Main footer content */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                © 2025 CanchaYA. Todos los derechos reservados.
                <FooterEasterEgg />
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link href="/privacy" className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
                  Privacidad
                </Link>
                <Link href="/terms" className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
                  Términos
                </Link>
                <Link href="/terms" className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
                  Cookies
                </Link>
              </div>
            </div>
            
            {/* Toggle switches */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Theme:</span>
                  <ThemeToggle />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Language:</span>
                  <LanguageToggle />
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </SearchProvider>
  )
}