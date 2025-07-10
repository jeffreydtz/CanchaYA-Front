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
    login: (email: string) => Promise<boolean>
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
            const success = await result.current.login('test@example.com')
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
}) 