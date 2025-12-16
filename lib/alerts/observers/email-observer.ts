/**
 * EMAIL OBSERVER
 * Observer concreto que maneja alertas por email
 */

import { IAlertObserver, Alert, AlertDeliveryResult, AlertChannel, AlertType } from '../types'
import { EmailService, createEmailService } from '../services/email-service'

/**
 * Templates HTML para diferentes tipos de alertas
 * Usamos ${variable} en lugar de {{variable}} para evitar conflictos con template literals de TypeScript
 */
const EMAIL_TEMPLATES: Record<string, { subject: string; html: string }> = {
  [AlertType.RESERVATION_CONFIRMED]: {
    subject: 'Reserva Confirmada - CanchaYA',
    html: [
      '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">',
      '  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">',
      '    <h1 style="color: white; margin: 0;">¡Reserva Confirmada!</h1>',
      '  </div>',
      '  <div style="padding: 30px; background-color: #f9fafb;">',
      '    <h2 style="color: #333;">${title}</h2>',
      '    <p style="color: #666; line-height: 1.6;">${message}</p>',
      '',
      '    ${if_courtName}',
      '    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">',
      '      <h3 style="margin-top: 0; color: #667eea;">Detalles de la Reserva</h3>',
      '      <p><strong>Cancha:</strong> ${courtName}</p>',
      '      <p><strong>Fecha:</strong> ${date}</p>',
      '      <p><strong>Hora:</strong> ${time}</p>',
      '      ${if_price}',
      '      <p><strong>Precio:</strong> $${price}</p>',
      '      ${endif_price}',
      '    </div>',
      '    ${endif_courtName}',
      '',
      '    ${if_actionUrl}',
      '    <div style="text-align: center; margin: 30px 0;">',
      '      <a href="${actionUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">',
      '        Ver Reserva',
      '      </a>',
      '    </div>',
      '    ${endif_actionUrl}',
      '  </div>',
      '  <div style="background: #e5e7eb; padding: 20px; text-align: center; color: #666; font-size: 12px;">',
      '    <p>© 2024 CanchaYA. Todos los derechos reservados.</p>',
      '  </div>',
      '</div>'
    ].join('\n')
  },
  [AlertType.RESERVATION_CANCELLED]: {
    subject: 'Reserva Cancelada - CanchaYA',
    html: [
      '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">',
      '  <div style="background: #ef4444; padding: 30px; text-align: center;">',
      '    <h1 style="color: white; margin: 0;">Reserva Cancelada</h1>',
      '  </div>',
      '  <div style="padding: 30px; background-color: #f9fafb;">',
      '    <h2 style="color: #333;">${title}</h2>',
      '    <p style="color: #666; line-height: 1.6;">${message}</p>',
      '  </div>',
      '  <div style="background: #e5e7eb; padding: 20px; text-align: center; color: #666; font-size: 12px;">',
      '    <p>© 2024 CanchaYA. Todos los derechos reservados.</p>',
      '  </div>',
      '</div>'
    ].join('\n')
  },
  [AlertType.PAYMENT_CONFIRMED]: {
    subject: 'Pago Confirmado - CanchaYA',
    html: [
      '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">',
      '  <div style="background: #10b981; padding: 30px; text-align: center;">',
      '    <h1 style="color: white; margin: 0;">✓ Pago Confirmado</h1>',
      '  </div>',
      '  <div style="padding: 30px; background-color: #f9fafb;">',
      '    <h2 style="color: #333;">${title}</h2>',
      '    <p style="color: #666; line-height: 1.6;">${message}</p>',
      '  </div>',
      '  <div style="background: #e5e7eb; padding: 20px; text-align: center; color: #666; font-size: 12px;">',
      '    <p>© 2024 CanchaYA. Todos los derechos reservados.</p>',
      '  </div>',
      '</div>'
    ].join('\n')
  },
  [AlertType.RESERVATION_REMINDER]: {
    subject: 'Recordatorio de Reserva - CanchaYA',
    html: [
      '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">',
      '  <div style="background: #f59e0b; padding: 30px; text-align: center;">',
      '    <h1 style="color: white; margin: 0;">⏰ Recordatorio</h1>',
      '  </div>',
      '  <div style="padding: 30px; background-color: #f9fafb;">',
      '    <h2 style="color: #333;">${title}</h2>',
      '    <p style="color: #666; line-height: 1.6;">${message}</p>',
      '  </div>',
      '  <div style="background: #e5e7eb; padding: 20px; text-align: center; color: #666; font-size: 12px;">',
      '    <p>© 2024 CanchaYA. Todos los derechos reservados.</p>',
      '  </div>',
      '</div>'
    ].join('\n')
  },
  default: {
    subject: 'Notificación - CanchaYA',
    html: [
      '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">',
      '  <div style="background: #667eea; padding: 30px; text-align: center;">',
      '    <h1 style="color: white; margin: 0;">CanchaYA</h1>',
      '  </div>',
      '  <div style="padding: 30px; background-color: #f9fafb;">',
      '    <h2 style="color: #333;">${title}</h2>',
      '    <p style="color: #666; line-height: 1.6;">${message}</p>',
      '  </div>',
      '  <div style="background: #e5e7eb; padding: 20px; text-align: center; color: #666; font-size: 12px;">',
      '    <p>© 2024 CanchaYA. Todos los derechos reservados.</p>',
      '  </div>',
      '</div>'
    ].join('\n')
  }
}

/**
 * Observer para notificaciones por email
 */
export class EmailObserver implements IAlertObserver {
  readonly id = 'email-observer'
  readonly channels = [AlertChannel.EMAIL]

  private emailService: EmailService

  constructor(emailService?: EmailService) {
    this.emailService = emailService || createEmailService()
  }

  /**
   * Verifica si puede manejar esta alerta
   */
  canHandle(alert: Alert): boolean {
    // Solo manejar si hay al menos un destinatario con email
    const hasEmailRecipients = alert.recipients.some(r => r.email)

    if (!hasEmailRecipients) {
      console.log(`[EmailObserver] Alert ${alert.id} has no email recipients`)
      return false
    }

    // Verificar que el canal EMAIL esté incluido
    if (!alert.channels.includes(AlertChannel.EMAIL)) {
      return false
    }

    return true
  }

  /**
   * Notifica la alerta por email
   */
  async notify(alert: Alert): Promise<AlertDeliveryResult> {
    console.log(`[EmailObserver] Processing alert ${alert.id} (${alert.type})`)

    try {
      // Filtrar solo destinatarios con email
      const emailRecipients = alert.recipients.filter(r => r.email && r.email.trim() !== '')

      if (emailRecipients.length === 0) {
        throw new Error('No valid email recipients found')
      }

      // Obtener template según tipo de alerta
      const template = EMAIL_TEMPLATES[alert.type] || EMAIL_TEMPLATES.default

      // Preparar variables para el template
      const variables: Record<string, string> = {
        title: alert.title,
        message: alert.message,
        ...(alert.metadata?.courtName && { courtName: alert.metadata.courtName }),
        ...(alert.metadata?.date && { date: alert.metadata.date }),
        ...(alert.metadata?.time && { time: alert.metadata.time }),
        ...(alert.metadata?.price && { price: alert.metadata.price.toString() }),
        ...(alert.metadata?.actionUrl && { actionUrl: alert.metadata.actionUrl })
      }

      // Reemplazar variables en el template
      let html = template.html

      // Reemplazar condicionales ${if_variable} ... ${endif_variable}
      for (const [key, value] of Object.entries(variables)) {
        const ifRegex = new RegExp(`\\$\\{if_${key}\\}([\\s\\S]*?)\\$\\{endif_${key}\\}`, 'g')
        if (value) {
          html = html.replace(ifRegex, '$1')
        } else {
          html = html.replace(ifRegex, '')
        }
      }

      // Limpiar condicionales no utilizados
      html = html.replace(/\$\{if_\w+\}[\s\S]*?\$\{endif_\w+\}/g, '')

      // Reemplazar variables normales ${variable}
      for (const [key, value] of Object.entries(variables)) {
        const varRegex = new RegExp(`\\$\\{${key}\\}`, 'g')
        html = html.replace(varRegex, value || '')
      }

      // Enviar email a todos los destinatarios
      const result = await this.emailService.send({
        to: emailRecipients.map(r => r.email!),
        subject: template.subject,
        html,
        text: alert.message // Fallback texto plano
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to send email')
      }

      console.log(`[EmailObserver] Email sent successfully. Message ID: ${result.messageId}`)

      return {
        channel: AlertChannel.EMAIL,
        success: true,
        sentAt: new Date(),
        metadata: {
          messageId: result.messageId,
          recipientCount: emailRecipients.length
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[EmailObserver] Error sending email:`, errorMessage)

      return {
        channel: AlertChannel.EMAIL,
        success: false,
        error: errorMessage
      }
    }
  }

  /**
   * Configura un template personalizado
   */
  setTemplate(type: AlertType, subject: string, html: string): void {
    EMAIL_TEMPLATES[type] = { subject, html }
    console.log(`[EmailObserver] Custom template set for ${type}`)
  }
}
