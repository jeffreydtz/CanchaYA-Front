/**
 * Hero Section Component for CanchaYA Dashboard
 * Modern hero with gradient background, glass morphism effects, and micro-interactions
 */

'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Calendar, Zap, Shield, Trophy } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/language-context'
import apiClient from '@/lib/api-client'

// Rosario Central Easter Egg Hook
function useRosarioCentralEasterEgg() {
  useEffect(() => {
    const konamiCode = ['c', 'e', 'n', 't', 'r', 'a', 'l']
    let konamiIndex = 0

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === konamiCode[konamiIndex]) {
        konamiIndex++
        if (konamiIndex === konamiCode.length) {
          // Trigger special Central easter egg
          const body = document.body
          body.style.backgroundImage = 'linear-gradient(45deg, #FFD700 25%, #1E40AF 25%, #1E40AF 50%, #FFD700 50%, #FFD700 75%, #1E40AF 75%)'
          body.style.backgroundSize = '20px 20px'
          body.style.animation = 'centralPride 2s ease-in-out'
          
          setTimeout(() => {
            body.style.backgroundImage = ''
            body.style.backgroundSize = ''
            body.style.animation = ''
          }, 3000)
          
          konamiIndex = 0
        }
      } else {
        konamiIndex = 0
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])
}

export default function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({
    courts: '500+',
    users: '10K+',
    bookings: '50K+',
    rating: '4.9⭐'
  })
  const { t } = useLanguage()
  
  // Activate Rosario Central easter egg
  useRosarioCentralEasterEgg()

  useEffect(() => {
    setMounted(true)

    // Fetch real stats from backend
    const fetchStats = async () => {
      try {
        const [canchasResponse, reservasResponse, usuariosResponse, valoracionesResponse] = await Promise.all([
          apiClient.getCanchas(),
          apiClient.getReservas(),
          apiClient.getUsuarios(),
          apiClient.getValoraciones()
        ])

        // Calculate average rating from valoraciones
        let averageRating = 4.9
        if (valoracionesResponse.data && valoracionesResponse.data.length > 0) {
          const totalRating = valoracionesResponse.data.reduce((sum, val) => sum + val.puntaje, 0)
          averageRating = Number((totalRating / valoracionesResponse.data.length).toFixed(1))
        }

        // Format user count
        const userCount = usuariosResponse.data?.length || 0
        const userDisplay = userCount >= 1000
          ? `${Math.floor(userCount / 1000)}K+`
          : `${userCount}+`

        if (canchasResponse.data && reservasResponse.data) {
          setStats({
            courts: `${canchasResponse.data.length}+`,
            users: userDisplay,
            bookings: `${reservasResponse.data.length}+`,
            rating: `${averageRating}⭐`
          })
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
        // Keep default values if API fails
      }
    }

    fetchStats()
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-slate-600 to-gray-400 dark:from-blue-600 dark:via-slate-700 dark:to-gray-600" />
      <div className="absolute inset-0 bg-grid opacity-20" />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl floating" />
      <div className="absolute top-40 right-32 w-24 h-24 bg-accent/20 rounded-full blur-lg floating" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-secondary/10 rounded-full blur-2xl floating" style={{ animationDelay: '2s' }} />
      
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className={`max-w-5xl mx-auto text-center ${mounted ? 'fade-in-up' : 'opacity-0'}`}>
          {/* Main heading */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-white/90 max-w-3xl mx-auto font-light leading-relaxed">
              {t('hero.subtitle')}
              <span className="block mt-2 text-white/80">{t('hero.subtitle2')}</span>
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-6 justify-center mb-16 ${mounted ? 'scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            <Link href="/buscar">
              <Button size="xl" variant="glow" className="group relative overflow-hidden">
                <MapPin className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
{t('hero.explore')}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Button>
            </Link>
            <Link href="/mis-reservas">
              <Button size="xl" variant="glass" className="group">
                <Calendar className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
{t('hero.reservations')}
              </Button>
            </Link>
          </div>

          {/* Feature cards */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${mounted ? 'fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
            <Card className="glass-effect group hover:scale-105 transition-all duration-300 card-hover min-h-[280px] flex flex-col justify-center bg-white/95 dark:bg-gray-800/95">
              <CardContent className="p-8 text-center flex flex-col justify-center h-full">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-slate-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-xl">
                  <Zap className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('feature.instant.title')}</h3>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-base">{t('feature.instant.desc')}</p>
                <div className="mt-4 flex items-center justify-center text-blue-500">
                  <div className="w-8 h-0.5 bg-blue-500 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-effect group hover:scale-105 transition-all duration-300 card-hover min-h-[280px] flex flex-col justify-center bg-white/95 dark:bg-gray-800/95">
              <CardContent className="p-8 text-center flex flex-col justify-center h-full">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-600 to-gray-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-xl">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('feature.secure.title')}</h3>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-base">{t('feature.secure.desc')}</p>
                <div className="mt-4 flex items-center justify-center text-slate-600">
                  <div className="w-8 h-0.5 bg-slate-600 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-effect group hover:scale-105 transition-all duration-300 card-hover min-h-[280px] flex flex-col justify-center bg-white/95 dark:bg-gray-800/95">
              <CardContent className="p-8 text-center flex flex-col justify-center h-full">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-500 to-blue-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-xl">
                  <Trophy className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('feature.premium.title')}</h3>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-base">{t('feature.premium.desc')}</p>
                <div className="mt-4 flex items-center justify-center text-gray-600">
                  <div className="w-8 h-0.5 bg-gray-600 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          
          {/* Stats section */}
          <div className={`mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 ${mounted ? 'fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-2">{stats.courts}</div>
              <div className="text-white/80 font-medium">{t('stats.courts')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-2">{stats.users}</div>
              <div className="text-white/80 font-medium">{t('stats.users')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-2">{stats.bookings}</div>
              <div className="text-white/80 font-medium">{t('stats.bookings')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-2">{stats.rating}</div>
              <div className="text-white/80 font-medium">{t('stats.rating')}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  )
}