/**
 * Token Refresh Hook for CanchaYA
 * Automatically refreshes access token before expiration
 */

'use client'

import { useEffect, useRef } from 'react'
import { getCookie, getRefreshToken, setAuthTokens, deleteCookie } from '@/lib/auth'
import apiClient from '@/lib/api-client'
import { jwtDecode } from 'jwt-decode'
import { toast } from 'sonner'

interface DecodedToken {
  exp: number
  iat: number
  id: string
  email: string
  rol: string
}

/**
 * Hook to automatically refresh access token
 * Checks token expiration and refreshes 5 minutes before expiry
 */
export function useTokenRefresh() {
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const setupTokenRefresh = () => {
      const accessToken = getCookie('token')
      const refreshToken = getRefreshToken()

      if (!accessToken || !refreshToken) {
        return
      }

      try {
        const decoded = jwtDecode<DecodedToken>(accessToken)
        const now = Date.now() / 1000 // Convert to seconds
        const expiresIn = decoded.exp - now

        // Refresh 5 minutes (300 seconds) before expiration
        const refreshIn = Math.max(0, (expiresIn - 300) * 1000) // Convert to milliseconds

        console.log(`Token expires in ${Math.floor(expiresIn / 60)} minutes. Will refresh in ${Math.floor(refreshIn / 1000 / 60)} minutes.`)

        // Clear any existing timeout
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current)
        }

        // Set up automatic refresh
        refreshTimeoutRef.current = setTimeout(async () => {
          try {
            console.log('Refreshing access token...')
            const response = await apiClient.refreshToken(refreshToken)

            if (response.data?.accessToken) {
              // Update access token (keep existing refresh token)
              setAuthTokens(response.data.accessToken, refreshToken)
              console.log('Access token refreshed successfully')

              // Schedule next refresh
              setupTokenRefresh()
            } else {
              console.error('Failed to refresh token:', response.error)
              toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')

              // Clear tokens and redirect to login
              deleteCookie('token')
              deleteCookie('refreshToken')

              if (typeof window !== 'undefined') {
                window.location.href = '/login'
              }
            }
          } catch (error) {
            console.error('Error refreshing token:', error)
            toast.error('Error al refrescar la sesión')
          }
        }, refreshIn)

      } catch (error) {
        console.error('Error decoding token:', error)
        // If token is invalid, clear it
        deleteCookie('token')
        deleteCookie('refreshToken')
      }
    }

    // Initial setup
    setupTokenRefresh()

    // Cleanup on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [])
}
