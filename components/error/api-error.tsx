"use client"

/**
 * API Error Component for CanchaYA
 * Specialized error handling for API and network-related errors
 */

import React, { useState, useEffect } from 'react'
import { AlertTriangle, RefreshCw, Wifi, WifiOff, Clock, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface ApiErrorProps {
  error: Error | string
  onRetry?: () => void | Promise<void>
  retryCount?: number
  maxRetries?: number
  showRetryButton?: boolean
  context?: string
  className?: string
}

export function ApiError({
  error,
  onRetry,
  retryCount = 0,
  maxRetries = 3,
  showRetryButton = true,
  context = 'la operación',
  className
}: ApiErrorProps) {
  const [isRetrying, setIsRetrying] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [countdown, setCountdown] = useState(0)

  const errorMessage = typeof error === 'string' ? error : error.message

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return

    setIsRetrying(true)
    try {
      await onRetry()
    } catch (error) {
      console.error('Retry failed:', error)
    } finally {
      setIsRetrying(false)
    }
  }

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Auto-retry countdown for network errors
  useEffect(() => {
    if (retryCount < maxRetries) {
      const timer = setTimeout(() => {
        handleRetry()
      }, 1000 * Math.pow(2, retryCount))

      return () => clearTimeout(timer)
    }
  }, [retryCount, maxRetries, handleRetry])

  const getErrorType = (): {
    type: string
    icon: React.ReactNode
    color: string
    description: string
    suggestions: string[]
  } => {
    const message = errorMessage.toLowerCase()

    if (!isOnline) {
      return {
        type: 'Sin conexión',
        icon: <WifiOff className="h-5 w-5" />,
        color: 'text-gray-600 bg-gray-50 border-gray-200',
        description: 'No hay conexión a internet',
        suggestions: [
          'Verifica tu conexión Wi-Fi o datos móviles',
          'Intenta conectarte a otra red',
          'Contacta a tu proveedor de internet si persiste'
        ]
      }
    }

    if (message.includes('timeout') || message.includes('network')) {
      return {
        type: 'Tiempo agotado',
        icon: <Clock className="h-5 w-5" />,
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        description: 'La conexión tardó demasiado en responder',
        suggestions: [
          'La red puede estar lenta en este momento',
          'Intenta nuevamente en unos segundos',
          'Verifica tu velocidad de internet'
        ]
      }
    }

    if (message.includes('500') || message.includes('server')) {
      return {
        type: 'Error del servidor',
        icon: <AlertTriangle className="h-5 w-5" />,
        color: 'text-red-600 bg-red-50 border-red-200',
        description: 'Problema en nuestros servidores',
        suggestions: [
          'Nuestro equipo técnico está trabajando en resolverlo',
          'Intenta nuevamente en unos minutos',
          'El servicio se restablecerá pronto'
        ]
      }
    }

    if (message.includes('401') || message.includes('unauthorized')) {
      return {
        type: 'Sesión expirada',
        icon: <AlertTriangle className="h-5 w-5" />,
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        description: 'Tu sesión ha expirado',
        suggestions: [
          'Inicia sesión nuevamente',
          'Por seguridad, las sesiones expiran automáticamente',
          'Guarda tu trabajo antes de continuar'
        ]
      }
    }

    if (message.includes('404') || message.includes('not found')) {
      return {
        type: 'No encontrado',
        icon: <Info className="h-5 w-5" />,
        color: 'text-purple-600 bg-purple-50 border-purple-200',
        description: 'El recurso solicitado no existe',
        suggestions: [
          'Verifica que la URL sea correcta',
          'Es posible que el contenido haya sido movido',
          'Intenta buscar lo que necesitas desde el inicio'
        ]
      }
    }

    return {
      type: 'Error de conexión',
      icon: <Wifi className="h-5 w-5" />,
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      description: 'No se pudo completar la operación',
      suggestions: [
        'Verifica tu conexión a internet',
        'Intenta recargar la página',
        'El problema podría ser temporal'
      ]
    }
  }

  const errorType = getErrorType()

  const canRetry = retryCount < maxRetries && isOnline && showRetryButton
  const shouldAutoRetry = !isOnline && retryCount === 0

  return (
    <Card className={className}>
      <CardHeader className="text-center pb-4">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
          {errorType.icon}
        </div>
        <CardTitle className="text-lg">No se pudo completar {context}</CardTitle>
        <CardDescription>{errorType.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Type Badge */}
        <div className="flex justify-center">
          <Badge variant="outline" className={errorType.color}>
            {errorType.type}
          </Badge>
        </div>

        {/* Offline Status */}
        {!isOnline && (
          <Alert className="border-gray-200 bg-gray-50">
            <WifiOff className="h-4 w-4" />
            <AlertTitle>Sin conexión a internet</AlertTitle>
            <AlertDescription>
              Te reconectaremos automáticamente cuando recuperes la conexión.
            </AlertDescription>
          </Alert>
        )}

        {/* Retry Progress */}
        {isRetrying && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Reintentando...</span>
              <span className="text-muted-foreground">
                {retryCount + 1}/{maxRetries}
              </span>
            </div>
            <Progress value={undefined} className="h-2" />
          </div>
        )}

        {/* Auto-retry countdown */}
        {shouldAutoRetry && countdown > 0 && (
          <Alert className="border-blue-200 bg-blue-50">
            <Clock className="h-4 w-4" />
            <AlertTitle>Reintento automático en {countdown}s</AlertTitle>
            <AlertDescription>
              Se reintentará automáticamente cuando se restaure la conexión.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 justify-center">
          {canRetry && (
            <Button 
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Reintentando...' : 'Intentar nuevamente'}
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

        {/* Retry Counter */}
        {retryCount > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Intento {retryCount} de {maxRetries}
            {retryCount >= maxRetries && ' (máximo alcanzado)'}
          </div>
        )}

        {/* Error Suggestions */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>¿Qué puedes hacer?</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {errorType.suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm">{suggestion}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>

        {/* Technical Details (Development) */}
        {process.env.NODE_ENV === 'development' && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Detalles técnicos</AlertTitle>
            <AlertDescription className="text-yellow-700">
              <details className="mt-1">
                <summary className="cursor-pointer text-xs font-medium">
                  Ver error original
                </summary>
                <pre className="text-xs bg-yellow-100 p-2 rounded mt-2 overflow-x-auto">
                  {errorMessage}
                </pre>
              </details>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

// Hook for API error handling
export function useApiError() {
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const maxRetries = 3

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    setError(null)
  }

  useEffect(() => {
    if (retryCount < maxRetries) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1)
        setError(null)
      }, 1000 * Math.pow(2, retryCount))

      return () => clearTimeout(timer)
    }
  }, [retryCount, maxRetries])

  const handleError = (error: Error | string) => {
    const errorMessage = typeof error === 'string' ? error : error.message
    setError(errorMessage)
  }

  const retry = async (operation: () => Promise<unknown>) => {
    try {
      await operation()
      setError(null)
      setRetryCount(0)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      handleError(errorMessage)
    }
  }

  return {
    error,
    retryCount,
    maxRetries,
    handleError,
    handleRetry,
    retry,
    clearError: () => setError(null),
  }
} 