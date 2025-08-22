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

const AuthContext = createContext<AuthContextType | undefined>(undefined)


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Inicializa el estado de autenticación leyendo el token y decodificando el usuario
  useEffect(() => {
    if (typeof window === 'undefined') return
    const token = getCookie('token')
    if (token) {
      try {
        const decoded: any = jwtDecode(token)
        // Garantiza que los campos requeridos existan
        setUser({
          id: decoded.id,
          nombre: decoded.nombre,
          email: decoded.email,
          rol: decoded.rol === 'ADMINISTRADOR' ? 'admin' : 'usuario',
          activo: decoded.activo ?? true,
          fechaCreacion: decoded.fechaCreacion ?? '',
        })
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
          const decoded: any = jwtDecode(response.data.token)
          setUser({
            id: decoded.id,
            nombre: decoded.nombre,
            email: decoded.email,
            rol: decoded.rol === 'ADMINISTRADOR' ? 'admin' : 'usuario',
            activo: decoded.activo ?? true,
            fechaCreacion: decoded.fechaCreacion ?? '',
          })
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
      const decoded: any = jwtDecode(token)
      setUser({
        id: decoded.id,
        nombre: decoded.nombre,
        email: decoded.email,
        rol: decoded.rol === 'ADMINISTRADOR' ? 'admin' : 'usuario',
        activo: decoded.activo ?? true,
        fechaCreacion: decoded.fechaCreacion ?? '',
      })
    } catch (e) {
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