/**
 * Server-side Authentication utilities for CanchaYA
 * Handles JWT token management and auth state on server-side only
 */

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getServerUser() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')

    if (!token) {
        return null
    }

    // Mock user data for now
    return {
        id: '1',
        nombre: 'Usuario Demo',
        email: 'demo@example.com',
        rol: 'usuario',
    }
}

export async function requireAuth() {
    const user = await getServerUser()
    if (!user) {
        redirect('/login')
    }
    return user
}

export async function requireAdmin() {
    const user = await getServerUser()
    if (!user) {
        redirect('/login')
    }
    if (user.rol !== 'admin') {
        redirect('/')
    }
    return user
} 