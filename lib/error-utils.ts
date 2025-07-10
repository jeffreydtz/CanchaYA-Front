/**
 * Error Handling Utilities for CanchaYA
 * Centralized error classification, logging, and recovery utilities
 */

// Error types classification
export enum ErrorType {
    NETWORK = 'NETWORK',
    AUTHENTICATION = 'AUTHENTICATION',
    AUTHORIZATION = 'AUTHORIZATION',
    VALIDATION = 'VALIDATION',
    NOT_FOUND = 'NOT_FOUND',
    SERVER_ERROR = 'SERVER_ERROR',
    CLIENT_ERROR = 'CLIENT_ERROR',
    TIMEOUT = 'TIMEOUT',
    UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
}

export interface ClassifiedError {
    type: ErrorType
    severity: ErrorSeverity
    message: string
    originalError: Error | string
    context?: string
    timestamp: Date
    userAgent?: string
    url?: string
    userId?: string
    sessionId?: string
    retryable: boolean
    suggestions: string[]
}

export interface ErrorReport {
    id: string
    error: ClassifiedError
    stackTrace?: string
    componentStack?: string
    metadata: Record<string, any>
}

// Error classification function
export function classifyError(error: Error | string, context?: string): ClassifiedError {
    const errorMessage = typeof error === 'string' ? error : error.message
    const errorStack = typeof error === 'string' ? '' : (error.stack || '')
    const lowerMessage = errorMessage.toLowerCase()
    const lowerStack = errorStack.toLowerCase()

    let type: ErrorType = ErrorType.UNKNOWN
    let severity: ErrorSeverity = ErrorSeverity.MEDIUM
    let retryable = false
    let suggestions: string[] = []

    // Network/Connection errors
    if (lowerMessage.includes('fetch') ||
        lowerMessage.includes('network') ||
        lowerMessage.includes('connection') ||
        lowerMessage.includes('timeout') ||
        lowerMessage.includes('cors')) {
        type = ErrorType.NETWORK
        severity = ErrorSeverity.MEDIUM
        retryable = true
        suggestions = [
            'Verifica tu conexión a internet',
            'Intenta recargar la página',
            'El servidor podría estar temporalmente no disponible'
        ]
    }

    // Timeout errors
    else if (lowerMessage.includes('timeout') || lowerMessage.includes('aborted')) {
        type = ErrorType.TIMEOUT
        severity = ErrorSeverity.MEDIUM
        retryable = true
        suggestions = [
            'La operación tardó demasiado tiempo',
            'Intenta nuevamente con una conexión más estable',
            'Verifica tu velocidad de internet'
        ]
    }

    // Authentication errors
    else if (lowerMessage.includes('401') ||
        lowerMessage.includes('unauthorized') ||
        lowerMessage.includes('auth') ||
        lowerMessage.includes('token') ||
        lowerMessage.includes('login')) {
        type = ErrorType.AUTHENTICATION
        severity = ErrorSeverity.HIGH
        retryable = false
        suggestions = [
            'Tu sesión ha expirado',
            'Inicia sesión nuevamente',
            'Verifica tus credenciales'
        ]
    }

    // Authorization errors  
    else if (lowerMessage.includes('403') ||
        lowerMessage.includes('forbidden') ||
        lowerMessage.includes('access denied')) {
        type = ErrorType.AUTHORIZATION
        severity = ErrorSeverity.HIGH
        retryable = false
        suggestions = [
            'No tienes permisos para esta acción',
            'Contacta al administrador si crees que es un error',
            'Verifica que tu cuenta tenga los permisos necesarios'
        ]
    }

    // Not Found errors
    else if (lowerMessage.includes('404') ||
        lowerMessage.includes('not found')) {
        type = ErrorType.NOT_FOUND
        severity = ErrorSeverity.LOW
        retryable = false
        suggestions = [
            'El recurso solicitado no existe',
            'Verifica que la URL sea correcta',
            'Es posible que el contenido haya sido movido'
        ]
    }

    // Validation errors
    else if (lowerMessage.includes('400') ||
        lowerMessage.includes('bad request') ||
        lowerMessage.includes('validation') ||
        lowerMessage.includes('invalid')) {
        type = ErrorType.VALIDATION
        severity = ErrorSeverity.MEDIUM
        retryable = false
        suggestions = [
            'Los datos proporcionados no son válidos',
            'Verifica que todos los campos estén completos',
            'Revisa el formato de los datos ingresados'
        ]
    }

    // Server errors
    else if (lowerMessage.includes('500') ||
        lowerMessage.includes('502') ||
        lowerMessage.includes('503') ||
        lowerMessage.includes('504') ||
        lowerMessage.includes('server error') ||
        lowerMessage.includes('internal server')) {
        type = ErrorType.SERVER_ERROR
        severity = ErrorSeverity.HIGH
        retryable = true
        suggestions = [
            'Error en nuestros servidores',
            'Nuestro equipo técnico ha sido notificado',
            'Intenta nuevamente en unos minutos'
        ]
    }

    // Client-side JavaScript errors
    else if (lowerStack.includes('react') ||
        lowerMessage.includes('render') ||
        lowerMessage.includes('hydrat') ||
        lowerMessage.includes('undefined') ||
        lowerMessage.includes('null') ||
        lowerMessage.includes('cannot read')) {
        type = ErrorType.CLIENT_ERROR
        severity = ErrorSeverity.MEDIUM
        retryable = true
        suggestions = [
            'Error en la aplicación',
            'Intenta recargar la página',
            'Limpia la caché del navegador si persiste'
        ]
    }

    // Critical errors (application crashes)
    if (lowerMessage.includes('crash') ||
        lowerMessage.includes('fatal') ||
        lowerMessage.includes('critical')) {
        severity = ErrorSeverity.CRITICAL
    }

    return {
        type,
        severity,
        message: errorMessage,
        originalError: error,
        context,
        timestamp: new Date(),
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        retryable,
        suggestions
    }
}

// Error logging function
export function logError(classifiedError: ClassifiedError, additionalData?: Record<string, any>): ErrorReport {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const report: ErrorReport = {
        id: errorId,
        error: classifiedError,
        stackTrace: typeof classifiedError.originalError === 'object' ? classifiedError.originalError.stack : undefined,
        metadata: {
            timestamp: classifiedError.timestamp.toISOString(),
            severity: classifiedError.severity,
            type: classifiedError.type,
            retryable: classifiedError.retryable,
            ...additionalData
        }
    }

    // Log to console with appropriate level
    switch (classifiedError.severity) {
        case ErrorSeverity.LOW:
            console.info('Error (Low):', report)
            break
        case ErrorSeverity.MEDIUM:
            console.warn('Error (Medium):', report)
            break
        case ErrorSeverity.HIGH:
            console.error('Error (High):', report)
            break
        case ErrorSeverity.CRITICAL:
            console.error('CRITICAL ERROR:', report)
            break
    }

    // In production, send to external error tracking service
    if (process.env.NODE_ENV === 'production') {
        sendToErrorTrackingService(report)
    }

    return report
}

// Mock function for error tracking service
function sendToErrorTrackingService(report: ErrorReport) {
    // This would integrate with services like Sentry, LogRocket, etc.
    // Example implementation:
    /*
    fetch('/api/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(report)
    }).catch(err => {
      console.error('Failed to send error report:', err)
    })
    */

    console.log('Error report sent to tracking service:', report.id)
}

// Error recovery utilities
export class ErrorRecovery {
    private static retryAttempts = new Map<string, number>()

    static async withRetry<T>(
        operation: () => Promise<T>,
        maxRetries: number = 3,
        delay: number = 1000,
        context?: string
    ): Promise<T> {
        const operationId = context || operation.toString()
        let attempts = this.retryAttempts.get(operationId) || 0

        try {
            const result = await operation()
            this.retryAttempts.delete(operationId) // Success, reset counter
            return result
        } catch (error) {
            const classifiedError = classifyError(error as Error, context)

            if (!classifiedError.retryable || attempts >= maxRetries) {
                logError(classifiedError, { attempts, maxRetries })
                throw error
            }

            attempts++
            this.retryAttempts.set(operationId, attempts)

            console.warn(`Retry attempt ${attempts}/${maxRetries} for ${context || 'operation'}`)

            // Exponential backoff
            const backoffDelay = delay * Math.pow(2, attempts - 1)
            await new Promise(resolve => setTimeout(resolve, backoffDelay))

            return this.withRetry(operation, maxRetries, delay, context)
        }
    }

    static async withFallback<T>(
        primary: () => Promise<T>,
        fallback: () => Promise<T>,
        context?: string
    ): Promise<T> {
        try {
            return await primary()
        } catch (error) {
            const classifiedError = classifyError(error as Error, `${context} (primary)`)
            logError(classifiedError)

            console.warn(`Primary operation failed, trying fallback for ${context}`)

            try {
                return await fallback()
            } catch (fallbackError) {
                const fallbackClassifiedError = classifyError(fallbackError as Error, `${context} (fallback)`)
                logError(fallbackClassifiedError)
                throw fallbackError
            }
        }
    }

    static getRetryCount(operationId: string): number {
        return this.retryAttempts.get(operationId) || 0
    }

    static resetRetryCount(operationId: string): void {
        this.retryAttempts.delete(operationId)
    }
}

// Error formatting utilities
export function formatErrorForUser(classifiedError: ClassifiedError): string {
    switch (classifiedError.type) {
        case ErrorType.NETWORK:
            return 'Problema de conexión. Verifica tu internet e intenta nuevamente.'
        case ErrorType.AUTHENTICATION:
            return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
        case ErrorType.AUTHORIZATION:
            return 'No tienes permisos para realizar esta acción.'
        case ErrorType.VALIDATION:
            return 'Los datos ingresados no son válidos. Verifica la información.'
        case ErrorType.NOT_FOUND:
            return 'El contenido solicitado no fue encontrado.'
        case ErrorType.SERVER_ERROR:
            return 'Error del servidor. Nuestro equipo ha sido notificado.'
        case ErrorType.TIMEOUT:
            return 'La operación tardó demasiado tiempo. Intenta nuevamente.'
        default:
            return 'Se produjo un error inesperado. Intenta nuevamente.'
    }
}

export function getErrorColor(severity: ErrorSeverity): string {
    switch (severity) {
        case ErrorSeverity.LOW:
            return 'text-blue-600 bg-blue-50 border-blue-200'
        case ErrorSeverity.MEDIUM:
            return 'text-orange-600 bg-orange-50 border-orange-200'
        case ErrorSeverity.HIGH:
            return 'text-red-600 bg-red-50 border-red-200'
        case ErrorSeverity.CRITICAL:
            return 'text-purple-600 bg-purple-50 border-purple-200'
        default:
            return 'text-gray-600 bg-gray-50 border-gray-200'
    }
}

// Global error handler
export function setupGlobalErrorHandlers() {
    // Unhandled promise rejections
    if (typeof window !== 'undefined') {
        window.addEventListener('unhandledrejection', (event) => {
            const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
            const classifiedError = classifyError(error, 'unhandled-promise-rejection')
            logError(classifiedError)

            // Prevent the default handling (console error)
            event.preventDefault()
        })

        // Global JavaScript errors
        window.addEventListener('error', (event) => {
            const error = event.error || new Error(event.message)
            const classifiedError = classifyError(error, 'global-javascript-error')
            logError(classifiedError, {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            })
        })
    }
} 