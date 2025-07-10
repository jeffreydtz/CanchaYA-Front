/**
 * Unit Tests for useAuth Hook
 * Tests authentication state management, login/logout flows, and error handling
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from '../use-auth'
import { renderWithProviders } from '@/__tests__/utils/test-utils'

// Mock API calls
const mockApiCall = jest.fn()
jest.mock('@/lib/api-client', () => ({
    api: {
        post: mockApiCall,
        get: mockApiCall,
    }
}))

// Mock Next.js router
const mockPush = jest.fn()
const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
        refresh: jest.fn(),
    }),
}))

// Mock token storage
const mockTokenStorage = {
    getToken: jest.fn(),
    setToken: jest.fn(),
    removeToken: jest.fn(),
}

jest.mock('@/lib/auth-storage', () => mockTokenStorage)

describe('useAuth Hook', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.clear()
        mockTokenStorage.getToken.mockReturnValue(null)
    })

    describe('Initialization', () => {
        it('initializes with no user when no token exists', async () => {
            const { result } = renderHook(() => useAuth())

            expect(result.current.user).toBeNull()
            expect(result.current.isAuthenticated).toBe(false)
            expect(result.current.isLoading).toBe(false)
        })

        it('attempts to restore user session when token exists', async () => {
            const mockToken = 'valid-jwt-token'
            const mockUser = global.testUser

            mockTokenStorage.getToken.mockReturnValue(mockToken)
            mockApiCall.mockResolvedValue({ data: mockUser })

            const { result } = renderHook(() => useAuth())

            // Initially loading
            expect(result.current.isLoading).toBe(true)
            expect(result.current.user).toBeNull()

            // After API call completes
            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
                expect(result.current.user).toEqual(mockUser)
                expect(result.current.isAuthenticated).toBe(true)
            })

            expect(mockApiCall).toHaveBeenCalledWith('/auth/me', {
                headers: {
                    Authorization: `Bearer ${mockToken}`
                }
            })
        })

        it('handles invalid token during session restoration', async () => {
            const mockToken = 'invalid-jwt-token'

            mockTokenStorage.getToken.mockReturnValue(mockToken)
            mockApiCall.mockRejectedValue(new Error('Unauthorized'))

            const { result } = renderHook(() => useAuth())

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
                expect(result.current.user).toBeNull()
                expect(result.current.isAuthenticated).toBe(false)
            })

            // Should remove invalid token
            expect(mockTokenStorage.removeToken).toHaveBeenCalled()
        })
    })

    describe('Login Flow', () => {
        it('successfully logs in user with valid credentials', async () => {
            const credentials = {
                email: 'test@example.com',
                password: 'password123'
            }

            const loginResponse = {
                user: global.testUser,
                token: 'new-jwt-token',
                success: true
            }

            mockApiCall.mockResolvedValue(loginResponse)

            const { result } = renderHook(() => useAuth())

            let loginResult: any
            await act(async () => {
                loginResult = await result.current.login(credentials)
            })

            expect(loginResult.success).toBe(true)
            expect(result.current.user).toEqual(global.testUser)
            expect(result.current.isAuthenticated).toBe(true)
            expect(result.current.isLoading).toBe(false)

            expect(mockApiCall).toHaveBeenCalledWith('/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials),
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            expect(mockTokenStorage.setToken).toHaveBeenCalledWith('new-jwt-token')
        })

        it('handles login failure with invalid credentials', async () => {
            const credentials = {
                email: 'test@example.com',
                password: 'wrongpassword'
            }

            mockApiCall.mockRejectedValue({
                message: 'Credenciales inválidas',
                status: 401
            })

            const { result } = renderHook(() => useAuth())

            let loginResult: any
            await act(async () => {
                loginResult = await result.current.login(credentials)
            })

            expect(loginResult.success).toBe(false)
            expect(loginResult.error).toBe('Credenciales inválidas')
            expect(result.current.user).toBeNull()
            expect(result.current.isAuthenticated).toBe(false)

            expect(mockTokenStorage.setToken).not.toHaveBeenCalled()
        })

        it('handles network errors during login', async () => {
            const credentials = {
                email: 'test@example.com',
                password: 'password123'
            }

            mockApiCall.mockRejectedValue(new Error('Network error'))

            const { result } = renderHook(() => useAuth())

            let loginResult: any
            await act(async () => {
                loginResult = await result.current.login(credentials)
            })

            expect(loginResult.success).toBe(false)
            expect(loginResult.error).toBe('Error de conexión. Intenta nuevamente.')
            expect(result.current.user).toBeNull()
            expect(result.current.isAuthenticated).toBe(false)
        })

        it('sets loading state during login process', async () => {
            const credentials = {
                email: 'test@example.com',
                password: 'password123'
            }

            // Mock delayed response
            mockApiCall.mockImplementation(() =>
                new Promise(resolve => setTimeout(() => resolve({
                    user: global.testUser,
                    token: 'token',
                    success: true
                }), 100))
            )

            const { result } = renderHook(() => useAuth())

            expect(result.current.isLoading).toBe(false)

            act(() => {
                result.current.login(credentials)
            })

            expect(result.current.isLoading).toBe(true)

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })
        })
    })

    describe('Logout Flow', () => {
        it('successfully logs out user', async () => {
            // Setup authenticated state
            const { result } = renderHook(() => useAuth())

            await act(async () => {
                result.current.setUser(global.testUser)
            })

            expect(result.current.isAuthenticated).toBe(true)

            // Logout
            await act(async () => {
                await result.current.logout()
            })

            expect(result.current.user).toBeNull()
            expect(result.current.isAuthenticated).toBe(false)
            expect(mockTokenStorage.removeToken).toHaveBeenCalled()
        })

        it('calls logout API endpoint', async () => {
            mockApiCall.mockResolvedValue({ success: true })

            const { result } = renderHook(() => useAuth())

            await act(async () => {
                result.current.setUser(global.testUser)
            })

            await act(async () => {
                await result.current.logout()
            })

            expect(mockApiCall).toHaveBeenCalledWith('/auth/logout', {
                method: 'POST'
            })
        })

        it('clears state even if logout API fails', async () => {
            mockApiCall.mockRejectedValue(new Error('Logout failed'))

            const { result } = renderHook(() => useAuth())

            await act(async () => {
                result.current.setUser(global.testUser)
            })

            await act(async () => {
                await result.current.logout()
            })

            // Should still clear local state
            expect(result.current.user).toBeNull()
            expect(result.current.isAuthenticated).toBe(false)
            expect(mockTokenStorage.removeToken).toHaveBeenCalled()
        })

        it('redirects to login page after logout', async () => {
            const { result } = renderHook(() => useAuth())

            await act(async () => {
                result.current.setUser(global.testUser)
            })

            await act(async () => {
                await result.current.logout()
            })

            expect(mockPush).toHaveBeenCalledWith('/login')
        })
    })

    describe('Registration Flow', () => {
        it('successfully registers new user', async () => {
            const registerData = {
                nombre: 'Test',
                apellido: 'User',
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123'
            }

            const registerResponse = {
                user: global.testUser,
                token: 'new-jwt-token',
                success: true
            }

            mockApiCall.mockResolvedValue(registerResponse)

            const { result } = renderHook(() => useAuth())

            let registerResult: any
            await act(async () => {
                registerResult = await result.current.register(registerData)
            })

            expect(registerResult.success).toBe(true)
            expect(result.current.user).toEqual(global.testUser)
            expect(result.current.isAuthenticated).toBe(true)

            expect(mockApiCall).toHaveBeenCalledWith('/auth/register', {
                method: 'POST',
                body: JSON.stringify(registerData),
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            expect(mockTokenStorage.setToken).toHaveBeenCalledWith('new-jwt-token')
        })

        it('handles registration validation errors', async () => {
            const registerData = {
                nombre: '',
                apellido: 'User',
                email: 'invalid-email',
                password: '123',
                confirmPassword: '456'
            }

            mockApiCall.mockRejectedValue({
                message: 'Datos de registro inválidos',
                errors: {
                    nombre: 'El nombre es requerido',
                    email: 'Email inválido',
                    password: 'La contraseña debe tener al menos 6 caracteres',
                    confirmPassword: 'Las contraseñas no coinciden'
                },
                status: 400
            })

            const { result } = renderHook(() => useAuth())

            let registerResult: any
            await act(async () => {
                registerResult = await result.current.register(registerData)
            })

            expect(registerResult.success).toBe(false)
            expect(registerResult.errors).toBeDefined()
            expect(registerResult.errors.nombre).toBe('El nombre es requerido')
            expect(result.current.user).toBeNull()
            expect(result.current.isAuthenticated).toBe(false)
        })

        it('handles duplicate email registration', async () => {
            const registerData = {
                nombre: 'Test',
                apellido: 'User',
                email: 'existing@example.com',
                password: 'password123',
                confirmPassword: 'password123'
            }

            mockApiCall.mockRejectedValue({
                message: 'El email ya está registrado',
                status: 409
            })

            const { result } = renderHook(() => useAuth())

            let registerResult: any
            await act(async () => {
                registerResult = await result.current.register(registerData)
            })

            expect(registerResult.success).toBe(false)
            expect(registerResult.error).toBe('El email ya está registrado')
        })
    })

    describe('User Profile Management', () => {
        it('updates user profile successfully', async () => {
            const { result } = renderHook(() => useAuth())

            // Setup authenticated state
            await act(async () => {
                result.current.setUser(global.testUser)
            })

            const updateData = {
                nombre: 'Updated',
                apellido: 'Name',
                telefono: '+54911234567'
            }

            const updatedUser = { ...global.testUser, ...updateData }
            mockApiCall.mockResolvedValue({ user: updatedUser })

            let updateResult: any
            await act(async () => {
                updateResult = await result.current.updateProfile(updateData)
            })

            expect(updateResult.success).toBe(true)
            expect(result.current.user).toEqual(updatedUser)

            expect(mockApiCall).toHaveBeenCalledWith('/auth/profile', {
                method: 'PATCH',
                body: JSON.stringify(updateData),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        })

        it('handles profile update errors', async () => {
            const { result } = renderHook(() => useAuth())

            await act(async () => {
                result.current.setUser(global.testUser)
            })

            const updateData = { email: 'invalid-email' }

            mockApiCall.mockRejectedValue({
                message: 'Email inválido',
                status: 400
            })

            let updateResult: any
            await act(async () => {
                updateResult = await result.current.updateProfile(updateData)
            })

            expect(updateResult.success).toBe(false)
            expect(updateResult.error).toBe('Email inválido')
            // User should remain unchanged
            expect(result.current.user).toEqual(global.testUser)
        })
    })

    describe('Password Management', () => {
        it('changes password successfully', async () => {
            const { result } = renderHook(() => useAuth())

            await act(async () => {
                result.current.setUser(global.testUser)
            })

            const passwordData = {
                currentPassword: 'oldpassword',
                newPassword: 'newpassword123',
                confirmPassword: 'newpassword123'
            }

            mockApiCall.mockResolvedValue({ success: true })

            let changeResult: any
            await act(async () => {
                changeResult = await result.current.changePassword(passwordData)
            })

            expect(changeResult.success).toBe(true)

            expect(mockApiCall).toHaveBeenCalledWith('/auth/change-password', {
                method: 'POST',
                body: JSON.stringify(passwordData),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        })

        it('handles incorrect current password', async () => {
            const { result } = renderHook(() => useAuth())

            await act(async () => {
                result.current.setUser(global.testUser)
            })

            const passwordData = {
                currentPassword: 'wrongpassword',
                newPassword: 'newpassword123',
                confirmPassword: 'newpassword123'
            }

            mockApiCall.mockRejectedValue({
                message: 'Contraseña actual incorrecta',
                status: 400
            })

            let changeResult: any
            await act(async () => {
                changeResult = await result.current.changePassword(passwordData)
            })

            expect(changeResult.success).toBe(false)
            expect(changeResult.error).toBe('Contraseña actual incorrecta')
        })
    })

    describe('Token Refresh', () => {
        it('refreshes token automatically before expiration', async () => {
            const { result } = renderHook(() => useAuth())

            const mockRefreshedToken = 'refreshed-jwt-token'
            mockApiCall.mockResolvedValue({
                token: mockRefreshedToken,
                user: global.testUser
            })

            await act(async () => {
                await result.current.refreshToken()
            })

            expect(mockApiCall).toHaveBeenCalledWith('/auth/refresh', {
                method: 'POST'
            })

            expect(mockTokenStorage.setToken).toHaveBeenCalledWith(mockRefreshedToken)
        })

        it('logs out user when refresh fails', async () => {
            const { result } = renderHook(() => useAuth())

            await act(async () => {
                result.current.setUser(global.testUser)
            })

            mockApiCall.mockRejectedValue(new Error('Refresh failed'))

            await act(async () => {
                await result.current.refreshToken()
            })

            expect(result.current.user).toBeNull()
            expect(result.current.isAuthenticated).toBe(false)
            expect(mockTokenStorage.removeToken).toHaveBeenCalled()
        })
    })

    describe('Permission Checks', () => {
        it('checks user permissions correctly', () => {
            const { result } = renderHook(() => useAuth())

            // Test without user
            expect(result.current.hasPermission('ADMIN')).toBe(false)

            // Set regular user
            act(() => {
                result.current.setUser(global.testUser)
            })

            expect(result.current.hasPermission('USER')).toBe(true)
            expect(result.current.hasPermission('ADMIN')).toBe(false)

            // Set admin user
            act(() => {
                result.current.setUser({
                    ...global.testUser,
                    rol: 'ADMINISTRADOR'
                })
            })

            expect(result.current.hasPermission('USER')).toBe(true)
            expect(result.current.hasPermission('ADMIN')).toBe(true)
        })

        it('checks if user is admin', () => {
            const { result } = renderHook(() => useAuth())

            // Regular user
            act(() => {
                result.current.setUser(global.testUser)
            })

            expect(result.current.isAdmin).toBe(false)

            // Admin user
            act(() => {
                result.current.setUser({
                    ...global.testUser,
                    rol: 'ADMINISTRADOR'
                })
            })

            expect(result.current.isAdmin).toBe(true)
        })
    })

    describe('Error Handling', () => {
        it('handles network timeouts', async () => {
            const credentials = {
                email: 'test@example.com',
                password: 'password123'
            }

            mockApiCall.mockRejectedValue({
                name: 'TimeoutError',
                message: 'Request timeout'
            })

            const { result } = renderHook(() => useAuth())

            let loginResult: any
            await act(async () => {
                loginResult = await result.current.login(credentials)
            })

            expect(loginResult.success).toBe(false)
            expect(loginResult.error).toBe('La conexión tardó demasiado. Intenta nuevamente.')
        })

        it('handles server errors', async () => {
            const credentials = {
                email: 'test@example.com',
                password: 'password123'
            }

            mockApiCall.mockRejectedValue({
                status: 500,
                message: 'Internal server error'
            })

            const { result } = renderHook(() => useAuth())

            let loginResult: any
            await act(async () => {
                loginResult = await result.current.login(credentials)
            })

            expect(loginResult.success).toBe(false)
            expect(loginResult.error).toBe('Error del servidor. Intenta más tarde.')
        })

        it('clears errors after successful operations', async () => {
            const { result } = renderHook(() => useAuth())

            // First, cause an error
            mockApiCall.mockRejectedValueOnce(new Error('Login failed'))

            await act(async () => {
                await result.current.login({
                    email: 'test@example.com',
                    password: 'wrong'
                })
            })

            // Then, succeed
            mockApiCall.mockResolvedValueOnce({
                user: global.testUser,
                token: 'token',
                success: true
            })

            await act(async () => {
                await result.current.login({
                    email: 'test@example.com',
                    password: 'correct'
                })
            })

            expect(result.current.error).toBeNull()
        })
    })
}) 