/**
 * ALERT OBSERVER PATTERN
 *
 * Integración del patrón Observer con el sistema de alertas analíticas
 *
 * Propósito:
 * - Monitorear métricas en tiempo real
 * - Detectar cuando se cruzan umbrales configurados
 * - Notificar a través de múltiples canales (Email, Push, SMS, In-App)
 * - Mantener historial de alertas disparadas
 * - Implementar cooldown para evitar spam de notificaciones
 *
 * Uso:
 * ```typescript
 * const { monitorMetric, getActiveAlerts, subscribeToAlerts } = useAlertObserver()
 *
 * // Monitorear una métrica
 * monitorMetric('occupancyRate', 85, alerts)
 *
 * // Suscribirse a alertas específicas
 * subscribeToAlerts('CRITICAL', (trigger) => {
 *   console.log('Critical alert triggered:', trigger)
 * })
 * ```
 */

'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import {
  Alert,
  AlertTrigger,
  AlertSeverity,
  AlertCondition,
} from '@/lib/analytics/types'
import { useNotification, NotificationType } from './notification-observer'
import { emailService } from '@/lib/email/email-service'

// ============================================================================
// INTERFACES
// ============================================================================

interface AlertObserverContextType {
  // Alert monitoring
  monitorMetric: (metricId: string, value: number, alerts: Alert[]) => AlertTrigger[]

  // Alert history
  triggeredAlerts: AlertTrigger[]
  getActiveAlerts: () => AlertTrigger[]
  clearAlertHistory: () => void

  // Subscriptions
  subscribeToAlerts: (
    severity?: AlertSeverity,
    callback?: (trigger: AlertTrigger) => void
  ) => () => void

  // Statistics
  getAlertStats: () => {
    total: number
    bySeverity: Record<AlertSeverity, number>
    last24Hours: number
    emailsSent: number
  }
}

interface AlertSubscriber {
  id: string
  severity?: AlertSeverity
  callback: (trigger: AlertTrigger) => void
}

// ============================================================================
// CONTEXT
// ============================================================================

const AlertObserverContext = createContext<AlertObserverContextType | undefined>(undefined)

// ============================================================================
// PROVIDER
// ============================================================================

export function AlertObserverProvider({ children }: { children: React.ReactNode }) {
  const [triggeredAlerts, setTriggeredAlerts] = useState<AlertTrigger[]>([])
  const [subscribers, setSubscribers] = useState<AlertSubscriber[]>([])
  const { notify, notifyError, notifyWarning } = useNotification()

  /**
   * Check if an alert condition is met
   */
  const checkCondition = useCallback((
    value: number,
    condition: AlertCondition,
    threshold: number | [number, number]
  ): boolean => {
    switch (condition) {
      case '>':
        return typeof threshold === 'number' && value > threshold
      case '<':
        return typeof threshold === 'number' && value < threshold
      case '=':
        return typeof threshold === 'number' && value === threshold
      case '>=':
        return typeof threshold === 'number' && value >= threshold
      case '<=':
        return typeof threshold === 'number' && value <= threshold
      case 'between':
        if (Array.isArray(threshold)) {
          return value >= threshold[0] && value <= threshold[1]
        }
        return false
      default:
        return false
    }
  }, [])

  /**
   * Check if an alert is in cooldown period
   */
  const isInCooldown = useCallback((alert: Alert): boolean => {
    if (!alert.lastTriggered || alert.cooldownMinutes === 0) {
      return false
    }

    const cooldownMs = alert.cooldownMinutes * 60 * 1000
    const timeSinceLastTrigger = Date.now() - new Date(alert.lastTriggered).getTime()

    return timeSinceLastTrigger < cooldownMs
  }, [])

  /**
   * Generate alert message
   */
  const generateAlertMessage = useCallback((
    alert: Alert,
    value: number
  ): string => {
    const conditionText = {
      '>': 'ha superado',
      '<': 'ha caído por debajo de',
      '=': 'es igual a',
      '>=': 'es mayor o igual a',
      '<=': 'es menor o igual a',
      'between': 'está entre'
    }[alert.condition] || 'cumple la condición'

    const thresholdText = Array.isArray(alert.threshold)
      ? `${alert.threshold[0]} y ${alert.threshold[1]}`
      : alert.threshold.toString()

    return `La métrica "${alert.metricName}" ${conditionText} el umbral de ${thresholdText}. Valor actual: ${value.toLocaleString('es-ES')}`
  }, [])

  /**
   * Notify subscribers about a triggered alert
   */
  const notifySubscribers = useCallback((trigger: AlertTrigger) => {
    subscribers.forEach(subscriber => {
      if (!subscriber.severity || subscriber.severity === trigger.alert.severity) {
        try {
          subscriber.callback(trigger)
        } catch (error) {
          console.error('Error in alert subscriber:', error)
        }
      }
    })
  }, [subscribers])

  /**
   * Send notifications through configured channels
   */
  const sendNotifications = useCallback(async (trigger: AlertTrigger) => {
    const { alert, message } = trigger
    let emailSent = false
    let emailError: string | undefined

    // In-App notification using toast
    if (alert.channels.includes('IN_APP')) {
      const notificationType = {
        CRITICAL: NotificationType.ERROR,
        HIGH: NotificationType.ERROR,
        MEDIUM: NotificationType.WARNING,
        LOW: NotificationType.INFO,
      }[alert.severity] || NotificationType.INFO

      notify({
        type: notificationType,
        title: `🚨 ${alert.name}`,
        description: message,
        action: {
          label: 'Ver Dashboard',
          onClick: () => {
            window.location.href = '/admin/dashboard'
          }
        }
      })
    }

    // Email notification
    if (alert.channels.includes('EMAIL') && alert.emailConfig?.enabled) {
      try {
        const result = await emailService.sendAlertEmail(trigger, alert.emailConfig)
        emailSent = result.success
        emailError = result.error

        if (result.success) {
          console.log('✅ Alert email sent successfully')
        } else {
          console.error('❌ Failed to send alert email:', result.error)
          notifyError(
            'Error al enviar email',
            `No se pudo enviar el email de alerta: ${result.error}`
          )
        }
      } catch (error) {
        emailError = error instanceof Error ? error.message : 'Unknown error'
        console.error('❌ Error sending alert email:', error)
      }
    }

    // Push notification (would integrate with service worker)
    if (alert.channels.includes('PUSH')) {
      // TODO: Implement push notifications
      console.log('🔔 Push notification:', message)
    }

    // SMS notification (would integrate with SMS service)
    if (alert.channels.includes('SMS')) {
      // TODO: Implement SMS notifications
      console.log('📱 SMS notification:', message)
    }

    // Update trigger with email status
    return { ...trigger, emailSent, emailError }
  }, [notify, notifyError])

  /**
   * Main function to monitor a metric against configured alerts
   */
  const monitorMetric = useCallback((
    metricId: string,
    value: number,
    alerts: Alert[]
  ): AlertTrigger[] => {
    const triggeredAlertList: AlertTrigger[] = []

    // Filter alerts for this metric that are active
    const relevantAlerts = alerts.filter(
      alert => alert.metricId === metricId && alert.active
    )

    relevantAlerts.forEach(alert => {
      // Skip if in cooldown
      if (isInCooldown(alert)) {
        return
      }

      // Check if condition is met
      const conditionMet = checkCondition(value, alert.condition, alert.threshold)

      if (conditionMet) {
        const message = generateAlertMessage(alert, value)

        const trigger: AlertTrigger = {
          alertId: alert.id,
          alert,
          triggeredAt: new Date(),
          value,
          previousValue: alert.lastValue,
          message,
        }

        triggeredAlertList.push(trigger)

        // Update alert's last triggered time
        alert.lastTriggered = new Date()
        alert.lastValue = value

        // Add to history
        setTriggeredAlerts(prev => [...prev, trigger])

        // Notify subscribers
        notifySubscribers(trigger)

        // Send notifications through channels
        sendNotifications(trigger).then(updatedTrigger => {
          // Update trigger in history with email status
          setTriggeredAlerts(prev =>
            prev.map(t => t.alertId === updatedTrigger.alertId ? updatedTrigger : t)
          )
        })

        // Log for analytics
        console.log('🚨 Alert triggered:', {
          alert: alert.name,
          metric: alert.metricName,
          value,
          threshold: alert.threshold,
          severity: alert.severity,
        })
      }
    })

    return triggeredAlertList
  }, [checkCondition, isInCooldown, generateAlertMessage, notifySubscribers, sendNotifications])

  /**
   * Get currently active (not resolved) alerts
   */
  const getActiveAlerts = useCallback((): AlertTrigger[] => {
    // For now, return all alerts from last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return triggeredAlerts.filter(
      trigger => new Date(trigger.triggeredAt) > twentyFourHoursAgo
    )
  }, [triggeredAlerts])

  /**
   * Clear alert history
   */
  const clearAlertHistory = useCallback(() => {
    setTriggeredAlerts([])
  }, [])

  /**
   * Subscribe to alert triggers
   */
  const subscribeToAlerts = useCallback((
    severity?: AlertSeverity,
    callback?: (trigger: AlertTrigger) => void
  ) => {
    const subscriberId = `alert-subscriber-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const subscriber: AlertSubscriber = {
      id: subscriberId,
      severity,
      callback: callback || ((trigger) => {
        console.log('Alert triggered:', trigger)
      })
    }

    setSubscribers(prev => [...prev, subscriber])

    // Return unsubscribe function
    return () => {
      setSubscribers(prev => prev.filter(sub => sub.id !== subscriberId))
    }
  }, [])

  /**
   * Get alert statistics
   */
  const getAlertStats = useCallback(() => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const last24Hours = triggeredAlerts.filter(
      trigger => new Date(trigger.triggeredAt) > twentyFourHoursAgo
    )

    const bySeverity: Record<AlertSeverity, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    }

    triggeredAlerts.forEach(trigger => {
      bySeverity[trigger.alert.severity]++
    })

    const emailsSent = triggeredAlerts.filter(trigger => trigger.emailSent).length

    return {
      total: triggeredAlerts.length,
      bySeverity,
      last24Hours: last24Hours.length,
      emailsSent,
    }
  }, [triggeredAlerts])

  // Clean up old alerts (keep last 1000)
  useEffect(() => {
    if (triggeredAlerts.length > 1000) {
      setTriggeredAlerts(prev => prev.slice(-1000))
    }
  }, [triggeredAlerts])

  const value: AlertObserverContextType = {
    monitorMetric,
    triggeredAlerts,
    getActiveAlerts,
    clearAlertHistory,
    subscribeToAlerts,
    getAlertStats,
  }

  return (
    <AlertObserverContext.Provider value={value}>
      {children}
    </AlertObserverContext.Provider>
  )
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to use the alert observer system
 */
export function useAlertObserver() {
  const context = useContext(AlertObserverContext)
  if (!context) {
    throw new Error('useAlertObserver debe usarse dentro de AlertObserverProvider')
  }
  return context
}

/**
 * Hook to automatically monitor a metric
 */
export function useMetricMonitor(
  metricId: string,
  value: number | undefined,
  alerts: Alert[],
  enabled = true
) {
  const { monitorMetric } = useAlertObserver()

  useEffect(() => {
    if (enabled && value !== undefined) {
      monitorMetric(metricId, value, alerts)
    }
  }, [metricId, value, alerts, enabled, monitorMetric])
}

/**
 * Hook to subscribe to critical alerts
 */
export function useCriticalAlertMonitor(
  callback: (trigger: AlertTrigger) => void
) {
  const { subscribeToAlerts } = useAlertObserver()

  useEffect(() => {
    const unsubscribe = subscribeToAlerts('CRITICAL', callback)
    return unsubscribe
  }, [callback, subscribeToAlerts])
}

/**
 * Hook to get alert statistics with auto-refresh
 */
export function useAlertStats(refreshInterval?: number) {
  const { getAlertStats } = useAlertObserver()
  const [stats, setStats] = useState(getAlertStats())

  useEffect(() => {
    if (refreshInterval) {
      const interval = setInterval(() => {
        setStats(getAlertStats())
      }, refreshInterval)

      return () => clearInterval(interval)
    } else {
      setStats(getAlertStats())
    }
  }, [refreshInterval, getAlertStats])

  return stats
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Evaluate a single alert against a value
 */
export function evaluateAlert(alert: Alert, value: number): boolean {
  switch (alert.condition) {
    case '>':
      return typeof alert.threshold === 'number' && value > alert.threshold
    case '<':
      return typeof alert.threshold === 'number' && value < alert.threshold
    case '=':
      return typeof alert.threshold === 'number' && value === alert.threshold
    case '>=':
      return typeof alert.threshold === 'number' && value >= alert.threshold
    case '<=':
      return typeof alert.threshold === 'number' && value <= alert.threshold
    case 'between':
      if (Array.isArray(alert.threshold)) {
        return value >= alert.threshold[0] && value <= alert.threshold[1]
      }
      return false
    default:
      return false
  }
}

/**
 * Get severity color for UI display
 */
export function getSeverityColor(severity: AlertSeverity): string {
  const colors: Record<AlertSeverity, string> = {
    LOW: '#10b981',      // green
    MEDIUM: '#f59e0b',   // yellow
    HIGH: '#ef4444',     // red
    CRITICAL: '#dc2626', // dark red
  }
  return colors[severity]
}

/**
 * Get severity icon
 */
export function getSeverityIcon(severity: AlertSeverity): string {
  const icons: Record<AlertSeverity, string> = {
    LOW: '✅',
    MEDIUM: '⚠️',
    HIGH: '🚨',
    CRITICAL: '🔴',
  }
  return icons[severity]
}

/**
 * Format threshold for display
 */
export function formatThreshold(threshold: number | [number, number]): string {
  if (Array.isArray(threshold)) {
    return `${threshold[0].toLocaleString('es-ES')} - ${threshold[1].toLocaleString('es-ES')}`
  }
  return threshold.toLocaleString('es-ES')
}

/**
 * Get condition text in Spanish
 */
export function getConditionText(condition: AlertCondition): string {
  const texts: Record<AlertCondition, string> = {
    '>': 'Mayor que',
    '<': 'Menor que',
    '=': 'Igual a',
    '>=': 'Mayor o igual que',
    '<=': 'Menor o igual que',
    'between': 'Entre',
  }
  return texts[condition]
}
