/**
 * Server Actions for CanchaYA
 * Handles form submissions and server-side operations
 * Implements authentication, reservations, and admin functions
 */

'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import apiClient, { type LoginCredentials, type RegisterData } from './api-client'

export type ActionState = {
  success?: boolean
  error?: string
  message?: string
}

// Authentication Actions
export async function loginAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const credentials: LoginCredentials = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  if (!credentials.email || !credentials.password) {
    return {
      error: 'Email y contraseña son requeridos',
      success: false,
    }
  }

  try {
    const response = await apiClient.login(credentials)

    if (response.error) {
      return {
        error: response.error,
        success: false,
      }
    }

    if (response.data?.access_token) {
      // Set HTTP-only cookie for security
      const cookieStore = await cookies()
      cookieStore.set('token', response.data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      })

      // Redirect based on user role
      const userRole = response.data.user.rol
      if (userRole === 'ADMINISTRADOR') {
        redirect('/admin')
      } else {
        redirect('/')
      }
    }

    return {
      error: 'Error en la autenticación',
      success: false,
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      error: 'Error del servidor. Intenta nuevamente.',
      success: false,
    }
  }
}

export async function registerAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const userData: RegisterData = {
    nombre: formData.get('nombre') as string,
    apellido: formData.get('apellido') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    telefono: formData.get('telefono') as string || undefined,
  }

  // Validation
  if (!userData.nombre || !userData.apellido || !userData.email || !userData.password) {
    return {
      error: 'Todos los campos obligatorios deben completarse',
      success: false,
    }
  }

  if (userData.password.length < 6) {
    return {
      error: 'La contraseña debe tener al menos 6 caracteres',
      success: false,
    }
  }

  const confirmPassword = formData.get('confirmPassword') as string
  if (userData.password !== confirmPassword) {
    return {
      error: 'Las contraseñas no coinciden',
      success: false,
    }
  }

  try {
    const response = await apiClient.register(userData)

    if (response.error) {
      return {
        error: response.error,
        success: false,
      }
    }

    if (response.data?.access_token) {
      // Set HTTP-only cookie
      const cookieStore = await cookies()
      cookieStore.set('token', response.data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      })

      redirect('/')
    }

    return {
      error: 'Error en el registro',
      success: false,
    }
  } catch (error) {
    console.error('Register error:', error)
    return {
      error: 'Error del servidor. Intenta nuevamente.',
      success: false,
    }
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('token')
  redirect('/login')
}

// Reservation Actions
export async function createReservationAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const reservationData = {
    canchaId: formData.get('canchaId') as string,
    fecha: formData.get('fecha') as string,
    horaInicio: formData.get('horaInicio') as string,
    horaFin: formData.get('horaFin') as string,
  }

  if (!reservationData.canchaId || !reservationData.fecha ||
    !reservationData.horaInicio || !reservationData.horaFin) {
    return {
      error: 'Todos los campos son requeridos',
      success: false,
    }
  }

  try {
    const response = await apiClient.createReservation(reservationData)

    if (response.error) {
      return {
        error: response.error,
        success: false,
      }
    }

    revalidatePath('/mis-reservas')
    revalidatePath('/')

    return {
      success: true,
      message: 'Reserva creada exitosamente. Recuerda confirmar tu asistencia.',
    }
  } catch (error) {
    console.error('Reservation error:', error)
    return {
      error: 'Error al crear la reserva. Intenta nuevamente.',
      success: false,
    }
  }
}

export async function confirmReservationAction(
  reservationId: string
): Promise<ActionState> {
  try {
    const response = await apiClient.confirmReservation(reservationId)

    if (response.error) {
      return {
        error: response.error,
        success: false,
      }
    }

    revalidatePath('/mis-reservas')

    return {
      success: true,
      message: 'Reserva confirmada exitosamente.',
    }
  } catch (error) {
    console.error('Confirm reservation error:', error)
    return {
      error: 'Error al confirmar la reserva.',
      success: false,
    }
  }
}

export async function cancelReservationAction(
  reservationId: string
): Promise<ActionState> {
  try {
    const response = await apiClient.cancelReservation(reservationId)

    if (response.error) {
      return {
        error: response.error,
        success: false,
      }
    }

    revalidatePath('/mis-reservas')
    revalidatePath('/admin')

    return {
      success: true,
      message: 'Reserva cancelada exitosamente.',
    }
  } catch (error) {
    console.error('Cancel reservation error:', error)
    return {
      error: 'Error al cancelar la reserva.',
      success: false,
    }
  }
}

// Legacy action aliases for backward compatibility
export const reserveCourtAction = createReservationAction
export const confirmAttendanceAction = confirmReservationAction

// Court Search Action
export async function searchCourtsAction(
  prevState: any,
  formData: FormData
) {
  const filters = {
    deporte: formData.get('deporte') as string || undefined,
    club: formData.get('club') as string || undefined,
    fecha: formData.get('fecha') as string || undefined,
    disponible: true,
  }

  try {
    const response = await apiClient.getCourts(filters)

    if (response.error) {
      return {
        error: response.error,
        courts: [],
      }
    }

    revalidatePath('/')

    return {
      courts: response.data || [],
      message: `Se encontraron ${response.data?.length || 0} canchas disponibles`,
    }
  } catch (error) {
    console.error('Search courts error:', error)
    return {
      error: 'Error al buscar canchas.',
      courts: [],
    }
  }
}
