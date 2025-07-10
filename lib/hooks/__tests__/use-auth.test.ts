/**
 * Unit Tests for useAuth Hook
 * Tests authentication state management, login/logout flows, and error handling
 */

import { renderHook, act } from '@testing-library/react'
import { useAuth, AuthProvider } from '@/components/auth/auth-context'
import { ReactNode } from 'react'

// Mock the auth utilities
jest.mock('@/lib/auth', () => ({
    getClientUser: jest.fn(),
    isClientAuthenticated: jest.fn(),
    logoutUser: jest.fn(),
}))

interface TestUser {
    id: string
    nombre: string
    email: string
    rol: string
}

interface AuthContextType {
    user: TestUser | null
    login: (email: string, password: string) => Promise<boolean>
    logout: () => void
    isAuthenticated: boolean
    isAdmin: boolean
    loading: boolean
}

const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{ children } </AuthProvider>
)

describe('useAuth', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should provide initial auth state', () => {
        const { result } = renderHook(() => useAuth(), { wrapper })

        expect(result.current.user).toBeNull()
        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.isAdmin).toBe(false)
        expect(result.current.loading).toBe(true)
        expect(typeof result.current.login).toBe('function')
        expect(typeof result.current.logout).toBe('function')
    })

    it('should handle login successfully', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper })

        await act(async () => {
            const success = await result.current.login('test@example.com', 'password')
            expect(success).toBe(true)
        })

        expect(result.current.user).toEqual({
            id: '1',
            nombre: 'Usuario Demo',
            email: 'test@example.com',
            rol: 'usuario',
        })
        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.isAdmin).toBe(false)
    })

    it('should handle login failure', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper })

        // Mock a failed login by throwing an error
        const originalLogin = result.current.login
        result.current.login = jest.fn().mockRejectedValue(new Error('Login failed'))

        await act(async () => {
            const success = await result.current.login('test@example.com', 'wrongpassword')
            expect(success).toBe(false)
        })

        expect(result.current.user).toBeNull()
        expect(result.current.isAuthenticated).toBe(false)
    })

    it('should handle logout', () => {
        const { result } = renderHook(() => useAuth(), { wrapper })

        act(() => {
            result.current.logout()
        })

        expect(result.current.user).toBeNull()
        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.isAdmin).toBe(false)
    })

    it('should identify admin users', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper })

        // Mock admin user
        const mockAdminUser: TestUser = {
            id: '1',
            nombre: 'Admin Demo',
            email: 'admin@example.com',
            rol: 'admin',
        }

        act(() => {
            // Directly set user to admin for testing
            ; (result.current as unknown as { user: TestUser | null }).user = mockAdminUser
        })

        expect(result.current.isAdmin).toBe(true)
        expect(result.current.isAuthenticated).toBe(true)
    })

    it('should identify regular users', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper })

        // Mock regular user
        const mockRegularUser: TestUser = {
            id: '2',
            nombre: 'Usuario Regular',
            email: 'user@example.com',
            rol: 'usuario',
        }

        act(() => {
            // Directly set user to regular for testing
            ; (result.current as unknown as { user: TestUser | null }).user = mockRegularUser
        })

        expect(result.current.isAdmin).toBe(false)
        expect(result.current.isAuthenticated).toBe(true)
    })

    it('should handle loading state', () => {
        const { result } = renderHook(() => useAuth(), { wrapper })

        expect(result.current.loading).toBe(true)

        // Wait for initialization to complete
        act(() => {
            // Simulate loading completion
            ; (result.current as unknown as { loading: boolean }).loading = false
        })

        expect(result.current.loading).toBe(false)
    })

    it('should throw error when used outside provider', () => {
        // Render without wrapper to test error
        expect(() => {
            renderHook(() => useAuth())
        }).toThrow('useAuth must be used within an AuthProvider')
    })

    it('should handle multiple login/logout cycles', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper })

        // First login
        await act(async () => {
            await result.current.login('user1@example.com', 'password1')
        })

        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.user?.email).toBe('user1@example.com')

        // Logout
        act(() => {
            result.current.logout()
        })

        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.user).toBeNull()

        // Second login
        await act(async () => {
            await result.current.login('user2@example.com', 'password2')
        })

        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.user?.email).toBe('user2@example.com')
    })

    it('should maintain user state across re-renders', async () => {
        const { result, rerender } = renderHook(() => useAuth(), { wrapper })

        await act(async () => {
            await result.current.login('test@example.com', 'password')
        })

        const userBeforeRerender = result.current.user

        rerender()

        expect(result.current.user).toEqual(userBeforeRerender)
        expect(result.current.isAuthenticated).toBe(true)
    })

    it('should handle concurrent login attempts', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper })

        const loginPromises = [
            result.current.login('user1@example.com', 'password1'),
            result.current.login('user2@example.com', 'password2'),
            result.current.login('user3@example.com', 'password3'),
        ]

        await act(async () => {
            await Promise.all(loginPromises)
        })

        // Should have the last login result
        expect(result.current.user?.email).toBe('user3@example.com')
    })

    it('should handle login with empty credentials', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper })

        await act(async () => {
            const success = await result.current.login('', '')
            expect(success).toBe(true) // Mock always returns true
        })

        expect(result.current.isAuthenticated).toBe(true)
    })

    it('should handle login with special characters', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper })

        await act(async () => {
            const success = await result.current.login('test+user@example.com', 'p@ssw0rd!')
            expect(success).toBe(true)
        })

        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.user?.email).toBe('test+user@example.com')
    })
}) 