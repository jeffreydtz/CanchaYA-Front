/**
 * Authentication Context for CanchaYA
 * Manages client-side authentication state and real-time updates
 * Now integrated with real backend authentication
 *
 * IMPORTANT: AuthProvider must wrap the entire app in app/layout.tsx for session persistence.
 */

'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getCookie, setCookie, deleteCookie } from '@/lib/auth'
import apiClient, { User } from '@/lib/api-client'
import { toast } from 'sonner'
import { jwtDecode } from 'jwt-decode'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  loading: boolean
  refreshUser: () => Promise<void>
}

interface DecodedUser {
  id: string
  nombre: string
  email: string
  rol: string
  [key: string]: any
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Utilidad para construir la URL base sin duplicar /api
function getBackendUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://backend-cancha-ya-production.up.railway.app/api';
  // Si la base ya termina en /api y el path empieza con /api, quitamos uno
  if (base.endsWith('/api') && path.startsWith('/api')) {
    return base + path.replace(/^\/api/, '');
  }
  // Si la base NO termina en /api y el path NO empieza con /, agregamos /
  if (!base.endsWith('/') && !path.startsWith('/')) {
    return base + '/' + path;
  }
  // Si la base termina en / y el path empieza con /, evitamos doble barra
  if (base.endsWith('/') && path.startsWith('/')) {
    return base + path.slice(1);
  }
  return base + path;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DecodedUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Inicializa el estado de autenticación leyendo el token y decodificando el usuario
  useEffect(() => {
    if (typeof window === 'undefined') return
    const token = getCookie('token')
    if (token) {
      try {
        const decoded: DecodedUser = jwtDecode(token)
        setUser(decoded)
      } catch (e) {
        setUser(null)
        deleteCookie('token')
      }
    } else {
      setUser(null)
    }
    setLoading(false)
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
        document.cookie = `token=${response.data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
        setCookie('token', response.data.token, 7)
        try {
          const decoded: DecodedUser = jwtDecode(response.data.token)
          setUser(decoded)
        } catch (e) {
          setUser(null)
          deleteCookie('token')
          toast.error('Token inválido')
          return false
        }
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
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  const refreshUser = async () => {
    if (typeof window === 'undefined') return
    const token = getCookie('token')
    if (!token) {
      setUser(null)
      return
    }
    try {
      const decoded: DecodedUser = jwtDecode(token)
      setUser(decoded)
    } catch (e) {
      setUser(null)
      deleteCookie('token')
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
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