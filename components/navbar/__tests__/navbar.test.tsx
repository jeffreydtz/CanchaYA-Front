/**
 * Unit Tests for Navbar Component
 * Tests navigation, authentication states, mobile behavior, and user interactions
 */

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Navbar } from '../navbar'
import { 
  renderWithProviders, 
  mockAuthContextValue,
  setMobileViewport,
  setDesktopViewport,
  expectNavigation
} from '@/__tests__/utils/test-utils'

// Mock useRouter
const mockPush = jest.fn()
const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}))

describe('Navbar', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockReplace.mockClear()
  })

  describe('Rendering', () => {
    it('renders brand logo and name', () => {
      renderWithProviders(<Navbar />)

      expect(screen.getByText('CanchaYA')).toBeInTheDocument()
      expect(screen.getByRole('img', { name: /logo/i })).toBeInTheDocument()
    })

    it('renders navigation links for authenticated users', () => {
      renderWithProviders(<Navbar />)

      expect(screen.getByRole('link', { name: /inicio/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /mis reservas/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /explorar canchas/i })).toBeInTheDocument()
    })

    it('renders user menu for authenticated users', () => {
      renderWithProviders(<Navbar />)

      expect(screen.getByTestId('user-menu')).toBeInTheDocument()
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })

    it('renders login/register buttons for unauthenticated users', () => {
      const unauthenticatedContext = {
        ...mockAuthContextValue,
        user: null,
        isAuthenticated: false,
      }

      renderWithProviders(<Navbar />, { authValue: unauthenticatedContext })

      expect(screen.getByRole('link', { name: /iniciar sesión/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /registrarse/i })).toBeInTheDocument()
      expect(screen.queryByTestId('user-menu')).not.toBeInTheDocument()
    })

    it('shows admin link for admin users', () => {
      const adminContext = {
        ...mockAuthContextValue,
        user: { ...global.testUser, rol: 'ADMINISTRADOR' },
      }

      renderWithProviders(<Navbar />, { authValue: adminContext })

      expect(screen.getByRole('link', { name: /administración/i })).toBeInTheDocument()
    })
  })

  describe('Mobile Responsiveness', () => {
    it('shows mobile menu toggle on small screens', () => {
      setMobileViewport()
      renderWithProviders(<Navbar />)

      expect(screen.getByTestId('mobile-menu-toggle')).toBeInTheDocument()
      expect(screen.queryByRole('navigation')).toHaveClass('hidden')
    })

    it('opens mobile menu when toggle is clicked', async () => {
      const user = userEvent.setup()
      setMobileViewport()
      renderWithProviders(<Navbar />)

      const toggleButton = screen.getByTestId('mobile-menu-toggle')
      await user.click(toggleButton)

      expect(screen.getByRole('navigation')).toHaveClass('block')
      expect(screen.getByTestId('close-mobile-menu')).toBeInTheDocument()
    })

    it('closes mobile menu when close button is clicked', async () => {
      const user = userEvent.setup()
      setMobileViewport()
      renderWithProviders(<Navbar />)

      // Open menu
      await user.click(screen.getByTestId('mobile-menu-toggle'))
      
      // Close menu
      await user.click(screen.getByTestId('close-mobile-menu'))

      expect(screen.getByRole('navigation')).toHaveClass('hidden')
    })

    it('shows full navigation on desktop screens', () => {
      setDesktopViewport()
      renderWithProviders(<Navbar />)

      expect(screen.queryByTestId('mobile-menu-toggle')).not.toBeInTheDocument()
      expect(screen.getByRole('navigation')).toHaveClass('block')
    })
  })

  describe('Navigation Interactions', () => {
    it('navigates to home when logo is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Navbar />)

      await user.click(screen.getByText('CanchaYA'))

      await expectNavigation('/')
    })

    it('navigates to dashboard when "Inicio" is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Navbar />)

      await user.click(screen.getByRole('link', { name: /inicio/i }))

      await expectNavigation('/dashboard')
    })

    it('navigates to reservations when "Mis Reservas" is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Navbar />)

      await user.click(screen.getByRole('link', { name: /mis reservas/i }))

      await expectNavigation('/mis-reservas')
    })

    it('navigates to courts when "Explorar Canchas" is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Navbar />)

      await user.click(screen.getByRole('link', { name: /explorar canchas/i }))

      await expectNavigation('/canchas')
    })

    it('navigates to admin panel for admin users', async () => {
      const user = userEvent.setup()
      const adminContext = {
        ...mockAuthContextValue,
        user: { ...global.testUser, rol: 'ADMINISTRADOR' },
      }

      renderWithProviders(<Navbar />, { authValue: adminContext })

      await user.click(screen.getByRole('link', { name: /administración/i }))

      await expectNavigation('/admin')
    })
  })

  describe('User Menu Interactions', () => {
    it('opens user dropdown when clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Navbar />)

      await user.click(screen.getByTestId('user-menu'))

      expect(screen.getByText(/perfil/i)).toBeInTheDocument()
      expect(screen.getByText(/configuración/i)).toBeInTheDocument()
      expect(screen.getByText(/cerrar sesión/i)).toBeInTheDocument()
    })

    it('shows user name and email in dropdown', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Navbar />)

      await user.click(screen.getByTestId('user-menu'))

      expect(screen.getByText('Test User')).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })

    it('calls logout when logout option is clicked', async () => {
      const user = userEvent.setup()
      const mockLogout = jest.fn()
      const contextWithLogout = {
        ...mockAuthContextValue,
        logout: mockLogout,
      }

      renderWithProviders(<Navbar />, { authValue: contextWithLogout })

      await user.click(screen.getByTestId('user-menu'))
      await user.click(screen.getByText(/cerrar sesión/i))

      expect(mockLogout).toHaveBeenCalled()
    })

    it('navigates to profile when profile option is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Navbar />)

      await user.click(screen.getByTestId('user-menu'))
      await user.click(screen.getByText(/perfil/i))

      await expectNavigation('/perfil')
    })
  })

  describe('Search Functionality', () => {
    it('renders search input', () => {
      renderWithProviders(<Navbar />)

      expect(screen.getByPlaceholderText(/buscar canchas/i)).toBeInTheDocument()
      expect(screen.getByTestId('search-icon')).toBeInTheDocument()
    })

    it('performs search when Enter is pressed', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Navbar />)

      const searchInput = screen.getByPlaceholderText(/buscar canchas/i)
      await user.type(searchInput, 'fútbol')
      await user.keyboard('{Enter}')

      await expectNavigation('/canchas?q=fútbol')
    })

    it('clears search input when clear button is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Navbar />)

      const searchInput = screen.getByPlaceholderText(/buscar canchas/i) as HTMLInputElement
      await user.type(searchInput, 'test search')

      expect(searchInput.value).toBe('test search')

      await user.click(screen.getByTestId('clear-search'))

      expect(searchInput.value).toBe('')
    })
  })

  describe('Notifications', () => {
    it('shows notification bell for authenticated users', () => {
      renderWithProviders(<Navbar />)

      expect(screen.getByTestId('notification-bell')).toBeInTheDocument()
    })

    it('shows notification count badge when there are unread notifications', () => {
      const contextWithNotifications = {
        ...mockAuthContextValue,
        user: { ...global.testUser, unreadNotifications: 3 },
      }

      renderWithProviders(<Navbar />, { authValue: contextWithNotifications })

      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByTestId('notification-count')).toBeInTheDocument()
    })

    it('opens notification dropdown when bell is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Navbar />)

      await user.click(screen.getByTestId('notification-bell'))

      expect(screen.getByText(/notificaciones/i)).toBeInTheDocument()
      expect(screen.getByText(/marcar todas como leídas/i)).toBeInTheDocument()
    })
  })

  describe('Authentication State Changes', () => {
    it('updates UI when user logs in', () => {
      const { rerender } = renderWithProviders(<Navbar />, {
        authValue: { ...mockAuthContextValue, user: null, isAuthenticated: false }
      })

      expect(screen.getByRole('link', { name: /iniciar sesión/i })).toBeInTheDocument()
      expect(screen.queryByTestId('user-menu')).not.toBeInTheDocument()

      rerender(<Navbar />)

      expect(screen.getByTestId('user-menu')).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /iniciar sesión/i })).not.toBeInTheDocument()
    })

    it('shows loading state during authentication', () => {
      const loadingContext = {
        ...mockAuthContextValue,
        isLoading: true,
        user: null,
        isAuthenticated: false,
      }

      renderWithProviders(<Navbar />, { authValue: loadingContext })

      expect(screen.getByTestId('auth-loading')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderWithProviders(<Navbar />)

      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Main navigation')
      expect(screen.getByTestId('user-menu')).toHaveAttribute('aria-label', 'User menu')
      expect(screen.getByTestId('notification-bell')).toHaveAttribute('aria-label', 'Notifications')
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Navbar />)

      // Tab through navigation items
      await user.tab()
      expect(screen.getByRole('link', { name: /inicio/i })).toHaveFocus()

      await user.tab()
      expect(screen.getByRole('link', { name: /mis reservas/i })).toHaveFocus()

      await user.tab()
      expect(screen.getByRole('link', { name: /explorar canchas/i })).toHaveFocus()
    })

    it('opens user menu with Enter key', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Navbar />)

      const userMenu = screen.getByTestId('user-menu')
      userMenu.focus()
      await user.keyboard('{Enter}')

      expect(screen.getByText(/perfil/i)).toBeInTheDocument()
    })
  })
}) 