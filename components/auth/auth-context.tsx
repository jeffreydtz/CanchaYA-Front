/**
 * Authentication Context for CanchaYA
 * Manages client-side authentication state and real-time updates
 * Now integrated with real backend authentication
 *
 * IMPORTANT: AuthProvider must wrap the entire app in app/layout.tsx for session persistence.
 */

'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getCookie, setCookie, deleteCookie, setAuthTokens, getRefreshToken } from '@/lib/auth'
import apiClient, { UserLegacy, AuthMeResponse } from '@/lib/api-client'
import { toast } from 'sonner'
import { jwtDecode } from 'jwt-decode'
import { useTokenRefresh } from '@/hooks/use-token-refresh'

// Use UserLegacy for backward compatibility with existing components
type User = UserLegacy

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
  loading: boolean
  refreshUser: () => Promise<void>
  personaId: string | null // Added for backend API compatibility
  userId: string | null     // User ID from JWT
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [personaId, setPersonaId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Enable automatic token refresh
  useTokenRefresh()

  // Inicializa el estado de autenticación leyendo el token y decodificando el usuario
  useEffect(() => {
    if (typeof window === 'undefined') return

    const initializeAuth = async () => {
      const token = getCookie('token')
      if (token) {
        try {
          const decoded: any = jwtDecode(token)
          // Garantiza que los campos requeridos existan
          const userData: User = {
            id: decoded.id,
            nombre: decoded.nombre || decoded.email.split('@')[0] || 'Usuario',
            email: decoded.email,
            rol: decoded.rol === 'ADMINISTRADOR' || decoded.rol === 'admin' ? 'admin' : 'usuario',
            activo: decoded.activo ?? true,
            fechaCreacion: decoded.fechaCreacion ?? new Date().toISOString(),
          }
          setUser(userData)
          setPersonaId(decoded.personaId || null)
          setUserId(decoded.id || null)

          // Fetch persona data to get avatar URL on initial load
          if (decoded.personaId) {
            try {
              const personaResponse = await apiClient.getPersona(decoded.personaId)
              if (personaResponse.data?.avatarUrl) {
                console.log('Avatar URL fetched on initial load:', personaResponse.data.avatarUrl)
                const avatarUrl = personaResponse.data.avatarUrl
                setUser((prevUser) =>
                  prevUser ? { ...prevUser, avatarUrl } : null
                )
              }
            } catch (error) {
              console.error('Error fetching persona data for avatar on init:', error)
              // Continue even if persona fetch fails
            }
          }
        } catch (e) {
          setUser(null)
          setPersonaId(null)
          setUserId(null)
          deleteCookie('token')
        }
      } else {
        setUser(null)
        setPersonaId(null)
        setUserId(null)
      }
      setLoading(false)
      setInitialLoad(false)
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      console.log('Attempting login for:', email)

      const response = await apiClient.login({ email, password })
      console.log('Login response:', response)

      if (response.error) {
        console.error('Login error from API:', response.error)
        toast.error(response.error)
        return false
      }

      // New API returns: { userId, accessToken, refreshToken }
      const { accessToken, refreshToken } = response.data || {}

      if (accessToken && refreshToken) {
        console.log('Tokens received, saving...')

        // Save both tokens
        setAuthTokens(accessToken, refreshToken)

        console.log('Tokens saved, decoding access token...')

        try {
          const decoded: any = jwtDecode(accessToken)
          console.log('Token decoded successfully:', decoded)

          // Validate that required fields exist
          if (!decoded.id || !decoded.email) {
            console.error('Missing required fields in token:', decoded)
            throw new Error('Token missing required fields')
          }

          const userData: User = {
            id: decoded.id,
            nombre: decoded.nombre || decoded.email.split('@')[0] || 'Usuario',
            email: decoded.email,
            rol: decoded.rol === 'admin' ? 'admin' : 'usuario',
            activo: decoded.activo ?? true,
            fechaCreacion: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : new Date().toISOString(),
          }

          setUser(userData)
          setPersonaId(decoded.personaId || null)
          setUserId(decoded.id || null)
          console.log('User set in context successfully:', userData)

          // Fetch persona data to get avatar URL
          if (decoded.personaId) {
            try {
              const personaResponse = await apiClient.getPersona(decoded.personaId)
              if (personaResponse.data?.avatarUrl) {
                console.log('Avatar URL fetched after login:', personaResponse.data.avatarUrl)
                const avatarUrl = personaResponse.data.avatarUrl
                setUser((prevUser) =>
                  prevUser ? { ...prevUser, avatarUrl } : null
                )
              }
            } catch (error) {
              console.error('Error fetching persona data for avatar:', error)
              // Continue even if persona fetch fails
            }
          }

          return true
        } catch (e) {
          console.error('Error decoding token:', e)
          console.error('Token that failed to decode:', accessToken)
          setUser(null)
          deleteCookie('token')
          deleteCookie('refreshToken')
          toast.error('Token inválido')
          return false
        }
      }

      console.error('No tokens in response')
      toast.error('Error en la autenticación')
      return false
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Error del servidor. Intenta nuevamente.')
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    const refreshToken = getRefreshToken()

    // Call backend to revoke refresh token
    if (refreshToken) {
      try {
        await apiClient.logoutAuth(refreshToken)
      } catch (error) {
        console.error('Error revoking refresh token:', error)
      }
    }

    // Clear client-side tokens
    deleteCookie('token')
    deleteCookie('refreshToken')
    setUser(null)
    setPersonaId(null)
    setUserId(null)
    toast.success('Sesión cerrada correctamente')

    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  const refreshUser = async () => {
    if (typeof window === 'undefined') return

    console.log('Refreshing user...')
    const token = getCookie('token')
    console.log('Token from cookie:', token ? 'exists' : 'not found')

    if (!token) {
      console.log('No token found, setting user to null')
      setUser(null)
      return
    }

    try {
      const decoded: any = jwtDecode(token)
      console.log('Token decoded successfully:', decoded)

      const userData: User = {
        id: decoded.id,
        nombre: decoded.nombre || decoded.email.split('@')[0] || 'Usuario',
        email: decoded.email,
        rol: decoded.rol === 'ADMINISTRADOR' || decoded.rol === 'admin' ? 'admin' : 'usuario',
        activo: decoded.activo ?? true,
        fechaCreacion: decoded.fechaCreacion ?? new Date().toISOString(),
      }

      setUser(userData)
      console.log('User refreshed:', userData)

      // Fetch persona data to get avatar URL
      if (decoded.personaId) {
        try {
          const personaResponse = await apiClient.getPersona(decoded.personaId)
          if (personaResponse.data?.avatarUrl) {
            console.log('Avatar URL fetched:', personaResponse.data.avatarUrl)
            const avatarUrl = personaResponse.data.avatarUrl
            setUser((prevUser) =>
              prevUser ? { ...prevUser, avatarUrl } : null
            )
          }
        } catch (error) {
          console.error('Error fetching persona data for avatar:', error)
          // Continue even if persona fetch fails
        }
      }
    } catch (e) {
      console.error('Error decoding token on refresh:', e)
      setUser(null)
      deleteCookie('token')
    }
  }

  const isAuthenticated = !!user
  const isAdmin = user?.rol === 'admin'

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    loading,
    refreshUser,
    personaId,
    userId,
  }

  // Only show loading spinner on initial page load, not during navigation
  if (initialLoad && loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Cargando...</p>
        </div>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 