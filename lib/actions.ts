/**
 * SERVER-ONLY: Do not import this file in client components.
 * Server Actions for CanchaYA
 * Handles form submissions and server-side operations
 * Now integrated with real backend authentication
 */

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import apiClient, { LoginCredentials, RegisterData } from './api-client'

interface ActionState {
  error?: string
  success: boolean
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

    if (response.data?.accessToken) {
      // Set HTTP-only cookie for security
      const cookieStore = await cookies()
      cookieStore.set('token', response.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      })

      // TODO: Get user info to redirect based on role
      // For now, redirect to home
      redirect('/')
    }

    return {
      error: 'Error en la autenticación',
      success: false,
    }
  } catch (error) {
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
  const registerData: RegisterData = {
    nombre: formData.get('nombre') as string,
    apellido: formData.get('apellido') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const confirmPassword = formData.get('confirmPassword') as string

  // Validation
  if (!registerData.nombre || !registerData.apellido || !registerData.email || !registerData.password) {
    return {
      error: 'Todos los campos son requeridos',
      success: false,
    }
  }

  if (registerData.password !== confirmPassword) {
    return {
      error: 'Las contraseñas no coinciden',
      success: false,
    }
  }

  if (registerData.password.length < 6) {
    return {
      error: 'La contraseña debe tener al menos 6 caracteres',
      success: false,
    }
  }

  try {
    const response = await apiClient.register(registerData)

    if (response.error) {
      return {
        error: response.error,
        success: false,
      }
    }

    if (response.data) {
      return {
        success: true,
        message: 'Usuario registrado exitosamente. Por favor inicia sesión.',
      }
    }

    return {
      error: 'Error en el registro',
      success: false,
    }
  } catch (error) {
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
  // TODO: Update to use new API structure with disponibilidadId and fechaHora
  return {
    error: 'La funcionalidad de reservas necesita actualizarse para usar disponibilidades.',
    success: false,
  }
  
  /*
  const reservationData = {
    disponibilidadId: formData.get('disponibilidadId') as string,
    fechaHora: formData.get('fechaHora') as string, // ISO 8601 format
  }

  if (!reservationData.disponibilidadId || !reservationData.fechaHora) {
    return {
      error: 'Todos los campos son requeridos',
      success: false,
    }
  }

  try {
    const response = await apiClient.createReserva(reservationData)

    if (response.error) {
      return {
        error: response.error,
        success: false,
      }
    }

    if (response.data) {
      return {
        success: true,
        message: 'Reserva creada exitosamente',
      }
    }

    return {
      error: 'Error al crear la reserva',
      success: false,
    }
  } catch (error) {
    return {
      error: 'Error del servidor. Intenta nuevamente.',
      success: false,
    }
  }
  */
}

export async function cancelReservationAction(
  reservationId: string
): Promise<ActionState> {
  try {
    const response = await apiClient.cancelReserva(reservationId)

    if (response.error) {
      return {
        error: response.error,
        success: false,
      }
    }

    return {
      success: true,
      message: 'Reserva cancelada exitosamente',
    }
  } catch (error) {
    return {
      error: 'Error del servidor. Intenta nuevamente.',
      success: false,
    }
  }
}
