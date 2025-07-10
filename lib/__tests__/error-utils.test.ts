/**
 * Unit Tests for Error Utilities
 * Tests error classification, recovery mechanisms, logging, and helper functions
 */

import { handleApiError, isApiError } from '../error-utils'

describe('error-utils', () => {
    describe('isApiError', () => {
        it('should return true for API error objects', () => {
            const apiError = {
                success: false,
                error: 'Something went wrong',
            }
            expect(isApiError(apiError)).toBe(true)
        })

        it('should return false for non-API error objects', () => {
            const regularError = new Error('Something went wrong')
            expect(isApiError(regularError)).toBe(false)
        })

        it('should return false for null or undefined', () => {
            expect(isApiError(null)).toBe(false)
            expect(isApiError(undefined)).toBe(false)
        })
    })

    describe('handleApiError', () => {
        it('should return error message from API error', () => {
            const apiError = {
                success: false,
                error: 'API Error Message',
            }
            const result = handleApiError(apiError)
            expect(result).toBe('API Error Message')
        })

        it('should return generic message for non-API errors', () => {
            const regularError = new Error('Something went wrong')
            const result = handleApiError(regularError)
            expect(result).toBe('Ha ocurrido un error inesperado. Intenta nuevamente.')
        })

        it('should return generic message for unknown error types', () => {
            const unknownError = 'String error'
            const result = handleApiError(unknownError)
            expect(result).toBe('Ha ocurrido un error inesperado. Intenta nuevamente.')
        })
    })
}) 