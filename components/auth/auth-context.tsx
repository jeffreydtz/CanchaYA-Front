/**
 * Authentication Context for CanchaYA
 * Manages client-side authentication state and real-time updates
 * Now integrated with real backend authentication
 *
 * IMPORTANT: AuthProvider must wrap the entire app in app/layout.tsx for session persistence.
 */

'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getCookie, deleteCookie, setAuthTokens, getRefreshToken } from '@/lib/auth'
import apiClient, { UserLegacy, JWTPayload } from '@/lib/api-client'
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
  isAdminClub: boolean // New flag for admin-club role
  isSuperAdmin: boolean // True if admin (global), false if admin-club
  loading: boolean
  refreshUser: () => Promise<void>
  personaId: string | null // Added for backend API compatibility
  userId: string | null     // User ID from JWT
  clubIds: string[] // Array of club IDs for scoped access (admin-club users)
  userRole: string | null // Complete role information (admin, admin-club, usuario, or custom business roles)
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Helper function to decode JWT and extract role and clubIds
 */
function decodeJWTToken(token: string): { role: string; clubIds: string[] } | null {
  try {
    const decoded = jwtDecode<JWTPayload>(token)
    return {
      role: decoded.rol,
      clubIds: decoded.clubIds || [],
    }
  } catch (e) {
    console.error('Error decoding JWT token:', e)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [personaId, setPersonaId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [clubIds, setClubIds] = useState<string[]>([])
  const [userRole, setUserRole] = useState<string | null>(null)

  // Enable automatic token refresh
  useTokenRefresh()

  // Inicializa el estado de autenticación leyendo el token y decodificando el usuario
  useEffect(() => {
    if (typeof window === 'undefined') return

    let isMounted = true

    const initializeAuth = async () => {
      try {
        const token = getCookie('token')
        if (!isMounted) return

        if (token) {
          try {
            const decoded = jwtDecode<JWTPayload>(token)
            const roleInfo = decodeJWTToken(token)

            if (!isMounted) return

            // Garantiza que los campos requeridos existan
            const userData: User = {
              id: decoded.sub,
              nombre: decoded.email.split('@')[0] || 'Usuario',
              email: decoded.email,
              rol: decoded.rol, // Use decoded role directly from JWT
              activo: true,
              fechaCreacion: new Date().toISOString(),
              clubIds: roleInfo?.clubIds || [], // Add clubIds from JWT
            }
            setUser(userData)
            setPersonaId(decoded.personaId || null)
            setUserId(decoded.sub || null)
            setUserRole(decoded.rol)
            setClubIds(roleInfo?.clubIds || [])

            // Fetch persona data to get avatar URL on initial load
            if (decoded.personaId) {
              try {
                const personaResponse = await apiClient.getPersona(decoded.personaId)
                if (!isMounted) return

                if (personaResponse.data?.avatarUrl) {
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
            console.error('Error decoding token on init:', e)
            setUser(null)
            setPersonaId(null)
            setUserId(null)
            setUserRole(null)
            setClubIds([])
            deleteCookie('token')
          }
        } else {
          setUser(null)
          setPersonaId(null)
          setUserId(null)
          setUserRole(null)
          setClubIds([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
          setInitialLoad(false)
        }
      }
    }

    initializeAuth()

    return () => {
      isMounted = false
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)

      const response = await apiClient.login({ email, password })

      if (response.error) {
        toast.error(response.error)
        return false
      }

      // New API returns: { userId, accessToken, refreshToken }
      const { accessToken, refreshToken } = response.data || {}

      if (accessToken && refreshToken) {
        // Save both tokens
        setAuthTokens(accessToken, refreshToken)

        try {
          const decoded = jwtDecode<JWTPayload>(accessToken)
          const roleInfo = decodeJWTToken(accessToken)

          // Validate that required fields exist
          if (!decoded.sub || !decoded.email) {
            throw new Error('Token missing required fields')
          }

          const userData: User = {
            id: decoded.sub,
            nombre: decoded.email.split('@')[0] || 'Usuario',
            email: decoded.email,
            rol: decoded.rol,
            activo: true,
            fechaCreacion: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : new Date().toISOString(),
            clubIds: roleInfo?.clubIds || [],
          }

          setUser(userData)
          setPersonaId(decoded.personaId || null)
          setUserId(decoded.sub || null)
          setUserRole(decoded.rol)
          setClubIds(roleInfo?.clubIds || [])

          // Fetch persona data to get avatar URL
          if (decoded.personaId) {
            try {
              const personaResponse = await apiClient.getPersona(decoded.personaId)
              if (personaResponse.data?.avatarUrl) {
                const avatarUrl = personaResponse.data.avatarUrl
                setUser((prevUser) =>
                  prevUser ? { ...prevUser, avatarUrl } : null
                )
              }
            } catch (error) {
              // Continue even if persona fetch fails
            }
          }

          return true
        } catch (e) {
          setUser(null)
          deleteCookie('token')
          deleteCookie('refreshToken')
          toast.error('Token inválido')
          return false
        }
      }

      toast.error('Error en la autenticación')
      return false
    } catch (error) {
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

    // Clear client-side tokens and auth state
    deleteCookie('token')
    deleteCookie('refreshToken')
    setUser(null)
    setPersonaId(null)
    setUserId(null)
    setUserRole(null)
    setClubIds([])
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
      setUserRole(null)
      setClubIds([])
      return
    }

    try {
      const decoded = jwtDecode<JWTPayload>(token)
      const roleInfo = decodeJWTToken(token)
      console.log('Token decoded successfully:', decoded)

      const userData: User = {
        id: decoded.sub,
        nombre: decoded.email.split('@')[0] || 'Usuario',
        email: decoded.email,
        rol: decoded.rol,
        activo: true,
        fechaCreacion: new Date().toISOString(),
        clubIds: roleInfo?.clubIds || [],
      }

      setUser(userData)
      setUserId(decoded.sub || null)
      setUserRole(decoded.rol)
      setClubIds(roleInfo?.clubIds || [])
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
      setUserRole(null)
      setClubIds([])
      deleteCookie('token')
    }
  }

  const isAuthenticated = !!user
  const isAdmin = user?.rol === 'admin'
  const isAdminClub = user?.rol === 'admin-club'
  const isSuperAdmin = user?.rol === 'admin' // True for global admin

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    isAdminClub,
    isSuperAdmin,
    loading,
    refreshUser,
    personaId,
    userId,
    clubIds,
    userRole,
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