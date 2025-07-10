"use client"

/**
 * Notification Provider for CanchaYA
 * Manages real-time notifications using SSE and Context API
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/components/auth/auth-context'
import { 
  NotificationData, 
  NotificationContextType, 
  NotificationManager,
  getNotifications,
  markNotificationAsRead,
  clearNotification,
  requestNotificationPermission,
  showBrowserNotification
} from '@/lib/notifications'
import { toast } from '@/hooks/use-toast'

const NotificationContext = createContext<NotificationContextType | null>(null)

interface NotificationProviderProps {
  children: React.ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user, token } = useAuth()
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [notificationManager, setNotificationManager] = useState<NotificationManager | null>(null)

  // Initialize notification manager when user logs in
  useEffect(() => {
    if (user && token) {
      const manager = new NotificationManager(user.id, token)
      setNotificationManager(manager)

      // Load existing notifications
      loadNotifications()

      // Request browser notification permission
      requestNotificationPermission().then(permission => {
        if (permission === 'granted') {
          console.log('✅ Browser notifications enabled')
        } else {
          console.log('ℹ️ Browser notifications disabled')
        }
      })

      return () => {
        manager.disconnect()
      }
    } else {
      // User logged out, clean up
      if (notificationManager) {
        notificationManager.disconnect()
        setNotificationManager(null)
      }
      setNotifications([])
      setIsConnected(false)
    }
  }, [user, token])

  // Connect to SSE stream
  useEffect(() => {
    if (notificationManager && user && token) {
      const handleNewNotification = (notification: NotificationData) => {
        setNotifications(prev => {
          // Avoid duplicates
          const exists = prev.some(n => n.id === notification.id)
          if (exists) return prev
          
          return [notification, ...prev].slice(0, 50) // Keep only last 50 notifications
        })

        // Show browser notification
        showBrowserNotification(notification)

        // Show toast notification
        showToastNotification(notification)
      }

      notificationManager.addListener(handleNewNotification)

      // Connect to SSE
      notificationManager.connect().then(connected => {
        setIsConnected(connected)
        if (connected) {
          console.log('🔔 Real-time notifications connected')
        }
      })

      return () => {
        notificationManager.removeListener(handleNewNotification)
      }
    }
  }, [notificationManager, user, token])

  const loadNotifications = async () => {
    if (!token) return

    try {
      const fetchedNotifications = await getNotifications(token)
      setNotifications(fetchedNotifications)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!token) return

    const success = await markNotificationAsRead(notificationId, token)
    if (success) {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      )
    }
  }, [token])

  const markAllAsRead = useCallback(async () => {
    if (!token) return

    // Mark all unread notifications as read
    const unreadNotifications = notifications.filter(n => !n.read)
    const promises = unreadNotifications.map(n => markNotificationAsRead(n.id, token))
    
    await Promise.all(promises)
    
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }, [notifications, token])

  const clearNotificationById = useCallback(async (notificationId: string) => {
    if (!token) return

    const success = await clearNotification(notificationId, token)
    if (success) {
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      )
    }
  }, [token])

  const clearAllNotifications = useCallback(async () => {
    if (!token) return

    const promises = notifications.map(n => clearNotification(n.id, token))
    await Promise.all(promises)
    
    setNotifications([])
  }, [notifications, token])

  const showToastNotification = (notification: NotificationData) => {
    const variant = notification.priority === 'high' ? 'destructive' : 'default'
    
    toast({
      title: notification.title,
      description: notification.message,
      variant,
      duration: notification.priority === 'low' ? 3000 : 5000,
    })
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotification: clearNotificationById,
    clearAllNotifications,
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// Hook for showing custom notifications
export function useNotificationActions() {
  const { user, token } = useAuth()

  const showCustomNotification = useCallback((
    title: string, 
    message: string, 
    priority: 'low' | 'medium' | 'high' = 'medium'
  ) => {
    const notification: NotificationData = {
      id: Date.now().toString(),
      type: 'REMINDER',
      title,
      message,
      userId: user?.id,
      timestamp: new Date().toISOString(),
      read: false,
      priority,
    }

    showBrowserNotification(notification)
    
    toast({
      title: notification.title,
      description: notification.message,
      variant: priority === 'high' ? 'destructive' : 'default',
      duration: priority === 'low' ? 3000 : 5000,
    })
  }, [user])

  return { showCustomNotification }
} 