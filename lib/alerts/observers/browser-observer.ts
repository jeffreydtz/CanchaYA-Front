/**
 * BROWSER OBSERVER
 * Observer concreto que maneja notificaciones del navegador (Web Notifications API)
 */

import { IAlertObserver, Alert, AlertDeliveryResult, AlertChannel } from '../types'

/**
 * Observer para notificaciones del navegador
 * Usa la Web Notifications API
 */
export class BrowserObserver implements IAlertObserver {
  readonly id = 'browser-observer'
  readonly channels = [AlertChannel.BROWSER]

  /**
   * Verifica si puede manejar esta alerta
   */
  canHandle(alert: Alert): boolean {
    // Verificar que el canal BROWSER esté incluido
    if (!alert.channels.includes(AlertChannel.BROWSER)) {
      return false
    }

    // Browser notifications solo funcionan en el navegador
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.log(`[BrowserObserver] Alert ${alert.id} cannot be shown (not supported)`)
      return false
    }

    // Verificar permisos
    if (Notification.permission !== 'granted') {
      console.log(`[BrowserObserver] Alert ${alert.id} cannot be shown (permission not granted)`)
      return false
    }

    return true
  }

  /**
   * Notifica la alerta via browser notification
   */
  async notify(alert: Alert): Promise<AlertDeliveryResult> {
    console.log(`[BrowserObserver] Processing alert ${alert.id} (${alert.type})`)

    try {
      const notification = new Notification(alert.title, {
        body: alert.message,
        icon: this.getIconForSeverity(alert.severity),
        badge: '/favicon.ico',
        tag: alert.id,
        requireInteraction: alert.severity === 'critical',
        silent: false,
        data: {
          alertId: alert.id,
          type: alert.type,
          actionUrl: alert.metadata?.actionUrl
        }
      })

      // Manejar click en la notificación
      notification.onclick = (event) => {
        event.preventDefault()

        // Enfocar la ventana
        window.focus()

        // Navegar a la URL de acción si existe
        if (alert.metadata?.actionUrl) {
          window.location.href = alert.metadata.actionUrl
        }

        notification.close()
      }

      // Auto-cerrar notificaciones no críticas
      if (alert.severity !== 'critical') {
        setTimeout(() => {
          notification.close()
        }, this.getDurationForSeverity(alert.severity))
      }

      console.log(`[BrowserObserver] Browser notification displayed successfully`)

      return {
        channel: AlertChannel.BROWSER,
        success: true,
        sentAt: new Date(),
        metadata: {
          severity: alert.severity,
          hasAction: !!alert.metadata?.actionUrl,
          requireInteraction: alert.severity === 'critical'
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[BrowserObserver] Error showing notification:`, errorMessage)

      return {
        channel: AlertChannel.BROWSER,
        success: false,
        error: errorMessage
      }
    }
  }

  /**
   * Solicita permiso para mostrar notificaciones
   */
  static async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied'
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      console.log(`[BrowserObserver] Permission request result: ${permission}`)
      return permission
    }

    return Notification.permission
  }

  /**
   * Verifica si las notificaciones están soportadas
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window
  }

  /**
   * Obtiene el estado del permiso
   */
  static getPermission(): NotificationPermission {
    if (!BrowserObserver.isSupported()) {
      return 'denied'
    }
    return Notification.permission
  }

  /**
   * Obtiene el icono según severidad
   */
  private getIconForSeverity(severity: string): string {
    switch (severity) {
      case 'critical':
      case 'error':
        return '/icons/alert-error.png'
      case 'warning':
        return '/icons/alert-warning.png'
      case 'success':
        return '/icons/alert-success.png'
      case 'info':
      default:
        return '/icons/alert-info.png'
    }
  }

  /**
   * Obtiene la duración según severidad
   */
  private getDurationForSeverity(severity: string): number {
    switch (severity) {
      case 'critical':
        return 0 // No auto-cerrar
      case 'error':
        return 10000 // 10 segundos
      case 'warning':
        return 7000 // 7 segundos
      case 'success':
      case 'info':
      default:
        return 5000 // 5 segundos
    }
  }
}
