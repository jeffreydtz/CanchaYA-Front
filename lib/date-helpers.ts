/**
 * Date Helper Functions for CanchaYA API
 * Utilities for working with ISO 8601 dates and disponibilidades
 */

/**
 * Convert date and time to ISO 8601 format for API
 * @param date - Date object or YYYY-MM-DD string
 * @param time - HH:MM string
 * @param timezone - Timezone offset (default: -03:00 for Argentina)
 * @returns ISO 8601 string for API (e.g., "2025-10-21T18:00:00-03:00")
 */
export function toISO8601(
  date: Date | string,
  time: string,
  timezone: string = '-03:00'
): string {
  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0]
  return `${dateStr}T${time}:00${timezone}`
}

/**
 * Parse ISO 8601 date from API response
 * @param iso8601 - ISO 8601 string from API
 * @returns Object with date and time components
 */
export function parseISO8601(iso8601: string): {
  date: Date
  dateString: string // YYYY-MM-DD
  timeString: string // HH:MM
  dayOfWeek: number // 0-6 (Sunday-Saturday)
} {
  const date = new Date(iso8601)

  return {
    date,
    dateString: date.toISOString().split('T')[0],
    timeString: date.toTimeString().substring(0, 5),
    dayOfWeek: date.getDay()
  }
}

/**
 * Get day of week from date (matches API diaSemana format)
 * @param date - Date object or YYYY-MM-DD string
 * @returns 0-6 (Sunday-Saturday)
 */
export function getDayOfWeek(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.getDay()
}

/**
 * Check if a time is within a horario range
 * @param time - HH:MM string
 * @param horaInicio - HH:MM string
 * @param horaFin - HH:MM string
 * @returns true if time is within range
 */
export function isTimeInRange(
  time: string,
  horaInicio: string,
  horaFin: string
): boolean {
  const [h, m] = time.split(':').map(Number)
  const [startH, startM] = horaInicio.split(':').map(Number)
  const [endH, endM] = horaFin.split(':').map(Number)

  const minutes = h * 60 + m
  const startMinutes = startH * 60 + startM
  const endMinutes = endH * 60 + endM

  return minutes >= startMinutes && minutes < endMinutes
}

/**
 * Format date for display
 * @param date - Date object, ISO 8601 string, or YYYY-MM-DD string
 * @param format - 'short' | 'long' | 'full'
 * @returns Formatted date string
 */
export function formatDisplayDate(
  date: Date | string,
  format: 'short' | 'long' | 'full' = 'long'
): string {
  const d = typeof date === 'string' ? new Date(date) : date

  const options: Intl.DateTimeFormatOptions = {
    short: { month: 'numeric', day: 'numeric', year: '2-digit' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
  }[format]

  return new Intl.DateTimeFormat('es-AR', options).format(d)
}

/**
 * Format time for display
 * @param time - HH:MM string or Date object
 * @returns Formatted time string (e.g., "18:00 hs")
 */
export function formatDisplayTime(time: string | Date): string {
  if (typeof time === 'string') {
    return `${time} hs`
  }
  return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')} hs`
}

/**
 * Get human-readable time until/since date
 * @param date - Date object or ISO 8601 string
 * @returns Relative time string (e.g., "en 2 horas", "hace 3 días")
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const diffMins = Math.floor(Math.abs(diffMs) / 60000)
  const isPast = diffMs < 0

  if (diffMins < 60) {
    return isPast ? `hace ${diffMins} minutos` : `en ${diffMins} minutos`
  }

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) {
    return isPast ? `hace ${diffHours} horas` : `en ${diffHours} horas`
  }

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) {
    return isPast ? `hace ${diffDays} días` : `en ${diffDays} días`
  }

  const diffWeeks = Math.floor(diffDays / 7)
  return isPast ? `hace ${diffWeeks} semanas` : `en ${diffWeeks} semanas`
}

/**
 * Check if a date is in the past
 * @param date - Date object or ISO 8601 string
 * @returns true if date is in the past
 */
export function isPast(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.getTime() < Date.now()
}

/**
 * Check if a date is today
 * @param date - Date object or ISO 8601 string
 * @returns true if date is today
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  return d.toDateString() === today.toDateString()
}

/**
 * Get available time slots for a day
 * @param startHour - Start hour (default: 8)
 * @param endHour - End hour (default: 23)
 * @param interval - Minutes between slots (default: 60)
 * @returns Array of HH:MM strings
 */
export function getTimeSlots(
  startHour: number = 8,
  endHour: number = 23,
  interval: number = 60
): string[] {
  const slots: string[] = []

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let min = 0; min < 60; min += interval) {
      if (hour === endHour && min > 0) break
      const h = hour.toString().padStart(2, '0')
      const m = min.toString().padStart(2, '0')
      slots.push(`${h}:${m}`)
    }
  }

  return slots
}
