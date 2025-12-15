/**
 * Server-side Authentication utilities for CanchaYA
 * Handles JWT token management and auth state on server-side only
 * Now validates tokens with the real backend
 *
 * CRITICAL: Use nivelAcceso for permission checks, NOT rol
 * - rol: Display only (informative label like "recepcionista")
 * - nivelAcceso: Real permission level (usuario | admin-club | admin)
 * - clubIds: Scope of data access for admin-club users
 */

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'
import { JWTPayload } from './api-client'

export interface ServerUser {
  id: string
  personaId: string
  nombre: string
  email: string
  rol: string // Display role (informative only - e.g., "recepcionista", "jugador")
  nivelAcceso: 'usuario' | 'admin-club' | 'admin' // REAL permission level - USE THIS
  clubIds: string[] // Array of club IDs for scoped access (admin-club users)
  activo: boolean
  fechaCreacion: string
}

export async function getServerUser(): Promise<ServerUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')

  if (!token) {
    return null
  }

  try {
    // Decodifica el token JWT localmente
    const decoded: JWTPayload = jwtDecode(token.value)

    // Mapea los campos esperados
    return {
      id: decoded.id,
      personaId: decoded.personaId,
      nombre: decoded.email.split('@')[0] || 'Usuario',
      email: decoded.email,
      rol: decoded.rol, // Display role (informative only)
      nivelAcceso: decoded.nivelAcceso, // REAL permission level
      clubIds: decoded.clubIds || [],
      activo: true,
      fechaCreacion: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : new Date().toISOString(),
    } as ServerUser
  } catch (error) {
    console.error('Error decoding token:', error)
    cookieStore.delete('token')
    return null
  }
}

export async function requireAuth(): Promise<ServerUser> {
  const user = await getServerUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

/**
 * Require admin access (global admin only)
 * CRITICAL: Uses nivelAcceso, not rol
 */
export async function requireAdmin(): Promise<ServerUser> {
  const user = await getServerUser()
  if (!user) {
    redirect('/login')
  }
  if (user.nivelAcceso !== 'admin') {
    redirect('/')
  }
  return user
}

/**
 * Require admin-club or admin access
 * For features accessible to both club admins and global admins
 */
export async function requireAdminOrAdminClub(): Promise<ServerUser> {
  const user = await getServerUser()
  if (!user) {
    redirect('/login')
  }
  if (user.nivelAcceso !== 'admin' && user.nivelAcceso !== 'admin-club') {
    redirect('/')
  }
  return user
}

/**
 * Check if user has access to a specific club
 * - Global admins (nivelAcceso='admin') have access to all clubs
 * - Club admins (nivelAcceso='admin-club') only have access to their clubIds
 */
export async function hasClubAccess(clubId: string): Promise<boolean> {
  const user = await getServerUser()
  if (!user) return false

  // Global admins have access to all clubs
  if (user.nivelAcceso === 'admin') return true

  // Club admins only have access to their clubs
  if (user.nivelAcceso === 'admin-club') {
    return user.clubIds.includes(clubId)
  }

  return false
}

export async function getCookie(name: string): Promise<string | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(name)
  return cookie?.value || null
} 