/**
 * Authentication Context for CanchaYA
 * Manages client-side authentication state and real-time updates
 */

'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { 
  getClientUser, 
  isClientAuthenticated, 
  isClientAdmin, 
  logoutUser,
  type AuthState 
} from '@/lib/auth'
import { User } from '@/lib/api-client'
import apiClient from '@/lib/api-client'

interface AuthContextType extends AuthState {
  login: (token: string) => void
  logout: () => void
  refreshUser: () => Promise<void>
  eventSource: EventSource | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [eventSource, setEventSource] = useState<EventSource | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user && !!token
  const isAdmin = user?.rol === 'ADMINISTRADOR'

  // Initialize auth state
  useEffect(() => {
    const initAuth = () => {
      try {
        if (isClientAuthenticated()) {
          const currentUser = getClientUser()
          setUser(currentUser)
          setToken(document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1"))
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        logout()
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  // Setup real-time events when user is authenticated
  useEffect(() => {
    if (user && !eventSource) {
      try {
        const es = apiClient.createEventSource(user.id)
        
        es.onmessage = (event) => {
          const data = JSON.parse(event.data)
          handleRealtimeEvent(data)
        }

        es.onerror = (error) => {
          console.error('EventSource error:', error)
          es.close()
          setEventSource(null)
          
          // Retry connection after 5 seconds
          setTimeout(() => {
            if (user) {
              const newEs = apiClient.createEventSource(user.id)
              setEventSource(newEs)
            }
          }, 5000)
        }

        setEventSource(es)

        return () => {
          es.close()
          setEventSource(null)
        }
      } catch (error) {
        console.error('Failed to setup EventSource:', error)
      }
    }
  }, [user, eventSource])

  const handleRealtimeEvent = (data: any) => {
    switch (data.type) {
      case 'TURNO_LIBERADO':
        toast.success('🔥 Turno disponible!', {
          description: `Se liberó un turno en ${data.cancha} para ${data.fecha} a las ${data.hora}`,
          action: {
            label: 'Ver cancha',
            onClick: () => router.push(`/cancha/${data.canchaId}`)
          }
        })
        break
        
      case 'RESERVA_CONFIRMADA':
        toast.success('✅ Reserva confirmada', {
          description: 'Tu reserva ha sido confirmada exitosamente'
        })
        break
        
      case 'RECORDATORIO_CONFIRMACION':
        toast.warning('⏰ Confirma tu asistencia', {
          description: `Tienes ${data.horasRestantes}h para confirmar tu reserva`,
          action: {
            label: 'Confirmar',
            onClick: () => router.push('/mis-reservas')
          }
        })
        break
        
      case 'RESERVA_LIBERADA':
        toast.error('⚠️ Reserva liberada', {
          description: 'Tu reserva fue liberada por falta de confirmación'
        })
        break
        
      default:
        console.log('Unknown event type:', data.type)
    }
  }

  const login = (newToken: string) => {
    try {
      const newUser = getClientUser()
      if (newUser) {
        setUser(newUser)
        setToken(newToken)
        toast.success(`¡Bienvenido, ${newUser.nombre}!`)
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Error en el inicio de sesión')
    }
  }

  const logout = () => {
    try {
      if (eventSource) {
        eventSource.close()
        setEventSource(null)
      }
      
      setUser(null)
      setToken(null)
      logoutUser()
      toast.info('Sesión cerrada')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const refreshUser = async () => {
    try {
      const response = await apiClient.me()
      if (response.data) {
        setUser(response.data)
      } else if (response.status === 401) {
        logout()
      }
    } catch (error) {
      console.error('Refresh user error:', error)
      logout()
    }
  }

  const contextValue: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    refreshUser,
    eventSource,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook for protected routes
export function useRequireAuth() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  return { user, isAuthenticated }
}

// Hook for admin routes
export function useRequireAdmin() {
  const { user, isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    } else if (!isAdmin) {
      router.push('/')
      toast.error('Acceso denegado: Se requieren permisos de administrador')
    }
  }, [isAuthenticated, isAdmin, router])

  return { user, isAuthenticated, isAdmin }
} 