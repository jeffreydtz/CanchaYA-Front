/**
 * Dashboard Page for CanchaYA
 * Modern landing page with enhanced UX and performance optimizations
 */

import { Suspense } from 'react'
import Link from 'next/link'
import HeroSection from '@/components/dashboard/hero-section'
import CourtFilters from '@/components/dashboard/court-filters'
import FeaturedCourts from '@/components/dashboard/featured-courts'
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
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden">
        {/* Luxury background effects */}
        <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />
        <div className="fixed inset-0 bg-gradient-to-br from-gold/5 via-transparent to-secondary/5 pointer-events-none" />

        {/* Theme Toggle - Fixed Position with glamorous styling */}
        <div className="fixed bottom-6 right-6 z-50 group">
          <div className="absolute inset-0 bg-gradient-gold blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10" />
          <ThemeToggle />
        </div>

        <main className="relative z-10">
          <Suspense fallback={<LoadingSkeleton />}>
            {/* Hero section - full viewport */}
            <HeroSection />

            {/* Content sections with luxury overlay */}
            <div className="relative z-10 bg-gradient-to-b from-transparent via-background to-background">
              <div className="container mx-auto px-4 pt-40 pb-16 space-y-20">
                {/* Search and filters */}
                <section className="animate-fade-up">
                  <CourtFilters />
                </section>

                {/* Featured courts */}
                <section className="animate-scale-in" style={{ animationDelay: '300ms' }}>
                  <FeaturedCourts />
                </section>
              </div>
            </div>
          </Suspense>
        </main>
      
      {/* Footer */}
      <footer className="relative glass-luxury border-t-2 border-gold/30 mt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-secondary/5 pointer-events-none" />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Company info */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="h-10 w-10 metallic-gold rounded-xl flex items-center justify-center shadow-glow-gold group-hover:shadow-glow-gold-lg transition-all duration-500">
                    <span className="text-black font-black text-base">CY</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-gold rounded-xl blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                </div>
                <span className="font-display font-black text-2xl text-gradient-luxury">CanchaYA</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed font-luxury">
                La plataforma de <span className="text-gold font-bold">lujo</span> para reservar canchas deportivas.
                Conectamos jugadores con las mejores instalaciones.
              </p>
            </div>
            
            {/* Quick links */}
            <div className="space-y-6">
              <h4 className="font-display font-bold text-lg text-gradient-luxury">Enlaces Rápidos</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-gold transition-all duration-300 hover:translate-x-1 inline-block font-luxury">→ Inicio</Link></li>
                <li><Link href="/buscar" className="text-gray-700 dark:text-gray-300 hover:text-gold transition-all duration-300 hover:translate-x-1 inline-block font-luxury">→ Buscar Canchas</Link></li>
                <li><Link href="/mis-reservas" className="text-gray-700 dark:text-gray-300 hover:text-gold transition-all duration-300 hover:translate-x-1 inline-block font-luxury">→ Mis Reservas</Link></li>
                <li><Link href="/desafios" className="text-gray-700 dark:text-gray-300 hover:text-gold transition-all duration-300 hover:translate-x-1 inline-block font-luxury">→ Desafíos</Link></li>
              </ul>
            </div>

            {/* Sports */}
            <div className="space-y-6">
              <h4 className="font-display font-bold text-lg text-gradient-luxury">Deportes</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/buscar" className="text-gray-700 dark:text-gray-300 hover:text-gold transition-all duration-300 hover:scale-105 inline-block font-luxury">⚽ Fútbol</Link></li>
                <li><Link href="/buscar" className="text-gray-700 dark:text-gray-300 hover:text-gold transition-all duration-300 hover:scale-105 inline-block font-luxury">🎾 Tenis</Link></li>
                <li><Link href="/buscar" className="text-gray-700 dark:text-gray-300 hover:text-gold transition-all duration-300 hover:scale-105 inline-block font-luxury">🏓 Paddle</Link></li>
                <li><Link href="/buscar" className="text-gray-700 dark:text-gray-300 hover:text-gold transition-all duration-300 hover:scale-105 inline-block font-luxury">🏀 Básquet</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-6">
              <h4 className="font-display font-bold text-lg text-gradient-luxury">Contacto</h4>
              <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300 font-luxury">
                <li className="flex items-center gap-2 hover:text-gold transition-colors duration-300">
                  <span className="text-gold">📧</span> info@canchaya.com
                </li>
                <li className="flex items-center gap-2 hover:text-gold transition-colors duration-300">
                  <span className="text-gold">📱</span> +54 341 123-4567
                </li>
                <li className="flex items-center gap-2 hover:text-gold transition-colors duration-300">
                  <span className="text-gold">📍</span> Rosario, Argentina
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t-2 border-gold/20 mt-12 pt-10">
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