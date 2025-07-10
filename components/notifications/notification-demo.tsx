"use client"

/**
 * Notification Demo Component for CanchaYA
 * Development tool to test notification functionality with mock data
 */

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Bell, Zap, AlertTriangle, Info } from 'lucide-react'
import { useNotifications } from './notification-provider'
import { NotificationData, showBrowserNotification } from '@/lib/notifications'

interface NotificationDemoProps {
  className?: string
}

export function NotificationDemo({ className }: NotificationDemoProps) {
  const { showCustomNotification } = useNotifications()
  const [selectedType, setSelectedType] = useState<'high' | 'medium' | 'low'>('medium')

  // Mock notification templates
  const mockNotifications: Omit<NotificationData, 'id' | 'timestamp' | 'read' | 'userId'>[] = [
    {
      type: 'RESERVATION_CONFIRMED',
      title: '¡Reserva confirmada!',
      message: 'Tu reserva para la Cancha de Fútbol 5 "El Fortín" el 25/12/2024 a las 20:00 ha sido confirmada.',
      priority: 'high',
      actionUrl: '/mis-reservas',
      courtId: '1',
      reservationId: 'res-123'
    },
    {
      type: 'SLOT_RELEASED',
      title: 'Horario disponible',
      message: 'Se liberó un horario en "Estadio Central" para el 26/12/2024 a las 18:00. ¡Reserva ahora!',
      priority: 'medium',
      actionUrl: '/cancha/2',
      courtId: '2'
    },
    {
      type: 'RESERVATION_CANCELLED',
      title: 'Reserva cancelada',
      message: 'Tu reserva para "Club Atlético" del 24/12/2024 ha sido cancelada. Se te reintegrará el pago.',
      priority: 'high',
      courtId: '3',
      reservationId: 'res-124'
    },
    {
      type: 'REMINDER',
      title: 'Recordatorio de reserva',
      message: 'Tu partido es en 2 horas. No olvides confirmar tu asistencia para mantener la reserva.',
      priority: 'medium',
      actionUrl: '/mis-reservas',
      reservationId: 'res-125'
    },
    {
      type: 'PAYMENT_CONFIRMED',
      title: 'Pago procesado',
      message: 'Se procesó exitosamente el pago de $15.000 por tu reserva. ¡Nos vemos en la cancha!',
      priority: 'low',
      reservationId: 'res-126'
    }
  ]

  const handleTestNotification = (notificationTemplate: typeof mockNotifications[0]) => {
    const notification: NotificationData = {
      ...notificationTemplate,
      id: `demo-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
      userId: 'demo-user'
    }

    // Show browser notification
    showBrowserNotification(notification)
    
    // Show toast notification
    showCustomNotification(
      notification.title,
      notification.message,
      notification.priority
    )
  }

  const handleCustomNotification = () => {
    const titles = {
      high: '¡Atención urgente!',
      medium: 'Nueva actualización',
      low: 'Información'
    }

    const messages = {
      high: 'Acción requerida inmediatamente. Tu reserva expira en 5 minutos.',
      medium: 'Hay actualizaciones disponibles en tu cuenta.',
      low: 'Gracias por usar CanchaYA. ¡Que tengas un gran partido!'
    }

    showCustomNotification(
      titles[selectedType],
      messages[selectedType],
      selectedType
    )
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'medium': return <Bell className="h-4 w-4 text-blue-600" />
      case 'low': return <Info className="h-4 w-4 text-gray-600" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Demo de Notificaciones
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Herramienta de desarrollo para probar el sistema de notificaciones en tiempo real.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Test Section */}
          <div>
            <h3 className="font-medium mb-3">Notificación personalizada</h3>
            <div className="flex items-center gap-3">
              <Select value={selectedType} onValueChange={(value) => setSelectedType(value as 'high' | 'medium' | 'low')}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3 text-red-600" />
                      Alta prioridad
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <Bell className="h-3 w-3 text-blue-600" />
                      Media prioridad
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <Info className="h-3 w-3 text-gray-600" />
                      Baja prioridad
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={handleCustomNotification}>
                <Zap className="h-4 w-4 mr-2" />
                Probar notificación
              </Button>
            </div>
          </div>

          {/* Template Tests */}
          <div>
            <h3 className="font-medium mb-3">Notificaciones predefinidas</h3>
            <div className="grid gap-3">
              {mockNotifications.map((notification, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-0.5">
                      {getPriorityIcon(notification.priority)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPriorityColor(notification.priority)}`}
                        >
                          {notification.priority === 'high' && 'Alta'}
                          {notification.priority === 'medium' && 'Media'}
                          {notification.priority === 'low' && 'Baja'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleTestNotification(notification)}
                    size="sm"
                    variant="outline"
                  >
                    Probar
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Instrucciones:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Las notificaciones aparecerán como toast en la esquina superior derecha</li>
              <li>• Si tienes permisos de navegador habilitados, también verás notificaciones nativas</li>
              <li>• El ícono de campana en la barra de navegación mostrará el contador de notificaciones</li>
              <li>• En producción, las notificaciones se reciben automáticamente vía SSE desde el backend</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 