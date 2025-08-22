/**
 * Notifications Page for CanchaYA
 * Notification management and subscription settings
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Bell, 
  BellOff, 
  Calendar, 
  Trophy, 
  MessageCircle,
  AlertTriangle,
  Info,
  Check,
  X,
  Clock,
  Mail,
  Smartphone,
  Settings
} from 'lucide-react'
import apiClient, { NotificationLog, NotificationSubscription } from '@/lib/api-client'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Navbar from '@/components/navbar/navbar'
import { useAuth } from '@/components/auth/auth-context'
import Link from 'next/link'

interface NotificationItem {
  id: string
  tipo: string
  titulo: string
  mensaje: string
  prioridad: string
  fechaCreacion: string
  leido: boolean
}

interface NotificationSettings {
  id: string
  activo: boolean
  emailReservas: boolean
  emailDesafios: boolean
  emailSistema: boolean
  pushReservas: boolean
  pushDesafios: boolean
  fechaActualizacion: string
}

function NotificationList() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Mock notifications data since API endpoint may not exist yet
        const response = { data: [] }
        if (response.data) {
          setNotifications(response.data)
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
        toast.error('Error al cargar notificaciones')
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const markAsRead = async (id: string) => {
    try {
      // Mock marking as read
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, leido: true } : notif
        )
      )
      toast.success('Marcada como leída')
    } catch (error) {
      toast.error('Error al marcar como leída')
    }
  }

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'RESERVA':
        return Calendar
      case 'DESAFIO':
        return Trophy
      case 'SISTEMA':
        return Bell
      case 'RECORDATORIO':
        return Clock
      default:
        return Info
    }
  }

  const getNotificationColor = (tipo: string, prioridad: string) => {
    if (prioridad === 'ALTA') return 'text-red-600 bg-red-50 dark:bg-red-900/20'
    
    switch (tipo) {
      case 'RESERVA':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
      case 'DESAFIO':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
      case 'SISTEMA':
        return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
          </CardTitle>
          <Badge variant="secondary">
            {notifications.filter(n => !n.leido).length} sin leer
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No tienes notificaciones</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.tipo)
              const colorClasses = getNotificationColor(notification.tipo, notification.prioridad)
              
              return (
                <div 
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-all hover:shadow-md ${
                    notification.leido 
                      ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700' 
                      : 'bg-white dark:bg-gray-800 border-primary/20 shadow-sm'
                  }`}
                >
                  <div className={`p-3 rounded-full ${colorClasses}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className={`font-semibold ${
                        notification.leido ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                      }`}>
                        {notification.titulo}
                      </h4>
                      {!notification.leido && (
                        <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                    
                    <p className={`text-sm ${
                      notification.leido ? 'text-gray-500' : 'text-gray-600 dark:text-gray-300'
                    }`}>
                      {notification.mensaje}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <Badge variant={notification.prioridad === 'ALTA' ? 'destructive' : 'secondary'} className="text-xs">
                          {notification.prioridad}
                        </Badge>
                        <span>{new Date(notification.fechaCreacion).toLocaleString()}</span>
                      </div>
                      
                      {!notification.leido && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Marcar como leída
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function NotificationSettingsComponent() {
  const [subscription, setSubscription] = useState<NotificationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        // Mock subscription data
        const response = { 
          data: {
            id: '1',
            activo: true,
            emailReservas: true,
            emailDesafios: true,
            emailSistema: false,
            pushReservas: true,
            pushDesafios: false,
            fechaActualizacion: new Date().toISOString()
          }
        }
        if (response.data) {
          setSubscription(response.data)
        }
      } catch (error) {
        console.error('Error fetching subscription:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [])

  const updateSubscription = async (updates: Partial<NotificationSettings>) => {
    if (!subscription) return
    
    setUpdating(true)
    try {
      // Mock updating subscription
      const updatedSubscription = {
        ...subscription,
        ...updates,
        fechaActualizacion: new Date().toISOString()
      }
      
      setSubscription(updatedSubscription)
      toast.success('Configuración actualizada')
    } catch (error) {
      toast.error('Error al actualizar configuración')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración de Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuración de Notificaciones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Notifications */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Notificaciones por Email
          </h3>
          
          <div className="space-y-4 pl-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-reservas">Reservas</Label>
                <p className="text-sm text-muted-foreground">
                  Confirmaciones, recordatorios y cambios en tus reservas
                </p>
              </div>
              <Switch
                id="email-reservas"
                checked={subscription?.emailReservas || false}
                onCheckedChange={(checked) => updateSubscription({ emailReservas: checked })}
                disabled={updating}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-desafios">Desafíos</Label>
                <p className="text-sm text-muted-foreground">
                  Invitaciones de equipos y resultados de partidos
                </p>
              </div>
              <Switch
                id="email-desafios"
                checked={subscription?.emailDesafios || false}
                onCheckedChange={(checked) => updateSubscription({ emailDesafios: checked })}
                disabled={updating}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-sistema">Sistema</Label>
                <p className="text-sm text-muted-foreground">
                  Actualizaciones importantes y comunicados
                </p>
              </div>
              <Switch
                id="email-sistema"
                checked={subscription?.emailSistema || false}
                onCheckedChange={(checked) => updateSubscription({ emailSistema: checked })}
                disabled={updating}
              />
            </div>
          </div>
        </div>

        {/* Push Notifications */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Notificaciones Push
          </h3>
          
          <div className="space-y-4 pl-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-reservas">Reservas</Label>
                <p className="text-sm text-muted-foreground">
                  Notificaciones instantáneas en tiempo real
                </p>
              </div>
              <Switch
                id="push-reservas"
                checked={subscription?.pushReservas || false}
                onCheckedChange={(checked) => updateSubscription({ pushReservas: checked })}
                disabled={updating}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-desafios">Desafíos</Label>
                <p className="text-sm text-muted-foreground">
                  Alertas de desafíos y partidos competitivos
                </p>
              </div>
              <Switch
                id="push-desafios"
                checked={subscription?.pushDesafios || false}
                onCheckedChange={(checked) => updateSubscription({ pushDesafios: checked })}
                disabled={updating}
              />
            </div>
          </div>
        </div>

        {/* Global Settings */}
        <div className="space-y-4 border-t pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="all-notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Todas las notificaciones
              </Label>
              <p className="text-sm text-muted-foreground">
                Desactivar todas las notificaciones del sistema
              </p>
            </div>
            <Switch
              id="all-notifications"
              checked={subscription?.activo || false}
              onCheckedChange={(checked) => updateSubscription({ activo: checked })}
              disabled={updating}
            />
          </div>
        </div>

        {subscription && (
          <div className="text-xs text-gray-500 pt-4 border-t">
            Última actualización: {new Date(subscription.fechaActualizacion).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Bell className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Inicia sesión para ver notificaciones</h2>
            <p className="text-gray-600 mb-4">
              Necesitas estar autenticado para acceder a tus notificaciones
            </p>
            <Link href="/login">
              <Button>Iniciar Sesión</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-8">
      <Navbar />
      
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed bottom-6 right-6 z-50">
        <ThemeToggle />
      </div>
      
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            Notificaciones
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Gestiona tus notificaciones y preferencias de comunicación
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notifications List */}
          <div className="lg:col-span-2">
            <NotificationList />
          </div>

          {/* Settings Panel */}
          <div>
            <NotificationSettingsComponent />
          </div>
        </div>
      </div>
    </div>
  )
}