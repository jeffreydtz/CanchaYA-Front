'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'
import { useAuth } from '@/components/auth/auth-context'

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, loading, nivelAcceso } = useAuth()

  useEffect(() => {
    // If already authenticated, redirect based on nivelAcceso (permission level)
    if (!loading && isAuthenticated) {
      let redirectPath = '/'

      // Redirect based on nivelAcceso - admin and admin-club go to admin panel, others to home
      // CRITICAL: Use nivelAcceso for routing decisions, NOT rol
      if (nivelAcceso === 'admin') {
        // Global admin redirects to admin dashboard with full access
        redirectPath = '/admin/dashboard'
      } else if (nivelAcceso === 'admin-club') {
        // Club-specific admin redirects to admin dashboard with club filter
        redirectPath = '/admin/dashboard'
      } else {
        // All other permission levels (usuario) redirect to home
        redirectPath = '/'
      }

      router.push(redirectPath)
    }
  }, [isAuthenticated, loading, nivelAcceso, router])

  // Show nothing while checking auth or redirecting
  if (loading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Cargando...</p>
        </div>
      </div>
    )
  }

  return <LoginForm />
}
