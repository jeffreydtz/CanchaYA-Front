/**
 * API Client para CanchaYA
 * Cliente universal alineado con el backend NestJS
 * Base URL: https://backend-cancha-ya-production.up.railway.app/api
 * Autenticación: Bearer JWT token (Authorization: Bearer <accessToken>)
 * Formato: JSON
 * 
 * DOCUMENTED ENDPOINTS (from API v1):
 * - /auth (register, login, refresh, logout, me)
 * - /usuarios (GET list - admin only)
 * - /personas (search, get by id, update)
 * - /canchas (list, get by id, get by club, create, update, delete)
 * - /reservas (list, create, confirm, cancel)
 * 
 * UNDOCUMENTED BUT IMPLEMENTED (from backend seed scripts):
 * - /canchas/{id}/disponibilidades - Get DisponibilidadHorario for a cancha
 * - /horarios - Horarios management (CRUD operations)
 * - /clubes - Clubs management (CRUD operations)  
 * - /deportes - Sports management (CRUD operations)
 * - /equipos - Teams management
 * - /desafios - Challenges management
 * - /deudas - Debts management
 * - /valoraciones - Ratings management
 * - /disponibilidades - Player availability (NOT IMPLEMENTED IN BACKEND)
 * - /reportes - Various reports endpoints
 * - /competicion - Competition/ranking endpoints
 * 
 * All IDs are UUIDs
 * Dates in format: YYYY-MM-DD
 * Times in format: HH:MM
 * DateTime in ISO 8601: YYYY-MM-DDTHH:MM:SS-03:00
 */

import { getCookie } from './auth'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://backend-cancha-ya-production.up.railway.app/api'

// --- Tipos alineados con el backend API ---

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
}

export interface AuthTokens {
  userId: string
  accessToken: string
  refreshToken: string
}

export interface AuthMeResponse {
  id: string
  rol: 'usuario' | 'admin'
  personaId: string
  email: string
  iat: number
  exp: number
}

/**
 * JWT Payload structure from backend
 * CRITICAL: Use nivelAcceso for permission control, NOT rol
 * - rol: Display only (informative label like "recepcionista")
 * - nivelAcceso: Real permission level (usuario | admin-club | admin)
 * - clubIds: Scope of data access for admin-club users
 */
export interface JWTPayload {
  id: string // User ID (UUID) - backend uses 'id' not 'sub'
  personaId: string // Person ID associated with user
  email: string // User email
  rol: string // Display role (e.g., "recepcionista", "jugador") - INFORMATIVE ONLY
  nivelAcceso: 'usuario' | 'admin-club' | 'admin' // REAL permission level - USE THIS FOR ACCESS CONTROL
  clubIds?: string[] // Array of club IDs if nivelAcceso is admin-club (optional)
  iat: number // Issued at timestamp
  exp: number // Expiration timestamp
}

export interface Persona {
  id: string
  nombre: string
  apellido: string
  email: string
  avatarUrl?: string
}

export interface User {
  id: string // UUID
  activo: boolean
  rol: { nombre: 'usuario' | 'admin' }
  persona: Persona
  createdAt: string
  updatedAt: string
}

// Legacy User interface for backward compatibility
// CRITICAL: Use nivelAcceso for permission checks, NOT rol
export interface UserLegacy {
  id: string // UUID
  nombre: string
  email: string
  telefono?: string
  rol: string // Display role (informative only - e.g., "recepcionista", "jugador")
  nivelAcceso: 'usuario' | 'admin-club' | 'admin' // REAL permission level - USE THIS
  activo: boolean
  deudaPendiente?: number
  estadoCuenta?: 'activo' | 'bloqueado'
  fechaCreacion: string
  avatarUrl?: string
  apellido?: string
  clubIds?: string[] // Array of club IDs for admin-club users (scoped access)
}

export interface Club {
  id: string // UUID
  nombre: string
  direccion: string
  telefono?: string
  email?: string
  latitud?: number // WGS84 (-90 to 90) - ubicación geográfica del club
  longitud?: number // WGS84 (-180 to 180) - ubicación geográfica del club
  fechaCreacion: string
}

export interface Deporte {
  id: string // UUID
  nombre: string
  fechaCreacion: string
}

export interface Cancha {
  id: string // UUID
  nombre: string
  ubicacion: string // Ubicación dentro del club (ej: "Cancha 3, sector norte", "Techada, al fondo a la derecha")
  tipoSuperficie: string
  precioPorHora: number
  activa: boolean
  club: {
    id: string
    nombre: string
    telefono?: string
    email?: string
    direccion?: string
    latitud?: number // Ubicación geográfica del club
    longitud?: number // Ubicación geográfica del club
  }
  deporte: {
    id: string
    nombre: string
  }
  fotos?: CanchaFoto[]
}

export interface DisponibilidadHorario {
  id: string
  diaSemana: number // 0-6 (0=domingo, 1=lunes, ..., 6=sábado)
  disponible: boolean // Si este slot está habilitado
  horario: {
    id: string
    horaInicio: string // HH:MM:SS
    horaFin: string // HH:MM:SS
  }
  cancha?: {
    id: string
    nombre: string
    deporte?: { nombre: string }
  }
  canchaId?: string
  horarioId?: string
}

export interface CanchaFoto {
  id: string
  url: string
  orden: number
  canchaId: string
  creadaEl: string
}

export interface AvailabilitySlot {
  canchaId: string
  canchaNombre: string
  horarioId: string
  horaInicio: string
  horaFin: string
  disponibilidadId: string
  fecha: string
}

export interface CrearDisponibilidadLoteDto {
  canchaIds: string[]
  horarioIds: string[]
  diasSemana: number[] // 1-7 (1=lunes, 7=domingo - se convierte a 0 internamente)
  disponible?: boolean // Default: true
}

export interface CrearDisponibilidadLoteResponse {
  inserted: number
  skipped: number
  totalPost: number
  created: DisponibilidadHorario[]
  message?: string
}

/**
 * Query params for real-time availability by date range
 * GET /disponibilidad-cancha/availability
 */
export interface AvailabilityQueryDto {
  from: string // YYYY-MM-DD (required)
  to: string // YYYY-MM-DD (required)
  clubId?: string // UUID (optional) - filter by club
  canchaId?: string // UUID (optional) - filter by cancha
}

/**
 * Real-time availability slot for a specific date
 * Shows if a slot is free or occupied based on reservations
 */
export interface AvailabilitySlotRealTime {
  fecha: string // YYYY-MM-DD
  canchaId: string
  canchaNombre: string
  horarioId: string
  horaInicio: string // HH:MM:SS
  horaFin: string // HH:MM:SS
  disponibilidadId: string // UUID of DisponibilidadHorario
  ocupado: boolean // true if there's a pending/confirmed reservation
  estado: 'libre' | 'ocupado'
}

export interface Reserva {
  id: string // UUID
  fechaHora: string // ISO 8601 (e.g., "2025-11-17T15:00:00.000Z")
  creadaEl: string // ISO 8601
  estado: 'pendiente' | 'confirmada' | 'cancelada'
  persona: {
    id: string
    nombre: string
    apellido: string
    email: string
  }
  disponibilidad: {
    id: string
    diaSemana: number // 0=domingo, 1=lunes, ..., 6=sábado
    cancha: {
      id: string
      nombre: string
    }
    horario: {
      id: string
      horaInicio: string // "15:00"
      horaFin: string // "16:00"
    }
  }
}

export interface CreateReservaData {
  disponibilidadId: string // UUID
  fechaHora: string // ISO 8601 format (e.g., "2025-11-17T15:00:00-03:00")
  personaId: string // UUID - REQUIRED: must be sent in payload
}

export interface EditReservaData {
  disponibilidadId?: string // UUID - optional
  fechaHora?: string // ISO 8601 format - optional
  // Note: At least one field must be provided
}

export interface Equipo {
  id: string // UUID
  nombre: string
  deporteId: string // UUID
  capitan?: string // UUID
  jugadores?: User[]
  deporte?: Deporte
  fechaCreacion: string
}

export interface Desafio {
  id: string // UUID
  estado: 'pendiente' | 'aceptado' | 'cancelado' | 'finalizado'
  reserva: {
    id: string
    fechaHora: string // ISO
    disponibilidad: {
      id: string
      cancha: {
        id: string
        nombre: string
        club: {
          id: string
          nombre: string
        }
      }
      horario: {
        id: string
        horaInicio: string // "20:00:00"
        horaFin: string
      }
    }
  }
  deporte: {
    id: string
    nombre: string
  }
  creador: Persona // Persona que crea el desafío
  jugadoresCreador: Persona[]
  jugadoresDesafiados: Persona[]
  invitadosCreador: Persona[]
  invitadosDesafiados: Persona[]
  ganador: 'creador' | 'desafiado' | null
  golesCreador: number | null
  golesDesafiado: number | null
  valoracionCreador: number | null  // 1-5
  valoracionDesafiado: number | null  // 1-5
  creadoEl: string // ISO Date
}

// DTOs para Desafíos
export interface CrearDesafioDto {
  reservaId: string // UUID - Must be a future reservation without existing challenge
  deporteId: string // UUID
  invitadosDesafiadosIds: string[] // Array of Persona UUIDs (min 1)
  jugadoresCreadorIds?: string[] // Optional teammates for creator
}

export interface AgregarJugadoresDto {
  lado: 'creador' | 'desafiado'
  accion: 'invitar' | 'remover'
  jugadoresIds: string[] // Array of Persona UUIDs
}

export interface FinalizarDesafioDto {
  ganadorLado: 'creador' | 'desafiado'
  resultado?: string // e.g., "7-5" format: "golesCreador-golesDesafiado"
  valoracion?: number // 1-5
}

export interface FiltroDesafioDto {
  estado?: 'pendiente' | 'aceptado' | 'finalizado' | 'cancelado'
  deporteId?: string
  jugadorId?: string // Only works for admin users
}

export interface Deuda {
  id: string
  monto: number
  pagada: boolean
  fechaVencimiento?: string
  persona: {
    id: string
    nombre: string
  }
}

export interface DisponibilidadPersona {
  id: string // UUID
  fechaDesde: string // ISO8601 Date
  fechaHasta: string // ISO8601 Date
  horaDesde: string // HH:mm format
  horaHasta: string // HH:mm format
  persona: Persona
  clubes: Club[]
  deporte: Deporte
}

export interface Horario {
  id: string // UUID
  canchaId: string // UUID
  dia: string
  horaInicio: string // HH:MM
  horaFin: string // HH:MM
  cancha?: Cancha
  fechaCreacion: string
}

export interface Valoracion {
  id: string
  tipo_objetivo: 'cancha' | 'club' | 'usuario'
  id_objetivo: string
  puntaje: number // 1-5
  comentario?: string
  persona: { nombre: string }
}

export interface RankingJugador {
  usuarioId: string // UUID
  nombre: string
  victorias: number
  derrotas: number
  puntos: number
  posicion: number
}

export interface RankingEquipo {
  equipoId: string // UUID
  nombre: string
  victorias: number
  derrotas: number
  puntos: number
  posicion: number
}

// Nuevas interfaces según documentación del backend
export interface PerfilCompetitivo {
  id: string
  usuario: {
    id: string
    email: string
    persona: {
      id: string
      nombre: string
      apellido: string
    }
  }
  activo: boolean
  ranking: number // ELO score
  partidosJugados: number
  victorias: number
  empates: number
  derrotas: number
  golesFavor: number
  golesContra: number
  racha: number // positive = win streak, negative = loss streak, 0 = neutral
}

export interface EloHistory {
  id: string
  rankingAnterior: number
  rankingNuevo: number
  delta: number
  creadoEl: string // ISO date
  desafio: {
    id: string
    estado: string
  }
}

export interface RankingPublico {
  posicion: number
  usuarioId: string
  nombre: string
  apellido: string
  ranking: number
  partidosJugados: number
  victorias: number
  derrotas: number
  empates: number
  activo: boolean
}

export interface PerfilCompletoPublico {
  usuarioId: string
  nombre: string
  apellido: string
  ranking: number
  activo: boolean
  partidosJugados: number
  victorias: number
  empates: number
  derrotas: number
  golesFavor: number
  golesContra: number
  racha: number
  historialElo: EloHistory[]
}

export interface NotificationSubscription {
  channel: 'email'
  address: string
}

export interface NotificationLog {
  id: string
  tipo: string
  destinatario: string
  estado: 'pendiente' | 'enviada' | 'fallida'
  fechaEnvio?: string
  contenido?: string
}

export interface ReporteReservas {
  fecha: string
  cantidad: number
  ingresos: number
}

export interface ReporteIngresos {
  clubId: string
  clubNombre: string
  ingresoTotal: number
}

export interface ReporteCanchaTop {
  canchaId: string
  canchaNombre: string
  cantidadReservas: number
}

export interface ReporteUsuarioTop {
  usuarioId: string
  usuarioNombre: string
  cantidadReservas: number
}

export interface ReporteOcupacionHorario {
  hora: string
  ocupacion: number
}

// ===== ADMIN DASHBOARD INTERFACES =====

/**
 * Resumen general del dashboard administrativo
 * GET /admin/resumen
 */
export interface AdminResumen {
  totalUsuarios: number
  totalReservas: number
  totalCanchas: number
  deudaTotalPendiente: number
}

/**
 * Top jugadores por ranking
 * GET /admin/top-jugadores
 */
export interface TopJugador {
  personaId: string
  nombre: string
  email: string
  ranking: number
}

/**
 * Canchas más usadas
 * GET /admin/canchas-mas-usadas
 */
export interface CanchaMasUsada {
  canchaId: string
  nombre: string
  totalReservas: number
}

/**
 * Personas con deuda pendiente
 * GET /admin/personas-con-deuda
 */
export interface PersonaConDeuda {
  personaId: string
  nombre: string
  email: string
  totalDeuda: number
}

/**
 * Agregación de reservas por período
 * GET /admin/reservas/aggregate
 */
export interface ReservasAggregate {
  bucket: string // Fecha del período (YYYY-MM-DD)
  total: number
  confirmadas: number
  canceladas: number
  pendientes: number
}

/**
 * Drilldown de reservas por niveles
 * GET /admin/reservas/drilldown
 */
export interface ReservasDrilldownClub {
  id: string
  nombre: string
  reservas: number
}

export interface ReservasDrilldownCancha {
  id: string
  nombre: string
  reservas: number
}

export interface ReservasDrilldownDetalle {
  fecha: string
  reservas: number
}

/**
 * Ocupación con semaforización
 * GET /admin/ocupacion
 */
export interface OcupacionSemaforo {
  id: string
  nombre: string
  slots: number
  reservas: number
  ocupacion: number // 0.0 - 1.0
  semaforo: 'verde' | 'amarillo' | 'rojo'
}

/**
 * Heatmap de reservas por día y hora
 * GET /admin/reservas/heatmap
 */
export interface ReservasHeatmap {
  dow: number // 0-6 (0=domingo, 1=lunes, etc.)
  hora: string // "HH:MM"
  reservas: number
}

// ===== ROLES INTERFACES =====

/**
 * Rol entity from backend
 * tipo: "sistema" (system roles - can include admin, admin-club, usuario, and other system roles) | "negocio" (custom business roles created by admin)
 */
export interface Rol {
  id: string // UUID
  nombre: string // Role name (e.g., "admin", "admin-club", "usuario", "recepcionista", "cajero", or any other system/business role)
  tipo: 'sistema' | 'negocio'
}

/**
 * DTO for creating a new business role
 * POST /api/roles
 */
export interface CrearRolDto {
  nombre: string // Role name (must not conflict with existing system roles)
}

/**
 * DTO for changing a user's role
 * PATCH /api/usuarios/:id/rol
 */
export interface CambiarRolDto {
  rol: string // Role name (must exist in Rol table)
}

// ===== USUARIOS EXTENDED INTERFACES =====

/**
 * Extended User interface for admin panel
 * This aligns with the new backend user structure
 */
export interface UsuarioAdmin {
  id: string // UUID
  activo: boolean
  failedLoginAttempts: number
  lastLoginAt?: string // ISO date
  persona: {
    id: string
    nombre: string
    apellido: string
    email: string
  }
  rol: string // Role name (can be any system or business role)
  createdAt: string // ISO date
  updatedAt: string // ISO date
}

/**
 * DTO for creating a user from admin panel
 * POST /api/usuarios/registro (admin only)
 */
export interface CrearUsuarioAdminDto {
  nombre: string
  apellido: string
  email: string
  password: string
  rol?: string // Optional, defaults to "usuario"
}

/**
 * DTO for updating user data
 * PATCH /api/usuarios/:id
 */
export interface ActualizarUsuarioDto {
  nombre?: string
  apellido?: string
  email?: string
}

// ===== ADMIN REPORTS EXTENDED =====

/**
 * Tendencia de ocupación a lo largo del tiempo
 * GET /api/admin/reportes/ocupacion-trend
 */
export interface OcupacionTrend {
  fecha: string // YYYY-MM-DD
  ocupacion: number // 0.0 - 1.0
}

/**
 * Tendencia de ingresos a lo largo del tiempo
 * GET /api/admin/reportes/revenue-trend
 */
export interface RevenueTrend {
  fecha: string // YYYY-MM-DD
  ingresos: number
}

/**
 * Tendencia de usuarios nuevos a lo largo del tiempo
 * GET /api/admin/reportes/usuarios-trend
 */
export interface UsuariosTrend {
  fecha: string // YYYY-MM-DD
  nuevosUsuarios: number
}

/**
 * Segmentación de usuarios por tipo de rol
 * GET /api/admin/usuarios/segmentacion
 */
export interface UsuariosSegmentacion {
  rol: string
  cantidad: number
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
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      ...options,
      headers
    })

    let data
    try {
      data = await response.json()
    } catch {
      data = {}
    }

    if (!response.ok) {
      // Handle different error formats from backend
      let errorMessage = 'Error de API'

      if (data.message) {
        errorMessage = data.message
      } else if (data.error) {
        errorMessage = data.error
      } else if (Array.isArray(data.errors) && data.errors.length > 0) {
        // Handle array of errors
        errorMessage = Array.isArray(data.errors)
          ? data.errors.join(', ')
          : data.errors.toString()
      } else if (data.error && typeof data.error === 'string') {
        errorMessage = data.error
      }

      // List of known endpoints that are not yet implemented in backend
      // Suppress 404 errors for these to avoid console spam
      const knownMissingEndpoints = [
        '/reportes/canchas-top',
        '/reportes/ocupacion-horarios',
        '/reportes/ingresos',
        '/roles',
        '/admin/roles',
      ]

      const shouldSuppressLog = response.status === 404 && knownMissingEndpoints.some(e => endpoint.includes(e))

      if (!shouldSuppressLog) {
        console.error(`API Error [${response.status}] at ${endpoint}:`, {
          status: response.status,
          data,
          errorMessage
        })
      }

      return {
        error: errorMessage,
        status: response.status
      }
    }

    return {
      data: data,
      message: data.message,
      status: response.status
    }
  } catch (error: any) {
    return {
      error: error.message || 'Error de red',
      status: 0
    }
  }
}

export { apiRequest }

// --- API Client alineado con el backend ---

const apiClient = {
  // ===== AUTENTICACIÓN =====

  /**
   * Login - POST /auth/login
   * Returns userId, accessToken, and refreshToken
   */
  login: (credentials: LoginCredentials) =>
    apiRequest<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  /**
   * Registro - POST /auth/register
   * Returns userId, accessToken, and refreshToken
   */
  register: (data: RegisterData) =>
    apiRequest<AuthTokens>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Refresh Token - POST /auth/refresh
   * Returns new accessToken
   */
  refreshToken: (refreshToken: string) =>
    apiRequest<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  /**
   * Logout - POST /auth/logout
   * Revokes refreshToken
   */
  logoutAuth: (refreshToken: string) =>
    apiRequest<{ ok: boolean }>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  /**
   * Get authenticated user info - GET /auth/me
   */
  getMe: () => apiRequest<AuthMeResponse>('/auth/me'),

  // ===== USUARIOS =====

  /**
   * Listar usuarios - GET /usuarios (admin only)
   * Returns full user list with extended info for admin panel
   */
  getUsuarios: () => apiRequest<UsuarioAdmin[]>('/usuarios'),

  /**
   * Crear usuario desde panel admin - POST /usuarios/registro (admin only)
   * Creates a new user with optional role assignment
   */
  crearUsuarioAdmin: (data: CrearUsuarioAdminDto) =>
    apiRequest<UsuarioAdmin>('/usuarios/registro', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Actualizar datos de usuario - PATCH /usuarios/{id}
   * Admin can edit any user, regular users can only edit themselves
   */
  actualizarUsuario: (id: string, data: ActualizarUsuarioDto) =>
    apiRequest<UsuarioAdmin>(`/usuarios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  /**
   * Cambiar rol de usuario - PATCH /usuarios/{id}/rol (admin only)
   * Changes the user's role to a valid existing role
   */
  cambiarRolUsuario: (id: string, data: CambiarRolDto) =>
    apiRequest<UsuarioAdmin>(`/usuarios/${id}/rol`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  /**
   * Actualizar usuario (legacy) - PATCH /usuarios/{id}
   */
  updateUsuario: (id: string, data: Partial<User>) =>
    apiRequest<User>(`/usuarios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // ===== PERSONAS =====

  /**
   * Listar todas las personas - GET /personas (solo admin)
   * Auth: admin only
   */
  getPersonas: () => apiRequest<Persona[]>('/personas'),

  /**
   * Buscar personas - GET /personas/search?q=<texto>
   * Busca por nombre, apellido o email (mínimo 2 caracteres)
   * Máximo 20 resultados
   */
  searchPersonas: (q: string) => apiRequest<Persona[]>(`/personas/search?q=${encodeURIComponent(q)}`),

  /**
   * Obtener persona por ID - GET /personas/:id
   * Auth: admin u owner
   */
  getPersona: (id: string) => apiRequest<Persona>(`/personas/${id}`),

  /**
   * Actualizar persona - PUT /personas/:id
   * Auth: admin u owner
   * Campos permitidos: nombre, apellido, email
   */
  updatePersona: (id: string, data: Partial<Persona>) =>
    apiRequest<Persona>(`/personas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /**
   * Eliminar persona - DELETE /personas/:id
   * Auth: solo admin
   */
  deletePersona: (id: string) =>
    apiRequest<void>(`/personas/${id}`, { method: 'DELETE' }),

  /**
   * Subir avatar de persona - POST /personas/:id/avatar
   * Auth: admin u owner
   * @param id ID de la persona
   * @param file Archivo de imagen (FormData)
   * Validaciones: JPEG/PNG, < 5MB
   * Returns: { avatarUrl: string, persona: Persona }
   */
  uploadPersonaAvatar: (id: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const token = getCookie ? getCookie('token') : undefined
    return fetch(`${BACKEND_URL}/personas/${id}/avatar`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    }).then(async (response) => {
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        return { error: data.message || 'Error al subir avatar', status: response.status }
      }
      return { data, status: response.status }
    }).catch((error) => ({
      error: error.message || 'Error de red',
      status: 0
    }))
  },

  // ===== CANCHAS =====

  /**
   * Listar canchas - GET /canchas
   */
  getCanchas: () => apiRequest<Cancha[]>('/canchas'),

  /**
   * Obtener canchas por club - GET /canchas/club/:clubId
   */
  getCanchasByClub: (clubId: string) => apiRequest<Cancha[]>(`/canchas/club/${clubId}`),

  /**
   * Obtener cancha por ID - GET /canchas/{id}
   */
  getCanchaById: (id: string) => apiRequest<Cancha>(`/canchas/${id}`),

  /**
   * Obtener disponibilidades de una cancha - GET /disponibilidad-cancha/{canchaId}
   * CORRECTED: Backend uses /disponibilidad-cancha endpoint, not /canchas/{id}/disponibilidades
   */
  getDisponibilidadesByCancha: (canchaId: string) =>
    apiRequest<DisponibilidadHorario[]>(`/disponibilidad-cancha/${canchaId}`),

  /**
   * Crear cancha - POST /canchas (admin only)
   * La ubicación geográfica viene del club, ubicacion es solo texto descriptivo
   */
  createCancha: (data: {
    nombre: string
    ubicacion: string // Ubicación dentro del club (ej: "Techada, al fondo a la derecha")
    tipoSuperficie: string
    precioPorHora: number
    deporteId: string
    clubId: string
  }) =>
    apiRequest<Cancha>('/canchas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Actualizar cancha - PUT /canchas/{id}
   */
  updateCancha: (id: string, data: Partial<Cancha>) =>
    apiRequest<Cancha>(`/canchas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /**
   * Eliminar cancha - DELETE /canchas/{id}
   */
  deleteCancha: (id: string) =>
    apiRequest<void>(`/canchas/${id}`, { method: 'DELETE' }),

  /**
   * Subir foto de cancha - POST /canchas/{id}/fotos
   * @param id ID de la cancha
   * @param file Archivo de imagen (FormData)
   */
  uploadCanchaFoto: (id: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const token = getCookie ? getCookie('token') : undefined
    return fetch(`${BACKEND_URL}/canchas/${id}/fotos`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    }).then(async (response) => {
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        return { error: data.message || 'Error al subir foto', status: response.status }
      }
      return { data, status: response.status }
    }).catch((error) => ({
      error: error.message || 'Error de red',
      status: 0
    }))
  },

  /**
   * Obtener fotos de una cancha - GET /canchas/{id}/fotos
   */
  getCanchaFotos: (id: string) => apiRequest<CanchaFoto[]>(`/canchas/${id}/fotos`),

  /**
   * Eliminar foto de cancha - DELETE /canchas/{id}/fotos/{fotoId}
   */
  deleteCanchaFoto: (canchaId: string, fotoId: string) =>
    apiRequest<void>(`/canchas/${canchaId}/fotos/${fotoId}`, { method: 'DELETE' }),

  // ===== CLUBES =====
  // NOTE: Clubes endpoints not in main API docs but implemented in backend (see seed scripts)
  
  /**
   * Listar clubes - GET /clubes
   * @note Not documented in API v1 but implemented in backend
   */
  getClubes: () => apiRequest<Club[]>('/clubes'),

  /**
   * Crear club - POST /clubes
   */
  createClub: (data: {
    nombre: string;
    direccion: string;
    telefono?: string;
    email?: string;
    latitud?: number; // WGS84 (-90 to 90)
    longitud?: number; // WGS84 (-180 to 180)
  }) =>
    apiRequest<Club>('/clubes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Obtener club por ID - GET /clubes/{id}
   */
  getClub: (id: string) => apiRequest<Club>(`/clubes/${id}`),

  /**
   * Actualizar club - PUT /clubes/{id}
   */
  updateClub: (id: string, data: Partial<Club>) =>
    apiRequest<Club>(`/clubes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /**
   * Eliminar club - DELETE /clubes/{id}
   */
  deleteClub: (id: string) =>
    apiRequest<void>(`/clubes/${id}`, { method: 'DELETE' }),

  /**
   * Obtener IDs de canchas de varios clubes - POST /clubes/canchas/ids
   * @param clubIds Array de IDs de clubes
   */
  getCanchaIdsByClubs: (clubIds: string[]) =>
    apiRequest<{ canchaIds: string[] }>('/clubes/canchas/ids', {
      method: 'POST',
      body: JSON.stringify({ clubIds }),
    }),

  /**
   * Obtener IDs de canchas de varios clubes (query string) - GET /clubes/canchas/ids?clubIds=uuid1,uuid2
   * @param clubIds Array de IDs de clubes
   */
  getCanchaIdsByClubsQuery: (clubIds: string[]) =>
    apiRequest<{ canchaIds: string[] }>(`/clubes/canchas/ids?clubIds=${clubIds.join(',')}`),

  // ===== DEPORTES =====
  // NOTE: Deportes endpoints not in main API docs but implemented in backend (see seed scripts)
  
  /**
   * Listar deportes - GET /deportes
   * @note Not documented in API v1 but implemented in backend
   */
  getDeportes: () => apiRequest<Deporte[]>('/deportes'),

  /**
   * Crear deporte - POST /deportes
   */
  createDeporte: (data: { nombre: string }) =>
    apiRequest<Deporte>('/deportes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Obtener deporte por ID - GET /deportes/{id}
   */
  getDeporte: (id: string) => apiRequest<Deporte>(`/deportes/${id}`),

  /**
   * Actualizar deporte - PATCH /deportes/{id}
   */
  updateDeporte: (id: string, data: Partial<Deporte>) =>
    apiRequest<Deporte>(`/deportes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  /**
   * Eliminar deporte - DELETE /deportes/{id}
   */
  deleteDeporte: (id: string) =>
    apiRequest<void>(`/deportes/${id}`, { method: 'DELETE' }),

  // ===== RESERVAS =====

  /**
   * Listar reservas - GET /reservas
   * Usuarios ven sus propias reservas, admins ven todas
   */
  getReservas: () => apiRequest<Reserva[]>('/reservas'),

  /**
   * Crear reserva - POST /reservas
   * Requiere: disponibilidadId y fechaHora (ISO 8601)
   * Reglas:
   * - No puede tener deudas impagas
   * - No puede existir otra reserva en misma fecha + disponibilidad
   * - fechaHora debe coincidir con el día y hora de la disponibilidad
   */
  createReserva: (data: CreateReservaData) =>
    apiRequest<Reserva>('/reservas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Obtener reserva por ID - GET /reservas/{id}
   */
  getReserva: (id: string) => apiRequest<Reserva>(`/reservas/${id}`),

  /**
   * Editar/Reprogramar reserva - PATCH /reservas/{id}
   * Solo permitido si estado === 'pendiente'
   * Solo admin o dueño de la reserva
   * Se puede cambiar disponibilidadId, fechaHora o ambos (al menos uno requerido)
   * Reglas:
   * - Reserva debe existir y estar pendiente
   * - Usuario debe ser admin o dueño (personaId === reserva.persona.id)
   * - Disponibilidad debe estar disponible
   * - No puede haber doble booking
   */
  editReserva: (id: string, data: EditReservaData) =>
    apiRequest<Reserva>(`/reservas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  /**
   * Confirmar reserva - PATCH /reservas/:id/confirmar
   * Solo admin o dueño de la reserva
   * Genera auditoría + mail + recordatorios automáticos
   */
  confirmarReserva: (id: string) =>
    apiRequest<Reserva>(`/reservas/${id}/confirmar`, {
      method: 'PATCH'
    }),

  /**
   * Cancelar reserva - DELETE /reservas/{id}
   * Cambia estado a "cancelada"
   */
  cancelReserva: (id: string) =>
    apiRequest<Reserva>(`/reservas/${id}`, { method: 'DELETE' }),


  // ===== EQUIPOS =====
  // NOTE: Equipos endpoints not in main API docs but implemented in backend
  
  /**
   * Listar equipos - GET /equipos
   * @note Not documented in API v1 but implemented in backend
   */
  getEquipos: () => apiRequest<Equipo[]>('/equipos'),

  /**
   * Crear equipo - POST /equipos
   */
  createEquipo: (data: {
    nombre: string;
    deporteId: string;
    jugadoresIds: string[];
  }) =>
    apiRequest<Equipo>('/equipos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Obtener equipo por ID - GET /equipos/{id}
   */
  getEquipo: (id: string) => apiRequest<Equipo>(`/equipos/${id}`),

  /**
   * Actualizar equipo - PUT /equipos/{id}
   */
  updateEquipo: (id: string, data: Partial<Equipo>) =>
    apiRequest<Equipo>(`/equipos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /**
   * Eliminar equipo - DELETE /equipos/{id}
   */
  deleteEquipo: (id: string) =>
    apiRequest<void>(`/equipos/${id}`, { method: 'DELETE' }),

  // ===== DESAFÍOS =====
  // NOTE: Desafios are documented in API docs under "Entidades relacionadas"

  /**
   * Listar desafíos - GET /desafios
   * Returns challenges filtered by logged-in user (as creator, player, or invited)
   * Query params: estado, deporteId, jugadorId (admin only)
   */
  getDesafios: (filtro?: FiltroDesafioDto) => {
    const params = new URLSearchParams()
    if (filtro?.estado) params.append('estado', filtro.estado)
    if (filtro?.deporteId) params.append('deporteId', filtro.deporteId)
    if (filtro?.jugadorId) params.append('jugadorId', filtro.jugadorId)
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiRequest<Desafio[]>(`/desafios${query}`)
  },

  /**
   * Obtener un desafío por ID
   * Nota: El backend no tiene endpoint GET /desafios/:id
   * Por lo tanto, obtenemos todos los desafíos y filtramos por ID
   */
  getDesafio: async (id: string): Promise<ApiResponse<Desafio>> => {
    const response = await apiRequest<Desafio[]>('/desafios')
    
    if (response.error || !response.data) {
      return { 
        error: response.error || 'Error al obtener desafíos', 
        data: undefined,
        status: response.status || 500
      }
    }
    
    const desafio = response.data.find(d => d.id === id)
    
    if (!desafio) {
      return { 
        error: 'Desafío no encontrado', 
        data: undefined,
        status: 404
      }
    }
    
    return { 
      data: desafio, 
      error: undefined,
      status: 200
    }
  },

  /**
   * Crear desafío - POST /desafios
   * Creates a new challenge based on an existing reservation
   * The creator's personaId is extracted from the JWT token
   *
   * Validations:
   * - reservaId must exist and not have an existing challenge
   * - Reservation must be in the future
   * - deporteId must exist
   * - Creator is automatically added to jugadoresCreador
   * - All invitadosDesafiadosIds must be valid personas
   */
  createDesafio: (data: CrearDesafioDto) =>
    apiRequest<Desafio>('/desafios', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Aceptar desafío - PATCH /desafios/{id}/aceptar
   * Accepts a challenge invitation
   * The personaId is extracted from the JWT token
   *
   * Validations:
   * - Challenge must exist
   * - Reservation must be in the future
   * - Person must be in invitadosDesafiados
   * - Person cannot have already accepted
   *
   * Actions:
   * - Moves person from invitadosDesafiados to jugadoresDesafiados
   * - Changes estado to 'Aceptado' if it was 'Pendiente'
   */
  aceptarDesafio: (id: string) =>
    apiRequest<Desafio>(`/desafios/${id}/aceptar`, {
      method: 'PATCH',
      body: JSON.stringify({}),
    }),

  /**
   * Rechazar desafío - PATCH /desafios/{id}/rechazar
   * Rejects a challenge invitation
   * The personaId is extracted from the JWT token
   *
   * Validations:
   * - Person must be in invitadosCreador or invitadosDesafiados (not already a player)
   *
   * Actions:
   * - Removes person from invitados list
   * - If no one left in invitados + jugadores on desafiado side, estado → 'Cancelado'
   */
  rechazarDesafio: (id: string) =>
    apiRequest<Desafio>(`/desafios/${id}/rechazar`, {
      method: 'PATCH',
      body: JSON.stringify({})
    }),

  /**
   * Cancelar desafío - PATCH /desafios/{id}/cancelar
   * Cancel a challenge (creator or admin only)
   *
   * Permissions:
   * - Creator of the challenge can cancel their own challenge
   * - Admin can cancel any challenge
   *
   * Cannot cancel if estado is already 'finalizado' or 'cancelado'
   */
  cancelarDesafio: (id: string) =>
    apiRequest<Desafio>(`/desafios/${id}/cancelar`, {
      method: 'PATCH'
    }),

  /**
   * Agregar jugadores a un desafío - PATCH /desafios/{id}/agregar-jugadores
   * Add more players to either team after challenge creation/acceptance
   *
   * Validations:
   * - Challenge must be in 'Pendiente' or 'Aceptado' estado
   * - All jugadoresIds must be valid personas
   * - Authorization:
   *   - lado='creador': caller must be creator or already in jugadoresCreador
   *   - lado='desafiado': caller must be in jugadoresDesafiados
   * - Players cannot be duplicated or moved between teams
   */
  agregarJugadoresDesafio: (id: string, data: AgregarJugadoresDto) =>
    apiRequest<Desafio>(`/desafios/${id}/agregar-jugadores`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  /**
   * Finalizar desafío - PATCH /desafios/{id}/finalizar
   * Finalize a challenge and record results, update ELO and stats
   *
   * Validations:
   * - Challenge estado must be 'Aceptado'
   * - Reservation must be in the past (match already occurred)
   * - Caller must be a participant (any player from either team)
   * - resultado format: "golesCreador-golesDesafiado" (e.g., "3-2")
   *
   * Actions:
   * - Updates ELO rankings for all participants
   * - Updates stats (partidos, goles, victorias, derrotas, racha)
   * - Records valoracion if provided
   * - Generates audit log and sends notifications
   */
  finalizarDesafio: (id: string, data: FinalizarDesafioDto) =>
    apiRequest<Desafio>(`/desafios/${id}/finalizar`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // ===== DEUDAS =====
  // NOTE: Deudas are documented in API docs under "Entidades relacionadas"
  
  /**
   * Listar deudas - GET /deudas
   * @note Referenced in API v1 documentation
   */
  getDeudas: () => apiRequest<Deuda[]>('/deudas'),

  /**
   * Crear deuda - POST /deudas
   * Request body should include personaId (from backend seed structure)
   */
  createDeuda: (data: {
    personaId: string; // UUID of Persona
    monto: number;
    fechaVencimiento: string; // YYYY-MM-DD
    pagada?: boolean;
  }) =>
    apiRequest<Deuda>('/deudas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Obtener deuda por ID - GET /deudas/{id}
   */
  getDeuda: (id: string) => apiRequest<Deuda>(`/deudas/${id}`),

  /**
   * Actualizar deuda - PATCH /deudas/{id}
   */
  updateDeuda: (id: string, data: Partial<Deuda>) =>
    apiRequest<Deuda>(`/deudas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  /**
   * Eliminar deuda - DELETE /deudas/{id}
   */
  deleteDeuda: (id: string) =>
    apiRequest<void>(`/deudas/${id}`, { method: 'DELETE' }),

  // ===== DISPONIBILIDADES PERSONALES =====
  // Personal availability for matching players (DisponibilidadPersona)
  
  /**
   * Listar disponibilidades personales - GET /disponibilidades
   * Returns current user's personal availability
   */
  getDisponibilidades: () => apiRequest<DisponibilidadPersona[]>('/disponibilidades'),

  /**
   * Crear disponibilidad personal - POST /disponibilidades
   * Set when/where you want to play
   */
  createDisponibilidad: (data: {
    fechaDesde: string; // ISO8601
    fechaHasta: string; // ISO8601
    horaDesde: string;  // HH:mm
    horaHasta: string;  // HH:mm
    deporteId: string;  // UUID
    clubesIds: string[]; // Array of club UUIDs
  }) =>
    apiRequest<DisponibilidadPersona>('/disponibilidades', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Eliminar disponibilidad personal - DELETE /disponibilidades/{id}
   */
  deleteDisponibilidad: (id: string) =>
    apiRequest<void>(`/disponibilidades/${id}`, { method: 'DELETE' }),

  // ===== HORARIOS =====
  // NOTE: Horarios endpoints not in main API docs but exist in backend (see seed scripts)
  // Horarios define the schedule/availability for canchas
  
  /**
   * Listar horarios - GET /horarios
   * @note Not documented in API v1 but implemented in backend
   */
  getHorarios: () => apiRequest<Horario[]>('/horarios'),

  /**
   * Crear horario - POST /horarios
   */
  createHorario: (data: {
    canchaId: string;
    dia: string;
    horaInicio: string; // HH:MM
    horaFin: string;    // HH:MM
  }) =>
    apiRequest<Horario>('/horarios', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Obtener horario por ID - GET /horarios/{id}
   */
  getHorario: (id: string) => apiRequest<Horario>(`/horarios/${id}`),

  /**
   * Actualizar horario - PATCH /horarios/{id}
   */
  updateHorario: (id: string, data: Partial<Horario>) =>
    apiRequest<Horario>(`/horarios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  /**
   * Eliminar horario - DELETE /horarios/{id}
   */
  deleteHorario: (id: string) =>
    apiRequest<void>(`/horarios/${id}`, { method: 'DELETE' }),

  // ===== DISPONIBILIDAD CANCHA (WEEKLY PATTERNS) =====

  /**
   * Crear patrón de disponibilidad en lote - POST /disponibilidad-cancha
   * Crea múltiples combinaciones de cancha × horario × día de semana
   */
  crearDisponibilidadLote: (data: CrearDisponibilidadLoteDto) =>
    apiRequest<CrearDisponibilidadLoteResponse>('/disponibilidad-cancha', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Listar patrón de disponibilidad por cancha - GET /disponibilidad-cancha/{canchaId}
   * Retorna todas las combinaciones de día × horario para esa cancha
   */
  getDisponibilidadPorCancha: (canchaId: string) =>
    apiRequest<DisponibilidadHorario[]>(`/disponibilidad-cancha/${canchaId}`),

  /**
   * Eliminar una fila del patrón - DELETE /disponibilidad-cancha/{id}
   */
  deleteDisponibilidadHorario: (id: string) =>
    apiRequest<void>(`/disponibilidad-cancha/${id}`, { method: 'DELETE' }),

  /**
   * Obtener disponibilidad dinámica por rango de fechas - GET /disponibilidad-cancha/availability
   * Muestra solo los slots libres (sin reservas pendientes/confirmadas)
   * @param from Fecha desde (YYYY-MM-DD)
   * @param to Fecha hasta (YYYY-MM-DD)
   * @param clubId ID del club (opcional)
   * @param canchaId ID de la cancha (opcional)
   */
  getDisponibilidadDinamica: (params: {
    from: string
    to: string
    clubId?: string
    canchaId?: string
  }) => {
    const queryParams = new URLSearchParams()
    queryParams.append('from', params.from)
    queryParams.append('to', params.to)
    if (params.clubId) queryParams.append('clubId', params.clubId)
    if (params.canchaId) queryParams.append('canchaId', params.canchaId)

    return apiRequest<AvailabilitySlot[]>(`/disponibilidad-cancha/availability?${queryParams.toString()}`)
  },

  /**
   * Disponibilidad real por rango de fechas - GET /disponibilidad-cancha/availability
   * Returns real-time availability showing free/occupied slots based on weekly patterns and existing reservations
   * @param params Query parameters with date range and optional filters
   * @returns Array of slots with occupation status (libre/ocupado)
   */
  getDisponibilidadRealTime: (params: AvailabilityQueryDto) => {
    const queryParams = new URLSearchParams()
    queryParams.append('from', params.from)
    queryParams.append('to', params.to)
    if (params.clubId) queryParams.append('clubId', params.clubId)
    if (params.canchaId) queryParams.append('canchaId', params.canchaId)
    return apiRequest<AvailabilitySlotRealTime[]>(
      `/disponibilidad-cancha/availability?${queryParams.toString()}`
    )
  },

  // ===== VALORACIONES =====
  // NOTE: Valoraciones are documented in API docs under "Entidades relacionadas"
  
  /**
   * Listar valoraciones - GET /valoraciones
   * @note Referenced in API v1 documentation
   */
  getValoraciones: () => apiRequest<Valoracion[]>('/valoraciones'),

  /**
   * Crear valoración - POST /valoraciones
   * tipo_objetivo: 'club' | 'cancha' | 'usuario'
   * id_objetivo: UUID of the target entity
   */
  createValoracion: (data: {
    tipo_objetivo: 'club' | 'cancha' | 'usuario';
    id_objetivo: string; // UUID
    puntaje: number; // 1-5
    comentario?: string;
  }) =>
    apiRequest<Valoracion>('/valoraciones', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Obtener valoración por ID - GET /valoraciones/{id}
   */
  getValoracion: (id: string) => apiRequest<Valoracion>(`/valoraciones/${id}`),

  /**
   * Eliminar valoración - DELETE /valoraciones/{id}
   */
  deleteValoracion: (id: string) =>
    apiRequest<void>(`/valoraciones/${id}`, { method: 'DELETE' }),

  // ===== REPORTES =====
  
  /**
   * Reporte de reservas - GET /reportes/reservas
   */
  getReporteReservas: (desde: string, hasta: string) =>
    apiRequest<ReporteReservas[]>(`/reportes/reservas?desde=${desde}&hasta=${hasta}`),

  /**
   * Reporte de ingresos - GET /reportes/ingresos
   */
  getReporteIngresos: (desde: string, hasta: string) =>
    apiRequest<ReporteIngresos[]>(`/reportes/ingresos?desde=${desde}&hasta=${hasta}`),

  /**
   * Reporte canchas más reservadas - GET /reportes/canchas-top
   */
  getReporteCanchasTop: () =>
    apiRequest<ReporteCanchaTop[]>('/reportes/canchas-top'),

  /**
   * Reporte usuarios con más reservas - GET /reportes/usuarios-top
   */
  getReporteUsuariosTop: () =>
    apiRequest<ReporteUsuarioTop[]>('/reportes/usuarios-top'),

  /**
   * Reporte ocupación por horarios - GET /reportes/ocupacion-horarios
   */
  getReporteOcupacionHorarios: () =>
    apiRequest<ReporteOcupacionHorario[]>('/reportes/ocupacion-horarios'),

  // ===== RANKING =====
  
  /**
   * Ranking de jugadores - GET /competicion/jugadores-ranking
   */
  getRankingJugadores: (deporteId: string) =>
    apiRequest<RankingJugador[]>(`/competicion/jugadores-ranking?deporteId=${deporteId}`),

  /**
   * Ranking de equipos - GET /competicion/equipos-ranking
   */
  getRankingEquipos: (deporteId: string) =>
    apiRequest<RankingEquipo[]>(`/competicion/equipos-ranking?deporteId=${deporteId}`),

  // ===== PERFIL COMPETITIVO =====

  /**
   * Obtener MI perfil competitivo - GET /perfil-competitivo
   * Returns the competitive profile for the authenticated user
   * Creates profile if it doesn't exist (with initial ELO and stats at 0)
   */
  getPerfilCompetitivo: () => apiRequest<PerfilCompetitivo>('/perfil-competitivo'),

  /**
   * Actualizar MI perfil competitivo - PATCH /perfil-competitivo
   * Allows activating/deactivating the competitive profile
   * When activo=false, user won't appear in public ranking (but stats still accumulate)
   */
  updatePerfilCompetitivo: (data: { activo: boolean }) =>
    apiRequest<PerfilCompetitivo>('/perfil-competitivo', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  /**
   * Ver historial de MI ELO - GET /perfil-competitivo/historial
   * Returns chronological list of ELO changes for the authenticated user
   */
  getHistorialElo: () => apiRequest<EloHistory[]>('/perfil-competitivo/historial'),

  // ===== RANKING PÚBLICO =====

  /**
   * Ranking general - GET /ranking
   * Returns global ranking of all active players, ordered by ranking DESC then partidosJugados
   * Only includes profiles with activo=true
   */
  getRanking: () => apiRequest<RankingPublico[]>('/ranking'),

  /**
   * Ver perfil competitivo de un usuario específico - GET /ranking/usuario/:usuarioId
   * Returns competitive profile with stats and recent ELO history for a specific user
   */
  getRankingByUsuarioId: (usuarioId: string) =>
    apiRequest<PerfilCompletoPublico>(`/ranking/usuario/${usuarioId}`),

  /**
   * Ver MI perfil competitivo vía módulo ranking - GET /ranking/me
   * Same as getRankingByUsuarioId but for the authenticated user
   * Returns own competitive profile with full stats and ELO history
   */
  getRankingMe: () => apiRequest<PerfilCompletoPublico>('/ranking/me'),






  /**
   * Suscribirse a notificaciones - POST /notifs/subscribe
   */
  subscribeToNotifications: (data: NotificationSubscription) =>
    apiRequest<void>('/notifs/subscribe', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Test de email - POST /notifs/test/email
   */
  testEmail: () =>
    apiRequest<void>('/notifs/test/email', { method: 'POST' }),


  /**
   * Verificar si el usuario puede hacer reservas - Validación personalizada
   */
  canUserReserve: () => apiRequest<{ canReserve: boolean; reason?: string }>('/usuarios/can-reserve'),

  // ===== ADMIN DASHBOARD =====
  // Endpoints específicos para el dashboard administrativo
  // Base URL: /admin
  // Todos requieren rol admin y token JWT

  /**
   * Resumen general del dashboard - GET /admin/resumen
   * @returns Métricas globales del sistema
   */
  getAdminResumen: () =>
    apiRequest<AdminResumen>('/admin/resumen'),

  /**
   * Top jugadores por ranking - GET /admin/top-jugadores
   * @param from Fecha desde (YYYY-MM-DD)
   * @param to Fecha hasta (YYYY-MM-DD)
   * @returns Top 10 jugadores según ranking
   */
  getAdminTopJugadores: (from?: string, to?: string) => {
    const params = new URLSearchParams()
    if (from) params.append('from', from)
    if (to) params.append('to', to)
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiRequest<TopJugador[]>(`/admin/top-jugadores${query}`)
  },

  /**
   * Canchas más usadas - GET /admin/canchas-mas-usadas
   * @param from Fecha desde (YYYY-MM-DD)
   * @param to Fecha hasta (YYYY-MM-DD)
   * @param tz Zona horaria (e.g., America/Argentina/Cordoba)
   * @returns Canchas con mayor cantidad de reservas confirmadas
   */
  getAdminCanchasMasUsadas: (from?: string, to?: string, tz?: string) => {
    const params = new URLSearchParams()
    if (from) params.append('from', from)
    if (to) params.append('to', to)
    if (tz) params.append('tz', tz)
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiRequest<CanchaMasUsada[]>(`/admin/canchas-mas-usadas${query}`)
  },

  /**
   * Personas con deuda pendiente - GET /admin/personas-con-deuda
   * @returns Lista de personas con deuda pendiente
   */
  getAdminPersonasConDeuda: () =>
    apiRequest<PersonaConDeuda[]>('/admin/personas-con-deuda'),

  /**
   * Agregación de reservas - GET /admin/reservas/aggregate
   * @param granularity Granularidad: 'day' | 'week' | 'month'
   * @param from Fecha desde (YYYY-MM-DD)
   * @param to Fecha hasta (YYYY-MM-DD)
   * @param tz Zona horaria (e.g., America/Argentina/Cordoba)
   * @returns Evolución de reservas agrupadas por período
   */
  getAdminReservasAggregate: (
    granularity: 'day' | 'week' | 'month',
    from: string,
    to: string,
    tz?: string
  ) => {
    const params = new URLSearchParams()
    params.append('granularity', granularity)
    params.append('from', from)
    params.append('to', to)
    if (tz) params.append('tz', tz)
    return apiRequest<ReservasAggregate[]>(`/admin/reservas/aggregate?${params.toString()}`)
  },

  /**
   * Drilldown de reservas por club - GET /admin/reservas/drilldown?level=club
   * @param from Fecha desde (YYYY-MM-DD)
   * @param to Fecha hasta (YYYY-MM-DD)
   * @returns Totales de reservas por club
   */
  getAdminReservasDrilldownClub: (from?: string, to?: string) => {
    const params = new URLSearchParams()
    params.append('level', 'club')
    if (from) params.append('from', from)
    if (to) params.append('to', to)
    return apiRequest<ReservasDrilldownClub[]>(`/admin/reservas/drilldown?${params.toString()}`)
  },

  /**
   * Drilldown de reservas por cancha - GET /admin/reservas/drilldown?level=cancha
   * @param clubId ID del club
   * @param from Fecha desde (YYYY-MM-DD)
   * @param to Fecha hasta (YYYY-MM-DD)
   * @returns Totales de reservas por cancha dentro del club
   */
  getAdminReservasDrilldownCancha: (clubId: string, from?: string, to?: string) => {
    const params = new URLSearchParams()
    params.append('level', 'cancha')
    params.append('clubId', clubId)
    if (from) params.append('from', from)
    if (to) params.append('to', to)
    return apiRequest<ReservasDrilldownCancha[]>(`/admin/reservas/drilldown?${params.toString()}`)
  },

  /**
   * Drilldown de reservas por detalle - GET /admin/reservas/drilldown?level=detalle
   * @param canchaId ID de la cancha
   * @param from Fecha desde (YYYY-MM-DD)
   * @param to Fecha hasta (YYYY-MM-DD)
   * @returns Detalle diario de reservas dentro de la cancha
   */
  getAdminReservasDrilldownDetalle: (canchaId: string, from?: string, to?: string) => {
    const params = new URLSearchParams()
    params.append('level', 'detalle')
    params.append('canchaId', canchaId)
    if (from) params.append('from', from)
    if (to) params.append('to', to)
    return apiRequest<ReservasDrilldownDetalle[]>(`/admin/reservas/drilldown?${params.toString()}`)
  },

  /**
   * Ocupación con semaforización - GET /admin/ocupacion
   * @param by Agrupar por: 'club' | 'cancha'
   * @param from Fecha desde (YYYY-MM-DD)
   * @param to Fecha hasta (YYYY-MM-DD)
   * @param tz Zona horaria (e.g., America/Argentina/Cordoba)
   * @returns Porcentaje de ocupación con semáforo visual
   */
  getAdminOcupacion: (by: 'club' | 'cancha', from?: string, to?: string, tz?: string) => {
    const params = new URLSearchParams()
    params.append('by', by)
    if (from) params.append('from', from)
    if (to) params.append('to', to)
    if (tz) params.append('tz', tz)
    return apiRequest<OcupacionSemaforo[]>(`/admin/ocupacion?${params.toString()}`)
  },

  /**
   * Heatmap de reservas - GET /admin/reservas/heatmap
   * @param clubId ID del club (opcional)
   * @param from Fecha desde (YYYY-MM-DD)
   * @param to Fecha hasta (YYYY-MM-DD)
   * @param tz Zona horaria (e.g., America/Argentina/Cordoba)
   * @returns Cantidad de reservas por día de la semana y hora
   */
  getAdminReservasHeatmap: (clubId?: string, from?: string, to?: string, tz?: string) => {
    const params = new URLSearchParams()
    if (clubId) params.append('clubId', clubId)
    if (from) params.append('from', from)
    if (to) params.append('to', to)
    if (tz) params.append('tz', tz)
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiRequest<ReservasHeatmap[]>(`/admin/reservas/heatmap${query}`)
  },

  /**
   * Tendencia de ocupación - GET /admin/reportes/ocupacion-trend
   * @param granularity Granularidad: 'day' | 'week' | 'month'
   * @param from Fecha desde (YYYY-MM-DD)
   * @param to Fecha hasta (YYYY-MM-DD)
   * @param clubIds IDs de clubes (opcional, para admin-club)
   * @returns Evolución del % de ocupación a lo largo del tiempo
   */
  getAdminOcupacionTrend: (
    granularity: 'day' | 'week' | 'month',
    from: string,
    to: string,
    clubIds?: string[]
  ) => {
    const params = new URLSearchParams()
    params.append('granularity', granularity)
    params.append('from', from)
    params.append('to', to)
    if (clubIds && clubIds.length > 0) {
      params.append('clubIds', clubIds.join(','))
    }
    return apiRequest<OcupacionTrend[]>(`/admin/reportes/ocupacion-trend?${params.toString()}`)
  },

  /**
   * Tendencia de ingresos - GET /admin/reportes/revenue-trend
   * @param granularity Granularidad: 'day' | 'week' | 'month'
   * @param from Fecha desde (YYYY-MM-DD)
   * @param to Fecha hasta (YYYY-MM-DD)
   * @param clubIds IDs de clubes (opcional, para admin-club)
   * @returns Evolución de ingresos a lo largo del tiempo
   */
  getAdminRevenueTrend: (
    granularity: 'day' | 'week' | 'month',
    from: string,
    to: string,
    clubIds?: string[]
  ) => {
    const params = new URLSearchParams()
    params.append('granularity', granularity)
    params.append('from', from)
    params.append('to', to)
    if (clubIds && clubIds.length > 0) {
      params.append('clubIds', clubIds.join(','))
    }
    return apiRequest<RevenueTrend[]>(`/admin/reportes/revenue-trend?${params.toString()}`)
  },

  /**
   * Tendencia de usuarios nuevos - GET /admin/reportes/usuarios-trend
   * @param granularity Granularidad: 'day' | 'week' | 'month'
   * @param from Fecha desde (YYYY-MM-DD)
   * @param to Fecha hasta (YYYY-MM-DD)
   * @returns Evolución de usuarios nuevos (global por ahora)
   */
  getAdminUsuariosTrend: (
    granularity: 'day' | 'week' | 'month',
    from: string,
    to: string
  ) => {
    const params = new URLSearchParams()
    params.append('granularity', granularity)
    params.append('from', from)
    params.append('to', to)
    return apiRequest<UsuariosTrend[]>(`/admin/reportes/usuarios-trend?${params.toString()}`)
  },

  /**
   * Segmentación de usuarios por rol - GET /admin/usuarios/segmentacion
   * @returns Cantidad de usuarios por tipo de rol
   */
  getAdminUsuariosSegmentacion: () =>
    apiRequest<UsuariosSegmentacion[]>('/admin/usuarios/segmentacion'),

  // ===== ROLES =====
  // Module for managing system and business roles
  // Base URL: /api/roles
  // Permissions: admin only

  /**
   * Listar todos los roles - GET /api/roles (admin only)
   * Returns both sistema (system roles) and negocio (custom business) roles
   * NOTE: If backend endpoint fails, returns empty array to allow dynamic role management
   */
  getRoles: () => apiRequest<Rol[]>('/roles').catch(() => Promise.resolve({ 
    data: [] as Rol[], 
    error: null 
  })),

  /**
   * Crear nuevo rol de negocio - POST /api/roles (admin only)
   * Creates a new business role for segmentation/UX purposes
   * Cannot create roles with names that conflict with existing system roles
   * NOTE: Backend endpoint not implemented - returns mock success
   */
  crearRol: (data: CrearRolDto) =>
    apiRequest<Rol>('/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    }).catch(() => Promise.resolve({
      data: {
        id: Math.random().toString(36).substr(2, 9),
        nombre: data.nombre,
        tipo: 'negocio'
      } as Rol,
      error: null
    })),
}

export default apiClient 