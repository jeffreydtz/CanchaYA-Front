/**
 * PUSH OBSERVER
 * Observer concreto que maneja notificaciones push
 */

import { IAlertObserver, Alert, AlertDeliveryResult, AlertChannel } from '../types'

/**
 * Observer para notificaciones push
 * Soporta Firebase Cloud Messaging, OneSignal, y Expo Push
 */
export class PushObserver implements IAlertObserver {
  readonly id = 'push-observer'
  readonly channels = [AlertChannel.PUSH]

  private provider: 'firebase' | 'onesignal' | 'expo'
  private apiKey?: string

  constructor(provider: 'firebase' | 'onesignal' | 'expo' = 'firebase', apiKey?: string) {
    this.provider = provider
    this.apiKey = apiKey || process.env.PUSH_API_KEY
  }

  /**
   * Verifica si puede manejar esta alerta
   */
  canHandle(alert: Alert): boolean {
    // Verificar que haya destinatarios con pushToken
    const hasPushRecipients = alert.recipients.some(r => r.pushToken)

    if (!hasPushRecipients) {
      console.log(`[PushObserver] Alert ${alert.id} has no push recipients`)
      return false
    }

    // Verificar que el canal PUSH esté incluido
    if (!alert.channels.includes(AlertChannel.PUSH)) {
      return false
    }

    return true
  }

  /**
   * Notifica la alerta vía push
   */
  async notify(alert: Alert): Promise<AlertDeliveryResult> {
    console.log(`[PushObserver] Processing alert ${alert.id} with provider ${this.provider}`)

    try {
      // Filtrar destinatarios con pushToken
      const pushRecipients = alert.recipients.filter(r => r.pushToken && r.pushToken.trim() !== '')

      if (pushRecipients.length === 0) {
        throw new Error('No valid push recipients found')
      }

      const tokens = pushRecipients.map(r => r.pushToken!)

      // Preparar payload de notificación
      const notification = {
        title: alert.title,
        body: alert.message,
        data: {
          alertId: alert.id,
          type: alert.type,
          severity: alert.severity,
          ...alert.metadata
        },
        badge: 1,
        sound: this.getSoundForSeverity(alert.severity)
      }

      // Enviar según proveedor
      let result: { success: boolean; messageId?: string; error?: string }

      switch (this.provider) {
        case 'firebase':
          result = await this.sendViaFirebase(tokens, notification)
          break
        case 'onesignal':
          result = await this.sendViaOneSignal(tokens, notification)
          break
        case 'expo':
          result = await this.sendViaExpo(tokens, notification)
          break
        default:
          throw new Error(`Unsupported push provider: ${this.provider}`)
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to send push notification')
      }

      console.log(`[PushObserver] Push sent successfully. Message ID: ${result.messageId}`)

      return {
        channel: AlertChannel.PUSH,
        success: true,
        sentAt: new Date(),
        metadata: {
          messageId: result.messageId,
          recipientCount: pushRecipients.length,
          provider: this.provider
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[PushObserver] Error sending push:`, errorMessage)

      return {
        channel: AlertChannel.PUSH,
        success: false,
        error: errorMessage
      }
    }
  }

  /**
   * Envía via Firebase Cloud Messaging
   */
  private async sendViaFirebase(
    tokens: string[],
    notification: any
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // En producción, usar el Admin SDK de Firebase
      // Esta es una implementación simplificada usando la API REST

      if (!this.apiKey) {
        throw new Error('Firebase API key not configured')
      }

      const url = `https://fcm.googleapis.com/fcm/send`

      const payload = {
        registration_ids: tokens,
        notification: {
          title: notification.title,
          body: notification.body,
          sound: notification.sound,
          badge: notification.badge
        },
        data: notification.data,
        priority: 'high'
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `key=${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Firebase FCM error: ${error}`)
      }

      const result = await response.json()

      console.log('[PushObserver] Firebase response:', result)

      return {
        success: result.success > 0,
        messageId: result.multicast_id?.toString() || `fcm-${Date.now()}`
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  /**
   * Envía via OneSignal
   */
  private async sendViaOneSignal(
    tokens: string[],
    notification: any
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.apiKey) {
        throw new Error('OneSignal API key not configured')
      }

      const appId = process.env.ONESIGNAL_APP_ID

      if (!appId) {
        throw new Error('OneSignal App ID not configured')
      }

      const url = 'https://onesignal.com/api/v1/notifications'

      const payload = {
        app_id: appId,
        include_player_ids: tokens,
        headings: { en: notification.title },
        contents: { en: notification.body },
        data: notification.data,
        ios_badgeType: 'Increase',
        ios_badgeCount: notification.badge
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`OneSignal error: ${JSON.stringify(error)}`)
      }

      const result = await response.json()

      console.log('[PushObserver] OneSignal response:', result)

      return {
        success: result.id !== undefined,
        messageId: result.id || `onesignal-${Date.now()}`
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  /**
   * Envía via Expo Push
   */
  private async sendViaExpo(
    tokens: string[],
    notification: any
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const url = 'https://exp.host/--/api/v2/push/send'

      const messages = tokens.map(token => ({
        to: token,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        badge: notification.badge,
        sound: notification.sound,
        priority: 'high'
      }))

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Accept-Encoding': 'gzip, deflate'
        },
        body: JSON.stringify(messages)
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Expo Push error: ${error}`)
      }

      const result = await response.json()

      console.log('[PushObserver] Expo response:', result)

      // Expo devuelve un array de resultados
      const allSucceeded = result.data?.every((r: any) => r.status === 'ok')

      return {
        success: allSucceeded,
        messageId: result.data?.[0]?.id || `expo-${Date.now()}`
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  /**
   * Obtiene el sonido apropiado según la severidad
   */
  private getSoundForSeverity(severity: string): string {
    switch (severity) {
      case 'critical':
      case 'error':
        return 'alert.wav'
      case 'warning':
        return 'warning.wav'
      default:
        return 'default'
    }
  }
}
