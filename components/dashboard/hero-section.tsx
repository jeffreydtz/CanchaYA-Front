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

export default function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent opacity-90" />
      <div className="absolute inset-0 bg-grid opacity-20" />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl floating" />
      <div className="absolute top-40 right-32 w-24 h-24 bg-accent/20 rounded-full blur-lg floating" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-secondary/10 rounded-full blur-2xl floating" style={{ animationDelay: '2s' }} />
      
      <div className="container mx-auto px-4 relative z-10">
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
            <Link href="/">
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
            <Card className="glass-effect group hover:scale-105 transition-all duration-300 card-hover border-white/20 min-h-[280px] flex flex-col justify-center">
              <CardContent className="p-8 text-center flex flex-col justify-center h-full">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-xl">
                  <Zap className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('feature.instant.title')}</h3>
                <p className="text-gray-700 dark:text-white/80 leading-relaxed text-base">{t('feature.instant.desc')}</p>
                <div className="mt-4 flex items-center justify-center text-primary-300">
                  <div className="w-8 h-0.5 bg-primary-300 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-effect group hover:scale-105 transition-all duration-300 card-hover border-white/20 min-h-[280px] flex flex-col justify-center">
              <CardContent className="p-8 text-center flex flex-col justify-center h-full">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-xl">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('feature.secure.title')}</h3>
                <p className="text-gray-700 dark:text-white/80 leading-relaxed text-base">{t('feature.secure.desc')}</p>
                <div className="mt-4 flex items-center justify-center text-secondary-300">
                  <div className="w-8 h-0.5 bg-secondary-300 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-effect group hover:scale-105 transition-all duration-300 card-hover border-white/20 min-h-[280px] flex flex-col justify-center">
              <CardContent className="p-8 text-center flex flex-col justify-center h-full">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-xl">
                  <Trophy className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('feature.premium.title')}</h3>
                <p className="text-gray-700 dark:text-white/80 leading-relaxed text-base">{t('feature.premium.desc')}</p>
                <div className="mt-4 flex items-center justify-center text-accent-300">
                  <div className="w-8 h-0.5 bg-accent-300 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Stats section */}
          <div className={`mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 ${mounted ? 'fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-2">500+</div>
              <div className="text-white/80 font-medium">{t('stats.courts')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-2">10K+</div>
              <div className="text-white/80 font-medium">{t('stats.users')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-2">50K+</div>
              <div className="text-white/80 font-medium">{t('stats.bookings')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-2">4.9⭐</div>
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