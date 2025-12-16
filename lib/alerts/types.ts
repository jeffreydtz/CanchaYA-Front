/**
 * ALERT SYSTEM TYPES
 * Tipos y interfaces para el sistema de alertas con patrón Observer
 */

/**
 * Niveles de severidad de las alertas
 */
export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
  SUCCESS = 'success'
}

/**
 * Tipos de alertas soportados
 */
export enum AlertType {
  RESERVATION_CONFIRMED = 'reservation_confirmed',
  RESERVATION_CANCELLED = 'reservation_cancelled',
  RESERVATION_REMINDER = 'reservation_reminder',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  PAYMENT_FAILED = 'payment_failed',
  SLOT_RELEASED = 'slot_released',
  CHALLENGE_CREATED = 'challenge_created',
  CHALLENGE_ACCEPTED = 'challenge_accepted',
  CHALLENGE_REJECTED = 'challenge_rejected',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  ACCOUNT_UPDATE = 'account_update',
  CUSTOM = 'custom'
}

/**
 * Canales de notificación disponibles
 */
export enum AlertChannel {
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
  IN_APP = 'in_app',
  BROWSER = 'browser'
}

/**
 * Datos de destinatario de la alerta
 */
export interface AlertRecipient {
  userId: string
  email?: string
  phoneNumber?: string
  pushToken?: string
  preferences?: AlertPreferences
}

/**
 * Preferencias de alertas del usuario
 */
export interface AlertPreferences {
  channels: AlertChannel[]
  enabledTypes: AlertType[]
  quietHours?: {
    start: string // HH:mm format
    end: string // HH:mm format
  }
  frequency?: 'immediate' | 'batched' | 'digest'
}

/**
 * Metadata adicional de la alerta
 */
export interface AlertMetadata {
  reservationId?: string
  courtId?: string
  clubId?: string
  challengeId?: string
  actionUrl?: string
  expiresAt?: Date
  priority?: number
  [key: string]: any
}

/**
 * Interfaz principal de una alerta
 */
export interface Alert {
  id: string
  type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  recipients: AlertRecipient[]
  channels: AlertChannel[]
  metadata?: AlertMetadata
  timestamp: Date
  scheduledFor?: Date
  sentAt?: Date
  deliveredAt?: Date
  readAt?: Date
  retryCount?: number
  status: AlertStatus
}

/**
 * Estados del ciclo de vida de una alerta
 */
export enum AlertStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  READ = 'read'
}

/**
 * Resultado de envío de alerta por canal
 */
export interface AlertDeliveryResult {
  channel: AlertChannel
  success: boolean
  sentAt?: Date
  error?: string
  metadata?: Record<string, any>
}

/**
 * Configuración de plantilla de alerta
 */
export interface AlertTemplate {
  type: AlertType
  subject: string
  body: string
  htmlBody?: string
  variables?: string[] // Variables que se reemplazan en el template
}

/**
 * Interfaz para observadores de alertas
 */
export interface IAlertObserver {
  id: string
  channels: AlertChannel[]

  /**
   * Método llamado cuando se dispara una alerta
   * @param alert - La alerta a procesar
   * @returns Promise con el resultado del envío
   */
  notify(alert: Alert): Promise<AlertDeliveryResult>

  /**
   * Verifica si el observador puede manejar esta alerta
   * @param alert - La alerta a verificar
   */
  canHandle(alert: Alert): boolean
}

/**
 * Configuración del email service
 */
export interface EmailConfig {
  provider: 'smtp' | 'sendgrid' | 'ses' | 'resend'
  apiKey?: string
  from: {
    email: string
    name: string
  }
  smtp?: {
    host: string
    port: number
    secure: boolean
    auth: {
      user: string
      pass: string
    }
  }
  templates?: {
    baseUrl?: string
    defaultLogo?: string
  }
}

/**
 * Datos para enviar email
 */
export interface EmailData {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  from?: string
  replyTo?: string
  cc?: string | string[]
  bcc?: string | string[]
  attachments?: EmailAttachment[]
}

/**
 * Adjunto de email
 */
export interface EmailAttachment {
  filename: string
  content: string | Buffer
  contentType?: string
  encoding?: string
}

/**
 * Configuración de SMS
 */
export interface SMSConfig {
  provider: 'twilio' | 'vonage' | 'aws-sns'
  accountSid?: string
  authToken?: string
  apiKey?: string
  apiSecret?: string
  from: string
}

/**
 * Datos para enviar SMS
 */
export interface SMSData {
  to: string
  message: string
  from?: string
}

/**
 * Configuración de notificaciones push
 */
export interface PushConfig {
  provider: 'firebase' | 'onesignal' | 'expo'
  apiKey?: string
  serverKey?: string
  appId?: string
}

/**
 * Datos para notificación push
 */
export interface PushData {
  tokens: string[]
  title: string
  body: string
  data?: Record<string, any>
  icon?: string
  badge?: number
  sound?: string
}
