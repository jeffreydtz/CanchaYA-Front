/**
 * Real-time Notifications System for CanchaYA
 * Handles SSE connections, notification types, and real-time updates
 */

import { toast } from 'sonner'
import { apiRequest } from './api-client'

export const showSuccess = (message: string) => {
    toast.success(message)
}

export const showError = (message: string) => {
    toast.error(message)
}

export const showInfo = (message: string) => {
    toast.info(message)
}

export const showWarning = (message: string) => {
    toast.warning(message)
}

export interface NotificationData {
    id: string
    type: 'RESERVATION_CONFIRMED' | 'RESERVATION_CANCELLED' | 'SLOT_RELEASED' | 'PAYMENT_CONFIRMED' | 'REMINDER'
    title: string
    message: string
    userId?: string
    courtId?: string
    reservationId?: string
    timestamp: string
    read: boolean
    priority: 'low' | 'medium' | 'high'
    actionUrl?: string
}

export interface NotificationContextType {
    notifications: NotificationData[]
    unreadCount: number
    isConnected: boolean
    markAsRead: (notificationId: string) => void
    markAllAsRead: () => void
    clearNotification: (notificationId: string) => void
    clearAllNotifications: () => void
}

// SSE Connection Manager
export class NotificationManager {
    private eventSource: EventSource | null = null
    private reconnectAttempts = 0
    private maxReconnectAttempts = 5
    private reconnectDelay = 1000
    private listeners: ((notification: NotificationData) => void)[] = []

    constructor(private userId: string, private token: string) { }

    connect(): Promise<boolean> {
        return new Promise((resolve) => {
            try {
                const url = new URL('/notifications/stream', process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000/api')
                url.searchParams.set('userId', this.userId)

                this.eventSource = new EventSource(url.toString(), {
                    withCredentials: true,
                })

                this.eventSource.onopen = () => {
                    console.log('✅ Notification stream connected')
                    this.reconnectAttempts = 0
                    resolve(true)
                }

                this.eventSource.onmessage = (event) => {
                    try {
                        const notification: NotificationData = JSON.parse(event.data)
                        this.notifyListeners(notification)
                    } catch (error) {
                        console.error('Failed to parse notification:', error)
                    }
                }

                this.eventSource.onerror = (error) => {
                    console.error('SSE connection error:', error)
                    this.handleReconnect()
                    resolve(false)
                }

                // Handle specific notification types
                this.eventSource.addEventListener('reservation_confirmed', (event) => {
                    const data = JSON.parse(event.data)
                    this.notifyListeners({
                        ...data,
                        type: 'RESERVATION_CONFIRMED',
                        priority: 'high',
                    })
                })

                this.eventSource.addEventListener('slot_released', (event) => {
                    const data = JSON.parse(event.data)
                    this.notifyListeners({
                        ...data,
                        type: 'SLOT_RELEASED',
                        priority: 'medium',
                    })
                })

                this.eventSource.addEventListener('reminder', (event) => {
                    const data = JSON.parse(event.data)
                    this.notifyListeners({
                        ...data,
                        type: 'REMINDER',
                        priority: 'low',
                    })
                })

            } catch (error) {
                console.error('Failed to establish SSE connection:', error)
                resolve(false)
            }
        })
    }

    disconnect() {
        if (this.eventSource) {
            this.eventSource.close()
            this.eventSource = null
            console.log('🔌 Notification stream disconnected')
        }
    }

    addListener(callback: (notification: NotificationData) => void) {
        this.listeners.push(callback)
    }

    removeListener(callback: (notification: NotificationData) => void) {
        this.listeners = this.listeners.filter(listener => listener !== callback)
    }

    private notifyListeners(notification: NotificationData) {
        this.listeners.forEach(listener => {
            try {
                listener(notification)
            } catch (error) {
                console.error('Notification listener error:', error)
            }
        })
    }

    private handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

            console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

            setTimeout(() => {
                this.connect()
            }, delay)
        } else {
            console.error('❌ Max reconnection attempts reached')
        }
    }

    isConnected(): boolean {
        return this.eventSource?.readyState === EventSource.OPEN
    }
}

// Notification API functions
export async function getNotifications(token: string): Promise<NotificationData[]> {
    try {
        const response = await apiRequest<{ notifications: NotificationData[] }>('/notificaciones', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
        if (response.error) {
            // Don't throw for 404 errors, just return empty array
            if (response.status === 404) {
                return []
            }
            throw new Error(response.error)
        }
        return response.data?.notifications || []
    } catch (error) {
        console.error('Error fetching notifications:', error)
        return []
    }
}

export async function markNotificationAsRead(notificationId: string, token: string): Promise<boolean> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}/read`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })

        return response.ok
    } catch (error) {
        console.error('Error marking notification as read:', error)
        return false
    }
}

export async function clearNotification(notificationId: string, token: string): Promise<boolean> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })

        return response.ok
    } catch (error) {
        console.error('Error clearing notification:', error)
        return false
    }
}

// Browser notification permissions
export function requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
        console.warn('This browser does not support notifications')
        return Promise.resolve('denied')
    }

    return Notification.requestPermission()
}

export function showBrowserNotification(notification: NotificationData) {
    if (Notification.permission === 'granted') {
        const browserNotification = new Notification(notification.title, {
            body: notification.message,
            icon: '/placeholder-logo.png',
            badge: '/placeholder-logo.png',
            tag: notification.id,
            requireInteraction: notification.priority === 'high',
        })

        browserNotification.onclick = () => {
            if (notification.actionUrl) {
                window.open(notification.actionUrl, '_blank')
            }
            browserNotification.close()
        }

        // Auto-close low priority notifications
        if (notification.priority === 'low') {
            setTimeout(() => {
                browserNotification.close()
            }, 5000)
        }
    }
} 