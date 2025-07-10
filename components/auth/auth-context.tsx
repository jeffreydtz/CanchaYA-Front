/**
 * Authentication Context for CanchaYA
 * Manages client-side authentication state and real-time updates
 */

'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getClientUser } from '@/lib/auth'

interface AuthContextType {
  user: { id: string; nombre: string; email: string; rol: string } | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; nombre: string; email: string; rol: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = getClientUser()
        if (currentUser) {
          setUser(currentUser)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Mock login for now
      const mockUser = {
        id: '1',
        nombre: 'Usuario Demo',
        email,
        rol: 'usuario'
      }
      setUser(mockUser)
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
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