/**
 * Unit Tests for MyReservations Component
 * Tests reservation loading, filtering, cancellation, and status management
 */

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MyReservations } from '../my-reservations'
import { 
  renderWithProviders, 
  mockFetchSuccess, 
  mockFetchError,
  expectToastMessage,
  expectApiCall
} from '@/__tests__/utils/test-utils'

// Mock API calls
const mockApiCall = jest.fn()
jest.mock('@/lib/api-client', () => ({
  api: {
    get: mockApiCall,
    delete: mockApiCall,
    patch: mockApiCall,
  }
}))

const mockReservations = [
  {
    ...global.testReservation,
    id: '1',
    fecha: '2024-12-25',
    horaInicio: '10:00',
    horaFin: '11:00',
    estado: 'CONFIRMADA',
    cancha: {
      ...global.testCourt,
      nombre: 'Cancha Fútbol 1'
    }
  },
  {
    ...global.testReservation,
    id: '2',
    fecha: '2024-12-26',
    horaInicio: '14:00',
    horaFin: '15:00',
    estado: 'PENDIENTE',
    cancha: {
      ...global.testCourt,
      nombre: 'Cancha Tenis 1'
    }
  },
  {
    ...global.testReservation,
    id: '3',
    fecha: '2024-12-20',
    horaInicio: '09:00',
    horaFin: '10:00',
    estado: 'CANCELADA',
    cancha: {
      ...global.testCourt,
      nombre: 'Cancha Básquet 1'
    }
  }
]

describe('MyReservations', () => {
  beforeEach(() => {
    mockApiCall.mockClear()
  })

  describe('Loading States', () => {
    it('shows loading spinner while fetching reservations', () => {
      mockApiCall.mockImplementation(() => new Promise(() => {})) // Never resolves
      
      renderWithProviders(<MyReservations />)

      expect(screen.getByTestId('loader-icon')).toBeInTheDocument()
      expect(screen.getByText(/cargando reservas/i)).toBeInTheDocument()
    })

    it('displays reservations after successful fetch', async () => {
      mockFetchSuccess(mockReservations)
      
      renderWithProviders(<MyReservations />)

      await waitFor(() => {
        expect(screen.getByText('Cancha Fútbol 1')).toBeInTheDocument()
        expect(screen.getByText('Cancha Tenis 1')).toBeInTheDocument()
        expect(screen.getByText('Cancha Básquet 1')).toBeInTheDocument()
      })
    })

    it('shows error message when fetch fails', async () => {
      mockFetchError('Error al cargar reservas')
      
      renderWithProviders(<MyReservations />)

      await waitFor(() => {
        expect(screen.getByText(/error al cargar reservas/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /intentar nuevamente/i })).toBeInTheDocument()
      })
    })

    it('shows empty state when no reservations exist', async () => {
      mockFetchSuccess([])
      
      renderWithProviders(<MyReservations />)

      await waitFor(() => {
        expect(screen.getByText(/no tienes reservas/i)).toBeInTheDocument()
        expect(screen.getByText(/¡es hora de reservar tu primera cancha!/i)).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /explorar canchas/i })).toBeInTheDocument()
      })
    })
  })

  describe('Reservation Display', () => {
    beforeEach(async () => {
      mockFetchSuccess(mockReservations)
      renderWithProviders(<MyReservations />)
      
      await waitFor(() => {
        expect(screen.getByText('Cancha Fútbol 1')).toBeInTheDocument()
      })
    })

    it('displays all reservation information correctly', () => {
      // Check first reservation
      expect(screen.getByText('Cancha Fútbol 1')).toBeInTheDocument()
      expect(screen.getByText('25 de diciembre, 2024')).toBeInTheDocument()
      expect(screen.getByText('10:00 - 11:00')).toBeInTheDocument()
      expect(screen.getByText('CONFIRMADA')).toBeInTheDocument()
      expect(screen.getByText('$5.000')).toBeInTheDocument()
    })

    it('shows correct status badges with appropriate colors', () => {
      const confirmedBadge = screen.getByText('CONFIRMADA')
      const pendingBadge = screen.getByText('PENDIENTE')
      const cancelledBadge = screen.getByText('CANCELADA')

      expect(confirmedBadge).toHaveClass('bg-green-100', 'text-green-800')
      expect(pendingBadge).toHaveClass('bg-yellow-100', 'text-yellow-800')
      expect(cancelledBadge).toHaveClass('bg-red-100', 'text-red-800')
    })

    it('displays court information with images', () => {
      const courtImages = screen.getAllByRole('img', { name: /cancha/i })
      expect(courtImages).toHaveLength(3)
      
      courtImages.forEach(img => {
        expect(img).toHaveAttribute('src')
        expect(img).toHaveAttribute('alt')
      })
    })

    it('shows action buttons for appropriate reservations', () => {
      // Confirmed reservations should have cancel button
      const cancelButtons = screen.getAllByRole('button', { name: /cancelar/i })
      expect(cancelButtons).toHaveLength(1) // Only for confirmed reservation

      // Pending reservations should have modify button
      const modifyButtons = screen.getAllByRole('button', { name: /modificar/i })
      expect(modifyButtons).toHaveLength(1) // Only for pending reservation

      // Cancelled reservations should have no action buttons
      const cancelledSection = screen.getByText('CANCELADA').closest('[data-testid="reservation-card"]')
      expect(cancelledSection?.querySelector('button[data-action]')).toBeNull()
    })
  })

  describe('Filtering and Sorting', () => {
    beforeEach(async () => {
      mockFetchSuccess(mockReservations)
      renderWithProviders(<MyReservations />)
      
      await waitFor(() => {
        expect(screen.getByText('Cancha Fútbol 1')).toBeInTheDocument()
      })
    })

    it('filters reservations by status', async () => {
      const user = userEvent.setup()
      
      // Filter by confirmed
      await user.click(screen.getByRole('button', { name: /confirmadas/i }))
      
      expect(screen.getByText('Cancha Fútbol 1')).toBeInTheDocument()
      expect(screen.queryByText('Cancha Tenis 1')).not.toBeInTheDocument()
      expect(screen.queryByText('Cancha Básquet 1')).not.toBeInTheDocument()
    })

    it('filters reservations by date range', async () => {
      const user = userEvent.setup()
      
      // Open date filter
      await user.click(screen.getByTestId('date-filter-button'))
      
      // Select "Próximas" filter
      await user.click(screen.getByText(/próximas/i))
      
      // Should only show future reservations
      expect(screen.getByText('Cancha Fútbol 1')).toBeInTheDocument()
      expect(screen.getByText('Cancha Tenis 1')).toBeInTheDocument()
      expect(screen.queryByText('Cancha Básquet 1')).not.toBeInTheDocument()
    })

    it('sorts reservations by date', async () => {
      const user = userEvent.setup()
      
      // Open sort dropdown
      await user.click(screen.getByTestId('sort-dropdown'))
      
      // Sort by date ascending
      await user.click(screen.getByText(/fecha \(más antigua\)/i))
      
      const reservationCards = screen.getAllByTestId('reservation-card')
      expect(reservationCards[0]).toHaveTextContent('Cancha Básquet 1') // Dec 20
      expect(reservationCards[1]).toHaveTextContent('Cancha Fútbol 1')  // Dec 25
      expect(reservationCards[2]).toHaveTextContent('Cancha Tenis 1')   // Dec 26
    })

    it('searches reservations by court name', async () => {
      const user = userEvent.setup()
      
      const searchInput = screen.getByPlaceholderText(/buscar por cancha/i)
      await user.type(searchInput, 'Fútbol')
      
      expect(screen.getByText('Cancha Fútbol 1')).toBeInTheDocument()
      expect(screen.queryByText('Cancha Tenis 1')).not.toBeInTheDocument()
      expect(screen.queryByText('Cancha Básquet 1')).not.toBeInTheDocument()
    })

    it('clears all filters when reset button is clicked', async () => {
      const user = userEvent.setup()
      
      // Apply some filters
      await user.click(screen.getByRole('button', { name: /confirmadas/i }))
      await user.type(screen.getByPlaceholderText(/buscar por cancha/i), 'test')
      
      // Clear filters
      await user.click(screen.getByRole('button', { name: /limpiar filtros/i }))
      
      // All reservations should be visible again
      expect(screen.getByText('Cancha Fútbol 1')).toBeInTheDocument()
      expect(screen.getByText('Cancha Tenis 1')).toBeInTheDocument()
      expect(screen.getByText('Cancha Básquet 1')).toBeInTheDocument()
    })
  })

  describe('Reservation Actions', () => {
    beforeEach(async () => {
      mockFetchSuccess(mockReservations)
      renderWithProviders(<MyReservations />)
      
      await waitFor(() => {
        expect(screen.getByText('Cancha Fútbol 1')).toBeInTheDocument()
      })
    })

    it('cancels reservation when cancel button is clicked', async () => {
      const user = userEvent.setup()
      mockApiCall.mockResolvedValueOnce({ success: true })
      
      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      await user.click(cancelButton)
      
      // Confirmation dialog should appear
      expect(screen.getByText(/¿estás seguro de que quieres cancelar/i)).toBeInTheDocument()
      
      // Confirm cancellation
      await user.click(screen.getByRole('button', { name: /sí, cancelar/i }))
      
      await waitFor(() => {
        expect(mockApiCall).toHaveBeenCalledWith(`/reservas/1/cancelar`, expect.objectContaining({
          method: 'PATCH'
        }))
        expectToastMessage('Reserva cancelada exitosamente', 'success')
      })
    })

    it('shows error when cancellation fails', async () => {
      const user = userEvent.setup()
      mockFetchError('Error al cancelar reserva')
      
      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      await user.click(cancelButton)
      await user.click(screen.getByRole('button', { name: /sí, cancelar/i }))
      
      await waitFor(() => {
        expectToastMessage('Error al cancelar reserva', 'error')
      })
    })

    it('allows modifying pending reservations', async () => {
      const user = userEvent.setup()
      
      const modifyButton = screen.getByRole('button', { name: /modificar/i })
      await user.click(modifyButton)
      
      // Should navigate to modify reservation page
      expect(mockApiCall).toHaveBeenCalledWith('/modificar-reserva/2')
    })

    it('prevents cancellation within 2 hours of start time', async () => {
      const nearReservation = {
        ...mockReservations[0],
        fecha: new Date().toISOString().split('T')[0],
        horaInicio: new Date(Date.now() + 60 * 60 * 1000).toTimeString().slice(0, 5) // 1 hour from now
      }
      
      mockFetchSuccess([nearReservation])
      renderWithProviders(<MyReservations />)
      
      await waitFor(() => {
        const cancelButton = screen.queryByRole('button', { name: /cancelar/i })
        expect(cancelButton).toBeDisabled()
        expect(screen.getByText(/no se puede cancelar/i)).toBeInTheDocument()
      })
    })
  })

  describe('Pagination', () => {
    it('shows pagination controls when there are many reservations', async () => {
      const manyReservations = Array.from({ length: 25 }, (_, i) => ({
        ...global.testReservation,
        id: `${i + 1}`,
        cancha: { ...global.testCourt, nombre: `Cancha ${i + 1}` }
      }))
      
      mockFetchSuccess(manyReservations)
      renderWithProviders(<MyReservations />)
      
      await waitFor(() => {
        expect(screen.getByTestId('pagination')).toBeInTheDocument()
        expect(screen.getByText('1 de 3')).toBeInTheDocument() // 25 items, 10 per page = 3 pages
      })
    })

    it('navigates to next page when next button is clicked', async () => {
      const user = userEvent.setup()
      const manyReservations = Array.from({ length: 25 }, (_, i) => ({
        ...global.testReservation,
        id: `${i + 1}`,
        cancha: { ...global.testCourt, nombre: `Cancha ${i + 1}` }
      }))
      
      mockFetchSuccess(manyReservations)
      renderWithProviders(<MyReservations />)
      
      await waitFor(() => {
        expect(screen.getByText('Cancha 1')).toBeInTheDocument()
      })
      
      // Click next page
      await user.click(screen.getByRole('button', { name: /siguiente/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Cancha 11')).toBeInTheDocument()
        expect(screen.queryByText('Cancha 1')).not.toBeInTheDocument()
      })
    })
  })

  describe('Reservation Details Modal', () => {
    beforeEach(async () => {
      mockFetchSuccess(mockReservations)
      renderWithProviders(<MyReservations />)
      
      await waitFor(() => {
        expect(screen.getByText('Cancha Fútbol 1')).toBeInTheDocument()
      })
    })

    it('opens details modal when reservation card is clicked', async () => {
      const user = userEvent.setup()
      
      const reservationCard = screen.getByText('Cancha Fútbol 1').closest('[data-testid="reservation-card"]')
      await user.click(reservationCard!)
      
      expect(screen.getByText(/detalles de la reserva/i)).toBeInTheDocument()
      expect(screen.getByText(/información de la cancha/i)).toBeInTheDocument()
      expect(screen.getByText(/Club Test/i)).toBeInTheDocument()
    })

    it('shows QR code for confirmed reservations', async () => {
      const user = userEvent.setup()
      
      const reservationCard = screen.getByText('Cancha Fútbol 1').closest('[data-testid="reservation-card"]')
      await user.click(reservationCard!)
      
      expect(screen.getByTestId('qr-code')).toBeInTheDocument()
      expect(screen.getByText(/código qr de acceso/i)).toBeInTheDocument()
    })

    it('closes modal when close button is clicked', async () => {
      const user = userEvent.setup()
      
      const reservationCard = screen.getByText('Cancha Fútbol 1').closest('[data-testid="reservation-card"]')
      await user.click(reservationCard!)
      
      await user.click(screen.getByTestId('close-modal'))
      
      expect(screen.queryByText(/detalles de la reserva/i)).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    beforeEach(async () => {
      mockFetchSuccess(mockReservations)
      renderWithProviders(<MyReservations />)
      
      await waitFor(() => {
        expect(screen.getByText('Cancha Fútbol 1')).toBeInTheDocument()
      })
    })

    it('has proper ARIA labels', () => {
      expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Mis Reservas')
      expect(screen.getByRole('region', { name: /filtros/i })).toBeInTheDocument()
      expect(screen.getByRole('list', { name: /lista de reservas/i })).toBeInTheDocument()
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      
      // Tab through filter buttons
      await user.tab()
      expect(screen.getByRole('button', { name: /todas/i })).toHaveFocus()
      
      await user.tab()
      expect(screen.getByRole('button', { name: /confirmadas/i })).toHaveFocus()
    })

    it('announces filter changes to screen readers', async () => {
      const user = userEvent.setup()
      
      await user.click(screen.getByRole('button', { name: /confirmadas/i }))
      
      expect(screen.getByRole('status')).toHaveTextContent('Mostrando 1 reserva confirmada')
    })
  })
}) 