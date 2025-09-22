"use client"

/**
 * Loading Error Component for CanchaYA
 * Handles loading states with timeout detection and error boundaries
 */

import React, { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, RefreshCw, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

interface LoadingErrorProps {
  isLoading: boolean
  error?: Error | string | null
  onRetry?: () => void | Promise<void>
  timeout?: number // in milliseconds
  loadingText?: string
  children?: React.ReactNode
  fallback?: React.ReactNode
  showProgress?: boolean
  className?: string
}

interface AsyncWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  timeout?: number
  onTimeout?: () => void
}

export function LoadingError({
  isLoading,
  error,
  onRetry,
  timeout = 30000, // 30 seconds default
  loadingText = 'Cargando...',
  children,
  fallback,
  showProgress = false,
  className
}: LoadingErrorProps) {
  const [hasTimedOut, setHasTimedOut] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)

  // Reset timeout state when loading state changes
  useEffect(() => {
    if (!isLoading) {
      setHasTimedOut(false)
      setTimeElapsed(0)
      return
    }

    // Start timeout timer
    const timeoutTimer = setTimeout(() => {
      setHasTimedOut(true)
    }, timeout)

    // Progress timer
    const progressTimer = setInterval(() => {
      setTimeElapsed(prev => prev + 100)
    }, 100)

    return () => {
      clearTimeout(timeoutTimer)
      clearInterval(progressTimer)
    }
  }, [isLoading, timeout])

  const progressValue = Math.min((timeElapsed / timeout) * 100, 95)

  const handleRetry = async () => {
    setHasTimedOut(false)
    setTimeElapsed(0)
    if (onRetry) {
      await onRetry()
    }
  }

  // Show error state
  if (error && !isLoading) {
    const errorMessage = typeof error === 'string' ? error : error.message

    return (
      <Card className={className}>
        <CardHeader className="text-center pb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-lg">Error al cargar</CardTitle>
          <CardDescription>No se pudieron obtener los datos</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Detalles del error</AlertTitle>
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>

          <div className="flex gap-2 justify-center">
            {onRetry && (
              <Button onClick={handleRetry} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Intentar nuevamente
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Recargar página
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show timeout state
  if (hasTimedOut && isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="text-center pb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-lg">La carga está tardando más de lo usual</CardTitle>
          <CardDescription>
            Esto puede deberse a una conexión lenta o problemas del servidor
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50">
            <Clock className="h-4 w-4" />
            <AlertTitle>¿Qué puedes hacer?</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                <li>Esperar un poco más (a veces tarda en cargar)</li>
                <li>Verificar tu conexión a internet</li>
                <li>Intentar recargar la página</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="flex gap-2 justify-center">
            <Button onClick={handleRetry} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Intentar nuevamente
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Recargar página
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Tiempo transcurrido: {Math.floor(timeElapsed / 1000)}s
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className={className}>
        {fallback || (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">{loadingText}</p>
                
                {showProgress && timeout > 5000 && (
                  <div className="space-y-2">
                    <Progress value={progressValue} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {Math.floor(timeElapsed / 1000)}s de {Math.floor(timeout / 1000)}s
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Show children when not loading and no error
  return <>{children}</>
}

// Skeleton loading components
export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <div className="flex gap-2 pt-4">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function LoadingSpinner({ size = 'md', text }: { size?: 'sm' | 'md' | 'lg', text?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-4'
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className={`${sizeClasses[size]} border-primary border-t-transparent rounded-full animate-spin`} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  )
}

// Async component wrapper
export function AsyncWrapper({ children, fallback, timeout = 10000, onTimeout }: AsyncWrapperProps) {
  const [hasTimedOut, setHasTimedOut] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasTimedOut(true)
      if (onTimeout) {
        onTimeout()
      }
    }, timeout)

    return () => clearTimeout(timer)
  }, [timeout, onTimeout])

  if (hasTimedOut) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <Clock className="h-4 w-4" />
        <AlertTitle>Carga lenta detectada</AlertTitle>
        <AlertDescription>
          El componente está tardando más de lo esperado en cargar.
        </AlertDescription>
      </Alert>
    )
  }

  return <>{fallback || children}</>
}

// Hook for loading states
export function useLoadingState(initialLoading = false) {
  const [isLoading, setIsLoading] = useState(initialLoading)
  const [error, setError] = useState<Error | null>(null)

  const withLoading = useCallback(async <T,>(operation: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await operation()
      setIsLoading(false)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      setIsLoading(false)
      return null
    }
  }, [])

  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
  }, [])

  return {
    isLoading,
    error,
    setIsLoading,
    setError,
    withLoading,
    reset
  }
} 