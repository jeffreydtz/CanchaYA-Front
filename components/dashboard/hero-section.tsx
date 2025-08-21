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

export default function HeroSection() {
  const [mounted, setMounted] = useState(false)

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
              Reserva tu{' '}
              <span className="text-gradient bg-gradient-to-r from-white to-accent-100">
                cancha deportiva
              </span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-white/90 max-w-3xl mx-auto font-light leading-relaxed">
              La plataforma más moderna para encontrar y reservar canchas deportivas.
              <span className="block mt-2 text-white/80">¡Experiencia premium garantizada!</span>
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-6 justify-center mb-16 ${mounted ? 'scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            <Link href="/">
              <Button size="xl" variant="glow" className="group relative overflow-hidden">
                <MapPin className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                Explorar Canchas
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Button>
            </Link>
            <Link href="/mis-reservas">
              <Button size="xl" variant="glass" className="group">
                <Calendar className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                Mis Reservas
              </Button>
            </Link>
          </div>

          {/* Feature cards */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${mounted ? 'fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
            <Card className="glass-effect group hover:scale-105 transition-all duration-300 card-hover border-white/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Reserva Instantánea</h3>
                <p className="text-white/80 leading-relaxed">Confirma tu cancha en menos de 30 segundos con nuestro sistema ultrarrápido</p>
              </CardContent>
            </Card>
            
            <Card className="glass-effect group hover:scale-105 transition-all duration-300 card-hover border-white/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Pago Seguro</h3>
                <p className="text-white/80 leading-relaxed">Tecnología de encriptación bancaria para proteger todas tus transacciones</p>
              </CardContent>
            </Card>
            
            <Card className="glass-effect group hover:scale-105 transition-all duration-300 card-hover border-white/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Canchas Premium</h3>
                <p className="text-white/80 leading-relaxed">Acceso exclusivo a las mejores instalaciones deportivas de la ciudad</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Stats section */}
          <div className={`mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 ${mounted ? 'fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-2">500+</div>
              <div className="text-white/80 font-medium">Canchas Disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-2">10K+</div>
              <div className="text-white/80 font-medium">Usuarios Activos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-2">50K+</div>
              <div className="text-white/80 font-medium">Reservas Realizadas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-2">4.9⭐</div>
              <div className="text-white/80 font-medium">Calificación Promedio</div>
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