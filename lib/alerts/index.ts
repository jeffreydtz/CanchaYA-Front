/**
 * ALERT SYSTEM - Main Entry Point
 * Sistema de alertas con patrón Observer
 *
 * Exporta todas las clases, tipos e interfaces necesarias
 * y proporciona helpers para facilitar el uso del sistema
 */

// Types
export * from './types'

// Alert Subject (Observable)
export { AlertSubject, getAlertSubject, resetAlertSubject } from './alert-subject'

// Observers (Concrete Observers)
export { EmailObserver } from './observers/email-observer'
export { PushObserver } from './observers/push-observer'
export { InAppObserver } from './observers/in-app-observer'
export { BrowserObserver } from './observers/browser-observer'

// Services
export { EmailService, createEmailService } from './services/email-service'

// Helpers y utilidades
import { getAlertSubject } from './alert-subject'
import { EmailObserver } from './observers/email-observer'
import { PushObserver } from './observers/push-observer'
import { InAppObserver } from './observers/in-app-observer'
import { BrowserObserver } from './observers/browser-observer'
import {
  AlertType,
  AlertSeverity,
  AlertChannel,
  AlertRecipient,
  AlertMetadata,
  Alert,
  AlertDeliveryResult
} from './types'

/**
 * Inicializa el sistema de alertas con observers por defecto
 */
export function initAlertSystem(options?: {
  enableEmail?: boolean
  enablePush?: boolean
  enableInApp?: boolean
  enableBrowser?: boolean
}): void {
  const {
    enableEmail = true,
    enablePush = false,
    enableInApp = true,
    enableBrowser = true
  } = options || {}

  const alertSubject = getAlertSubject()

  // Registrar observers según configuración
  if (enableEmail) {
    try {
      const emailObserver = new EmailObserver()
      alertSubject.attach(emailObserver)
      console.log('[AlertSystem] Email observer attached')
    } catch (error) {
      console.error('[AlertSystem] Failed to attach email observer:', error)
    }
  }

  if (enablePush) {
    try {
      const pushObserver = new PushObserver()
      alertSubject.attach(pushObserver)
      console.log('[AlertSystem] Push observer attached')
    } catch (error) {
      console.error('[AlertSystem] Failed to attach push observer:', error)
    }
  }

  if (enableInApp) {
    try {
      const inAppObserver = new InAppObserver()
      alertSubject.attach(inAppObserver)
      console.log('[AlertSystem] In-app observer attached')
    } catch (error) {
      console.error('[AlertSystem] Failed to attach in-app observer:', error)
    }
  }

  if (enableBrowser) {
    try {
      const browserObserver = new BrowserObserver()
      alertSubject.attach(browserObserver)
      console.log('[AlertSystem] Browser observer attached')
    } catch (error) {
      console.error('[AlertSystem] Failed to attach browser observer:', error)
    }
  }

  console.log('[AlertSystem] Initialized with', alertSubject.getObservers().length, 'observers')
}

/**
 * Helper para enviar alertas de forma simple
 */
export async function sendAlert(params: {
  type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  recipients: AlertRecipient[]
  channels?: AlertChannel[]
  metadata?: AlertMetadata
}): Promise<{ alert: Alert; results: AlertDeliveryResult[] }> {
  const alertSubject = getAlertSubject()

  const channels = params.channels || [AlertChannel.IN_APP, AlertChannel.EMAIL]

  return alertSubject.createAndNotify({
    type: params.type,
    severity: params.severity,
    title: params.title,
    message: params.message,
    recipients: params.recipients,
    channels,
    metadata: params.metadata
  })
}

/**
 * Helpers para tipos específicos de alertas
 */
export const AlertHelpers = {
  /**
   * Alerta de reserva confirmada
   */
  async reservationConfirmed(params: {
    userId: string
    email: string
    courtName: string
    date: string
    time: string
    price?: number
    reservationId: string
    actionUrl?: string
  }): Promise<{ alert: Alert; results: AlertDeliveryResult[] }> {
    return sendAlert({
      type: AlertType.RESERVATION_CONFIRMED,
      severity: AlertSeverity.SUCCESS,
      title: '¡Reserva Confirmada!',
      message: `Tu reserva en ${params.courtName} para el ${params.date} a las ${params.time} ha sido confirmada.`,
      recipients: [{ userId: params.userId, email: params.email }],
      channels: [AlertChannel.EMAIL, AlertChannel.IN_APP, AlertChannel.PUSH],
      metadata: {
        reservationId: params.reservationId,
        courtName: params.courtName,
        date: params.date,
        time: params.time,
        price: params.price,
        actionUrl: params.actionUrl || `/reservas/${params.reservationId}`
      }
    })
  },

  /**
   * Alerta de reserva cancelada
   */
  async reservationCancelled(params: {
    userId: string
    email: string
    courtName: string
    date: string
    time: string
    reason?: string
    reservationId: string
  }): Promise<{ alert: Alert; results: AlertDeliveryResult[] }> {
    const message = params.reason
      ? `Tu reserva en ${params.courtName} para el ${params.date} a las ${params.time} ha sido cancelada. Razón: ${params.reason}`
      : `Tu reserva en ${params.courtName} para el ${params.date} a las ${params.time} ha sido cancelada.`

    return sendAlert({
      type: AlertType.RESERVATION_CANCELLED,
      severity: AlertSeverity.WARNING,
      title: 'Reserva Cancelada',
      message,
      recipients: [{ userId: params.userId, email: params.email }],
      channels: [AlertChannel.EMAIL, AlertChannel.IN_APP],
      metadata: {
        reservationId: params.reservationId,
        courtName: params.courtName,
        date: params.date,
        time: params.time
      }
    })
  },

  /**
   * Recordatorio de reserva
   */
  async reservationReminder(params: {
    userId: string
    email: string
    pushToken?: string
    courtName: string
    date: string
    time: string
    reservationId: string
    hoursBeforeEvent: number
  }): Promise<{ alert: Alert; results: AlertDeliveryResult[] }> {
    return sendAlert({
      type: AlertType.RESERVATION_REMINDER,
      severity: AlertSeverity.INFO,
      title: 'Recordatorio de Reserva',
      message: `Recordatorio: Tienes una reserva en ${params.courtName} ${params.hoursBeforeEvent > 1 ? `en ${params.hoursBeforeEvent} horas` : 'muy pronto'}. ${params.date} a las ${params.time}.`,
      recipients: [{
        userId: params.userId,
        email: params.email,
        pushToken: params.pushToken
      }],
      channels: [AlertChannel.IN_APP, AlertChannel.PUSH, AlertChannel.BROWSER],
      metadata: {
        reservationId: params.reservationId,
        courtName: params.courtName,
        date: params.date,
        time: params.time,
        actionUrl: `/reservas/${params.reservationId}`
      }
    })
  },

  /**
   * Alerta de pago confirmado
   */
  async paymentConfirmed(params: {
    userId: string
    email: string
    amount: number
    reservationId: string
    paymentMethod: string
  }): Promise<{ alert: Alert; results: AlertDeliveryResult[] }> {
    return sendAlert({
      type: AlertType.PAYMENT_CONFIRMED,
      severity: AlertSeverity.SUCCESS,
      title: 'Pago Confirmado',
      message: `Tu pago de $${params.amount} ha sido confirmado. Método de pago: ${params.paymentMethod}.`,
      recipients: [{ userId: params.userId, email: params.email }],
      channels: [AlertChannel.EMAIL, AlertChannel.IN_APP],
      metadata: {
        reservationId: params.reservationId,
        amount: params.amount,
        paymentMethod: params.paymentMethod,
        actionUrl: `/reservas/${params.reservationId}`
      }
    })
  },

  /**
   * Alerta de slot liberado
   */
  async slotReleased(params: {
    userIds: string[]
    emails: string[]
    courtName: string
    date: string
    time: string
    courtId: string
  }): Promise<{ alert: Alert; results: AlertDeliveryResult[] }> {
    const recipients = params.userIds.map((userId, index) => ({
      userId,
      email: params.emails[index]
    }))

    return sendAlert({
      type: AlertType.SLOT_RELEASED,
      severity: AlertSeverity.INFO,
      title: '¡Horario Disponible!',
      message: `Se ha liberado un horario en ${params.courtName} para el ${params.date} a las ${params.time}. ¡Reserva ahora!`,
      recipients,
      channels: [AlertChannel.EMAIL, AlertChannel.PUSH, AlertChannel.IN_APP],
      metadata: {
        courtId: params.courtId,
        courtName: params.courtName,
        date: params.date,
        time: params.time,
        actionUrl: `/reservar/${params.courtId}?date=${params.date}&time=${params.time}`
      }
    })
  },

  /**
   * Alerta de desafío creado
   */
  async challengeCreated(params: {
    userId: string
    email: string
    challengerTeamName: string
    challengeId: string
  }): Promise<{ alert: Alert; results: AlertDeliveryResult[] }> {
    return sendAlert({
      type: AlertType.CHALLENGE_CREATED,
      severity: AlertSeverity.INFO,
      title: '¡Nuevo Desafío Recibido!',
      message: `El equipo ${params.challengerTeamName} te ha desafiado a un partido.`,
      recipients: [{ userId: params.userId, email: params.email }],
      channels: [AlertChannel.EMAIL, AlertChannel.PUSH, AlertChannel.IN_APP],
      metadata: {
        challengeId: params.challengeId,
        actionUrl: `/desafios/${params.challengeId}`
      }
    })
  }
}
