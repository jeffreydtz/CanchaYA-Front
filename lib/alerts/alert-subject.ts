/**
 * ALERT SUBJECT (Observable)
 * Implementación del patrón Observer para el sistema de alertas
 *
 * Este es el Subject que mantiene la lista de observers y notifica cuando hay cambios
 */

import {
  Alert,
  IAlertObserver,
  AlertChannel,
  AlertDeliveryResult,
  AlertStatus,
  AlertType,
  AlertSeverity,
  AlertRecipient,
  AlertMetadata
} from './types'

/**
 * Subject del patrón Observer
 * Gestiona los observers y la distribución de alertas
 */
export class AlertSubject {
  private observers: Map<string, IAlertObserver> = new Map()
  private alerts: Map<string, Alert> = new Map()
  private deliveryHistory: Map<string, AlertDeliveryResult[]> = new Map()

  /**
   * Registra un nuevo observer
   * @param observer - El observer a registrar
   */
  attach(observer: IAlertObserver): void {
    if (this.observers.has(observer.id)) {
      throw new Error(`Observer with id ${observer.id} already exists`)
    }
    this.observers.set(observer.id, observer)
    console.log(`[AlertSubject] Observer ${observer.id} attached. Channels: ${observer.channels.join(', ')}`)
  }

  /**
   * Desregistra un observer
   * @param observerId - ID del observer a desregistrar
   */
  detach(observerId: string): boolean {
    const result = this.observers.delete(observerId)
    if (result) {
      console.log(`[AlertSubject] Observer ${observerId} detached`)
    }
    return result
  }

  /**
   * Obtiene un observer por ID
   * @param observerId - ID del observer
   */
  getObserver(observerId: string): IAlertObserver | undefined {
    return this.observers.get(observerId)
  }

  /**
   * Obtiene todos los observers registrados
   */
  getObservers(): IAlertObserver[] {
    return Array.from(this.observers.values())
  }

  /**
   * Obtiene observers para canales específicos
   * @param channels - Canales a filtrar
   */
  getObserversByChannels(channels: AlertChannel[]): IAlertObserver[] {
    return this.getObservers().filter(observer =>
      observer.channels.some(channel => channels.includes(channel))
    )
  }

  /**
   * Notifica a todos los observers relevantes sobre una nueva alerta
   * @param alert - La alerta a distribuir
   */
  async notify(alert: Alert): Promise<AlertDeliveryResult[]> {
    console.log(`[AlertSubject] Notifying alert ${alert.id} (${alert.type}) to observers`)

    // Actualizar estado de la alerta
    alert.status = AlertStatus.SENDING
    this.alerts.set(alert.id, alert)

    const results: AlertDeliveryResult[] = []
    const relevantObservers = this.getObserversByChannels(alert.channels)

    console.log(`[AlertSubject] Found ${relevantObservers.length} relevant observers for channels: ${alert.channels.join(', ')}`)

    // Notificar a cada observer en paralelo
    const promises = relevantObservers
      .filter(observer => observer.canHandle(alert))
      .map(async observer => {
        try {
          console.log(`[AlertSubject] Notifying observer ${observer.id}`)
          const result = await observer.notify(alert)
          results.push(result)
          return result
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          console.error(`[AlertSubject] Error notifying observer ${observer.id}:`, errorMessage)

          // Registrar fallo para cada canal del observer
          observer.channels.forEach(channel => {
            if (alert.channels.includes(channel)) {
              results.push({
                channel,
                success: false,
                error: errorMessage
              })
            }
          })
        }
      })

    await Promise.all(promises)

    // Guardar historial de entrega
    this.deliveryHistory.set(alert.id, results)

    // Actualizar estado de la alerta basado en resultados
    const allFailed = results.every(r => !r.success)
    const allSucceeded = results.every(r => r.success)

    if (allFailed) {
      alert.status = AlertStatus.FAILED
    } else if (allSucceeded) {
      alert.status = AlertStatus.SENT
      alert.sentAt = new Date()
    } else {
      // Parcialmente exitoso
      alert.status = AlertStatus.SENT
      alert.sentAt = new Date()
    }

    this.alerts.set(alert.id, alert)

    console.log(`[AlertSubject] Alert ${alert.id} processed. Success: ${results.filter(r => r.success).length}/${results.length}`)

    return results
  }

  /**
   * Crea y notifica una nueva alerta
   * @param params - Parámetros de la alerta
   */
  async createAndNotify(params: {
    type: AlertType
    severity: AlertSeverity
    title: string
    message: string
    recipients: AlertRecipient[]
    channels: AlertChannel[]
    metadata?: AlertMetadata
    scheduledFor?: Date
  }): Promise<{ alert: Alert; results: AlertDeliveryResult[] }> {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type: params.type,
      severity: params.severity,
      title: params.title,
      message: params.message,
      recipients: params.recipients,
      channels: params.channels,
      metadata: params.metadata,
      timestamp: new Date(),
      scheduledFor: params.scheduledFor,
      status: params.scheduledFor ? AlertStatus.SCHEDULED : AlertStatus.PENDING,
      retryCount: 0
    }

    this.alerts.set(alert.id, alert)

    // Si está programada para el futuro, no enviar ahora
    if (params.scheduledFor && params.scheduledFor > new Date()) {
      console.log(`[AlertSubject] Alert ${alert.id} scheduled for ${params.scheduledFor.toISOString()}`)
      return { alert, results: [] }
    }

    // Enviar inmediatamente
    const results = await this.notify(alert)

    return { alert, results }
  }

  /**
   * Obtiene una alerta por ID
   * @param alertId - ID de la alerta
   */
  getAlert(alertId: string): Alert | undefined {
    return this.alerts.get(alertId)
  }

  /**
   * Obtiene todas las alertas
   */
  getAllAlerts(): Alert[] {
    return Array.from(this.alerts.values())
  }

  /**
   * Obtiene el historial de entrega de una alerta
   * @param alertId - ID de la alerta
   */
  getDeliveryHistory(alertId: string): AlertDeliveryResult[] | undefined {
    return this.deliveryHistory.get(alertId)
  }

  /**
   * Reintenta enviar una alerta fallida
   * @param alertId - ID de la alerta a reintentar
   */
  async retry(alertId: string): Promise<AlertDeliveryResult[]> {
    const alert = this.alerts.get(alertId)

    if (!alert) {
      throw new Error(`Alert ${alertId} not found`)
    }

    if (alert.status === AlertStatus.SENT) {
      throw new Error(`Alert ${alertId} was already sent successfully`)
    }

    alert.retryCount = (alert.retryCount || 0) + 1
    console.log(`[AlertSubject] Retrying alert ${alertId} (attempt ${alert.retryCount})`)

    return this.notify(alert)
  }

  /**
   * Cancela una alerta programada
   * @param alertId - ID de la alerta a cancelar
   */
  cancel(alertId: string): boolean {
    const alert = this.alerts.get(alertId)

    if (!alert) {
      return false
    }

    if (alert.status === AlertStatus.SENT || alert.status === AlertStatus.DELIVERED) {
      throw new Error(`Cannot cancel alert ${alertId} - already sent/delivered`)
    }

    alert.status = AlertStatus.CANCELLED
    this.alerts.set(alertId, alert)

    console.log(`[AlertSubject] Alert ${alertId} cancelled`)
    return true
  }

  /**
   * Limpia alertas antiguas del historial
   * @param olderThan - Fecha límite (alertas anteriores serán eliminadas)
   */
  cleanHistory(olderThan: Date): number {
    let removed = 0

    for (const [id, alert] of this.alerts.entries()) {
      if (alert.timestamp < olderThan) {
        this.alerts.delete(id)
        this.deliveryHistory.delete(id)
        removed++
      }
    }

    console.log(`[AlertSubject] Cleaned ${removed} old alerts`)
    return removed
  }

  /**
   * Obtiene estadísticas del sistema de alertas
   */
  getStats(): {
    totalAlerts: number
    totalObservers: number
    byStatus: Record<AlertStatus, number>
    byType: Record<AlertType, number>
    bySeverity: Record<AlertSeverity, number>
  } {
    const alerts = this.getAllAlerts()

    const byStatus: Record<string, number> = {}
    const byType: Record<string, number> = {}
    const bySeverity: Record<string, number> = {}

    alerts.forEach(alert => {
      byStatus[alert.status] = (byStatus[alert.status] || 0) + 1
      byType[alert.type] = (byType[alert.type] || 0) + 1
      bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1
    })

    return {
      totalAlerts: alerts.length,
      totalObservers: this.observers.size,
      byStatus: byStatus as Record<AlertStatus, number>,
      byType: byType as Record<AlertType, number>,
      bySeverity: bySeverity as Record<AlertSeverity, number>
    }
  }
}

// Singleton instance
let alertSubject: AlertSubject | null = null

/**
 * Obtiene la instancia singleton del AlertSubject
 */
export function getAlertSubject(): AlertSubject {
  if (!alertSubject) {
    alertSubject = new AlertSubject()
  }
  return alertSubject
}

/**
 * Resetea el singleton (útil para testing)
 */
export function resetAlertSubject(): void {
  alertSubject = null
}
