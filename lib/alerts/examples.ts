/**
 * EJEMPLOS DE USO DEL SISTEMA DE ALERTAS
 *
 * Este archivo contiene ejemplos prácticos de cómo usar el sistema de alertas
 * con el patrón Observer en diferentes escenarios de la aplicación CanchaYA
 */

import {
  initAlertSystem,
  sendAlert,
  AlertHelpers,
  getAlertSubject,
  AlertType,
  AlertSeverity,
  AlertChannel,
  AlertStatus
} from './index'

// ==========================================
// EJEMPLO 1: Inicialización del Sistema
// ==========================================

/**
 * Inicializar el sistema de alertas al inicio de la aplicación
 * Llamar esto en app/layout.tsx o en el punto de entrada principal
 */
export function example_initializeAlertSystem() {
  initAlertSystem({
    enableEmail: true,
    enablePush: true,
    enableInApp: true,
    enableBrowser: true
  })

  console.log('[Example] Alert system initialized')
}

// ==========================================
// EJEMPLO 2: Alerta Simple
// ==========================================

/**
 * Enviar una alerta simple a un usuario
 */
export async function example_simpleAlert() {
  const { alert, results } = await sendAlert({
    type: AlertType.RESERVATION_CONFIRMED,
    severity: AlertSeverity.SUCCESS,
    title: '¡Reserva Confirmada!',
    message: 'Tu reserva ha sido confirmada exitosamente.',
    recipients: [
      {
        userId: 'user-123',
        email: 'usuario@example.com'
      }
    ],
    channels: [AlertChannel.EMAIL, AlertChannel.IN_APP]
  })

  console.log('[Example] Alert sent:', alert.id)
  console.log('[Example] Delivery results:', results)

  return { alert, results }
}

// ==========================================
// EJEMPLO 3: Usando Helpers Pre-configurados
// ==========================================

/**
 * Usar helpers para enviar alertas comunes
 */
export async function example_useHelpers() {
  // Reserva confirmada
  await AlertHelpers.reservationConfirmed({
    userId: 'user-123',
    email: 'usuario@example.com',
    courtName: 'Cancha Principal',
    date: '2024-12-20',
    time: '18:00',
    price: 5000,
    reservationId: 'reservation-456',
    actionUrl: '/reservas/reservation-456'
  })

  // Recordatorio de reserva
  await AlertHelpers.reservationReminder({
    userId: 'user-123',
    email: 'usuario@example.com',
    pushToken: 'expo-push-token-xyz',
    courtName: 'Cancha Principal',
    date: '2024-12-20',
    time: '18:00',
    reservationId: 'reservation-456',
    hoursBeforeEvent: 2
  })

  // Pago confirmado
  await AlertHelpers.paymentConfirmed({
    userId: 'user-123',
    email: 'usuario@example.com',
    amount: 5000,
    reservationId: 'reservation-456',
    paymentMethod: 'Tarjeta de Crédito'
  })

  console.log('[Example] Helpers executed successfully')
}

// ==========================================
// EJEMPLO 4: Notificación Múltiple
// ==========================================

/**
 * Notificar a múltiples usuarios sobre un slot liberado
 */
export async function example_notifyMultipleUsers() {
  const users = [
    { id: 'user-1', email: 'user1@example.com' },
    { id: 'user-2', email: 'user2@example.com' },
    { id: 'user-3', email: 'user3@example.com' }
  ]

  const { alert, results } = await AlertHelpers.slotReleased({
    userIds: users.map(u => u.id),
    emails: users.map(u => u.email),
    courtName: 'Cancha Principal',
    date: '2024-12-20',
    time: '18:00',
    courtId: 'court-123'
  })

  console.log('[Example] Notified', users.length, 'users')
  console.log('[Example] Successful deliveries:', results.filter(r => r.success).length)

  return { alert, results }
}

// ==========================================
// EJEMPLO 5: Alerta Programada
// ==========================================

/**
 * Programar una alerta para enviarse en el futuro
 */
export async function example_scheduledAlert() {
  const alertSubject = getAlertSubject()

  // Programar para 1 hora en el futuro
  const scheduledDate = new Date(Date.now() + 3600000)

  const { alert, results } = await alertSubject.createAndNotify({
    type: AlertType.RESERVATION_REMINDER,
    severity: AlertSeverity.INFO,
    title: 'Recordatorio de Reserva',
    message: 'Tu reserva es en 1 hora',
    recipients: [{ userId: 'user-123', email: 'user@example.com' }],
    channels: [AlertChannel.EMAIL, AlertChannel.PUSH],
    scheduledFor: scheduledDate
  })

  console.log('[Example] Alert scheduled for:', scheduledDate.toISOString())
  console.log('[Example] Alert status:', alert.status) // Debería ser 'scheduled'
  console.log('[Example] Immediate results:', results.length) // Debería ser 0

  return { alert, scheduledDate }
}

// ==========================================
// EJEMPLO 6: Manejo de Errores y Reintentos
// ==========================================

/**
 * Manejar fallos y reintentar alertas
 */
export async function example_retryFailedAlert() {
  const alertSubject = getAlertSubject()

  // Enviar alerta
  const { alert } = await sendAlert({
    type: AlertType.RESERVATION_CONFIRMED,
    severity: AlertSeverity.SUCCESS,
    title: 'Test',
    message: 'Test message',
    recipients: [{ userId: 'user-123', email: 'invalid-email' }], // Email inválido podría fallar
    channels: [AlertChannel.EMAIL]
  })

  // Verificar si falló
  if (alert.status === AlertStatus.FAILED) {
    console.log('[Example] Alert failed, retrying...')

    // Reintentar
    const retryResults = await alertSubject.retry(alert.id)

    console.log('[Example] Retry results:', retryResults)
    console.log('[Example] Retry count:', alert.retryCount)
  }

  return alert
}

// ==========================================
// EJEMPLO 7: Estadísticas del Sistema
// ==========================================

/**
 * Obtener estadísticas del sistema de alertas
 */
export function example_getStatistics() {
  const alertSubject = getAlertSubject()

  const stats = alertSubject.getStats()

  console.log('[Example] Alert System Statistics:')
  console.log('  Total Alerts:', stats.totalAlerts)
  console.log('  Total Observers:', stats.totalObservers)
  console.log('  By Status:', stats.byStatus)
  console.log('  By Type:', stats.byType)
  console.log('  By Severity:', stats.bySeverity)

  return stats
}

// ==========================================
// EJEMPLO 8: Limpieza de Historial
// ==========================================

/**
 * Limpiar alertas antiguas del historial
 */
export function example_cleanHistory() {
  const alertSubject = getAlertSubject()

  // Limpiar alertas de hace más de 7 días
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const removed = alertSubject.cleanHistory(sevenDaysAgo)

  console.log('[Example] Cleaned', removed, 'old alerts')

  return removed
}

// ==========================================
// EJEMPLO 9: Observer Personalizado
// ==========================================

/**
 * Crear y registrar un observer personalizado
 */
export function example_customObserver() {
  const alertSubject = getAlertSubject()

  // Crear observer personalizado para Slack
  const slackObserver = {
    id: 'slack-observer',
    channels: [AlertChannel.IN_APP], // Usar canal existente o crear uno nuevo

    canHandle: (alert: any) => {
      return alert.severity === AlertSeverity.CRITICAL
    },

    notify: async (alert: any) => {
      try {
        // Enviar a Slack webhook
        const response = await fetch('https://hooks.slack.com/services/YOUR/WEBHOOK', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 ${alert.title}\n${alert.message}`
          })
        })

        return {
          channel: AlertChannel.IN_APP,
          success: response.ok,
          sentAt: new Date()
        }
      } catch (error) {
        return {
          channel: AlertChannel.IN_APP,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  }

  // Registrar observer
  alertSubject.attach(slackObserver as any)

  console.log('[Example] Custom Slack observer registered')

  return slackObserver
}

// ==========================================
// EJEMPLO 10: Flujo Completo de Reserva
// ==========================================

/**
 * Ejemplo de flujo completo: reserva, pago y recordatorios
 */
export async function example_completeReservationFlow(
  userId: string,
  email: string,
  courtName: string,
  date: string,
  time: string
) {
  const reservationId = `reservation-${Date.now()}`

  // 1. Confirmar reserva
  await AlertHelpers.reservationConfirmed({
    userId,
    email,
    courtName,
    date,
    time,
    price: 5000,
    reservationId,
    actionUrl: `/reservas/${reservationId}`
  })

  // 2. Confirmar pago
  await AlertHelpers.paymentConfirmed({
    userId,
    email,
    amount: 5000,
    reservationId,
    paymentMethod: 'Tarjeta de Crédito'
  })

  // 3. Programar recordatorio para 2 horas antes
  const reservationDateTime = new Date(`${date} ${time}`)
  const reminderTime = new Date(reservationDateTime.getTime() - 2 * 60 * 60 * 1000)

  const alertSubject = getAlertSubject()
  await alertSubject.createAndNotify({
    type: AlertType.RESERVATION_REMINDER,
    severity: AlertSeverity.INFO,
    title: 'Recordatorio de Reserva',
    message: `Recordatorio: Tu reserva en ${courtName} es en 2 horas (${time})`,
    recipients: [{ userId, email }],
    channels: [AlertChannel.PUSH, AlertChannel.BROWSER],
    scheduledFor: reminderTime
  })

  console.log('[Example] Complete reservation flow executed')
  console.log('[Example] Reservation ID:', reservationId)

  return reservationId
}

// ==========================================
// EJEMPLO 11: Integración con API Routes
// ==========================================

/**
 * Ejemplo de cómo usar el sistema de alertas en API routes
 * Ubicar en: app/api/reservations/confirm/route.ts
 */
export const example_apiRouteIntegration = `
import { NextRequest, NextResponse } from 'next/server'
import { AlertHelpers } from '@/lib/alerts'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, courtName, date, time, price, reservationId } = body

    // Lógica de confirmación de reserva aquí...

    // Enviar alerta
    await AlertHelpers.reservationConfirmed({
      userId,
      email,
      courtName,
      date,
      time,
      price,
      reservationId,
      actionUrl: \`/reservas/\${reservationId}\`
    })

    return NextResponse.json({ success: true, reservationId })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to confirm reservation' }, { status: 500 })
  }
}
`

// ==========================================
// EJEMPLO 12: Integración con React Components
// ==========================================

/**
 * Ejemplo de cómo usar el sistema de alertas en componentes React
 */
export const example_reactComponentIntegration = `
'use client'

import { useState } from 'react'
import { AlertHelpers } from '@/lib/alerts'
import { useAuth } from '@/components/auth/auth-context'

export function ReservationConfirmButton({ reservation }) {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const handleConfirm = async () => {
    setLoading(true)

    try {
      // Confirmar reserva en el backend
      const response = await fetch('/api/reservations/confirm', {
        method: 'POST',
        body: JSON.stringify(reservation)
      })

      if (response.ok) {
        // Enviar alerta
        await AlertHelpers.reservationConfirmed({
          userId: user.id,
          email: user.email,
          courtName: reservation.courtName,
          date: reservation.date,
          time: reservation.time,
          price: reservation.price,
          reservationId: reservation.id
        })
      }
    } catch (error) {
      console.error('Failed to confirm reservation:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleConfirm} disabled={loading}>
      {loading ? 'Confirmando...' : 'Confirmar Reserva'}
    </button>
  )
}
`
