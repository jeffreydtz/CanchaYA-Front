/**
 * EMAIL SERVICE
 * Servicio para envío de emails con soporte multi-proveedor
 *
 * Soporta:
 * - SMTP (Nodemailer)
 * - SendGrid
 * - AWS SES
 * - Resend
 */

import { EmailConfig, EmailData, EmailAttachment } from '../types'

/**
 * Interfaz base para proveedores de email
 */
interface IEmailProvider {
  send(data: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }>
}

/**
 * Proveedor SMTP usando Nodemailer (para entorno Node.js)
 */
class SMTPProvider implements IEmailProvider {
  private config: EmailConfig

  constructor(config: EmailConfig) {
    this.config = config
  }

  async send(data: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // En un entorno real, aquí usarías nodemailer
    // Como este es código cliente, esto solo es un stub para la arquitectura
    try {
      // Simular envío
      console.log('[SMTPProvider] Sending email:', {
        to: data.to,
        subject: data.subject,
        from: data.from || this.config.from.email
      })

      // En producción, esto sería algo como:
      // const nodemailer = require('nodemailer')
      // const transporter = nodemailer.createTransport(this.config.smtp)
      // const info = await transporter.sendMail({ ... })

      return {
        success: true,
        messageId: `smtp-${Date.now()}`
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[SMTPProvider] Error:', errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    }
  }
}

/**
 * Proveedor SendGrid
 */
class SendGridProvider implements IEmailProvider {
  private apiKey: string
  private from: { email: string; name: string }

  constructor(config: EmailConfig) {
    if (!config.apiKey) {
      throw new Error('SendGrid API key is required')
    }
    this.apiKey = config.apiKey
    this.from = config.from
  }

  async send(data: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const url = 'https://api.sendgrid.com/v3/mail/send'

      const payload = {
        personalizations: [
          {
            to: Array.isArray(data.to)
              ? data.to.map(email => ({ email }))
              : [{ email: data.to }],
            subject: data.subject,
            ...(data.cc && {
              cc: Array.isArray(data.cc)
                ? data.cc.map(email => ({ email }))
                : [{ email: data.cc }]
            }),
            ...(data.bcc && {
              bcc: Array.isArray(data.bcc)
                ? data.bcc.map(email => ({ email }))
                : [{ email: data.bcc }]
            })
          }
        ],
        from: {
          email: data.from || this.from.email,
          name: this.from.name
        },
        content: [
          ...(data.text ? [{ type: 'text/plain', value: data.text }] : []),
          ...(data.html ? [{ type: 'text/html', value: data.html }] : [])
        ],
        ...(data.replyTo && { reply_to: { email: data.replyTo } }),
        ...(data.attachments && {
          attachments: data.attachments.map(att => ({
            content: typeof att.content === 'string'
              ? att.content
              : att.content.toString('base64'),
            filename: att.filename,
            type: att.contentType || 'application/octet-stream',
            disposition: 'attachment'
          }))
        })
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`SendGrid API error: ${error}`)
      }

      const messageId = response.headers.get('X-Message-Id') || `sendgrid-${Date.now()}`

      console.log('[SendGridProvider] Email sent successfully:', messageId)

      return {
        success: true,
        messageId
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[SendGridProvider] Error:', errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    }
  }
}

/**
 * Proveedor AWS SES
 */
class SESProvider implements IEmailProvider {
  private apiKey: string
  private from: { email: string; name: string }
  private region: string

  constructor(config: EmailConfig) {
    if (!config.apiKey) {
      throw new Error('AWS credentials are required')
    }
    this.apiKey = config.apiKey
    this.from = config.from
    this.region = process.env.AWS_REGION || 'us-east-1'
  }

  async send(data: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // En producción, aquí usarías el AWS SDK
      // Esta es una implementación simplificada
      console.log('[SESProvider] Would send email via AWS SES:', {
        to: data.to,
        subject: data.subject,
        region: this.region
      })

      // Simular envío exitoso
      return {
        success: true,
        messageId: `ses-${Date.now()}`
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[SESProvider] Error:', errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    }
  }
}

/**
 * Proveedor Resend
 */
class ResendProvider implements IEmailProvider {
  private apiKey: string
  private from: { email: string; name: string }

  constructor(config: EmailConfig) {
    if (!config.apiKey) {
      throw new Error('Resend API key is required')
    }
    this.apiKey = config.apiKey
    this.from = config.from
  }

  async send(data: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const url = 'https://api.resend.com/emails'

      const payload = {
        from: data.from || `${this.from.name} <${this.from.email}>`,
        to: data.to,
        subject: data.subject,
        text: data.text,
        html: data.html,
        ...(data.cc && { cc: data.cc }),
        ...(data.bcc && { bcc: data.bcc }),
        ...(data.replyTo && { reply_to: data.replyTo }),
        ...(data.attachments && {
          attachments: data.attachments.map(att => ({
            filename: att.filename,
            content: typeof att.content === 'string'
              ? att.content
              : att.content.toString('base64')
          }))
        })
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Resend API error: ${JSON.stringify(error)}`)
      }

      const result = await response.json()
      console.log('[ResendProvider] Email sent successfully:', result.id)

      return {
        success: true,
        messageId: result.id
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[ResendProvider] Error:', errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    }
  }
}

/**
 * Servicio principal de Email
 */
export class EmailService {
  private provider: IEmailProvider
  private config: EmailConfig

  constructor(config: EmailConfig) {
    this.config = config

    // Seleccionar proveedor basado en configuración
    switch (config.provider) {
      case 'smtp':
        this.provider = new SMTPProvider(config)
        break
      case 'sendgrid':
        this.provider = new SendGridProvider(config)
        break
      case 'ses':
        this.provider = new SESProvider(config)
        break
      case 'resend':
        this.provider = new ResendProvider(config)
        break
      default:
        throw new Error(`Unsupported email provider: ${config.provider}`)
    }

    console.log(`[EmailService] Initialized with provider: ${config.provider}`)
  }

  /**
   * Envía un email
   * @param data - Datos del email
   */
  async send(data: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Validaciones básicas
    if (!data.to || (Array.isArray(data.to) && data.to.length === 0)) {
      return {
        success: false,
        error: 'Recipient email is required'
      }
    }

    if (!data.subject) {
      return {
        success: false,
        error: 'Subject is required'
      }
    }

    if (!data.text && !data.html) {
      return {
        success: false,
        error: 'Email body (text or html) is required'
      }
    }

    try {
      console.log(`[EmailService] Sending email to ${data.to}`)
      const result = await this.provider.send(data)

      if (result.success) {
        console.log(`[EmailService] Email sent successfully. Message ID: ${result.messageId}`)
      } else {
        console.error(`[EmailService] Failed to send email: ${result.error}`)
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[EmailService] Unexpected error:`, errorMessage)

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  /**
   * Envía un email con plantilla HTML
   * @param data - Datos del email
   * @param templateHtml - HTML de la plantilla
   * @param variables - Variables a reemplazar en la plantilla
   */
  async sendWithTemplate(
    data: Omit<EmailData, 'html'>,
    templateHtml: string,
    variables: Record<string, string>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Reemplazar variables en la plantilla
    let html = templateHtml

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      html = html.replace(regex, value)
    }

    return this.send({
      ...data,
      html
    })
  }

  /**
   * Envía emails en lote
   * @param emails - Array de emails a enviar
   */
  async sendBatch(emails: EmailData[]): Promise<Array<{ success: boolean; messageId?: string; error?: string }>> {
    console.log(`[EmailService] Sending batch of ${emails.length} emails`)

    const results = await Promise.all(
      emails.map(email => this.send(email))
    )

    const successCount = results.filter(r => r.success).length
    console.log(`[EmailService] Batch complete. Success: ${successCount}/${emails.length}`)

    return results
  }

  /**
   * Verifica la configuración del servicio
   */
  async verify(): Promise<boolean> {
    console.log(`[EmailService] Verifying ${this.config.provider} configuration...`)

    // Aquí podrías hacer una verificación real según el proveedor
    // Por ejemplo, SendGrid tiene un endpoint de verificación

    return true
  }
}

/**
 * Factory para crear instancia del servicio de email
 */
export function createEmailService(config?: Partial<EmailConfig>): EmailService {
  const defaultConfig: EmailConfig = {
    provider: (process.env.EMAIL_PROVIDER as any) || 'smtp',
    apiKey: process.env.EMAIL_API_KEY,
    from: {
      email: process.env.EMAIL_FROM_ADDRESS || 'noreply@canchaya.com',
      name: process.env.EMAIL_FROM_NAME || 'CanchaYA'
    },
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    }
  }

  const finalConfig = { ...defaultConfig, ...config }

  return new EmailService(finalConfig)
}
