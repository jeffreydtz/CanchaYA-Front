/**
 * Server-side Authentication utilities for CanchaYA
 * Handles JWT token management and auth state on server-side only
 */

import { cookies } from 'next/headers'
import { User } from './api-client'

export interface JWTPayload {
    sub: string
    email: string
    nombre: string
    apellido: string
    rol: 'JUGADOR' | 'ADMINISTRADOR'
    iat: number
    exp: number
}

// Simple JWT decode without verification (for server-side)
function decodeJWT(token: string): JWTPayload | null {
    try {
        const parts = token.split('.')
        if (parts.length !== 3) return null

        const payload = parts[1]
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
        return decoded as JWTPayload
    } catch {
        return null
    }
}

// Server-side cookie helpers
export async function getServerToken(): Promise<string | null> {
    const cookieStore = await cookies()
    return cookieStore.get('token')?.value || null
}

export async function getServerUser(): Promise<User | null> {
    const token = await getServerToken()
    if (!token) return null

    try {
        const payload = decodeJWT(token)
        if (!payload) return null

        return {
            id: payload.sub,
            nombre: payload.nombre,
            apellido: payload.apellido,
            email: payload.email,
            rol: payload.rol,
            activo: true,
            fechaCreacion: new Date().toISOString(),
        }
    } catch {
        return null
    }
}

export async function isServerAuthenticated(): Promise<boolean> {
    const token = await getServerToken()
    if (!token) return false

    try {
        const payload = decodeJWT(token)
        if (!payload) return false
        return Date.now() < payload.exp * 1000
    } catch {
        return false
    }
}

export async function isServerAdmin(): Promise<boolean> {
    const user = await getServerUser()
    return user?.rol === 'ADMINISTRADOR'
}

// Validation helpers
export async function requireAuth(): Promise<User> {
    const user = await getServerUser()
    if (!user) {
        throw new Error('Authentication required')
    }
    return user
}

export async function requireAdmin(): Promise<User> {
    const user = await requireAuth()
    if (user.rol !== 'ADMINISTRADOR') {
        throw new Error('Admin access required')
    }
    return user
} 