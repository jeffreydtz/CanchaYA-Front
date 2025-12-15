import { format, parseISO, isValid, startOfDay, addDays } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { es } from 'date-fns/locale'

const DEFAULT_TIMEZONE = 'America/Argentina/Buenos_Aires'

export const DATE_FORMATS = {
  ISO: 'yyyy-MM-dd',
  DISPLAY: 'dd/MM/yyyy',
  LONG: 'EEEE, dd \'de\' MMMM \'de\' yyyy',
  SHORT: 'dd/MM',
  TIME: 'HH:mm',
  DATE_TIME: 'dd/MM/yyyy HH:mm',
} as const

export const formatDate = (date: Date | string, formatType: keyof typeof DATE_FORMATS = 'DISPLAY'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) {
      throw new Error('Invalid date')
    }
    return format(dateObj, DATE_FORMATS[formatType], { locale: es })
  } catch (error) {
    return 'Fecha inválida'
  }
}

export const formatDateWithTimezone = (
  date: Date | string,
  formatType: keyof typeof DATE_FORMATS = 'DISPLAY',
  timezone: string = DEFAULT_TIMEZONE
): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) {
      throw new Error('Invalid date')
    }
    return formatInTimeZone(dateObj, timezone, DATE_FORMATS[formatType], { locale: es })
  } catch (error) {
    return 'Fecha inválida'
  }
}

export const parseDate = (dateString: string): Date | null => {
  try {
    const date = parseISO(dateString)
    return isValid(date) ? date : null
  } catch (error) {
    return null
  }
}

export const formatDateForInput = (date: Date): string => {
  return format(date, DATE_FORMATS.ISO)
}

export const formatTime = (timeString: string): string => {
  return timeString.substring(0, 5) // Extract HH:MM from HH:MM:SS
}

export const formatDateTime = (date: Date | string, time?: string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return 'Fecha inválida'
  
  const dateStr = format(dateObj, DATE_FORMATS.DISPLAY, { locale: es })
  return time ? `${dateStr} ${formatTime(time)}` : dateStr
}

export const isDateInPast = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return isValid(dateObj) ? dateObj < startOfDay(new Date()) : false
}

export const isDateToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return false
  
  const today = new Date()
  return format(dateObj, DATE_FORMATS.ISO) === format(today, DATE_FORMATS.ISO)
}

export const getDateRange = (startDate: Date, days: number) => {
  return Array.from({ length: days }, (_, i) => addDays(startDate, i))
}

export const isDateDisabled = (date: Date, options?: {
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
  disablePastDates?: boolean
}): boolean => {
  if (!isValid(date)) return true
  
  const { minDate, maxDate, disabledDates = [], disablePastDates = true } = options || {}
  
  if (disablePastDates && isDateInPast(date)) {
    return true
  }
  
  if (minDate && date < minDate) {
    return true
  }
  
  if (maxDate && date > maxDate) {
    return true
  }
  
  return disabledDates.some(disabledDate => 
    format(date, DATE_FORMATS.ISO) === format(disabledDate, DATE_FORMATS.ISO)
  )
}

export const getWeekdayName = (date: Date): string => {
  return format(date, 'EEEE', { locale: es }).toLowerCase()
}

export const getNextAvailableDate = (startDate: Date = new Date()): Date => {
  let nextDate = startOfDay(startDate)
  if (isDateInPast(nextDate)) {
    nextDate = addDays(nextDate, 1)
  }
  return nextDate
}

export const validateDateString = (dateString: string): boolean => {
  const date = parseDate(dateString)
  return date !== null && isValid(date)
}