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
  isAdmin: boolean // True if nivelAcceso === 'admin'
  isAdminClub: boolean // True if nivelAcceso === 'admin-club'
  isSuperAdmin: boolean // True if nivelAcceso === 'admin' (global admin)
  loading: boolean
  refreshUser: () => Promise<void>
  personaId: string | null // Added for backend API compatibility
  userId: string | null     // User ID from JWT
  clubIds: string[] // Array of club IDs for scoped access (admin-club users)
  nivelAcceso: 'usuario' | 'admin-club' | 'admin' | null // REAL permission level - USE THIS
  displayRole: string | null // Display role (informative only - e.g., "recepcionista")
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Helper function to decode JWT and extract nivelAcceso, rol, and clubIds
 * CRITICAL: nivelAcceso is the real permission level, rol is just for display
 */
function decodeJWTToken(token: string): {
  nivelAcceso: 'usuario' | 'admin-club' | 'admin'
  displayRole: string
  clubIds: string[]
} | null {
  try {
    const decoded = jwtDecode<JWTPayload>(token)
    return {
      nivelAcceso: decoded.nivelAcceso,
      displayRole: decoded.rol,
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
  const [nivelAcceso, setNivelAcceso] = useState<'usuario' | 'admin-club' | 'admin' | null>(null)
  const [displayRole, setDisplayRole] = useState<string | null>(null)

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
            const tokenInfo = decodeJWTToken(token)

            if (!isMounted) return

            // Garantiza que los campos requeridos existan
            const userData: User = {
              id: decoded.id,
              nombre: decoded.email.split('@')[0] || 'Usuario',
              email: decoded.email,
              rol: decoded.rol, // Display role (informative only)
              nivelAcceso: decoded.nivelAcceso, // REAL permission level
              activo: true,
              fechaCreacion: new Date().toISOString(),
              clubIds: tokenInfo?.clubIds || [], // Add clubIds from JWT
            }
            setUser(userData)
            setPersonaId(decoded.personaId || null)
            setUserId(decoded.id || null)
            setNivelAcceso(decoded.nivelAcceso)
            setDisplayRole(decoded.rol)
            setClubIds(tokenInfo?.clubIds || [])

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
            setNivelAcceso(null)
            setDisplayRole(null)
            setClubIds([])
            deleteCookie('token')
          }
        } else {
          setUser(null)
          setPersonaId(null)
          setUserId(null)
          setNivelAcceso(null)
          setDisplayRole(null)
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
          const tokenInfo = decodeJWTToken(accessToken)

          // Validate that required fields exist
          if (!decoded.id || !decoded.email || !decoded.nivelAcceso) {
            throw new Error('Token missing required fields')
          }

          const userData: User = {
            id: decoded.id,
            nombre: decoded.email.split('@')[0] || 'Usuario',
            email: decoded.email,
            rol: decoded.rol, // Display role (informative only)
            nivelAcceso: decoded.nivelAcceso, // REAL permission level
            activo: true,
            fechaCreacion: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : new Date().toISOString(),
            clubIds: tokenInfo?.clubIds || [],
          }

          setUser(userData)
          setPersonaId(decoded.personaId || null)
          setUserId(decoded.id || null)
          setNivelAcceso(decoded.nivelAcceso)
          setDisplayRole(decoded.rol)
          setClubIds(tokenInfo?.clubIds || [])

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
            } catch {
              // Continue even if persona fetch fails
            }
          }

          return true
        } catch {
          setUser(null)
          deleteCookie('token')
          deleteCookie('refreshToken')
          toast.error('Token inválido')
          return false
        }
      }

      toast.error('Error en la autenticación')
      return false
    } catch {
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
    setNivelAcceso(null)
    setDisplayRole(null)
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
      setNivelAcceso(null)
      setDisplayRole(null)
      setClubIds([])
      return
    }

    try {
      const decoded = jwtDecode<JWTPayload>(token)
      const tokenInfo = decodeJWTToken(token)
      console.log('Token decoded successfully:', decoded)

      const userData: User = {
        id: decoded.id,
        nombre: decoded.email.split('@')[0] || 'Usuario',
        email: decoded.email,
        rol: decoded.rol, // Display role (informative only)
        nivelAcceso: decoded.nivelAcceso, // REAL permission level
        activo: true,
        fechaCreacion: new Date().toISOString(),
        clubIds: tokenInfo?.clubIds || [],
      }

      setUser(userData)
      setUserId(decoded.id || null)
      setNivelAcceso(decoded.nivelAcceso)
      setDisplayRole(decoded.rol)
      setClubIds(tokenInfo?.clubIds || [])
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
      setNivelAcceso(null)
      setDisplayRole(null)
      setClubIds([])
      deleteCookie('token')
    }
  }

  const isAuthenticated = !!user
  // CRITICAL: Use nivelAcceso for permission checks, NOT rol
  const isAdmin = nivelAcceso === 'admin'
  const isAdminClub = nivelAcceso === 'admin-club'
  const isSuperAdmin = nivelAcceso === 'admin' // True for global admin

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
    nivelAcceso,
    displayRole,
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