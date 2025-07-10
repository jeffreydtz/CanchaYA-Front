/**
 * API Client for CanchaYA Backend
 * Handles all HTTP communications with the NestJS backend
 * Includes JWT token management and error handling
 */

import { getCookie } from '@/lib/auth'
import { classifyError, logError, ErrorRecovery, formatErrorForUser } from '@/lib/error-utils'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

export interface ApiResponse<T = any> {
    data?: T
    message?: string
    error?: string
    status: number
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface RegisterData {
    nombre: string
    apellido: string
    email: string
    password: string
    telefono?: string
}

export interface Court {
    id: string
    nombre: string
    descripcion: string
    precio: number
    imagenes: string[]
    club: {
        id: string
        nombre: string
        direccion: string
    }
    deporte: {
        id: string
        nombre: string
    }
    disponible: boolean
}

export interface Reservation {
    id: string
    fecha: string
    horaInicio: string
    horaFin: string
    estado: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'LIBERADA'
    confirmada: boolean
    cancha: Court
    usuario: {
        id: string
        nombre: string
        apellido: string
        email: string
    }
    precio: number
    fechaCreacion: string
}

export interface User {
    id: string
    nombre: string
    apellido: string
    email: string
    telefono?: string
    rol: 'JUGADOR' | 'ADMINISTRADOR'
    activo: boolean
    fechaCreacion: string
}

class ApiClient {
    private baseURL: string

    constructor() {
        this.baseURL = BACKEND_URL
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const token = getCookie('token')

        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
            ...options,
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, config)

            // Handle non-JSON responses (like network errors)
            let data
            try {
                data = await response.json()
            } catch (parseError) {
                data = { message: 'Respuesta inválida del servidor' }
            }

            if (!response.ok) {
                // Create error from HTTP status and response
                const error = new Error(`HTTP ${response.status}: ${data.message || response.statusText}`)
                const classifiedError = classifyError(error, `API ${options.method || 'GET'} ${endpoint}`)
                const errorReport = logError(classifiedError, {
                    endpoint,
                    method: options.method || 'GET',
                    status: response.status,
                    response: data
                })

                return {
                    error: formatErrorForUser(classifiedError),
                    status: response.status,
                }
            }

            return {
                data: data,
                message: data.message,
                status: response.status,
            }
        } catch (error) {
            // Network or other fetch errors
            const classifiedError = classifyError(error as Error, `API ${options.method || 'GET'} ${endpoint}`)
            const errorReport = logError(classifiedError, {
                endpoint,
                method: options.method || 'GET'
            })

            return {
                error: formatErrorForUser(classifiedError),
                status: 0, // Network error
            }
        }
    }

    // Request with retry logic
    private async requestWithRetry<T>(
        endpoint: string,
        options: RequestInit = {},
        maxRetries: number = 3
    ): Promise<ApiResponse<T>> {
        return ErrorRecovery.withRetry(
            () => this.request<T>(endpoint, options),
            maxRetries,
            1000,
            `API ${options.method || 'GET'} ${endpoint}`
        )
    }

    // Authentication endpoints
    async login(credentials: LoginCredentials): Promise<ApiResponse<{ access_token: string; user: User }>> {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        })
    }

    async register(userData: RegisterData): Promise<ApiResponse<{ access_token: string; user: User }>> {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        })
    }

    async me(): Promise<ApiResponse<User>> {
        return this.request('/auth/me')
    }

    // Courts endpoints
    async getCourts(params?: {
        disponible?: boolean
        deporte?: string
        club?: string
        fecha?: string
    }): Promise<ApiResponse<Court[]>> {
        const searchParams = new URLSearchParams()
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, value.toString())
                }
            })
        }

        const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
        return this.request(`/canchas${query}`)
    }

    async getCourt(id: string): Promise<ApiResponse<Court>> {
        return this.request(`/canchas/${id}`)
    }

    async getCourtAvailability(courtId: string, fecha: string): Promise<ApiResponse<{
        horarios: Array<{
            hora: string
            disponible: boolean
            precio: number
        }>
    }>> {
        return this.request(`/canchas/${courtId}/disponibilidad?fecha=${fecha}`)
    }

    // Reservations endpoints
    async createReservation(data: {
        canchaId: string
        fecha: string
        horaInicio: string
        horaFin: string
    }): Promise<ApiResponse<Reservation>> {
        return this.request('/reservas', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async getMyReservations(): Promise<ApiResponse<Reservation[]>> {
        return this.request('/reservas/mis-reservas')
    }

    async confirmReservation(reservationId: string): Promise<ApiResponse<Reservation>> {
        return this.request(`/reservas/${reservationId}/confirmar`, {
            method: 'PATCH',
        })
    }

    async cancelReservation(reservationId: string): Promise<ApiResponse<void>> {
        return this.request(`/reservas/${reservationId}/cancelar`, {
            method: 'PATCH',
        })
    }

    // Admin endpoints
    async getAllReservations(): Promise<ApiResponse<Reservation[]>> {
        return this.request('/admin/reservas')
    }

    async getUsers(): Promise<ApiResponse<User[]>> {
        return this.request('/admin/usuarios')
    }

    async getReports(periodo: 'week' | 'month' | 'year'): Promise<ApiResponse<{
        reservasTotales: number
        ingresosTotales: number
        ocupacionPromedio: number
        canchasMasReservadas: Array<{
            cancha: string
            reservas: number
        }>
    }>> {
        return this.request(`/admin/reportes?periodo=${periodo}`)
    }

    // Real-time events endpoint
    createEventSource(userId: string): EventSource {
        const token = getCookie('token')
        const url = `${this.baseURL}/events/stream?userId=${userId}&token=${token}`
        return new EventSource(url)
    }
}

export const apiClient = new ApiClient()
export default apiClient 