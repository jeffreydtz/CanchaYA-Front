/**
 * Court Detail Page for CanchaYA
 * Individual court view with reservation booking functionality
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar } from '@/components/ui/calendar'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { 
  MapPin, 
  Clock, 
  Star, 
  Phone, 
  Mail, 
  DollarSign,
  Calendar as CalendarIcon,
  ChevronLeft,
  Users,
  Wifi,
  Car,
  Coffee,
  Zap,
  Shield,
  Heart,
  Share2,
  Camera,
  CheckCircle
} from 'lucide-react'
import apiClient, { Cancha } from '@/lib/api-client'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import Navbar from '@/components/navbar/navbar'
import { useAuth } from '@/components/auth/auth-context'

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', 
  '20:00', '21:00', '22:00'
]

const amenities = [
  { icon: Wifi, label: 'WiFi Gratis', available: true },
  { icon: Car, label: 'Estacionamiento', available: true },
  { icon: Coffee, label: 'Cafetería', available: false },
  { icon: Zap, label: 'Iluminación LED', available: true },
  { icon: Users, label: 'Vestuarios', available: true },
  { icon: Shield, label: 'Seguridad 24/7', available: false },
]

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-10 w-10 rounded" />
        <Skeleton className="h-8 w-48" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CanchaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [cancha, setCancha] = useState<Cancha | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [reserving, setReserving] = useState(false)
  
  const canchaId = params.id as string

  useEffect(() => {
    const fetchCancha = async () => {
      if (!canchaId) return
      
      setLoading(true)
      try {
        const response = await apiClient.getCanchaById(canchaId)
        if (response.data) {
          setCancha(response.data)
        } else {
          toast.error('Cancha no encontrada')
          router.push('/buscar')
        }
      } catch (error) {
        console.error('Error fetching cancha:', error)
        toast.error('Error al cargar la cancha')
        router.push('/buscar')
      } finally {
        setLoading(false)
      }
    }
    
    fetchCancha()
  }, [canchaId, router])

  const handleReservation = async () => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para hacer una reserva')
      router.push('/login')
      return
    }
    
    if (!selectedTime) {
      toast.error('Selecciona un horario')
      return
    }
    
    setReserving(true)
    try {
      // Note: debt validation would be handled by backend during reservation creation
      // For now, we'll proceed with reservation and let backend handle debt validation
      
      const response = await apiClient.createReserva({
        canchaId: canchaId,
        usuarioId: '', // Se manejará en el backend con el token
        fecha: selectedDate.toISOString().split('T')[0],
        hora: selectedTime
      })
      
      if (response.data) {
        toast.success('¡Reserva creada exitosamente! Recuerda confirmarla 2 horas antes del partido.')
        router.push('/mis-reservas')
      } else {
        toast.error(response.error || 'Error al crear la reserva')
      }
    } catch (error) {
      console.error('Error creating reservation:', error)
      toast.error('Error al crear la reserva')
    } finally {
      setReserving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
        <Navbar />
        <div className="container mx-auto px-4">
          <LoadingSkeleton />
        </div>
      </div>
    )
  }

  if (!cancha) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
        <Navbar />
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-semibold mb-4">Cancha no encontrada</h2>
              <Link href="/buscar">
                <Button>Volver a búsqueda</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed bottom-6 right-6 z-50">
        <ThemeToggle />
      </div>
      
      {/* Hero Section with Overlay */}
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <Image
          src="/cancha.jpeg"
          alt={cancha.nombre}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        
        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container mx-auto px-4 pb-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-4 mb-6">
              <Link href="/buscar">
                <Button variant="ghost" size="sm" className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Link href="/buscar" className="hover:text-white">Búsqueda</Link>
                <span>/</span>
                <span className="font-semibold text-white">{cancha.nombre}</span>
              </div>
            </div>
            
            {/* Title and Actions */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge className="bg-primary/90 backdrop-blur-sm text-white border-white/20 px-3 py-1">
                    {cancha.deporte?.nombre}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-blue-400 fill-current" />
                    <Star className="h-4 w-4 text-blue-400 fill-current" />
                    <Star className="h-4 w-4 text-blue-400 fill-current" />
                    <Star className="h-4 w-4 text-blue-400 fill-current" />
                    <Star className="h-4 w-4 text-blue-400/50" />
                    <span className="text-white/90 text-sm ml-1">4.5 (128)</span>
                  </div>
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-black text-white">
                  {cancha.nombre}
                </h1>
                
                <div className="flex items-center gap-6 text-white/90">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span className="font-medium">{cancha.club?.nombre}</span>
                  </div>
                  {cancha.precioPorHora && (
                    <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-green-400/30">
                      <DollarSign className="h-5 w-5 text-green-400" />
                      <span className="font-bold text-green-400 text-lg">${cancha.precioPorHora}/hora</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30">
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30">
                  <Camera className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Court Details Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Detalles de la Cancha
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200/50 dark:border-blue-700/30">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-blue-900 dark:text-blue-100">Ubicación</h3>
                          <p className="text-blue-700 dark:text-blue-200 text-sm mt-1">
                            {cancha.ubicacion}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200/50 dark:border-green-700/30">
                        <div className="p-2 bg-green-500 rounded-lg">
                          <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-green-900 dark:text-green-100">Horarios</h3>
                          <p className="text-green-700 dark:text-green-200 text-sm mt-1">
                            Lunes a Domingo: 8:00 - 22:00
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {cancha.club?.telefono && (
                        <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200/50 dark:border-purple-700/30">
                          <div className="p-2 bg-purple-500 rounded-lg">
                            <Phone className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-purple-900 dark:text-purple-100">Teléfono</h3>
                            <p className="text-purple-700 dark:text-purple-200 text-sm mt-1">
                              {cancha.club.telefono}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {cancha.club?.email && (
                        <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200/50 dark:border-orange-700/30">
                          <div className="p-2 bg-orange-500 rounded-lg">
                            <Mail className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-orange-900 dark:text-orange-100">Email</h3>
                            <p className="text-orange-700 dark:text-orange-200 text-sm mt-1">
                              {cancha.club.email}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  Servicios y Comodidades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                        amenity.available
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700/50 dark:text-green-200 hover:shadow-md'
                          : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 text-gray-500 dark:from-gray-800/20 dark:to-gray-700/20 dark:border-gray-600/50 dark:text-gray-400'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        amenity.available ? 'bg-green-500' : 'bg-gray-400'
                      }`}>
                        <amenity.icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium">{amenity.label}</span>
                      {amenity.available && (
                        <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Reservation */}
          <div className="space-y-6">
            <Card className="sticky top-24 bg-white/90 backdrop-blur-sm border-white/20 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarIcon className="h-6 w-6" />
                  Hacer Reserva
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {/* Date Selection */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200/50 dark:border-blue-700/30">
                  <h4 className="font-semibold mb-3 text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Selecciona una fecha
                  </h4>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    disabled={(date) => date < new Date()}
                    className="rounded-lg border border-blue-200/50 bg-white dark:bg-gray-800/50 backdrop-blur-sm"
                  />
                </div>

                {/* Time Selection */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200/50 dark:border-green-700/30">
                  <h4 className="font-semibold mb-3 text-green-900 dark:text-green-100 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Horarios disponibles
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? 'default' : 'outline'}
                        size="sm"
                        className={`text-xs font-medium transition-all duration-200 ${
                          selectedTime === time 
                            ? 'bg-primary text-white shadow-md scale-105' 
                            : 'hover:bg-green-100 hover:border-green-300 hover:text-green-800 dark:hover:bg-green-900/20'
                        }`}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Price Summary */}
                {cancha.precioPorHora && selectedTime && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-xl border border-amber-200/50 dark:border-amber-700/30">
                    <h4 className="font-semibold mb-3 text-amber-900 dark:text-amber-100 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Resumen del precio
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-amber-800 dark:text-amber-200">
                        <span>Precio por hora:</span>
                        <span className="font-semibold">${cancha.precioPorHora}</span>
                      </div>
                      <div className="flex justify-between items-center text-amber-800 dark:text-amber-200">
                        <span>Duración:</span>
                        <span className="font-semibold">1 hora</span>
                      </div>
                      <Separator className="bg-blue-200 dark:bg-blue-700" />
                      <div className="flex justify-between items-center font-bold text-lg text-amber-900 dark:text-amber-100">
                        <span>Total:</span>
                        <span className="text-2xl">${cancha.precioPorHora}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reserve Button */}
                <Button 
                  onClick={handleReservation}
                  disabled={!selectedTime || reserving}
                  className="w-full h-14 font-bold text-lg bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  size="lg"
                >
                  {reserving ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Procesando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      Reservar Ahora
                    </div>
                  )}
                </Button>

                {!isAuthenticated && (
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/30">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <Link href="/login" className="font-semibold text-primary hover:underline flex items-center justify-center gap-1">
                        <Users className="h-4 w-4" />
                        Inicia sesión
                      </Link>
                      para hacer una reserva
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}