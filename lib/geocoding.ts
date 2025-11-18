/**
 * Geocoding utility using OpenStreetMap Nominatim API
 * Converts addresses to coordinates (latitude, longitude)
 * Includes localStorage caching to reduce API calls
 */

const CACHE_KEY = 'cancha-ya-geocoding-cache'
const CACHE_VERSION = '1'
const CACHE_EXPIRY_DAYS = 30

export interface GeocodeResult {
  latitude: number
  longitude: number
  displayName: string
}

interface CacheEntry {
  result: GeocodeResult | null
  timestamp: number
}

interface GeocodeCache {
  version: string
  entries: Record<string, CacheEntry>
}

/**
 * Get cache from localStorage
 */
function getCache(): GeocodeCache {
  try {
    if (typeof window === 'undefined') return { version: CACHE_VERSION, entries: {} }

    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return { version: CACHE_VERSION, entries: {} }

    const cache = JSON.parse(cached) as GeocodeCache
    if (cache.version !== CACHE_VERSION) return { version: CACHE_VERSION, entries: {} }

    return cache
  } catch (error) {
    console.warn('Error reading geocoding cache:', error)
    return { version: CACHE_VERSION, entries: {} }
  }
}

/**
 * Save cache to localStorage
 */
function saveCache(cache: GeocodeCache): void {
  try {
    if (typeof window === 'undefined') return
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.warn('Error saving geocoding cache:', error)
  }
}

/**
 * Check if cached entry is still valid
 */
function isCacheValid(entry: CacheEntry): boolean {
  const expiryMs = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000
  return Date.now() - entry.timestamp < expiryMs
}

/**
 * Get cached result if available and valid
 */
function getCachedResult(address: string): GeocodeResult | null | undefined {
  const cache = getCache()
  const entry = cache.entries[address]

  if (!entry) return undefined
  if (!isCacheValid(entry)) {
    // Remove expired entry
    delete cache.entries[address]
    saveCache(cache)
    return undefined
  }

  return entry.result
}

/**
 * Save result to cache
 */
function cacheResult(address: string, result: GeocodeResult | null): void {
  const cache = getCache()
  cache.entries[address] = {
    result,
    timestamp: Date.now(),
  }
  saveCache(cache)
}

/**
 * Geocode an address using OpenStreetMap Nominatim API
 * Checks cache first before making API request
 * @param address - The address to geocode
 * @returns Promise with coordinates and display name, or null if not found
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  try {
    if (!address || address.trim().length === 0) {
      return null
    }

    // Check cache first
    const cached = getCachedResult(address)
    if (cached !== undefined) {
      return cached
    }

    // Use Nominatim API (OpenStreetMap)
    const encodedAddress = encodeURIComponent(address)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
      {
        headers: {
          'Accept': 'application/json',
          // Nominatim requires a user agent
          'User-Agent': 'CanchaYA-App/1.0',
        },
      }
    )

    if (!response.ok) {
      console.error('Geocoding API error:', response.status)
      return null
    }

    const data = await response.json() as any[]

    if (!data || data.length === 0) {
      console.warn(`No results found for address: ${address}`)
      // Cache the null result to avoid repeated failed requests
      cacheResult(address, null)
      return null
    }

    const result = data[0]
    const geocodeResult = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      displayName: result.display_name,
    }

    // Cache the result
    cacheResult(address, geocodeResult)

    return geocodeResult
  } catch (error) {
    console.error('Error geocoding address:', error)
    return null
  }
}

/**
 * Geocode multiple addresses with delay to respect API rate limits
 * @param addresses - Array of addresses to geocode
 * @param delayMs - Delay between requests in milliseconds (default: 1000ms)
 * @returns Promise with array of geocode results
 */
export async function geocodeAddresses(
  addresses: Array<{ id: string; address: string }>,
  delayMs: number = 1000
): Promise<Map<string, GeocodeResult | null>> {
  const results = new Map<string, GeocodeResult | null>()

  for (const { id, address } of addresses) {
    const result = await geocodeAddress(address)
    results.set(id, result)

    // Add delay to respect API rate limits (1 request per second)
    // Nominatim allows 1 request per second
    await new Promise(resolve => setTimeout(resolve, delayMs))
  }

  return results
}

/**
 * Check if an address needs geocoding (has address but no coordinates)
 */
export function needsGeocoding(address: string, latitude?: number, longitude?: number): boolean {
  return !!(address && address.trim().length > 0 && (!latitude || !longitude))
}

/**
 * Default fallback coordinates (Buenos Aires, Argentina - center of country)
 */
export const DEFAULT_CENTER = {
  latitude: -34.6037,
  longitude: -58.3816,
}

/**
 * Get map center from multiple coordinates
 */
export function calculateMapCenter(
  coordinates: Array<{ latitude: number; longitude: number }>
): { latitude: number; longitude: number } {
  if (coordinates.length === 0) {
    return DEFAULT_CENTER
  }

  const avgLat = coordinates.reduce((sum, c) => sum + c.latitude, 0) / coordinates.length
  const avgLng = coordinates.reduce((sum, c) => sum + c.longitude, 0) / coordinates.length

  return {
    latitude: avgLat,
    longitude: avgLng,
  }
}

/**
 * Get suggestions to improve an address that couldn't be geocoded
 */
export function getSuggestedAddressImprovements(address: string): string[] {
  const suggestions: string[] = []

  // Check if address has city/area
  if (!address.includes(',')) {
    suggestions.push('Agregar el nombre de la ciudad o zona')
  }

  // Check if address seems incomplete
  if (address.length < 10) {
    suggestions.push('La dirección parece incompleta - agregar más detalles')
  }

  // Suggest adding country for international addresses
  if (!address.toLowerCase().includes('argentina') &&
    !address.toLowerCase().includes('ar') &&
    !address.toLowerCase().includes('buenos aires') &&
    !address.toLowerCase().includes('mendoza') &&
    !address.toLowerCase().includes('córdoba') &&
    !address.toLowerCase().includes('rosario')) {
    suggestions.push('Especificar el país o provincia (ej: Argentina)')
  }

  // Suggest adding neighborhood/district
  const hasNumber = /\d/.test(address)
  if (hasNumber) {
    suggestions.push('Agregar el barrio o zona específica')
  }

  return suggestions.length > 0 ? suggestions : [
    'Intenta con una dirección más completa',
    'Verifica la ortografía de la dirección'
  ]
}
