/**
 * DATA FACTORY PATTERN
 * 
 * Patrón de Diseño: Factory Pattern
 * 
 * Propósito:
 * - Centralizar la creación y validación de objetos de datos
 * - Garantizar que todos los datos numéricos sean válidos antes de usarlos
 * - Eliminar código duplicado de validación en componentes
 * - Proporcionar valores por defecto seguros
 * 
 * Ventajas:
 * 1. Consistencia: Todos los datos pasan por el mismo proceso de validación
 * 2. Mantenibilidad: Un solo lugar para cambiar lógica de validación
 * 3. Testabilidad: Fácil de probar en aislamiento
 * 4. Seguridad: Previene errores de tipo en runtime
 * 
 * Uso:
 * ```typescript
 * const cancha = DataFactory.createValidatedCancha(apiResponse)
 * const rating = DataFactory.createValidatedRating(ratingData)
 * ```
 */

import { Cancha, Valoracion } from '@/lib/api-client'

/**
 * Interfaz para objetos numéricos validados
 */
interface ValidatedNumeric {
  value: number
  isValid: boolean
  originalValue: any
}

/**
 * Clase Factory para crear objetos de datos validados
 */
export class DataFactory {
  /**
   * Valida y normaliza un valor numérico
   * Convierte strings, null, undefined a números válidos o 0
   */
  private static validateNumeric(value: any, defaultValue: number = 0): ValidatedNumeric {
    const numericValue = Number(value)
    const isValid = !isNaN(numericValue) && isFinite(numericValue)
    
    return {
      value: isValid ? numericValue : defaultValue,
      isValid,
      originalValue: value
    }
  }

  /**
   * Crea una Cancha validada con todos los campos numéricos seguros
   */
  static createValidatedCancha(data: Partial<Cancha>): Cancha {
    const validatedPrecio = this.validateNumeric(data.precioPorHora, 0)
    
    // Log de advertencia si el dato original era inválido
    if (!validatedPrecio.isValid && data.precioPorHora !== undefined) {
      console.warn(
        `[DataFactory] precioPorHora inválido para cancha ${data.id}: "${data.precioPorHora}" → ${validatedPrecio.value}`
      )
    }

    return {
      id: data.id || '',
      nombre: data.nombre || 'Cancha sin nombre',
      ubicacion: data.ubicacion || 'Ubicación no especificada',
      tipoSuperficie: data.tipoSuperficie || 'No especificado',
      precioPorHora: validatedPrecio.value,
      activa: data.activa ?? true,
      club: data.club || {
        id: '',
        nombre: 'Club no especificado',
        direccion: '',
        telefono: undefined,
        email: undefined,
        latitud: undefined,
        longitud: undefined,
        fechaCreacion: new Date().toISOString()
      },
      deporte: data.deporte,
      fechaCreacion: data.fechaCreacion || new Date().toISOString()
    } as Cancha
  }

  /**
   * Crea una Valoración validada con puntaje numérico seguro
   */
  static createValidatedRating(data: Partial<Valoracion>): Valoracion {
    const validatedPuntaje = this.validateNumeric(data.puntaje, 0)
    
    // Asegurar que el puntaje esté entre 1 y 5
    const clampedPuntaje = Math.max(1, Math.min(5, validatedPuntaje.value))
    
    if (!validatedPuntaje.isValid && data.puntaje !== undefined) {
      console.warn(
        `[DataFactory] puntaje inválido: "${data.puntaje}" → ${clampedPuntaje}`
      )
    }

    return {
      id: data.id || '',
      puntaje: clampedPuntaje,
      comentario: data.comentario || null,
      tipo_objetivo: data.tipo_objetivo || 'cancha',
      id_objetivo: data.id_objetivo || '',
      personaId: data.personaId || '',
      persona: data.persona,
      fechaCreacion: data.fechaCreacion || new Date().toISOString()
    } as Valoracion
  }

  /**
   * Valida coordenadas geográficas
   */
  static createValidatedCoordinates(lat: any, lng: any): {
    latitude: number
    longitude: number
    isValid: boolean
  } {
    const validatedLat = this.validateNumeric(lat, 0)
    const validatedLng = this.validateNumeric(lng, 0)
    
    // Validar rangos válidos de coordenadas
    const latInRange = validatedLat.value >= -90 && validatedLat.value <= 90
    const lngInRange = validatedLng.value >= -180 && validatedLng.value <= 180
    
    return {
      latitude: latInRange ? validatedLat.value : 0,
      longitude: lngInRange ? validatedLng.value : 0,
      isValid: validatedLat.isValid && validatedLng.isValid && latInRange && lngInRange
    }
  }

  /**
   * Crea un array de Canchas validadas
   */
  static createValidatedCanchas(data: Partial<Cancha>[]): Cancha[] {
    return data.map(cancha => this.createValidatedCancha(cancha))
  }

  /**
   * Crea un array de Valoraciones validadas
   */
  static createValidatedRatings(data: Partial<Valoracion>[]): Valoracion[] {
    return data.map(rating => this.createValidatedRating(rating))
  }

  /**
   * Valida y normaliza un precio
   * Útil para validaciones rápidas sin crear objeto completo
   */
  static validatePrice(price: any): number {
    return this.validateNumeric(price, 0).value
  }

  /**
   * Valida y normaliza un rating
   * Asegura que esté entre 1 y 5
   */
  static validateRating(rating: any): number {
    const validated = this.validateNumeric(rating, 0).value
    return Math.max(1, Math.min(5, validated))
  }
}

/**
 * Hook personalizado para usar el Factory en componentes React
 */
export function useDataFactory() {
  return {
    createValidatedCancha: DataFactory.createValidatedCancha,
    createValidatedRating: DataFactory.createValidatedRating,
    createValidatedCoordinates: DataFactory.createValidatedCoordinates,
    validatePrice: DataFactory.validatePrice,
    validateRating: DataFactory.validateRating
  }
}

