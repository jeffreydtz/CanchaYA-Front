import { renderWithProviders } from '@/__tests__/utils/test-utils';
import { MyReservations } from '../my-reservations';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as actions from '@/lib/actions';

jest.mock('@/lib/actions', () => ({
  confirmReservationAction: jest.fn(),
  cancelReservationAction: jest.fn(),
}));

describe('Reservation Integration Flow', () => {
  const mockReservations = [
    {
      id: '1',
      fecha: '2025-03-20',
      horaInicio: '14:00',
      horaFin: '15:00',
      estado: 'PENDIENTE',
      confirmada: false,
      precio: 5000,
      cancha: {
        id: '1',
        nombre: 'Cancha Fútbol 1',
        deporte: { nombre: 'Fútbol' },
        club: { nombre: 'Club Deportivo', direccion: 'Av. Principal 123' },
      },
    },
  ];

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-03-20T12:00:00Z'));
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('user can confirm and cancel a reservation', async () => {
    const user = userEvent.setup();
    (actions.confirmReservationAction as jest.Mock).mockResolvedValue({ success: true });
    (actions.cancelReservationAction as jest.Mock).mockResolvedValue({ success: true });

    renderWithProviders(
      <MyReservations reservations={mockReservations} userId="test-user" />
    );

    // Confirm reservation
    await user.click(screen.getByRole('button', { name: /confirmar asistencia/i }));
    await user.click(screen.getByRole('button', { name: /confirmar/i }));
    await waitFor(() => {
      expect(actions.confirmReservationAction).toHaveBeenCalledWith('1');
      expect(screen.getByText(/reserva confirmada/i)).toBeInTheDocument();
    });

    // Cancel reservation
    await user.click(screen.getByRole('button', { name: /cancelar reserva/i }));
    await user.click(screen.getByRole('button', { name: /sí, cancelar/i }));
    await waitFor(() => {
      expect(actions.cancelReservationAction).toHaveBeenCalledWith('1');
      expect(screen.getByText(/reserva cancelada/i)).toBeInTheDocument();
    });
  });
}); 