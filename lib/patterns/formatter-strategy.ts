/**
 * STRATEGY PATTERN - Formatters & Validators
 * 
 * Patrón de Diseño: Strategy Pattern
 * 
 * Propósito:
 * - Encapsular diferentes algoritmos de formateo en clases intercambiables
 * - Permitir cambiar el comportamiento de formateo en runtime
 * - Eliminar condicionales complejos (if/else, switch) para formateo
 * - Facilitar testing de cada estrategia de forma aislada
 * 
 * Ventajas:
 * 1. Open/Closed Principle: Abierto para extensión, cerrado para modificación
 * 2. Single Responsibility: Cada estrategia tiene una sola responsabilidad
 * 3. Testabilidad: Cada estrategia se puede testear independientemente
 * 4. Flexibilidad: Fácil cambiar estrategias en runtime
 * 
 * Uso:
 * ```typescript
 * const formatter = new PriceFormatter()
 * const price = formatter.format(1500) // "$1.500,00"
 * 
 * const dateFormatter = new DateFormatter('SHORT')
 * const date = dateFormatter.format(new Date()) // "01/12/2025"
 * ```
 */

/**
 * Interfaz base para todas las estrategias de formateo
 */
export interface FormatterStrategy<T, R = string> {
  format(value: T): R
  parse?(value: string): T
  validate?(value: T): boolean
}

/**
 * ESTRATEGIA: Formateo de Precios
 */
export class PriceFormatter implements FormatterStrategy<number> {
  private locale: string
  private currency: string
  private decimals: number

  constructor(
    locale: string = 'es-AR',
    currency: string = 'ARS',
    decimals: number = 2
  ) {
    this.locale = locale
    this.currency = currency
    this.decimals = decimals
  }

  format(value: number): string {
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
      return '$0,00'
    }

    return new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: this.decimals,
      maximumFractionDigits: this.decimals
    }).format(value)
  }

  parse(value: string): number {
    // Remover símbolos de moneda y separadores
    const cleaned = value.replace(/[^\d,-]/g, '').replace(',', '.')
    return parseFloat(cleaned) || 0
  }

  validate(value: number): boolean {
    return typeof value === 'number' && !isNaN(value) && isFinite(value) && value >= 0
  }
}

/**
 * ESTRATEGIA: Formateo de Precios Compactos (con K, M)
 */
export class CompactPriceFormatter implements FormatterStrategy<number> {
  format(value: number): string {
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
      return '$0'
    }

    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 2)}M`
    }
    if (value >= 1000) {
      return `$${Math.round(value / 1000)}K`
    }
    return `$${value.toLocaleString()}`
  }

  validate(value: number): boolean {
    return typeof value === 'number' && !isNaN(value) && isFinite(value) && value >= 0
  }
}

/**
 * ESTRATEGIA: Formateo de Fechas
 */
export type DateFormatStyle = 'SHORT' | 'MEDIUM' | 'LONG' | 'FULL' | 'RELATIVE'

export class DateFormatter implements FormatterStrategy<Date> {
  private style: DateFormatStyle
  private locale: string

  constructor(style: DateFormatStyle = 'MEDIUM', locale: string = 'es-ES') {
    this.style = style
    this.locale = locale
  }

  format(value: Date): string {
    if (!(value instanceof Date) || isNaN(value.getTime())) {
      return 'Fecha inválida'
    }

    switch (this.style) {
      case 'SHORT':
        return value.toLocaleDateString(this.locale, {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      
      case 'MEDIUM':
        return value.toLocaleDateString(this.locale, {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })
      
      case 'LONG':
        return value.toLocaleDateString(this.locale, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      
      case 'FULL':
        return value.toLocaleString(this.locale, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      
      case 'RELATIVE':
        return this.formatRelative(value)
      
      default:
        return value.toLocaleDateString(this.locale)
    }
  }

  private formatRelative(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSecs < 60) return 'Hace unos segundos'
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
    
    return this.format(date)
  }

  parse(value: string): Date {
    return new Date(value)
  }

  validate(value: Date): boolean {
    return value instanceof Date && !isNaN(value.getTime())
  }
}

/**
 * ESTRATEGIA: Formateo de Ratings/Calificaciones
 */
export class RatingFormatter implements FormatterStrategy<number> {
  private maxRating: number
  private showDecimals: boolean

  constructor(maxRating: number = 5, showDecimals: boolean = true) {
    this.maxRating = maxRating
    this.showDecimals = showDecimals
  }

  format(value: number): string {
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
      return '0.0'
    }

    const clamped = Math.max(0, Math.min(this.maxRating, value))
    return this.showDecimals ? clamped.toFixed(1) : Math.round(clamped).toString()
  }

  validate(value: number): boolean {
    return (
      typeof value === 'number' &&
      !isNaN(value) &&
      isFinite(value) &&
      value >= 0 &&
      value <= this.maxRating
    )
  }

  /**
   * Convierte rating numérico a estrellas
   */
  toStars(value: number): string {
    const fullStars = Math.floor(value)
    const hasHalfStar = value % 1 >= 0.5
    const emptyStars = this.maxRating - fullStars - (hasHalfStar ? 1 : 0)

    return '★'.repeat(fullStars) +
           (hasHalfStar ? '½' : '') +
           '☆'.repeat(emptyStars)
  }
}

/**
 * ESTRATEGIA: Formateo de Coordenadas Geográficas
 */
export class CoordinateFormatter implements FormatterStrategy<{ lat: number; lng: number }> {
  private precision: number

  constructor(precision: number = 6) {
    this.precision = precision
  }

  format(value: { lat: number; lng: number }): string {
    const lat = Number(value.lat)
    const lng = Number(value.lng)

    if (isNaN(lat) || isNaN(lng)) {
      return '0.000000, 0.000000'
    }

    return `${lat.toFixed(this.precision)}, ${lng.toFixed(this.precision)}`
  }

  validate(value: { lat: number; lng: number }): boolean {
    const lat = Number(value.lat)
    const lng = Number(value.lng)

    return (
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    )
  }

  formatLatitude(lat: number): string {
    const direction = lat >= 0 ? 'N' : 'S'
    return `${Math.abs(lat).toFixed(this.precision)}° ${direction}`
  }

  formatLongitude(lng: number): string {
    const direction = lng >= 0 ? 'E' : 'O'
    return `${Math.abs(lng).toFixed(this.precision)}° ${direction}`
  }
}

/**
 * ESTRATEGIA: Formateo de Números con separadores
 */
export class NumberFormatter implements FormatterStrategy<number> {
  private locale: string
  private decimals: number

  constructor(locale: string = 'es-AR', decimals: number = 0) {
    this.locale = locale
    this.decimals = decimals
  }

  format(value: number): string {
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
      return '0'
    }

    return new Intl.NumberFormat(this.locale, {
      minimumFractionDigits: this.decimals,
      maximumFractionDigits: this.decimals
    }).format(value)
  }

  validate(value: number): boolean {
    return typeof value === 'number' && !isNaN(value) && isFinite(value)
  }
}

/**
 * CONTEXT: Clase que usa las estrategias
 */
export class FormatterContext<T, R = string> {
  private strategy: FormatterStrategy<T, R>

  constructor(strategy: FormatterStrategy<T, R>) {
    this.strategy = strategy
  }

  setStrategy(strategy: FormatterStrategy<T, R>): void {
    this.strategy = strategy
  }

  format(value: T): R {
    return this.strategy.format(value)
  }

  parse(value: string): T | undefined {
    return this.strategy.parse?.(value)
  }

  validate(value: T): boolean {
    return this.strategy.validate?.(value) ?? true
  }
}

/**
 * FACTORY: Para crear formatters comunes rápidamente
 */
export class FormatterFactory {
  static createPriceFormatter(compact: boolean = false): FormatterStrategy<number> {
    return compact ? new CompactPriceFormatter() : new PriceFormatter()
  }

  static createDateFormatter(style: DateFormatStyle = 'MEDIUM'): FormatterStrategy<Date> {
    return new DateFormatter(style)
  }

  static createRatingFormatter(showDecimals: boolean = true): FormatterStrategy<number> {
    return new RatingFormatter(5, showDecimals)
  }

  static createCoordinateFormatter(precision: number = 6): FormatterStrategy<{ lat: number; lng: number }> {
    return new CoordinateFormatter(precision)
  }

  static createNumberFormatter(decimals: number = 0): FormatterStrategy<number> {
    return new NumberFormatter('es-AR', decimals)
  }
}

/**
 * Hook para usar formatters en componentes React
 */
export function useFormatter() {
  return {
    formatPrice: (value: number, compact: boolean = false) => {
      const formatter = FormatterFactory.createPriceFormatter(compact)
      return formatter.format(value)
    },
    formatDate: (value: Date, style: DateFormatStyle = 'MEDIUM') => {
      const formatter = FormatterFactory.createDateFormatter(style)
      return formatter.format(value)
    },
    formatRating: (value: number, showDecimals: boolean = true) => {
      const formatter = FormatterFactory.createRatingFormatter(showDecimals)
      return formatter.format(value)
    },
    formatCoordinate: (lat: number, lng: number, precision: number = 6) => {
      const formatter = FormatterFactory.createCoordinateFormatter(precision)
      return formatter.format({ lat, lng })
    },
    formatNumber: (value: number, decimals: number = 0) => {
      const formatter = FormatterFactory.createNumberFormatter(decimals)
      return formatter.format(value)
    }
  }
}

