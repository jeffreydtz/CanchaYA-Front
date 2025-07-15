/**
 * API Client para CanchaYA
 * Cliente universal alineado con Swagger del backend (NestJS)
 * - Todos los endpoints y recursos documentados en https://backend-cancha-ya-production.up.railway.app/api/docs/
 * - Nombres, rutas y estructuras de datos exactamente como en Swagger
 * - Manejo centralizado de errores y autenticación (token JWT)
 * - Modular, DRY y exhaustivamente documentado
 *
 * Reglas:
 * - No mocks, solo llamadas reales a la API
 * - Todos los recursos: Auth, Canchas, Reservas, Usuarios, Notificaciones, Admin, Reportes, etc.
 * - Tipos y métodos alineados con Swagger
 * - Documentación clara en cada función
 */

import { getCookie } from './auth'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

// --- Tipos alineados con Swagger ---

export interface ApiResponse<T = any> {
  data?: T
  message?: string
  error?: string
  status?: number
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

export interface CourtAvailability {
  horarios: Array<{
    hora: string
    disponible: boolean
    precio: number
  }>
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

export interface Notification {
  id: string
  usuarioId: string
  titulo: string
  mensaje: string
  leida: boolean
  fecha: string
}

export interface Report {
  reservasTotales: number
  ingresosTotales: number
  ocupacionPromedio: number
  canchasMasReservadas: Array<{
    cancha: string
    reservas: number
  }>
}

export interface Stats {
  totalUsuarios: number
  totalCanchas: number
  totalReservas: number
  totalIngresos: number
  crecimientoReciente: number
}

// --- Utilidad centralizada para requests ---

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getCookie ? getCookie('token') : undefined
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  try {
    const res = await fetch(`${BACKEND_URL}${endpoint}`, { ...options, headers })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { error: data.message || data.error || 'Error de API', status: res.status }
    }
    return { data: data.data ?? data, message: data.message, status: res.status }
  } catch (error: any) {
    return { error: error.message || 'Error de red', status: 0 }
  }
}

// --- API Client alineado con Swagger ---

const apiClient = {
  /**
   * Autenticación: Login
   * POST /auth/login
   */
  login: (credentials: LoginCredentials) =>
    apiRequest<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  /**
   * Autenticación: Registro
   * POST /auth/register
   */
  register: (data: RegisterData) =>
    apiRequest<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Obtener usuario autenticado
   * GET /auth/me
   */
  me: () => apiRequest<User>('/auth/me'),

  /**
   * Listar canchas (con filtros opcionales)
   * GET /canchas
   */
  getCanchas: (params?: { disponible?: boolean; deporte?: string; club?: string; fecha?: string }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString())
      })
    }
    const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
    return apiRequest<Court[]>(`/canchas${query}`)
  },

  /**
   * Obtener detalles de una cancha
   * GET /canchas/:id
   */
  getCancha: (id: string) => apiRequest<Court>(`/canchas/${id}`),

  /**
   * Disponibilidad de una cancha para una fecha
   * GET /canchas/:id/disponibilidad?fecha=YYYY-MM-DD
   */
  getDisponibilidadCancha: (id: string, fecha: string) =>
    apiRequest<CourtAvailability>(`/canchas/${id}/disponibilidad?fecha=${fecha}`),

  /**
   * Crear reserva
   * POST /reservas
   */
  crearReserva: (data: { canchaId: string; fecha: string; horaInicio: string; horaFin: string }) =>
    apiRequest<Reservation>('/reservas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Mis reservas
   * GET /reservas/mis-reservas
   */
  misReservas: () => apiRequest<Reservation[]>('/reservas/mis-reservas'),

  /**
   * Confirmar reserva
   * PATCH /reservas/:id/confirmar
   */
  confirmarReserva: (id: string) =>
    apiRequest<Reservation>(`/reservas/${id}/confirmar`, { method: 'PATCH' }),

  /**
   * Cancelar reserva
   * PATCH /reservas/:id/cancelar
   */
  cancelarReserva: (id: string) =>
    apiRequest<void>(`/reservas/${id}/cancelar`, { method: 'PATCH' }),

  /**
   * Listar todas las reservas (admin)
   * GET /admin/reservas
   */
  adminReservas: () => apiRequest<Reservation[]>('/admin/reservas'),

  /**
   * Listar usuarios (admin)
   * GET /admin/usuarios
   */
  adminUsuarios: () => apiRequest<User[]>('/admin/usuarios'),

  /**
   * Obtener estadísticas (admin)
   * GET /admin/estadisticas
   */
  adminEstadisticas: () => apiRequest<Stats>('/admin/estadisticas'),

  /**
   * Obtener reportes (admin)
   * GET /admin/reportes
   */
  adminReportes: (periodo: 'week' | 'month' | 'year' = 'month') =>
    apiRequest<Report>(`/admin/reportes?periodo=${periodo}`),

  /**
   * Listar notificaciones del usuario
   * GET /notificaciones
   */
  getNotificaciones: () => apiRequest<Notification[]>('/notificaciones'),

  /**
   * Marcar notificación como leída
   * PATCH /notificaciones/:id/leida
   */
  marcarNotificacionLeida: (id: string) =>
    apiRequest<void>(`/notificaciones/${id}/leida`, { method: 'PATCH' }),

  // Agrega aquí cualquier endpoint adicional que aparezca en Swagger
}

export default apiClient 