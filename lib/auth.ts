'use client'

export function getClientUser() {
    // Mock user data for now
    return {
        id: '1',
        nombre: 'Usuario Demo',
        email: 'demo@example.com',
        rol: 'usuario',
    }
}

export function isClientAuthenticated(): boolean {
    return !!getClientUser()
}

export function logoutUser(): void {
    // Clear client-side auth state
    localStorage.removeItem('user')
    localStorage.removeItem('token')
} 