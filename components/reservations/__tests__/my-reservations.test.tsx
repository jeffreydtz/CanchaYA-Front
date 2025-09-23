/**
 * Unit Tests for MyReservations Component
 * Tests reservation display, confirmation, cancellation, and status management
 */

import { render, screen, waitFor } from '@testing-library/react'
import MyReservations from '../my-reservations'
import apiClient from '@/lib/api-client'

// Mock API client
jest.mock('@/lib/api-client', () => ({
  __esModule: true,
  default: {
    getMyReservations: jest.fn(),
    cancelReservation: jest.fn(),
  },
}))

const mockReservations = [
  {
    id: '1',
    courtId: 'court1',
    userId: 'user1',
    fecha: '2025-01-15',
    hora: '14:00',
    duracion: 2,
    precio: 5000,
    estado: 'confirmada',
    court: {
      id: 'court1',
      nombre: 'Cancha de Fútbol 1',
      deporte: 'Fútbol',
      club: 'Club Deportivo',
      direccion: 'Av. Principal 123',
      precio: 5000,
      imagen: '/placeholder.jpg',
      descripcion: 'Cancha profesional',
      horarios: 'Lun-Dom 8:00-22:00',
      telefono: '123-456-7890',
      email: 'info@club.com',
    },
  },
]

describe('MyReservations', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2025-03-20T12:00:00Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  describe('Reservation Display', () => {
    it('displays all reservation information correctly', () => {
      render(
        <MyReservations 
          reservations={mockReservations} 
          userId="test-user" 
        />
      )

      // Check first reservation
      expect(screen.getByText('Cancha de Fútbol 1')).toBeInTheDocument()
      expect(screen.getByText('Fútbol')).toBeInTheDocument()
      expect(screen.getByText(/miércoles, 20 de marzo de 2025/i)).toBeInTheDocument()
      expect(screen.getByText(/14:00 - 15:00 hs/i)).toBeInTheDocument()
      expect(screen.getByText('Club Deportivo - Av. Principal 123')).toBeInTheDocument()
      expect(screen.getByText('$ 5.000')).toBeInTheDocument()
    })

    it('shows correct status badges', () => {
      render(
        <MyReservations 
          reservations={mockReservations} 
          userId="test-user" 
        />
      )

      const pendingBadge = screen.getByText('Pendiente')
      const confirmedBadge = screen.getByText('Confirmada')
      const cancelledBadge = screen.getByText('Cancelada')

      expect(pendingBadge).toHaveClass('bg-gray-100', 'text-gray-800')
      expect(confirmedBadge).toHaveClass('bg-green-100', 'text-green-800')
      expect(cancelledBadge).toHaveClass('bg-destructive')
    })

    it('shows confirmation deadline for pending reservations', () => {
      const futureReservation = {
        ...mockReservations[0],
        fecha: '2025-03-20',
        hora: '16:00'
      }

      render(
        <MyReservations 
          reservations={[futureReservation]} 
          userId="test-user" 
        />
      )

      expect(screen.getByText(/confirma en 2h/i)).toBeInTheDocument()
    })
  })

  describe('Reservation Actions', () => {
    it('allows confirming a pending reservation within the time window', async () => {
      const confirmSpy = jest.spyOn(apiClient.default, 'confirmReservation')
      confirmSpy.mockResolvedValue({ success: true })

      const pendingReservation = {
        ...mockReservations[0],
        fecha: '2025-03-20',
        hora: '16:00' // 4 hours from mock current time
      }

      render(
        <MyReservations 
          reservations={[pendingReservation]} 
          userId="test-user" 
        />
      )

      // Open confirm dialog
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /confirmar asistencia/i })).toBeInTheDocument()
      })
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /confirmar/i })).toBeInTheDocument()
      })

      // Confirm reservation
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /confirmar/i })).toBeInTheDocument()
      })

      expect(confirmSpy).toHaveBeenCalledWith(pendingReservation.id)
    })

    it('allows cancelling an upcoming reservation', async () => {
      const cancelSpy = jest.spyOn(apiClient.default, 'cancelReservation')
      cancelSpy.mockResolvedValue({ success: true })

      const upcomingReservation = {
        ...mockReservations[0],
        fecha: '2025-03-20',
        hora: '16:00'
      }

      render(
        <MyReservations 
          reservations={[upcomingReservation]} 
          userId="test-user" 
        />
      )

      // Open cancel dialog
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancelar reserva/i })).toBeInTheDocument()
      })
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sí, cancelar/i })).toBeInTheDocument()
      })

      // Cancel reservation
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sí, cancelar/i })).toBeInTheDocument()
      })

      expect(cancelSpy).toHaveBeenCalledWith(upcomingReservation.id)
    })

    it('shows error toast when confirmation fails', async () => {
      const confirmSpy = jest.spyOn(apiClient.default, 'confirmReservation')
      confirmSpy.mockResolvedValue({ success: false, error: 'Error de confirmación' })

      render(
        <MyReservations 
          reservations={[mockReservations[0]]} 
          userId="test-user" 
        />
      )

      // Open confirm dialog
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /confirmar asistencia/i })).toBeInTheDocument()
      })
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /confirmar/i })).toBeInTheDocument()
      })

      // Try to confirm
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /confirmar/i })).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByText('Error de confirmación')).toBeInTheDocument()
      })
    })

    it('shows error toast when cancellation fails', async () => {
      const cancelSpy = jest.spyOn(apiClient.default, 'cancelReservation')
      cancelSpy.mockResolvedValue({ success: false, error: 'Error de cancelación' })

      render(
        <MyReservations 
          reservations={[mockReservations[0]]} 
          userId="test-user" 
        />
      )

      // Open cancel dialog
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancelar reserva/i })).toBeInTheDocument()
      })
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sí, cancelar/i })).toBeInTheDocument()
      })

      // Try to cancel
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sí, cancelar/i })).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByText('Error de cancelación')).toBeInTheDocument()
      })
    })

    it('disables confirmation button when past deadline', () => {
      const pastDeadlineReservation = {
        ...mockReservations[0],
        fecha: '2025-03-20',
        hora: '13:00' // 1 hour from mock current time
      }

      render(
        <MyReservations 
          reservations={[pastDeadlineReservation]} 
          userId="test-user" 
        />
      )

      expect(screen.queryByRole('button', { name: /confirmar asistencia/i })).not.toBeInTheDocument()
    })

    it('disables cancellation button for past reservations', () => {
      const pastReservation = {
        ...mockReservations[0],
        fecha: '2025-03-19',
        hora: '10:00'
      }

      render(
        <MyReservations 
          reservations={[pastReservation]} 
          userId="test-user" 
        />
      )

      expect(screen.queryByRole('button', { name: /cancelar reserva/i })).not.toBeInTheDocument()
    })
  })
}) 