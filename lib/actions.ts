/**
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

    if (response.data?.token && response.data?.user) {
      // Set HTTP-only cookie for security
      const cookieStore = await cookies()
      cookieStore.set('token', response.data.token, {
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
  const registerData: RegisterData = {
    nombre: formData.get('nombre') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const confirmPassword = formData.get('confirmPassword') as string

  // Validation
  if (!registerData.nombre || !registerData.email || !registerData.password) {
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
    console.error('Registration error:', error)
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
    usuarioId: formData.get('usuarioId') as string,
    canchaId: formData.get('canchaId') as string,
    fecha: formData.get('fecha') as string,
    hora: formData.get('hora') as string,
  }

  if (!reservationData.usuarioId || !reservationData.canchaId || !reservationData.fecha || !reservationData.hora) {
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
    console.error('Reservation creation error:', error)
    return {
      error: 'Error del servidor. Intenta nuevamente.',
      success: false,
    }
  }
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
    console.error('Reservation cancellation error:', error)
    return {
      error: 'Error del servidor. Intenta nuevamente.',
      success: false,
    }
  }
}
