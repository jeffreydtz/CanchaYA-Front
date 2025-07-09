/**
 * Client-side Authentication utilities for CanchaYA
 * Handles JWT token management, cookies, and auth state on client-side only
 */

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

export interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    isAdmin: boolean
}

// Simple JWT decode without verification (for client-side)
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

// Client-side cookie helpers (for client components)
export function setCookie(name: string, value: string, days: number = 7): void {
    if (typeof window === 'undefined') return

    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)

    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`
}

export function getCookie(name: string): string | null {
    if (typeof window === 'undefined') return null

    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null
    }
    return null
}

export function removeCookie(name: string): void {
    if (typeof window === 'undefined') return

    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
}

export function getClientUser(): User | null {
    const token = getCookie('token')
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

export function isClientAuthenticated(): boolean {
    const token = getCookie('token')
    if (!token) return false

    try {
        const payload = decodeJWT(token)
        if (!payload) return false
        return Date.now() < payload.exp * 1000
    } catch {
        return false
    }
}

export function isClientAdmin(): boolean {
    const user = getClientUser()
    return user?.rol === 'ADMINISTRADOR'
}

// Auth actions for login/logout
export function loginUser(token: string): void {
    setCookie('token', token, 7) // 7 days
}

export function logoutUser(): void {
    removeCookie('token')
    if (typeof window !== 'undefined') {
        window.location.href = '/login'
    }
} 