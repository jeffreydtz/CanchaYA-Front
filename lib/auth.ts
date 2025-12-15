/**
 * Client-side Authentication utilities for CanchaYA
 * Handles JWT token management and user data on client-side
 */

'use client'

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null
  }

  try {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift() || null
      // Decode the cookie value since we URL-encode when setting
      if (cookieValue) {
        try {
          return decodeURIComponent(cookieValue)
        } catch (decodeError) {
          // If decode fails, return the raw value
          return cookieValue
        }
      }
    }
  } catch (e) {
    // Silently handle cookie reading errors
  }
  return null
}

export function setCookie(name: string, value: string, days: number = 7): void {
  if (typeof document === 'undefined') {
    return
  }

  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:'
  // URL encode the value to ensure special characters in JWT tokens are preserved
  const encodedValue = encodeURIComponent(value)
  document.cookie = `${name}=${encodedValue}; expires=${expires}; path=/; SameSite=Strict${isSecure ? '; Secure' : ''}`
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
  deleteCookie('refreshToken')
  localStorage.removeItem('user')

  // Redirect to login
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}

/**
 * Get refresh token from cookies
 */
export function getRefreshToken(): string | null {
  return getCookie('refreshToken')
}

/**
 * Set both access and refresh tokens
 */
export function setAuthTokens(accessToken: string, refreshToken: string): void {
  setCookie('token', accessToken, 7) // Access token valid for 7 days
  setCookie('refreshToken', refreshToken, 30) // Refresh token valid for 30 days
} 