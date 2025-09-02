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
        const userData: User = {
          id: decoded.id,
          nombre: decoded.nombre || decoded.email.split('@')[0] || 'Usuario',
          email: decoded.email,
          rol: decoded.rol === 'ADMINISTRADOR' || decoded.rol === 'admin' ? 'admin' : 'usuario',
          activo: decoded.activo ?? true,
          fechaCreacion: decoded.fechaCreacion ?? new Date().toISOString(),
        }
        setUser(userData)
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
      console.log('Attempting login for:', email)
      
      const response = await apiClient.login({ email, password })
      console.log('Login response:', response)
      
      if (response.error) {
        console.error('Login error from API:', response.error)
        toast.error(response.error)
        return false
      }
      
      // Check for both token and accessToken fields
      const authToken = response.data?.token || response.data?.accessToken
      
      if (authToken) {
        console.log('Token received, saving...')
        
        // Clear any existing cookie first
        deleteCookie('token')
        
        // Set cookie using the utility function
        setCookie('token', authToken, 7)
        
        console.log('Cookie set, decoding token...')
        
        try {
          const decoded: any = jwtDecode(authToken)
          console.log('Token decoded successfully:', decoded)
          console.log('Token fields - id:', decoded.id, 'nombre:', decoded.nombre, 'email:', decoded.email, 'rol:', decoded.rol)
          
          // Validate that required fields exist (nombre is optional, can use email as fallback)
          if (!decoded.id || !decoded.email) {
            console.error('Missing required fields in token:', decoded)
            throw new Error('Token missing required fields')
          }
          
          const userData: User = {
            id: decoded.id,
            nombre: decoded.nombre || decoded.email.split('@')[0] || 'Usuario',
            email: decoded.email,
            rol: decoded.rol === 'ADMINISTRADOR' || decoded.rol === 'admin' ? 'admin' : 'usuario',
            activo: decoded.activo ?? true,
            fechaCreacion: decoded.fechaCreacion ?? new Date().toISOString(),
          }
          
          setUser(userData)
          console.log('User set in context successfully:', userData)
          
          // Verify cookie was saved
          setTimeout(() => {
            const savedToken = getCookie('token')
            console.log('Cookie verification - token saved:', savedToken ? 'YES' : 'NO')
          }, 100)
          
          toast.success('¡Bienvenido!')
          return true
        } catch (e) {
          console.error('Error decoding token:', e)
          console.error('Token that failed to decode:', authToken)
          setUser(null)
          deleteCookie('token')
          toast.error('Token inválido')
          return false
        }
      }
      
      console.error('No token in response')
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