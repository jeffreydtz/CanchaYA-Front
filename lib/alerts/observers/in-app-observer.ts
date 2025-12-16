/**
 * IN-APP OBSERVER
 * Observer concreto que maneja notificaciones in-app (toast, banners)
 */

import { IAlertObserver, Alert, AlertDeliveryResult, AlertChannel } from '../types'
import { toast } from 'sonner'

/**
 * Observer para notificaciones dentro de la aplicación
 * Usa Sonner para mostrar toasts
 */
export class InAppObserver implements IAlertObserver {
  readonly id = 'in-app-observer'
  readonly channels = [AlertChannel.IN_APP]

  /**
   * Verifica si puede manejar esta alerta
   */
  canHandle(alert: Alert): boolean {
    // Verificar que el canal IN_APP esté incluido
    if (!alert.channels.includes(AlertChannel.IN_APP)) {
      return false
    }

    // In-app notifications solo funcionan en el navegador
    if (typeof window === 'undefined') {
      console.log(`[InAppObserver] Alert ${alert.id} cannot be shown (not in browser)`)
      return false
    }

    return true
  }

  /**
   * Notifica la alerta in-app
   */
  async notify(alert: Alert): Promise<AlertDeliveryResult> {
    console.log(`[InAppObserver] Processing alert ${alert.id} (${alert.type})`)

    try {
      // Configuración del toast
      const toastOptions = {
        description: alert.message,
        duration: this.getDurationForSeverity(alert.severity),
        action: alert.metadata?.actionUrl ? {
          label: 'Ver',
          onClick: () => {
            if (alert.metadata?.actionUrl) {
              window.location.href = alert.metadata.actionUrl
            }
          }
        } : undefined
      }

      // Mostrar toast según severidad
      switch (alert.severity) {
        case 'success':
          toast.success(alert.title, toastOptions)
          break
        case 'error':
        case 'critical':
          toast.error(alert.title, toastOptions)
          break
        case 'warning':
          toast.warning(alert.title, toastOptions)
          break
        case 'info':
        default:
          toast.info(alert.title, toastOptions)
          break
      }

      console.log(`[InAppObserver] Toast displayed successfully`)

      return {
        channel: AlertChannel.IN_APP,
        success: true,
        sentAt: new Date(),
        metadata: {
          severity: alert.severity,
          hasAction: !!alert.metadata?.actionUrl
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[InAppObserver] Error showing toast:`, errorMessage)

      return {
        channel: AlertChannel.IN_APP,
        success: false,
        error: errorMessage
      }
    }
  }

  /**
   * Obtiene la duración del toast según severidad
   */
  private getDurationForSeverity(severity: string): number {
    switch (severity) {
      case 'critical':
        return 10000 // 10 segundos
      case 'error':
        return 7000 // 7 segundos
      case 'warning':
        return 5000 // 5 segundos
      case 'success':
      case 'info':
      default:
        return 4000 // 4 segundos
    }
  }
}
