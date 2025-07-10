/**
 * Unit Tests for Navbar Component
 * Tests navigation, authentication states, mobile behavior, and user interactions
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { useAuth } from '@/components/auth/auth-context'
import Navbar from '../navbar'

// Mock auth context
jest.mock('@/components/auth/auth-context', () => ({
  useAuth: jest.fn(),
}))

// Mock notification bell component
jest.mock('@/components/notifications/notification-bell', () => {
  return function MockNotificationBell() {
    return <div data-testid="notification-bell">Notification Bell</div>
  }
})

const mockAuth = {
  user: null,
  isLoading: false,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
}

const mockUser = {
  id: '1',
  nombre: 'John',
  apellido: 'Doe',
  email: 'john@example.com',
  rol: 'USUARIO'
}

const mockAdminUser = {
  ...mockUser,
  rol: 'ADMINISTRADOR'
}

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders brand logo and name', () => {
      render(<Navbar />)

      expect(screen.getByText('CanchaYA')).toBeInTheDocument()
      expect(screen.getByText('C')).toBeInTheDocument() // Logo letter
    })

    it('renders authentication buttons for unauthenticated users', () => {
      render(<Navbar />)

      expect(screen.getByRole('link', { name: /iniciar sesión/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /registrarse/i })).toBeInTheDocument()
    })

    it('renders user menu for authenticated users', () => {
      render(<Navbar user={mockUser} />)

      expect(screen.getByText('JD')).toBeInTheDocument() // Avatar initials
      expect(screen.getByRole('button', { name: /john doe/i })).toBeInTheDocument()
    })

    it('renders admin link for admin users', () => {
      render(<Navbar user={mockAdminUser} />)

      expect(screen.getByRole('link', { name: /admin/i })).toBeInTheDocument()
      expect(screen.getByText('Administrador')).toBeInTheDocument()
    })

    it('renders notification bell for authenticated users', () => {
      render(<Navbar user={mockUser} />)

      expect(screen.getByTestId('notification-bell')).toBeInTheDocument()
    })
  })

  describe('User Menu Interactions', () => {
    it('shows user information in dropdown menu', async () => {
      const user = userEvent.setup()
      render(<Navbar user={mockUser} />)

      // Open dropdown
      await user.click(screen.getByRole('button', { name: /john doe/i }))

      // Check user info
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })

    it('navigates to correct pages from dropdown menu', async () => {
      const user = userEvent.setup()
      render(<Navbar user={mockUser} />)

      // Open dropdown
      await user.click(screen.getByRole('button', { name: /john doe/i }))

      // Click menu items
      await user.click(screen.getByText('Perfil'))
      expect(mockPush).toHaveBeenCalledWith('/perfil')

      await user.click(screen.getByText('Mis Reservas'))
      expect(mockPush).toHaveBeenCalledWith('/mis-reservas')

      await user.click(screen.getByText('Configuración'))
      expect(mockPush).toHaveBeenCalledWith('/configuracion')
    })

    it('handles logout correctly', async () => {
      const user = userEvent.setup()
      const logoutSpy = jest.spyOn(actions, 'logoutAction')
      render(<Navbar user={mockUser} />)

      // Open dropdown and click logout
      await user.click(screen.getByRole('button', { name: /john doe/i }))
      await user.click(screen.getByText(/cerrar sesión/i))

      expect(logoutSpy).toHaveBeenCalled()
    })
  })

  describe('Mobile Menu', () => {
    it('shows mobile menu button on mobile', () => {
      render(<Navbar user={mockUser} />)

      expect(screen.getByRole('button', { name: /abrir menú/i })).toBeInTheDocument()
    })

    it('opens mobile menu when button is clicked', async () => {
      const user = userEvent.setup()
      render(<Navbar user={mockUser} />)

      await user.click(screen.getByRole('button', { name: /abrir menú/i }))

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Menú')).toBeInTheDocument()
    })

    it('shows correct navigation links in mobile menu', async () => {
      const user = userEvent.setup()
      render(<Navbar user={mockAdminUser} />)

      await user.click(screen.getByRole('button', { name: /abrir menú/i }))

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getAllByText(/inicio/i)[1]).toBeInTheDocument() // One in desktop nav, one in mobile
      expect(screen.getAllByText(/mis reservas/i)[1]).toBeInTheDocument()
      expect(screen.getAllByText(/panel admin/i)[1]).toBeInTheDocument()
    })

    it('closes mobile menu when a link is clicked', async () => {
      const user = userEvent.setup()
      render(<Navbar user={mockUser} />)

      // Open menu
      await user.click(screen.getByRole('button', { name: /abrir menú/i }))
      
      // Click a link
      await user.click(screen.getAllByText(/inicio/i)[1])

      // Menu should close
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('Navigation Links', () => {
    it('renders correct desktop navigation links for authenticated users', () => {
      render(<Navbar user={mockUser} />)

      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('hidden md:flex')
      expect(screen.getByRole('link', { name: /inicio/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /mis reservas/i })).toBeInTheDocument()
    })

    it('includes admin link in desktop navigation for admin users', () => {
      render(<Navbar user={mockAdminUser} />)

      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('hidden md:flex')
      expect(screen.getByRole('link', { name: /admin/i })).toBeInTheDocument()
    })
  })
}) 