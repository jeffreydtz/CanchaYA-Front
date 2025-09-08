"use client"

/**
 * Global Error Boundary for CanchaYA
 * Catches JavaScript errors anywhere in the component tree and displays fallback UI
 */

import React from 'react'
import { AlertTriangle, RefreshCw, Home, Bug, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { apiRequest } from '@/lib/api-client'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
  errorId?: string
  timestamp?: Date
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  isolate?: boolean // If true, prevents error from bubbling up
}

interface ErrorFallbackProps {
  error: Error
  errorInfo?: React.ErrorInfo
  resetError: () => void
  errorId: string
  timestamp: Date
}

// Default Error Fallback Component
function DefaultErrorFallback({ 
  error, 
  errorInfo, 
  resetError, 
  errorId, 
  timestamp 
}: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  const getErrorType = (error: Error): { type: string; severity: 'low' | 'medium' | 'high'; color: string } => {
    const errorMessage = error.message.toLowerCase()
    const errorStack = error.stack?.toLowerCase() || ''
    
    // Network/API errors
    if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('api')) {
      return { type: 'Error de Conexión', severity: 'medium', color: 'text-orange-600 bg-orange-50 border-orange-200' }
    }
    
    // Authentication errors
    if (errorMessage.includes('auth') || errorMessage.includes('token') || errorMessage.includes('unauthorized')) {
      return { type: 'Error de Autenticación', severity: 'high', color: 'text-red-600 bg-red-50 border-red-200' }
    }
    
    // Component/Rendering errors
    if (errorStack.includes('react') || errorMessage.includes('render') || errorMessage.includes('component')) {
      return { type: 'Error de Interfaz', severity: 'medium', color: 'text-blue-600 bg-blue-50 border-blue-200' }
    }
    
    // JavaScript errors
    if (errorMessage.includes('undefined') || errorMessage.includes('null') || errorMessage.includes('type')) {
      return { type: 'Error de Código', severity: 'high', color: 'text-purple-600 bg-purple-50 border-purple-200' }
    }
    
    return { type: 'Error Desconocido', severity: 'high', color: 'text-gray-600 bg-gray-50 border-gray-200' }
  }

  const errorType = getErrorType(error)
  
  const getErrorSuggestions = () => {
    const errorMessage = error.message.toLowerCase()
    
    if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
      return [
        'Verifica tu conexión a internet',
        'Intenta recargar la página',
        'El servidor podría estar temporalmente no disponible'
      ]
    }
    
    if (errorMessage.includes('auth') || errorMessage.includes('token')) {
      return [
        'Tu sesión podría haber expirado',
        'Intenta cerrar sesión e iniciar sesión nuevamente',
        'Verifica tus credenciales'
      ]
    }
    
    return [
      'Intenta recargar la página',
      'Si el problema persiste, contacta al soporte técnico',
      'Verifica que tu navegador esté actualizado'
    ]
  }

  const handleReportError = () => {
    const errorReport = {
      errorId,
      timestamp: timestamp.toISOString(),
      message: error.message,
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      componentStack: errorInfo?.componentStack
    }
    
    // In a real app, this would send to error tracking service
    console.error('Error Report:', errorReport)
    
    // Copy error info to clipboard for user to send
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => alert('Información del error copiada al portapapeles'))
      .catch(() => console.error('Failed to copy error info'))
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">¡Oops! Algo salió mal</CardTitle>
          <CardDescription>
            Se produjo un error inesperado. Nuestro equipo ha sido notificado automáticamente.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Error Type Badge */}
          <div className="flex justify-center">
            <Badge variant="outline" className={errorType.color}>
              {errorType.type}
            </Badge>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={resetError} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Intentar nuevamente
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Ir al inicio
            </Button>
          </div>

          {/* Error Suggestions */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Sugerencias para solucionar el problema:</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1 mt-2">
                {getErrorSuggestions().map((suggestion, index) => (
                  <li key={index} className="text-sm">{suggestion}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>

          {/* Error Details (Development Only) */}
          {isDevelopment && (
            <Alert className="border-gray-200 bg-gray-50">
              <Bug className="h-4 w-4 text-gray-600" />
              <AlertTitle className="text-gray-800">Información de desarrollo</AlertTitle>
              <AlertDescription className="text-gray-700">
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium">Ver detalles del error</summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <strong>Error:</strong> {error.message}
                    </div>
                    <div>
                      <strong>ID:</strong> {errorId}
                    </div>
                    <div>
                      <strong>Timestamp:</strong> {timestamp.toLocaleString('es-AR')}
                    </div>
                    {error.stack && (
                      <div>
                        <strong>Stack trace:</strong>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                    {errorInfo?.componentStack && (
                      <div>
                        <strong>Component stack:</strong>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              </AlertDescription>
            </Alert>
          )}

          {/* Support Contact */}
          <div className="text-center text-sm text-muted-foreground border-t pt-4">
            <p className="mb-2">
              Si el problema persiste, no dudes en contactarnos:
            </p>
            <div className="flex justify-center gap-4">
              <Button
                variant="link"
                size="sm"
                onClick={handleReportError}
                className="h-auto p-0"
              >
                <Bug className="h-3 w-3 mr-1" />
                Reportar error
              </Button>
              <Button
                variant="link"
                size="sm"
                onClick={() => window.open('mailto:soporte@canchaya.com')}
                className="h-auto p-0"
              >
                <Phone className="h-3 w-3 mr-1" />
                Contactar soporte
              </Button>
            </div>
            <p className="text-xs mt-2 text-muted-foreground">
              ID del error: {errorId} | {timestamp.toLocaleString('es-AR')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Error Boundary Class Component
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0
  private maxRetries = 3

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return {
      hasError: true,
      error,
      errorId,
      timestamp: new Date()
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })

    // Log error to console (and external service in production)
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.reportErrorToService(error, errorInfo)
    }
  }

  private reportErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    // This would integrate with services like Sentry, LogRocket, etc.
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: localStorage.getItem('userId') // If available
    }

    // Example: Send to error tracking service
    // await apiRequest('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorReport)
    // })
    
    console.log('Error report prepared for service:', errorReport)
  }

  resetError = () => {
    this.retryCount++
    
    if (this.retryCount <= this.maxRetries) {
      this.setState({ 
        hasError: false, 
        error: undefined, 
        errorInfo: undefined,
        errorId: undefined,
        timestamp: undefined
      })
    } else {
      // Max retries reached, reload page
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError && this.state.error && this.state.errorId && this.state.timestamp) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      
      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
          errorId={this.state.errorId}
          timestamp={this.state.timestamp}
        />
      )
    }

    return this.props.children
  }
}

// Hook for error reporting in functional components
export function useErrorHandler() {
  const reportError = React.useCallback((error: Error, context?: string) => {
    console.error(`Error in ${context || 'component'}:`, error)
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // reportErrorToService(error, context)
    }
  }, [])

  return { reportError }
} 