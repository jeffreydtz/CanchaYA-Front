/**
 * Authentication Context for CanchaYA
 * Manages client-side authentication state and real-time updates
 * Now integrated with real backend authentication
 */

'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getCookie, setCookie, deleteCookie } from '@/lib/auth'
import apiClient, { User } from '@/lib/api-client'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  loading: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getCookie('token')
      if (token) {
        try {
          // Validate token with backend and get user data
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://backend-cancha-ya-production.up.railway.app/api'}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })

          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
          } else {
            // Invalid token, remove it
            deleteCookie('token')
            setUser(null)
          }
        } catch (error) {
          console.error('Auth initialization error:', error)
          deleteCookie('token')
          setUser(null)
        }
      }
      setLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      const response = await apiClient.login({ email, password })
      
      if (response.error) {
        toast.error(response.error)
        return false
      }

      if (response.data?.token) {
        // Set the token cookie immediately (client-side)
        document.cookie = `token=${response.data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
        // Optionally, also call setCookie for consistency
        setCookie('token', response.data.token, 7)
        // Now refresh the user from the backend using the new token
        await refreshUser();
        toast.success('¡Bienvenido!')
        return true
      }

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

  const logout = () => {
    deleteCookie('token')
    setUser(null)
    toast.success('Sesión cerrada correctamente')
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  const refreshUser = async () => {
    const token = getCookie('token')
    if (!token) {
      setUser(null)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://backend-cancha-ya-production.up.railway.app/api'}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        // Invalid token, remove it
        deleteCookie('token')
        setUser(null)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      deleteCookie('token')
      setUser(null)
    }
  }

  const isAuthenticated = !!user
  const isAdmin = user?.rol === 'ADMINISTRADOR'

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    loading,
    refreshUser,
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