/**
 * OBSERVER PATTERN - Notification System
 * 
 * Patrón de Diseño: Observer Pattern (implementado con React Context API)
 * 
 * Propósito:
 * - Centralizar el manejo de notificaciones en la aplicación
 * - Permitir que múltiples componentes "observen" y reaccionen a notificaciones
 * - Desacoplar la lógica de notificación de los componentes individuales
 * - Mantener un historial de notificaciones para debugging y analytics
 * 
 * Ventajas:
 * 1. Desacoplamiento: Los componentes no necesitan conocer la implementación de notificaciones
 * 2. Extensibilidad: Fácil agregar nuevos tipos de notificaciones o observers
 * 3. Centralización: Un solo punto de control para todas las notificaciones
 * 4. Trazabilidad: Historial completo de notificaciones para debugging
 * 
 * Uso:
 * ```typescript
 * const { notify, notifySuccess, notifyError } = useNotification()
 * 
 * notifySuccess('Reserva creada exitosamente')
 * notifyError('Error al cargar datos', { action: 'Reintentar' })
 * ```
 */

'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'

/**
 * Tipos de notificaciones soportadas
 */
export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  LOADING = 'loading'
}

/**
 * Interfaz para una notificación
 */
export interface Notification {
  id: string
  type: NotificationType
  title: string
  description?: string
  timestamp: Date
  action?: {
    label: string
    onClick: () => void
  }
  duration?: number
}

/**
 * Interfaz para observers (suscriptores)
 */
interface NotificationObserver {
  id: string
  callback: (notification: Notification) => void
}

/**
 * Contexto de notificaciones
 */
interface NotificationContextType {
  notifications: Notification[]
  notify: (notification: Omit<Notification, 'id' | 'timestamp'>) => string
  notifySuccess: (title: string, description?: string) => string
  notifyError: (title: string, description?: string, action?: Notification['action']) => string
  notifyWarning: (title: string, description?: string) => string
  notifyInfo: (title: string, description?: string) => string
  notifyLoading: (title: string, description?: string) => string
  dismissNotification: (id: string) => void
  clearAll: () => void
  subscribe: (callback: (notification: Notification) => void) => () => void
  getHistory: () => Notification[]
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

/**
 * Provider del sistema de notificaciones
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [observers, setObservers] = useState<NotificationObserver[]>([])

  /**
   * Notifica a todos los observers
   */
  const notifyObservers = useCallback((notification: Notification) => {
    observers.forEach(observer => {
      try {
        observer.callback(notification)
      } catch (error) {
        console.error(`[NotificationObserver] Error en observer ${observer.id}:`, error)
      }
    })
  }, [observers])

  /**
   * Función principal para crear notificaciones
   */
  const notify = useCallback((
    notification: Omit<Notification, 'id' | 'timestamp'>
  ): string => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const fullNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date()
    }

    // Agregar al historial
    setNotifications(prev => [...prev, fullNotification])

    // Notificar a observers
    notifyObservers(fullNotification)

    // Mostrar toast usando sonner
    const toastOptions = {
      description: notification.description,
      duration: notification.duration || 4000,
      action: notification.action ? {
        label: notification.action.label,
        onClick: notification.action.onClick
      } : undefined
    }

    switch (notification.type) {
      case NotificationType.SUCCESS:
        toast.success(notification.title, toastOptions)
        break
      case NotificationType.ERROR:
        toast.error(notification.title, toastOptions)
        break
      case NotificationType.WARNING:
        toast.warning(notification.title, toastOptions)
        break
      case NotificationType.INFO:
        toast.info(notification.title, toastOptions)
        break
      case NotificationType.LOADING:
        toast.loading(notification.title, toastOptions)
        break
      default:
        toast(notification.title, toastOptions)
    }

    return id
  }, [notifyObservers])

  /**
   * Helpers para tipos específicos de notificaciones
   */
  const notifySuccess = useCallback((title: string, description?: string) => {
    return notify({ type: NotificationType.SUCCESS, title, description })
  }, [notify])

  const notifyError = useCallback((
    title: string,
    description?: string,
    action?: Notification['action']
  ) => {
    return notify({ type: NotificationType.ERROR, title, description, action })
  }, [notify])

  const notifyWarning = useCallback((title: string, description?: string) => {
    return notify({ type: NotificationType.WARNING, title, description })
  }, [notify])

  const notifyInfo = useCallback((title: string, description?: string) => {
    return notify({ type: NotificationType.INFO, title, description })
  }, [notify])

  const notifyLoading = useCallback((title: string, description?: string) => {
    return notify({ type: NotificationType.LOADING, title, description })
  }, [notify])

  /**
   * Descartar una notificación específica
   */
  const dismissNotification = useCallback((id: string) => {
    toast.dismiss(id)
  }, [])

  /**
   * Limpiar todas las notificaciones
   */
  const clearAll = useCallback(() => {
    toast.dismiss()
    setNotifications([])
  }, [])

  /**
   * Suscribirse a notificaciones (Observer Pattern)
   */
  const subscribe = useCallback((callback: (notification: Notification) => void) => {
    const observerId = `observer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const observer: NotificationObserver = { id: observerId, callback }
    
    setObservers(prev => [...prev, observer])

    // Retornar función de unsubscribe
    return () => {
      setObservers(prev => prev.filter(obs => obs.id !== observerId))
    }
  }, [])

  /**
   * Obtener historial de notificaciones
   */
  const getHistory = useCallback(() => {
    return [...notifications]
  }, [notifications])

  // Limpiar notificaciones antiguas (más de 100)
  useEffect(() => {
    if (notifications.length > 100) {
      setNotifications(prev => prev.slice(-100))
    }
  }, [notifications])

  const value: NotificationContextType = {
    notifications,
    notify,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notifyLoading,
    dismissNotification,
    clearAll,
    subscribe,
    getHistory
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

/**
 * Hook para usar el sistema de notificaciones
 */
export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification debe usarse dentro de NotificationProvider')
  }
  return context
}

/**
 * Hook para suscribirse a notificaciones específicas
 */
export function useNotificationObserver(
  callback: (notification: Notification) => void,
  filter?: (notification: Notification) => boolean
) {
  const { subscribe } = useNotification()

  useEffect(() => {
    const unsubscribe = subscribe((notification) => {
      if (!filter || filter(notification)) {
        callback(notification)
      }
    })

    return unsubscribe
  }, [callback, filter, subscribe])
}

/**
 * Hook para rastrear errores de API
 */
export function useApiErrorTracking() {
  const [apiErrors, setApiErrors] = useState<Notification[]>([])

  useNotificationObserver(
    (notification) => {
      setApiErrors(prev => [...prev, notification])
    },
    (notification) => notification.type === NotificationType.ERROR
  )

  return {
    apiErrors,
    errorCount: apiErrors.length,
    lastError: apiErrors[apiErrors.length - 1]
  }
}

