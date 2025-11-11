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

export interface Persona {
  id: string
  nombre: string
  apellido: string
  email: string
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
export interface UserLegacy {
  id: string // UUID
  nombre: string
  email: string
  telefono?: string
  rol: 'usuario' | 'admin'
  activo: boolean
  deudaPendiente?: number
  estadoCuenta?: 'activo' | 'bloqueado'
  fechaCreacion: string
}

export interface Club {
  id: string // UUID
  nombre: string
  direccion: string
  telefono?: string
  email?: string
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
  ubicacion: string
  tipoSuperficie: string
  precioPorHora: number
  activa: boolean
  club: {
    id: string
    nombre: string
    telefono?: string
    email?: string
    direccion?: string
  }
  deporte: {
    id: string
    nombre: string
  }
}

export interface DisponibilidadHorario {
  id: string
  diaSemana: number // 0-6 (Sunday-Saturday)
  horario: {
    horaInicio: string // HH:MM
    horaFin: string // HH:MM
  }
  cancha: {
    id: string
    nombre: string
    deporte: { nombre: string }
  }
  disponible?: boolean
}

export interface Reserva {
  id: string // UUID
  fechaHora: string // ISO 8601
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada'
  persona: {
    id: string
    nombre: string
  }
  disponibilidad: DisponibilidadHorario
}

export interface CreateReservaData {
  personaId: string // UUID - Required by backend
  disponibilidadId: string // UUID
  fechaHora: string // ISO 8601 format (e.g., "2025-10-21T18:00:00Z")
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
  reserva: { id: string }
  deporte: { nombre: string }
  creador: { nombre: string; apellido?: string; id?: string }
  jugadoresCreador: Persona[]
  invitadosDesafiados: Persona[]
  jugadoresDesafiados: Persona[]
  estado: 'pendiente' | 'aceptado' | 'cancelado' | 'finalizado'
  ganador: 'creador' | 'desafiado' | null
  golesCreador: number | null
  golesDesafiado: number | null
  valoracionCreador: number | null  // 1-5
  valoracionDesafiado: number | null  // 1-5
  creadoEl: string // ISO Date
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
  personaId: string
  deporteId: string
  elo: number
  partidosJugados: number
  partidosGanados: number
  partidosPerdidos: number
  partidosEmpatados: number
  golesAFavor: number
  golesEnContra: number
  rachaActual: number
  mejorRacha: number
  deporte?: Deporte
}

export interface EloHistory {
  id: string
  perfilId: string
  eloAnterior: number
  eloNuevo: number
  cambio: number
  contexto: string
  fecha: string
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
      return { 
        error: data.message || data.error || 'Error de API', 
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
   */
  getUsuarios: () => apiRequest<User[]>('/usuarios'),

  /**
   * Actualizar usuario - PATCH /usuarios/{id}
   */
  updateUsuario: (id: string, data: Partial<User>) =>
    apiRequest<User>(`/usuarios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // ===== PERSONAS =====

  /**
   * Buscar personas - GET /personas/search?q=<texto>
   */
  searchPersonas: (q: string) => apiRequest<Persona[]>(`/personas/search?q=${encodeURIComponent(q)}`),

  /**
   * Obtener persona por ID - GET /personas/:id
   */
  getPersona: (id: string) => apiRequest<Persona>(`/personas/${id}`),

  /**
   * Actualizar persona - PATCH /personas/:id
   */
  updatePersona: (id: string, data: Partial<Persona>) =>
    apiRequest<Persona>(`/personas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

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
   */
  createCancha: (data: {
    nombre: string
    ubicacion: string
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
   * Actualizar club - PATCH /clubes/{id}
   */
  updateClub: (id: string, data: Partial<Club>) =>
    apiRequest<Club>(`/clubes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  /**
   * Eliminar club - DELETE /clubes/{id}
   */
  deleteClub: (id: string) =>
    apiRequest<void>(`/clubes/${id}`, { method: 'DELETE' }),

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
   * @note Referenced in API v1 documentation
   */
  getDesafios: (params?: {
    estado?: string;
    deporteId?: string;
    equipoId?: string;
    jugadorId?: string;
    fecha?: string;
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value)
      })
    }
    const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
    return apiRequest<Desafio[]>(`/desafios${query}`)
  },

  /**
   * Crear desafío - POST /desafios
   * CORRECTED: Backend uses reserva-based challenges, not team-based
   */
  createDesafio: (data: {
    reservaId: string; // UUID - Must be a future reservation
    deporteId: string; // UUID
    invitadosDesafiadosIds: string[]; // Array of Persona UUIDs (min 1)
    jugadoresCreadorIds?: string[]; // Optional teammates for creator
  }) =>
    apiRequest<Desafio>('/desafios', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Aceptar desafío - PATCH /desafios/{id}/aceptar
   * CORRECTED: Backend requires personaId, not equipoRivalId
   */
  aceptarDesafio: (id: string, personaId: string) =>
    apiRequest<Desafio>(`/desafios/${id}/aceptar`, {
      method: 'PATCH',
      body: JSON.stringify({ personaId }),
    }),

  /**
   * Agregar jugadores a un desafío - PATCH /desafios/{id}/agregar-jugadores
   * Add more players to either team
   */
  agregarJugadoresDesafio: (id: string, data: {
    lado: 'creador' | 'desafiado';
    jugadoresIds: string[]; // Array of Persona UUIDs
  }) =>
    apiRequest<Desafio>(`/desafios/${id}/agregar-jugadores`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  /**
   * Finalizar desafío - PATCH /desafios/{id}/finalizar
   * CORRECTED: Backend requires ganadorLado and optional result/valoracion
   */
  finalizarDesafio: (id: string, data: {
    ganadorLado: 'creador' | 'desafiado';
    resultado?: string; // e.g., "3-2"
    valoracion?: number; // 1-5
  }) =>
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

  // ===== FUNCIONALIDADES CRÍTICAS DEL BACKEND =====

  /**
   * Obtener perfil competitivo del usuario - GET /perfil-competitivo
   */
  getPerfilCompetitivo: () => apiRequest<PerfilCompetitivo[]>('/perfil-competitivo'),

  /**
   * Obtener ranking global - GET /ranking
   */
  getRanking: (deporteId?: string) => apiRequest<PerfilCompetitivo[]>(`/ranking${deporteId ? `?deporteId=${deporteId}` : ''}`),

  /**
   * Obtener perfil competitivo por usuario ID - GET /ranking/usuario/{id}
   */
  getRankingByUsuarioId: (id: string) => apiRequest<PerfilCompetitivo>(`/ranking/usuario/${id}`),




  /**
   * Rechazar desafío - PATCH /desafios/{id}/rechazar
   * Reject challenge invitation
   */
  rechazarDesafio: (id: string, personaId?: string) =>
    apiRequest<Desafio>(`/desafios/${id}/rechazar`, { 
      method: 'PATCH',
      body: personaId ? JSON.stringify({ personaId }) : undefined
    }),


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
}

export default apiClient 