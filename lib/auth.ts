/**
 * Client-side Authentication utilities for CanchaYA
 * Handles JWT token management and user data on client-side
 */

'use client'

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null
  }
  
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }
  return null
}

export function setCookie(name: string, value: string, days: number = 7): void {
  if (typeof document === 'undefined') {
    return
  }
  
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Strict`
}

export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') {
    return
  }
  
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

export function getClientUser() {
  // This will return user data from the auth context
  // The actual user data should come from the auth context, not from here
  return null
}

export function isClientAuthenticated(): boolean {
  const token = getCookie('token')
  return !!token
}

export function logoutUser(): void {
  // Clear client-side auth state
  deleteCookie('token')
  localStorage.removeItem('user')
  
  // Redirect to login
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
} 