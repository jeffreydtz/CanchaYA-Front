/**
 * Unit Tests for MyReservations Component
 * Tests reservation display, confirmation, cancellation, and status management
 */

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MyReservations } from '../my-reservations'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { addHours, subHours, parseISO, format } from 'date-fns'
import { es } from 'date-fns/locale'
import * as actions from '@/lib/actions'

// Mock server actions
jest.mock('@/lib/actions', () => ({
  confirmReservationAction: jest.fn(),
  cancelReservationAction: jest.fn()
}))

const mockDate = new Date('2024-03-20T12:00:00Z')

const mockReservations = [
  {
    id: '1',
    fecha: '2024-03-20',
    horaInicio: '14:00',
    horaFin: '15:00',
    estado: 'PENDIENTE',
    confirmada: false,
    precio: 5000,
    cancha: {
      id: '1',
      nombre: 'Cancha Fútbol 1',
      deporte: { nombre: 'Fútbol' },
      club: {
        nombre: 'Club Deportivo',
        direccion: 'Av. Principal 123'
      }
    }
  },
  {
    id: '2',
    fecha: '2024-03-20',
    horaInicio: '16:00',
    horaFin: '17:00',
    estado: 'CONFIRMADA',
    confirmada: true,
    precio: 6000,
    cancha: {
      id: '2',
      nombre: 'Cancha Tenis 1',
      deporte: { nombre: 'Tenis' },
      club: {
        nombre: 'Club Deportivo',
        direccion: 'Av. Principal 123'
      }
    }
  },
  {
    id: '3',
    fecha: '2024-03-19',
    horaInicio: '10:00',
    horaFin: '11:00',
    estado: 'CANCELADA',
    confirmada: false,
    precio: 4500,
    cancha: {
      id: '3',
      nombre: 'Cancha Básquet 1',
      deporte: { nombre: 'Básquet' },
      club: {
        nombre: 'Club Deportivo',
        direccion: 'Av. Principal 123'
      }
    }
  }
]

describe('MyReservations', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(mockDate)
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  describe('Reservation Display', () => {
    it('displays all reservation information correctly', () => {
      renderWithProviders(
        <MyReservations 
          reservations={mockReservations} 
          userId="test-user" 
        />
      )

      // Check first reservation
      expect(screen.getByText('Cancha Fútbol 1')).toBeInTheDocument()
      expect(screen.getByText('Fútbol')).toBeInTheDocument()
      expect(screen.getByText(/miércoles, 20 de marzo de 2024/i)).toBeInTheDocument()
      expect(screen.getByText(/14:00 - 15:00 hs/i)).toBeInTheDocument()
      expect(screen.getByText('Club Deportivo - Av. Principal 123')).toBeInTheDocument()
      expect(screen.getByText('$ 5.000')).toBeInTheDocument()
    })

    it('shows correct status badges', () => {
      renderWithProviders(
        <MyReservations 
          reservations={mockReservations} 
          userId="test-user" 
        />
      )

      const pendingBadge = screen.getByText('Pendiente')
      const confirmedBadge = screen.getByText('Confirmada')
      const cancelledBadge = screen.getByText('Cancelada')

      expect(pendingBadge).toHaveClass('border-yellow-500', 'text-yellow-700')
      expect(confirmedBadge).toHaveClass('bg-green-100', 'text-green-800')
      expect(cancelledBadge).toHaveClass('bg-destructive')
    })

    it('shows confirmation deadline for pending reservations', () => {
      const futureReservation = {
        ...mockReservations[0],
        fecha: '2024-03-20',
        horaInicio: '16:00'
      }

      renderWithProviders(
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
      const user = userEvent.setup()
      const confirmSpy = jest.spyOn(actions, 'confirmReservationAction')
      confirmSpy.mockResolvedValue({ success: true })

      const pendingReservation = {
        ...mockReservations[0],
        fecha: '2024-03-20',
        horaInicio: '16:00' // 4 hours from mock current time
      }

      renderWithProviders(
        <MyReservations 
          reservations={[pendingReservation]} 
          userId="test-user" 
        />
      )

      // Open confirm dialog
      await user.click(screen.getByRole('button', { name: /confirmar asistencia/i }))
      
      // Confirm reservation
      await user.click(screen.getByRole('button', { name: /confirmar/i }))

      expect(confirmSpy).toHaveBeenCalledWith(pendingReservation.id)
    })

    it('allows cancelling an upcoming reservation', async () => {
      const user = userEvent.setup()
      const cancelSpy = jest.spyOn(actions, 'cancelReservationAction')
      cancelSpy.mockResolvedValue({ success: true })

      const upcomingReservation = {
        ...mockReservations[0],
        fecha: '2024-03-20',
        horaInicio: '16:00'
      }

      renderWithProviders(
        <MyReservations 
          reservations={[upcomingReservation]} 
          userId="test-user" 
        />
      )

      // Open cancel dialog
      await user.click(screen.getByRole('button', { name: /cancelar reserva/i }))
      
      // Cancel reservation
      await user.click(screen.getByRole('button', { name: /sí, cancelar/i }))

      expect(cancelSpy).toHaveBeenCalledWith(upcomingReservation.id)
    })

    it('shows error toast when confirmation fails', async () => {
      const user = userEvent.setup()
      const confirmSpy = jest.spyOn(actions, 'confirmReservationAction')
      confirmSpy.mockResolvedValue({ success: false, error: 'Error de confirmación' })

      renderWithProviders(
        <MyReservations 
          reservations={[mockReservations[0]]} 
          userId="test-user" 
        />
      )

      // Open confirm dialog
      await user.click(screen.getByRole('button', { name: /confirmar asistencia/i }))
      
      // Try to confirm
      await user.click(screen.getByRole('button', { name: /confirmar/i }))

      await waitFor(() => {
        expect(screen.getByText('Error de confirmación')).toBeInTheDocument()
      })
    })

    it('shows error toast when cancellation fails', async () => {
      const user = userEvent.setup()
      const cancelSpy = jest.spyOn(actions, 'cancelReservationAction')
      cancelSpy.mockResolvedValue({ success: false, error: 'Error de cancelación' })

      renderWithProviders(
        <MyReservations 
          reservations={[mockReservations[0]]} 
          userId="test-user" 
        />
      )

      // Open cancel dialog
      await user.click(screen.getByRole('button', { name: /cancelar reserva/i }))
      
      // Try to cancel
      await user.click(screen.getByRole('button', { name: /sí, cancelar/i }))

      await waitFor(() => {
        expect(screen.getByText('Error de cancelación')).toBeInTheDocument()
      })
    })

    it('disables confirmation button when past deadline', () => {
      const pastDeadlineReservation = {
        ...mockReservations[0],
        fecha: '2024-03-20',
        horaInicio: '13:00' // 1 hour from mock current time
      }

      renderWithProviders(
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
        fecha: '2024-03-19',
        horaInicio: '10:00'
      }

      renderWithProviders(
        <MyReservations 
          reservations={[pastReservation]} 
          userId="test-user" 
        />
      )

      expect(screen.queryByRole('button', { name: /cancelar reserva/i })).not.toBeInTheDocument()
    })
  })
}) 