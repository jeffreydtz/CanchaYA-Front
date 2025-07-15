/**
 * Server-side Authentication utilities for CanchaYA
 * Handles JWT token management and auth state on server-side only
 * Now validates tokens with the real backend
 */

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://backend-cancha-ya-production.up.railway.app/api'

export interface ServerUser {
  id: string
  nombre: string
  email: string
  telefono?: string
  rol: 'JUGADOR' | 'ADMINISTRADOR'
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
    // Validate token with backend
    const response = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      // Token is invalid, remove it
      cookieStore.delete('token')
      return null
    }

    const userData = await response.json()
    return userData as ServerUser
  } catch (error) {
    console.error('Error validating token:', error)
    // If there's an error, consider the token invalid
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

export async function requireAdmin(): Promise<ServerUser> {
  const user = await getServerUser()
  if (!user) {
    redirect('/login')
  }
  if (user.rol !== 'ADMINISTRADOR') {
    redirect('/')
  }
  return user
}

export async function getCookie(name: string): Promise<string | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(name)
  return cookie?.value || null
} 