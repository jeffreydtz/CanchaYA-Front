/**
 * Hero Section Component for CanchaYA Dashboard
 * Main landing section with personalized content and search
 */

'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Calendar, Star } from 'lucide-react'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Reserva tu cancha deportiva
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Encuentra y reserva las mejores canchas de fútbol, tenis, paddle y más
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/cancha/1">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                <MapPin className="mr-2 h-5 w-5" />
                Ver Canchas
              </Button>
            </Link>
            <Link href="/mis-reservas">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-black hover:bg-white hover:text-blue-600">
                <Calendar className="mr-2 h-5 w-5" />
                Mis Reservas
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <MapPin className="h-8 w-8 mx-auto mb-3 text-blue-200" />
                <h3 className="text-lg font-semibold mb-2">Múltiples Deportes</h3>
                <p className="text-blue-100">Fútbol, tenis, paddle y más</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-3 text-blue-200" />
                <h3 className="text-lg font-semibold mb-2">Reserva Fácil</h3>
                <p className="text-blue-100">En pocos clics desde tu celular</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 mx-auto mb-3 text-blue-200" />
                <h3 className="text-lg font-semibold mb-2">Mejores Precios</h3>
                <p className="text-blue-100">Ofertas exclusivas para usuarios</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
