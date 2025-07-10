'use client'

/**
 * Next.js Error Page for CanchaYA
 * Global error boundary for unhandled errors at the page level
 */

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to console and external service
    console.error('Page Error:', error)
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error tracking service
      // reportErrorToService(error)
    }
  }, [error])

  const getErrorInfo = () => {
    const message = error.message.toLowerCase()
    const stack = error.stack?.toLowerCase() || ''

    // Network/API errors
    if (message.includes('fetch') || message.includes('network') || message.includes('api')) {
      return {
        type: 'Error de Conexión',
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        title: 'Problema de conectividad',
        description: 'No se pudo establecer conexión con el servidor',
        suggestions: [
          'Verifica tu conexión a internet',
          'Intenta recargar la página',
          'El servidor podría estar temporalmente no disponible'
        ]
      }
    }

    // Rendering/Component errors
    if (stack.includes('react') || message.includes('render') || message.includes('hydrat')) {
      return {
        type: 'Error de Renderizado',
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        title: 'Error en la interfaz',
        description: 'Hubo un problema al mostrar esta página',
        suggestions: [
          'Intenta recargar la página',
          'Limpia la caché del navegador',
          'Asegúrate de que tu navegador esté actualizado'
        ]
      }
    }

    // Authentication errors
    if (message.includes('auth') || message.includes('token') || message.includes('unauthorized')) {
      return {
        type: 'Error de Autenticación',
        color: 'text-red-600 bg-red-50 border-red-200',
        title: 'Problema de autenticación',
        description: 'Tu sesión ha expirado o hay un problema con las credenciales',
        suggestions: [
          'Intenta cerrar sesión e iniciar sesión nuevamente',
          'Verifica que tus credenciales sean correctas',
          'Es posible que tu sesión haya expirado por seguridad'
        ]
      }
    }

    // JavaScript/Logic errors
    if (message.includes('undefined') || message.includes('null') || message.includes('type')) {
      return {
        type: 'Error de Aplicación',
        color: 'text-purple-600 bg-purple-50 border-purple-200',
        title: 'Error interno de la aplicación',
        description: 'Se produjo un error inesperado en la aplicación',
        suggestions: [
          'Este es un error técnico que hemos registrado',
          'Intenta recargar la página',
          'Si persiste, contacta al soporte técnico'
        ]
      }
    }

    // Default error
    return {
      type: 'Error Desconocido',
      color: 'text-gray-600 bg-gray-50 border-gray-200',
      title: 'Algo salió mal',
      description: 'Se produjo un error inesperado',
      suggestions: [
        'Intenta recargar la página',
        'Si el problema persiste, contacta al soporte',
        'Verifica que tu navegador esté actualizado'
      ]
    }
  }

  const errorInfo = getErrorInfo()
  const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const handleReportError = () => {
    const errorReport = {
      errorId,
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    // Copy error info to clipboard
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
          <CardTitle className="text-2xl">{errorInfo.title}</CardTitle>
          <CardDescription className="text-base">
            {errorInfo.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Type Badge */}
          <div className="flex justify-center">
            <Badge variant="outline" className={errorInfo.color}>
              {errorInfo.type}
            </Badge>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset} className="flex items-center gap-2">
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
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver atrás
            </Button>
          </div>

          {/* Error Suggestions */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>¿Qué puedes hacer?</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1 mt-2">
                {errorInfo.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm">{suggestion}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <Bug className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800">Información de desarrollo</AlertTitle>
              <AlertDescription className="text-yellow-700">
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium">Ver detalles del error</summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <strong>Error:</strong> {error.message}
                    </div>
                    {error.digest && (
                      <div>
                        <strong>Digest:</strong> {error.digest}
                      </div>
                    )}
                    <div>
                      <strong>ID:</strong> {errorId}
                    </div>
                    <div>
                      <strong>Timestamp:</strong> {new Date().toLocaleString('es-AR')}
                    </div>
                    {error.stack && (
                      <div>
                        <strong>Stack trace:</strong>
                        <pre className="text-xs bg-yellow-100 p-2 rounded mt-1 overflow-x-auto max-h-32">
                          {error.stack}
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
                <AlertTriangle className="h-3 w-3 mr-1" />
                Contactar soporte
              </Button>
            </div>
            <p className="text-xs mt-2 text-muted-foreground">
              ID del error: {errorId} | {new Date().toLocaleString('es-AR')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 