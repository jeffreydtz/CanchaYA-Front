"use client"

/**
 * Notification Provider for CanchaYA
 * Manages real-time notifications using SSE and Context API
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { getNotifications } from '@/lib/notifications'
import { getCookie } from '@/lib/auth'
import { useAuth } from '@/components/auth/auth-context'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  priority: 'low' | 'medium' | 'high'
  read: boolean
  createdAt: string
  data?: Record<string, unknown>
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotification: (id: string) => void
  clearAllNotifications: () => void
  loadNotifications: () => Promise<void>
  showCustomNotification: (title: string, message: string, priority?: 'low' | 'medium' | 'high') => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { isAuthenticated, loading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notificationManager, setNotificationManager] = useState<unknown>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const now = new Date()
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: isNaN(now.getTime()) ? new Date(0).toISOString() : now.toISOString(),
      read: false,
    }
    
    setNotifications(prev => [newNotification, ...prev])
    
    // Show toast for high priority notifications
    if (notification.priority === 'high') {
      toast(notification.title, {
        description: notification.message,
      })
    }
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const loadNotifications = useCallback(async () => {
    try {
      const token = getCookie('token')
      if (!token) {
        console.warn('Token not found, cannot load notifications.')
        return
      }
      const response = await getNotifications(token)
      const notifications = response.map((n: any) => ({
        ...n,
        createdAt: n.createdAt || n.fechaCreacion || n.created_at || '', // fallback for missing field
      }))
      setNotifications(notifications)
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }, [])

  const showCustomNotification = useCallback((title: string, message: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
    addNotification({
      title,
      message,
      type: 'info',
      priority,
    })
  }, [addNotification])

  // Initialize notifications and request permission
  useEffect(() => {
    if (!isAuthenticated || loading) return;
    const initializeNotifications = async () => {
      try {
        // Request notification permission
        // await apiClient.requestNotificationPermission()
        
        // Load existing notifications
        await loadNotifications()
        
        // Initialize real-time notification manager
        if (typeof window !== 'undefined' && window.NotificationManager) {
          const manager = new window.NotificationManager()
          setNotificationManager(manager)
          
          // Connect to real-time stream
          const connected = await manager.connect()
          if (connected) {
            manager.addListener('notification', (data: unknown) => {
              const notificationData = data as {
                title: string
                message: string
                type: string
                priority: string
                data?: Record<string, unknown>
              }
              
              addNotification({
                title: notificationData.title,
                message: notificationData.message,
                type: notificationData.type as 'info' | 'success' | 'warning' | 'error',
                priority: notificationData.priority as 'low' | 'medium' | 'high',
                data: notificationData.data,
              })
            })
          }
        }
      } catch (error) {
        console.error('Error initializing notifications:', error)
      }
    }

    initializeNotifications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, loading, loadNotifications, addNotification])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (notificationManager && typeof notificationManager === 'object' && notificationManager !== null) {
        const manager = notificationManager as { disconnect?: () => void }
        if (manager.disconnect) {
          manager.disconnect()
        }
      }
    }
  }, [notificationManager])

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    loadNotifications,
    showCustomNotification,
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  )
}

// Extend Window interface for NotificationManager
declare global {
  interface Window {
    NotificationManager?: new () => {
      connect: () => Promise<boolean>
      disconnect: () => void
      addListener: (event: string, callback: (data: unknown) => void) => void
      removeListener: (event: string, callback: (data: unknown) => void) => void
    }
  }
} 