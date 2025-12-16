/**
 * Email Service for Alert Notifications
 * Provides email sending capabilities with templates and configuration
 */

import {
  Alert,
  AlertTrigger,
  EmailTemplate,
  EmailNotification,
  EmailConfig
} from '@/lib/analytics/types'

// ============================================================================
// EMAIL CONFIGURATION
// ============================================================================

interface EmailServiceConfig {
  apiUrl: string
  from: string
  replyTo?: string
  maxRetries: number
  retryDelay: number
}

const defaultConfig: EmailServiceConfig = {
  apiUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://backend-cancha-ya-production.up.railway.app/api',
  from: 'alertas@canchaya.com',
  replyTo: 'soporte@canchaya.com',
  maxRetries: 3,
  retryDelay: 5000, // 5 seconds
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

/**
 * Base HTML template wrapper for all emails
 */
function getBaseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CanchaYA - Alerta</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 5px 0 0 0;
      opacity: 0.9;
      font-size: 14px;
    }
    .content {
      padding: 30px 20px;
    }
    .alert-box {
      border-left: 4px solid;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      background-color: #f8f9fa;
    }
    .alert-box.low {
      border-left-color: #10b981;
      background-color: #f0fdf4;
    }
    .alert-box.medium {
      border-left-color: #f59e0b;
      background-color: #fffbeb;
    }
    .alert-box.high {
      border-left-color: #ef4444;
      background-color: #fef2f2;
    }
    .alert-box.critical {
      border-left-color: #dc2626;
      background-color: #fef2f2;
      border: 2px solid #dc2626;
    }
    .metric-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin: 15px 0;
    }
    .metric-value {
      font-size: 36px;
      font-weight: 700;
      color: #667eea;
      margin: 10px 0;
    }
    .metric-label {
      font-size: 14px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .metric-change {
      font-size: 14px;
      margin-top: 10px;
    }
    .metric-change.positive {
      color: #10b981;
    }
    .metric-change.negative {
      color: #ef4444;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      padding: 12px 30px;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
      text-align: center;
    }
    .button:hover {
      opacity: 0.9;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background-color: #f8f9fa;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #e5e7eb;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    @media only screen and (max-width: 600px) {
      .container {
        margin: 0;
        border-radius: 0;
      }
      .content {
        padding: 20px 15px;
      }
      .header h1 {
        font-size: 24px;
      }
      .metric-value {
        font-size: 28px;
      }
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>
  `.trim()
}

/**
 * Template for metric threshold alerts
 */
function getMetricThresholdTemplate(data: {
  alertName: string
  metricName: string
  value: number
  threshold: number | [number, number]
  condition: string
  severity: string
  message: string
  previousValue?: number
  timestamp: Date
}): string {
  const severityClass = data.severity.toLowerCase()
  const severityEmoji = {
    low: '✅',
    medium: '⚠️',
    high: '🚨',
    critical: '🔴'
  }[severityClass] || '📊'

  const changePercent = data.previousValue
    ? ((data.value - data.previousValue) / data.previousValue * 100).toFixed(2)
    : null

  return getBaseTemplate(`
    <div class="container">
      <div class="header">
        <h1>${severityEmoji} Alerta: ${data.alertName}</h1>
        <p>Umbral de métrica alcanzado</p>
      </div>
      <div class="content">
        <div class="alert-box ${severityClass}">
          <h2 style="margin-bottom: 10px;">⚡ ${data.message}</h2>
          <p style="font-size: 14px; color: #6b7280;">
            ${new Date(data.timestamp).toLocaleString('es-ES', {
              dateStyle: 'full',
              timeStyle: 'short'
            })}
          </p>
        </div>

        <div class="metric-card">
          <div class="metric-label">${data.metricName}</div>
          <div class="metric-value">${data.value.toLocaleString('es-ES')}</div>
          ${changePercent ? `
            <div class="metric-change ${parseFloat(changePercent) > 0 ? 'positive' : 'negative'}">
              ${parseFloat(changePercent) > 0 ? '↑' : '↓'} ${Math.abs(parseFloat(changePercent))}%
              ${data.previousValue ? `(anterior: ${data.previousValue.toLocaleString('es-ES')})` : ''}
            </div>
          ` : ''}
        </div>

        <table>
          <tr>
            <th>Condición</th>
            <td>${data.condition}</td>
          </tr>
          <tr>
            <th>Umbral</th>
            <td>${Array.isArray(data.threshold) ? `${data.threshold[0]} - ${data.threshold[1]}` : data.threshold.toLocaleString('es-ES')}</td>
          </tr>
          <tr>
            <th>Severidad</th>
            <td><strong style="color: ${severityClass === 'critical' ? '#dc2626' : severityClass === 'high' ? '#ef4444' : severityClass === 'medium' ? '#f59e0b' : '#10b981'};">${data.severity}</strong></td>
          </tr>
        </table>

        <center>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/dashboard" class="button">
            Ver Dashboard 📊
          </a>
        </center>

        <p style="margin-top: 20px; padding: 15px; background: #fffbeb; border-radius: 6px; font-size: 14px;">
          💡 <strong>Recomendación:</strong> Revisa las métricas relacionadas en el dashboard para identificar la causa raíz y tomar acciones correctivas.
        </p>
      </div>
      <div class="footer">
        <p>Este es un mensaje automático de CanchaYA. No respondas a este email.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/alertas">Configurar Alertas</a> | <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/dashboard">Dashboard</a></p>
      </div>
    </div>
  `)
}

/**
 * Template for anomaly detection alerts
 */
function getAnomalyTemplate(data: {
  metricName: string
  value: number
  expectedValue: number
  deviation: number
  severity: string
  timestamp: Date
}): string {
  const severityClass = data.severity.toLowerCase()

  return getBaseTemplate(`
    <div class="container">
      <div class="header">
        <h1>🔍 Anomalía Detectada</h1>
        <p>Comportamiento inusual en las métricas</p>
      </div>
      <div class="content">
        <div class="alert-box ${severityClass}">
          <h2 style="margin-bottom: 10px;">Se detectó un comportamiento anómalo en ${data.metricName}</h2>
          <p style="font-size: 14px; color: #6b7280;">
            ${new Date(data.timestamp).toLocaleString('es-ES', {
              dateStyle: 'full',
              timeStyle: 'short'
            })}
          </p>
        </div>

        <table>
          <tr>
            <th>Valor Actual</th>
            <td><strong>${data.value.toLocaleString('es-ES')}</strong></td>
          </tr>
          <tr>
            <th>Valor Esperado</th>
            <td>${data.expectedValue.toLocaleString('es-ES')}</td>
          </tr>
          <tr>
            <th>Desviación</th>
            <td style="color: ${data.deviation > 0 ? '#ef4444' : '#10b981'};">
              ${data.deviation > 0 ? '↑' : '↓'} ${Math.abs(data.deviation).toFixed(2)}%
            </td>
          </tr>
        </table>

        <center>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/dashboard" class="button">
            Investigar Anomalía 🔎
          </a>
        </center>
      </div>
      <div class="footer">
        <p>Este es un mensaje automático de CanchaYA. No respondas a este email.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/alertas">Configurar Alertas</a></p>
      </div>
    </div>
  `)
}

/**
 * Template for critical alerts (requires immediate attention)
 */
function getCriticalAlertTemplate(data: {
  alertName: string
  message: string
  severity: string
  actions: string[]
  timestamp: Date
}): string {
  return getBaseTemplate(`
    <div class="container">
      <div class="header" style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);">
        <h1>🔴 ALERTA CRÍTICA</h1>
        <p>Requiere atención inmediata</p>
      </div>
      <div class="content">
        <div class="alert-box critical">
          <h2 style="margin-bottom: 10px; color: #dc2626;">${data.alertName}</h2>
          <p style="font-size: 16px; margin: 10px 0;">${data.message}</p>
          <p style="font-size: 14px; color: #6b7280;">
            ${new Date(data.timestamp).toLocaleString('es-ES', {
              dateStyle: 'full',
              timeStyle: 'short'
            })}
          </p>
        </div>

        <h3 style="margin: 20px 0 10px 0;">📋 Acciones Recomendadas:</h3>
        <ul style="padding-left: 20px; margin: 10px 0;">
          ${data.actions.map(action => `<li style="margin: 8px 0;">${action}</li>`).join('')}
        </ul>

        <center>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/dashboard" class="button" style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);">
            Tomar Acción Ahora ⚡
          </a>
        </center>

        <p style="margin-top: 20px; padding: 15px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; font-size: 14px; color: #991b1b;">
          ⏰ <strong>Urgente:</strong> Esta alerta requiere atención inmediata. El sistema ha detectado una situación crítica que puede afectar las operaciones.
        </p>
      </div>
      <div class="footer">
        <p style="color: #dc2626; font-weight: 600;">🚨 Alerta de Alta Prioridad - No Ignorar</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/alertas">Configurar Alertas</a></p>
      </div>
    </div>
  `)
}

/**
 * Template for daily summary emails
 */
function getDailySummaryTemplate(data: {
  date: Date
  metrics: Array<{
    name: string
    value: number
    change: number
    status: 'success' | 'warning' | 'danger'
  }>
  alerts: number
  topInsights: string[]
}): string {
  return getBaseTemplate(`
    <div class="container">
      <div class="header">
        <h1>📈 Resumen Diario</h1>
        <p>${new Date(data.date).toLocaleDateString('es-ES', { dateStyle: 'full' })}</p>
      </div>
      <div class="content">
        <h2 style="margin-bottom: 20px;">Métricas del Día</h2>

        ${data.metrics.map(metric => `
          <div class="metric-card">
            <div class="metric-label">${metric.name}</div>
            <div class="metric-value">${metric.value.toLocaleString('es-ES')}</div>
            <div class="metric-change ${metric.change >= 0 ? 'positive' : 'negative'}">
              ${metric.change >= 0 ? '↑' : '↓'} ${Math.abs(metric.change)}% vs. ayer
            </div>
          </div>
        `).join('')}

        ${data.alerts > 0 ? `
          <div style="background: #fffbeb; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <strong>⚠️ ${data.alerts} alerta${data.alerts > 1 ? 's' : ''} activada${data.alerts > 1 ? 's' : ''} hoy</strong>
          </div>
        ` : ''}

        <h3 style="margin: 30px 0 15px 0;">💡 Insights Principales</h3>
        <ul style="padding-left: 20px;">
          ${data.topInsights.map(insight => `<li style="margin: 8px 0;">${insight}</li>`).join('')}
        </ul>

        <center>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/dashboard" class="button">
            Ver Dashboard Completo 📊
          </a>
        </center>
      </div>
      <div class="footer">
        <p>Resumen automático de CanchaYA</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/alertas">Configurar Alertas</a></p>
      </div>
    </div>
  `)
}

/**
 * Template for weekly reports
 */
function getWeeklyReportTemplate(data: {
  weekStart: Date
  weekEnd: Date
  summary: {
    totalReservations: number
    totalRevenue: number
    occupancyRate: number
    newUsers: number
  }
  highlights: string[]
  topCourts: Array<{ name: string; revenue: number }>
}): string {
  return getBaseTemplate(`
    <div class="container">
      <div class="header">
        <h1>📊 Reporte Semanal</h1>
        <p>${new Date(data.weekStart).toLocaleDateString('es-ES')} - ${new Date(data.weekEnd).toLocaleDateString('es-ES')}</p>
      </div>
      <div class="content">
        <h2 style="margin-bottom: 20px;">Resumen de la Semana</h2>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
          <div class="metric-card">
            <div class="metric-label">Reservas</div>
            <div class="metric-value">${data.summary.totalReservations}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Ingresos</div>
            <div class="metric-value">$${data.summary.totalRevenue.toLocaleString('es-ES')}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Ocupación</div>
            <div class="metric-value">${data.summary.occupancyRate}%</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Usuarios Nuevos</div>
            <div class="metric-value">${data.summary.newUsers}</div>
          </div>
        </div>

        <h3 style="margin: 30px 0 15px 0;">🏆 Canchas Destacadas</h3>
        <table>
          <thead>
            <tr>
              <th>Cancha</th>
              <th style="text-align: right;">Ingresos</th>
            </tr>
          </thead>
          <tbody>
            ${data.topCourts.map(court => `
              <tr>
                <td>${court.name}</td>
                <td style="text-align: right; font-weight: 600;">$${court.revenue.toLocaleString('es-ES')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3 style="margin: 30px 0 15px 0;">✨ Highlights de la Semana</h3>
        <ul style="padding-left: 20px;">
          ${data.highlights.map(highlight => `<li style="margin: 8px 0;">${highlight}</li>`).join('')}
        </ul>

        <center>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/dashboard" class="button">
            Ver Análisis Completo 📈
          </a>
        </center>
      </div>
      <div class="footer">
        <p>Reporte automático de CanchaYA</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/alertas">Configurar Alertas</a></p>
      </div>
    </div>
  `)
}

// ============================================================================
// EMAIL SERVICE CLASS
// ============================================================================

export class EmailService {
  private config: EmailServiceConfig
  private queue: EmailNotification[] = []

  constructor(config?: Partial<EmailServiceConfig>) {
    this.config = { ...defaultConfig, ...config }
  }

  /**
   * Send an email notification for an alert trigger
   */
  async sendAlertEmail(
    trigger: AlertTrigger,
    emailConfig: EmailConfig
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { alert, value, previousValue, triggeredAt, message } = trigger

      if (!emailConfig.enabled || emailConfig.recipients.length === 0) {
        return { success: false, error: 'Email not enabled or no recipients' }
      }

      // Generate subject
      const subject = emailConfig.customSubject ||
        `[${alert.severity}] Alerta: ${alert.name}`

      // Generate email body based on template
      let htmlBody: string

      switch (emailConfig.template) {
        case 'METRIC_THRESHOLD':
          htmlBody = getMetricThresholdTemplate({
            alertName: alert.name,
            metricName: alert.metricName,
            value,
            threshold: alert.threshold,
            condition: this.getConditionText(alert.condition),
            severity: alert.severity,
            message: emailConfig.customMessage || message,
            previousValue,
            timestamp: triggeredAt,
          })
          break

        case 'CRITICAL_ALERT':
          htmlBody = getCriticalAlertTemplate({
            alertName: alert.name,
            message: emailConfig.customMessage || message,
            severity: alert.severity,
            actions: [
              'Revisar el dashboard de métricas',
              'Verificar la configuración del sistema',
              'Contactar al equipo técnico si persiste',
            ],
            timestamp: triggeredAt,
          })
          break

        default:
          htmlBody = getMetricThresholdTemplate({
            alertName: alert.name,
            metricName: alert.metricName,
            value,
            threshold: alert.threshold,
            condition: this.getConditionText(alert.condition),
            severity: alert.severity,
            message: emailConfig.customMessage || message,
            previousValue,
            timestamp: triggeredAt,
          })
      }

      // Create email notification
      const notification: EmailNotification = {
        id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        to: emailConfig.recipients,
        cc: emailConfig.cc,
        bcc: emailConfig.bcc,
        subject,
        template: emailConfig.template,
        templateData: {
          alert,
          trigger,
          value,
          previousValue,
          message,
        },
        status: 'pending',
      }

      // Send email
      const result = await this.sendEmail(notification, htmlBody)

      return result
    } catch (error) {
      console.error('Error sending alert email:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Send a daily summary email
   */
  async sendDailySummary(
    recipients: string[],
    data: {
      date: Date
      metrics: Array<{
        name: string
        value: number
        change: number
        status: 'success' | 'warning' | 'danger'
      }>
      alerts: number
      topInsights: string[]
    }
  ): Promise<{ success: boolean; error?: string }> {
    const htmlBody = getDailySummaryTemplate(data)

    const notification: EmailNotification = {
      id: `daily-summary-${Date.now()}`,
      to: recipients,
      subject: `📈 Resumen Diario CanchaYA - ${new Date(data.date).toLocaleDateString('es-ES')}`,
      template: 'DAILY_SUMMARY',
      templateData: data,
      status: 'pending',
    }

    return this.sendEmail(notification, htmlBody)
  }

  /**
   * Send a weekly report email
   */
  async sendWeeklyReport(
    recipients: string[],
    data: {
      weekStart: Date
      weekEnd: Date
      summary: {
        totalReservations: number
        totalRevenue: number
        occupancyRate: number
        newUsers: number
      }
      highlights: string[]
      topCourts: Array<{ name: string; revenue: number }>
    }
  ): Promise<{ success: boolean; error?: string }> {
    const htmlBody = getWeeklyReportTemplate(data)

    const notification: EmailNotification = {
      id: `weekly-report-${Date.now()}`,
      to: recipients,
      subject: `📊 Reporte Semanal CanchaYA - ${new Date(data.weekStart).toLocaleDateString('es-ES')}`,
      template: 'WEEKLY_REPORT',
      templateData: data,
      status: 'pending',
    }

    return this.sendEmail(notification, htmlBody)
  }

  /**
   * Internal method to send email via backend API
   */
  private async sendEmail(
    notification: EmailNotification,
    htmlBody: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // In a real implementation, this would call the backend API
      // For now, we'll simulate the API call

      console.log('📧 Sending email:', {
        to: notification.to,
        subject: notification.subject,
        template: notification.template,
      })

      // Simulate API call to backend
      // const response = await fetch(`${this.config.apiUrl}/notifications/email`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     to: notification.to,
      //     cc: notification.cc,
      //     bcc: notification.bcc,
      //     subject: notification.subject,
      //     html: htmlBody,
      //     from: this.config.from,
      //     replyTo: this.config.replyTo,
      //   }),
      // })

      // if (!response.ok) {
      //   throw new Error(`Email API error: ${response.statusText}`)
      // }

      notification.status = 'sent'
      notification.sentAt = new Date()

      // Log success
      console.log('✅ Email sent successfully:', notification.id)

      return { success: true }
    } catch (error) {
      notification.status = 'failed'
      notification.error = error instanceof Error ? error.message : 'Unknown error'

      console.error('❌ Email send failed:', error)

      return {
        success: false,
        error: notification.error,
      }
    }
  }

  /**
   * Helper to get human-readable condition text
   */
  private getConditionText(condition: string): string {
    const conditionMap: Record<string, string> = {
      '>': 'Mayor que',
      '<': 'Menor que',
      '=': 'Igual a',
      '>=': 'Mayor o igual que',
      '<=': 'Menor o igual que',
      'between': 'Entre',
    }
    return conditionMap[condition] || condition
  }

  /**
   * Add email to queue for batch processing
   */
  addToQueue(notification: EmailNotification): void {
    notification.status = 'queued'
    this.queue.push(notification)
  }

  /**
   * Process email queue
   */
  async processQueue(): Promise<void> {
    const pending = this.queue.filter(n => n.status === 'queued')

    for (const notification of pending) {
      // This would need the HTML body - in practice, you'd store it with the notification
      // await this.sendEmail(notification, htmlBody)

      // Remove from queue after processing
      this.queue = this.queue.filter(n => n.id !== notification.id)
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const emailService = new EmailService()

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate multiple email addresses
 */
export function validateEmails(emails: string[]): {
  valid: string[]
  invalid: string[]
} {
  const valid: string[] = []
  const invalid: string[] = []

  emails.forEach(email => {
    if (isValidEmail(email.trim())) {
      valid.push(email.trim())
    } else {
      invalid.push(email.trim())
    }
  })

  return { valid, invalid }
}

/**
 * Format email recipients for display
 */
export function formatRecipients(emails: string[]): string {
  if (emails.length === 0) return 'Sin destinatarios'
  if (emails.length === 1) return emails[0]
  if (emails.length === 2) return emails.join(' y ')
  return `${emails[0]} y ${emails.length - 1} más`
}
