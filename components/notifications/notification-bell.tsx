"use client"

/**
 * Notification Bell Component for CanchaYA
 * Displays notification icon with unread count and dropdown panel
 */

import React, { useState } from 'react'
import { Bell, Check, CheckCheck, Trash2, X, Clock, AlertCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useNotifications } from './notification-provider'
import { NotificationData } from '@/lib/notifications'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const { 
    notifications, 
    unreadCount, 
    isConnected, 
    markAsRead, 
    markAllAsRead, 
    clearNotification,
    clearAllNotifications 
  } = useNotifications()
  
  const [isOpen, setIsOpen] = useState(false)

  const getNotificationIcon = (type: NotificationData['type']) => {
    switch (type) {
      case 'RESERVATION_CONFIRMED':
        return <Check className="h-4 w-4 text-green-600" />
      case 'RESERVATION_CANCELLED':
        return <X className="h-4 w-4 text-red-600" />
      case 'SLOT_RELEASED':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'PAYMENT_CONFIRMED':
        return <CheckCheck className="h-4 w-4 text-green-600" />
      case 'REMINDER':
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      default:
        return <Info className="h-4 w-4 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: NotificationData['priority']) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50'
      case 'medium': return 'border-blue-200 bg-blue-50'
      case 'low': return 'border-gray-200 bg-gray-50'
      default: return 'border-gray-200 bg-white'
    }
  }

  const handleNotificationClick = async (notification: NotificationData) => {
    if (!notification.read) {
      await markAsRead(notification.id)
    }
    
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank')
    }
  }

  const recentNotifications = notifications.slice(0, 10)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} no leídas)` : ''}`}
        >
          <Bell className={cn(
            "h-5 w-5 transition-colors",
            isConnected ? "text-foreground" : "text-muted-foreground"
          )} />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          
          {/* Connection indicator */}
          <div className={cn(
            "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background",
            isConnected ? "bg-green-500" : "bg-gray-400"
          )} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 max-h-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  markAllAsRead()
                }}
                className="h-6 px-2 text-xs"
              >
                Marcar todas
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  clearAllNotifications()
                }}
                className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {recentNotifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay notificaciones</p>
          </div>
        ) : (
          <ScrollArea className="h-full max-h-80">
            {recentNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex flex-col items-start gap-2 p-3 cursor-pointer border-l-4",
                  !notification.read && "bg-muted/50",
                  getPriorityColor(notification.priority)
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-2 w-full">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={cn(
                        "text-sm font-medium truncate",
                        !notification.read && "font-semibold"
                      )}>
                        {notification.title}
                      </h4>
                      
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            clearNotification(notification.id)
                          }}
                          className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {notification.message}
                    </p>
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(notification.timestamp), {
                        addSuffix: true,
                        locale: es
                      })}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}

        {notifications.length > 10 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center justify-center text-sm text-muted-foreground">
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 h-auto text-xs"
                onClick={() => window.location.href = '/notificaciones'}
              >
                Ver todas las notificaciones
              </Button>
            </DropdownMenuItem>
          </>
        )}

        {/* Connection status */}
        <DropdownMenuSeparator />
        <div className="px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-green-500" : "bg-gray-400"
          )} />
          {isConnected ? 'Conectado' : 'Desconectado'}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 