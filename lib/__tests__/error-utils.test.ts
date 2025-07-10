/**
 * Unit Tests for Error Utilities
 * Tests error classification, recovery mechanisms, logging, and helper functions
 */

import {
    ErrorType,
    ErrorSeverity,
    classifyError,
    logError,
    formatErrorForUser,
    getErrorColor,
    ErrorRecovery,
    setupGlobalErrorHandlers
} from '../error-utils'

describe('Error Classification', () => {
    describe('classifyError', () => {
        it('classifies network errors correctly', () => {
            const networkErrors = [
                new Error('fetch failed'),
                new Error('Network error'),
                new Error('ERR_NETWORK'),
                new Error('Connection timeout'),
                new Error('Request timeout')
            ]

            networkErrors.forEach(error => {
                const classification = classifyError(error)
                expect(classification.type).toBe(ErrorType.NETWORK)
                expect(classification.severity).toBe(ErrorSeverity.HIGH)
            })
        })

        it('classifies authentication errors correctly', () => {
            const authErrors = [
                new Error('Unauthorized'),
                new Error('401'),
                new Error('Token expired'),
                new Error('Authentication failed'),
                new Error('Invalid credentials')
            ]

            authErrors.forEach(error => {
                const classification = classifyError(error)
                expect(classification.type).toBe(ErrorType.AUTHENTICATION)
                expect(classification.severity).toBe(ErrorSeverity.MEDIUM)
            })
        })

        it('classifies authorization errors correctly', () => {
            const authzErrors = [
                new Error('Forbidden'),
                new Error('403'),
                new Error('Access denied'),
                new Error('Insufficient permissions')
            ]

            authzErrors.forEach(error => {
                const classification = classifyError(error)
                expect(classification.type).toBe(ErrorType.AUTHORIZATION)
                expect(classification.severity).toBe(ErrorSeverity.MEDIUM)
            })
        })

        it('classifies validation errors correctly', () => {
            const validationErrors = [
                new Error('Validation failed'),
                new Error('Invalid input'),
                new Error('Required field missing'),
                new Error('Format invalid')
            ]

            validationErrors.forEach(error => {
                const classification = classifyError(error)
                expect(classification.type).toBe(ErrorType.VALIDATION)
                expect(classification.severity).toBe(ErrorSeverity.LOW)
            })
        })

        it('classifies not found errors correctly', () => {
            const notFoundErrors = [
                new Error('Not found'),
                new Error('404'),
                new Error('Resource not found'),
                new Error('Page not found')
            ]

            notFoundErrors.forEach(error => {
                const classification = classifyError(error)
                expect(classification.type).toBe(ErrorType.NOT_FOUND)
                expect(classification.severity).toBe(ErrorSeverity.MEDIUM)
            })
        })

        it('classifies server errors correctly', () => {
            const serverErrors = [
                new Error('Internal server error'),
                new Error('500'),
                new Error('502'),
                new Error('503'),
                new Error('Database error')
            ]

            serverErrors.forEach(error => {
                const classification = classifyError(error)
                expect(classification.type).toBe(ErrorType.SERVER_ERROR)
                expect(classification.severity).toBe(ErrorSeverity.HIGH)
            })
        })

        it('classifies client errors correctly', () => {
            const clientErrors = [
                new Error('Cannot read property'),
                new Error('undefined is not a function'),
                new Error('TypeError'),
                new Error('ReferenceError')
            ]

            clientErrors.forEach(error => {
                const classification = classifyError(error)
                expect(classification.type).toBe(ErrorType.CLIENT_ERROR)
                expect(classification.severity).toBe(ErrorSeverity.HIGH)
            })
        })

        it('classifies timeout errors correctly', () => {
            const timeoutErrors = [
                new Error('Timeout'),
                new Error('Request timeout'),
                new Error('Operation timed out')
            ]

            timeoutErrors.forEach(error => {
                const classification = classifyError(error)
                expect(classification.type).toBe(ErrorType.TIMEOUT)
                expect(classification.severity).toBe(ErrorSeverity.MEDIUM)
            })
        })

        it('provides fallback classification for unknown errors', () => {
            const unknownError = new Error('Some random error message')
            const classification = classifyError(unknownError)

            expect(classification.type).toBe(ErrorType.UNKNOWN)
            expect(classification.severity).toBe(ErrorSeverity.MEDIUM)
        })

        it('includes error details in classification', () => {
            const error = new Error('Test error message')
            const classification = classifyError(error)

            expect(classification.error).toBe(error)
            expect(classification.message).toBe('Test error message')
            expect(classification.timestamp).toBeInstanceOf(Date)
            expect(classification.context).toBeDefined()
        })

        it('generates unique error ID', () => {
            const error1 = new Error('Error 1')
            const error2 = new Error('Error 2')

            const classification1 = classifyError(error1)
            const classification2 = classifyError(error2)

            expect(classification1.id).not.toBe(classification2.id)
            expect(classification1.id).toMatch(/^err_\d+_[a-z0-9]+$/)
            expect(classification2.id).toMatch(/^err_\d+_[a-z0-9]+$/)
        })
    })
})

describe('Error Logging', () => {
    const originalConsoleError = console.error
    const originalConsoleWarn = console.warn
    const originalConsoleLog = console.log

    beforeEach(() => {
        console.error = jest.fn()
        console.warn = jest.fn()
        console.log = jest.fn()
    })

    afterEach(() => {
        console.error = originalConsoleError
        console.warn = originalConsoleWarn
        console.log = originalConsoleLog
    })

    describe('logError', () => {
        it('logs critical errors to console.error', () => {
            const error = new Error('Critical error')
            const classification = { ...classifyError(error), severity: ErrorSeverity.CRITICAL }

            logError(classification)

            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining('CRITICAL'),
                expect.objectContaining({
                    id: classification.id,
                    type: classification.type,
                    message: 'Critical error'
                })
            )
        })

        it('logs high severity errors to console.error', () => {
            const error = new Error('High severity error')
            const classification = { ...classifyError(error), severity: ErrorSeverity.HIGH }

            logError(classification)

            expect(console.error).toHaveBeenCalled()
        })

        it('logs medium severity errors to console.warn', () => {
            const error = new Error('Medium severity error')
            const classification = { ...classifyError(error), severity: ErrorSeverity.MEDIUM }

            logError(classification)

            expect(console.warn).toHaveBeenCalled()
        })

        it('logs low severity errors to console.log', () => {
            const error = new Error('Low severity error')
            const classification = { ...classifyError(error), severity: ErrorSeverity.LOW }

            logError(classification)

            expect(console.log).toHaveBeenCalled()
        })

        it('includes context information in logs', () => {
            const error = new Error('Error with context')
            const classification = classifyError(error, { component: 'TestComponent', action: 'testAction' })

            logError(classification)

            expect(console.error).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    context: expect.objectContaining({
                        component: 'TestComponent',
                        action: 'testAction'
                    })
                })
            )
        })
    })
})

describe('Error Formatting', () => {
    describe('formatErrorForUser', () => {
        it('formats network errors for users', () => {
            const error = new Error('fetch failed')
            const classification = classifyError(error)
            const userMessage = formatErrorForUser(classification)

            expect(userMessage).toContain('conexión')
            expect(userMessage).toContain('internet')
        })

        it('formats authentication errors for users', () => {
            const error = new Error('Unauthorized')
            const classification = classifyError(error)
            const userMessage = formatErrorForUser(classification)

            expect(userMessage).toContain('sesión')
            expect(userMessage).toContain('iniciar')
        })

        it('formats validation errors for users', () => {
            const error = new Error('Validation failed')
            const classification = classifyError(error)
            const userMessage = formatErrorForUser(classification)

            expect(userMessage).toContain('información')
            expect(userMessage).toContain('correcta')
        })

        it('provides generic message for unknown errors', () => {
            const error = new Error('Unknown error')
            const classification = classifyError(error)
            const userMessage = formatErrorForUser(classification)

            expect(userMessage).toContain('inesperado')
            expect(userMessage).toContain('intenta')
        })

        it('includes suggestions in user messages', () => {
            const error = new Error('Network error')
            const classification = classifyError(error)
            const userMessage = formatErrorForUser(classification)

            expect(userMessage).toContain('Verifica')
            expect(userMessage).toContain('Intenta')
        })
    })

    describe('getErrorColor', () => {
        it('returns correct colors for different severities', () => {
            expect(getErrorColor(ErrorSeverity.CRITICAL)).toBe('destructive')
            expect(getErrorColor(ErrorSeverity.HIGH)).toBe('destructive')
            expect(getErrorColor(ErrorSeverity.MEDIUM)).toBe('warning')
            expect(getErrorColor(ErrorSeverity.LOW)).toBe('secondary')
        })

        it('handles undefined severity', () => {
            expect(getErrorColor(undefined as any)).toBe('secondary')
        })
    })
})

describe('Error Recovery', () => {
    describe('withRetry', () => {
        it('succeeds on first attempt when operation succeeds', async () => {
            const successfulOperation = jest.fn().mockResolvedValue('success')
            const recovery = new ErrorRecovery()

            const result = await recovery.withRetry(successfulOperation)

            expect(result).toBe('success')
            expect(successfulOperation).toHaveBeenCalledTimes(1)
        })

        it('retries failed operations up to max attempts', async () => {
            const failingOperation = jest.fn().mockRejectedValue(new Error('Operation failed'))
            const recovery = new ErrorRecovery()

            await expect(recovery.withRetry(failingOperation, { maxAttempts: 3 }))
                .rejects.toThrow('Operation failed')

            expect(failingOperation).toHaveBeenCalledTimes(3)
        })

        it('succeeds after retries', async () => {
            const operation = jest.fn()
                .mockRejectedValueOnce(new Error('First failure'))
                .mockRejectedValueOnce(new Error('Second failure'))
                .mockResolvedValueOnce('success')

            const recovery = new ErrorRecovery()
            const result = await recovery.withRetry(operation, { maxAttempts: 3 })

            expect(result).toBe('success')
            expect(operation).toHaveBeenCalledTimes(3)
        })

        it('implements exponential backoff', async () => {
            const failingOperation = jest.fn().mockRejectedValue(new Error('Always fails'))
            const recovery = new ErrorRecovery()

            const startTime = Date.now()

            await expect(recovery.withRetry(failingOperation, {
                maxAttempts: 3,
                baseDelay: 100
            })).rejects.toThrow()

            const endTime = Date.now()
            const totalTime = endTime - startTime

            // Should wait ~100ms + ~200ms = ~300ms minimum
            expect(totalTime).toBeGreaterThan(250)
        })

        it('respects custom retry conditions', async () => {
            const networkError = new Error('Network error')
            const validationError = new Error('Validation failed')

            const operation = jest.fn()
                .mockRejectedValueOnce(networkError)
                .mockRejectedValueOnce(validationError)

            const recovery = new ErrorRecovery()

            // Should retry network errors but not validation errors
            await expect(recovery.withRetry(operation, {
                maxAttempts: 3,
                shouldRetry: (error) => error.message.includes('Network')
            })).rejects.toThrow('Validation failed')

            expect(operation).toHaveBeenCalledTimes(2)
        })
    })

    describe('withFallback', () => {
        it('returns primary result when primary succeeds', async () => {
            const primaryOperation = jest.fn().mockResolvedValue('primary success')
            const fallbackOperation = jest.fn().mockResolvedValue('fallback success')
            const recovery = new ErrorRecovery()

            const result = await recovery.withFallback(primaryOperation, fallbackOperation)

            expect(result).toBe('primary success')
            expect(primaryOperation).toHaveBeenCalledTimes(1)
            expect(fallbackOperation).not.toHaveBeenCalled()
        })

        it('returns fallback result when primary fails', async () => {
            const primaryOperation = jest.fn().mockRejectedValue(new Error('Primary failed'))
            const fallbackOperation = jest.fn().mockResolvedValue('fallback success')
            const recovery = new ErrorRecovery()

            const result = await recovery.withFallback(primaryOperation, fallbackOperation)

            expect(result).toBe('fallback success')
            expect(primaryOperation).toHaveBeenCalledTimes(1)
            expect(fallbackOperation).toHaveBeenCalledTimes(1)
        })

        it('throws error when both primary and fallback fail', async () => {
            const primaryOperation = jest.fn().mockRejectedValue(new Error('Primary failed'))
            const fallbackOperation = jest.fn().mockRejectedValue(new Error('Fallback failed'))
            const recovery = new ErrorRecovery()

            await expect(recovery.withFallback(primaryOperation, fallbackOperation))
                .rejects.toThrow('Fallback failed')
        })
    })
})

describe('Global Error Handlers', () => {
    const originalAddEventListener = window.addEventListener
    const originalConsoleError = console.error

    beforeEach(() => {
        window.addEventListener = jest.fn()
        console.error = jest.fn()
    })

    afterEach(() => {
        window.addEventListener = originalAddEventListener
        console.error = originalConsoleError
    })

    it('sets up global error handlers', () => {
        setupGlobalErrorHandlers()

        expect(window.addEventListener).toHaveBeenCalledWith('error', expect.any(Function))
        expect(window.addEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function))
    })

    it('handles unhandled promise rejections', () => {
        setupGlobalErrorHandlers()

        const unhandledRejectionHandler = (window.addEventListener as jest.Mock).mock.calls
            .find(call => call[0] === 'unhandledrejection')[1]

        const mockEvent = {
            reason: new Error('Unhandled promise rejection'),
            preventDefault: jest.fn()
        }

        unhandledRejectionHandler(mockEvent)

        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining('Unhandled Promise Rejection'),
            expect.any(Object)
        )
        expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    it('handles global JavaScript errors', () => {
        setupGlobalErrorHandlers()

        const errorHandler = (window.addEventListener as jest.Mock).mock.calls
            .find(call => call[0] === 'error')[1]

        const mockEvent = {
            error: new Error('Global JavaScript error'),
            filename: 'test.js',
            lineno: 42,
            colno: 15
        }

        errorHandler(mockEvent)

        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining('Global JavaScript Error'),
            expect.objectContaining({
                filename: 'test.js',
                line: 42,
                column: 15
            })
        )
    })
})

describe('Error Context', () => {
    it('includes browser information in error context', () => {
        const error = new Error('Test error')
        const classification = classifyError(error)

        expect(classification.context.userAgent).toBe('Jest Test Environment')
        expect(classification.context.url).toBe('http://localhost:3000/')
        expect(classification.context.timestamp).toBeInstanceOf(Date)
    })

    it('includes custom context when provided', () => {
        const error = new Error('Test error')
        const customContext = {
            component: 'TestComponent',
            action: 'testAction',
            userId: 'user123'
        }

        const classification = classifyError(error, customContext)

        expect(classification.context.component).toBe('TestComponent')
        expect(classification.context.action).toBe('testAction')
        expect(classification.context.userId).toBe('user123')
    })

    it('merges custom context with default context', () => {
        const error = new Error('Test error')
        const customContext = { component: 'TestComponent' }

        const classification = classifyError(error, customContext)

        expect(classification.context.component).toBe('TestComponent')
        expect(classification.context.userAgent).toBe('Jest Test Environment')
        expect(classification.context.url).toBe('http://localhost:3000/')
    })
}) 