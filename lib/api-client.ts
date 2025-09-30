/**
 * API Client para CanchaYA
 * Cliente universal alineado con el backend NestJS
 * Base URL: https://backend-cancha-ya-production.up.railway.app/api
 * Autenticación: Bearer JWT token
 * Todos los IDs son UUIDs, fechas en formato YYYY-MM-DD, horas en HH:MM
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

export interface User {
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
  disponible: boolean
  deporteId: string // UUID
  clubId: string // UUID
  deporte?: Deporte
  club?: Club
  fechaCreacion: string
}

export interface Reserva {
  id: string // UUID
  usuarioId: string // UUID
  canchaId: string // UUID
  fecha: string // YYYY-MM-DD
  hora: string // HH:MM
  estado: 'pendiente' | 'confirmada' | 'liberada' | 'completada'
  monto?: number
  fechaConfirmacion?: string
  notificacionesEnviadas?: boolean
  usuario?: User
  cancha?: Cancha
  fechaCreacion: string
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
  equipoRetadorId: string // UUID
  equipoRivalId?: string // UUID
  deporteId: string // UUID
  fecha: string // YYYY-MM-DD
  hora: string // HH:MM
  estado: 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO' | 'FINALIZADO'
  resultado?: string
  equipoRetador?: Equipo
  equipoRival?: Equipo
  deporte?: Deporte
  fechaCreacion: string
}

export interface Deuda {
  id: string // UUID
  personaId: string // UUID (actualizado según backend)
  monto: number
  descripcion: string
  fechaVencimiento: string // YYYY-MM-DD
  pagada: boolean
  fechaPago?: string
  usuario?: User
  fechaCreacion: string
}

export interface DisponibilidadJugador {
  id: string // UUID
  usuarioId: string // UUID
  fechaDesde: string // YYYY-MM-DD
  fechaHasta: string // YYYY-MM-DD
  horaDesde: string // HH:MM
  horaHasta: string // HH:MM
  clubesIds: string[] // UUIDs
  usuario?: User
  fechaCreacion: string
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
  id: string // UUID
  usuarioId: string // UUID
  canchaId: string // UUID
  puntaje: number // 1-5
  comentario?: string
  usuario?: User
  cancha?: Cancha
  fechaCreacion: string
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
   */
  login: (credentials: LoginCredentials) =>
    apiRequest<{ accessToken: string; token?: string; user?: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  /**
   * Registro - POST /usuarios/registro  
   */
  register: (data: RegisterData) =>
    apiRequest<User>('/usuarios/registro', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // ===== USUARIOS =====
  
  /**
   * Listar usuarios - GET /usuarios
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

  // ===== CANCHAS =====
  
  /**
   * Listar canchas - GET /canchas
   */
  getCanchas: () => apiRequest<Cancha[]>('/canchas'),

  /**
   * Obtener cancha por ID - GET /canchas/{id}
   */
  getCanchaById: (id: string) => apiRequest<Cancha>(`/canchas/${id}`),

  /**
   * Crear cancha - POST /canchas
   */
  createCancha: (data: {
    nombre: string;
    ubicacion: string;
    tipoSuperficie: string;
    precioPorHora: number;
    deporteId: string;
    clubId: string;
  }) =>
    apiRequest<Cancha>('/canchas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Obtener cancha por ID - GET /canchas/{id}
   */
  getCancha: (id: string) => apiRequest<Cancha>(`/canchas/${id}`),

  /**
   * Actualizar cancha - PATCH /canchas/{id}
   */
  updateCancha: (id: string, data: Partial<Cancha>) =>
    apiRequest<Cancha>(`/canchas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  /**
   * Eliminar cancha - DELETE /canchas/{id}
   */
  deleteCancha: (id: string) =>
    apiRequest<void>(`/canchas/${id}`, { method: 'DELETE' }),

  // ===== CLUBES =====
  
  /**
   * Listar clubes - GET /clubes
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
  
  /**
   * Listar deportes - GET /deportes
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
   */
  getReservas: () => apiRequest<Reserva[]>('/reservas'),

  /**
   * Crear reserva - POST /reservas
   */
  createReserva: (data: {
    usuarioId: string;
    canchaId: string;
    fecha: string; // YYYY-MM-DD
    hora: string;  // HH:MM
  }) =>
    apiRequest<Reserva>('/reservas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Obtener reserva por ID - GET /reservas/{id}
   */
  getReserva: (id: string) => apiRequest<Reserva>(`/reservas/${id}`),

  /**
   * Confirmar reserva - PATCH /reservas/{id}/confirmar
   */
  confirmarReserva: (id: string) =>
    apiRequest<Reserva>(`/reservas/${id}/confirmar`, { 
      method: 'PATCH'
    }),

  /**
   * Cancelar reserva - DELETE /reservas/{id}
   */
  cancelReserva: (id: string) =>
    apiRequest<void>(`/reservas/${id}`, { method: 'DELETE' }),


  // ===== EQUIPOS =====
  
  /**
   * Listar equipos - GET /equipos
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
  
  /**
   * Listar desafíos - GET /desafios
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
   */
  createDesafio: (data: {
    equipoRetadorId: string;
    deporteId: string;
    fecha: string; // YYYY-MM-DD
    hora: string;  // HH:MM
  }) =>
    apiRequest<Desafio>('/desafios', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Aceptar desafío - PATCH /desafios/{id}/aceptar
   */
  aceptarDesafio: (id: string, equipoRivalId: string) =>
    apiRequest<Desafio>(`/desafios/${id}/aceptar`, {
      method: 'PATCH',
      body: JSON.stringify({ equipoRivalId }),
    }),

  /**
   * Finalizar desafío - PATCH /desafios/{id}/finalizar
   */
  finalizarDesafio: (id: string, resultado: string) =>
    apiRequest<Desafio>(`/desafios/${id}/finalizar`, {
      method: 'PATCH',
      body: JSON.stringify({ resultado }),
    }),

  // ===== DEUDAS =====
  
  /**
   * Listar deudas - GET /deudas
   */
  getDeudas: () => apiRequest<Deuda[]>('/deudas'),

  /**
   * Crear deuda - POST /deudas
   */
  createDeuda: (data: {
    usuarioId: string;
    monto: number;
    fechaVencimiento: string; // YYYY-MM-DD
    descripcion?: string;
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

  // ===== DISPONIBILIDAD DE JUGADORES =====
  
  /**
   * Listar disponibilidades - GET /disponibilidades
   */
  getDisponibilidades: () => apiRequest<DisponibilidadJugador[]>('/disponibilidades'),

  /**
   * Crear disponibilidad - POST /disponibilidades
   */
  createDisponibilidad: (data: {
    fechaDesde: string; // YYYY-MM-DD
    fechaHasta: string; // YYYY-MM-DD
    horaDesde: string;  // HH:MM
    horaHasta: string;  // HH:MM
    clubesIds: string[]; // UUIDs
  }) =>
    apiRequest<DisponibilidadJugador>('/disponibilidades', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Eliminar disponibilidad - DELETE /disponibilidades/{id}
   */
  deleteDisponibilidad: (id: string) =>
    apiRequest<void>(`/disponibilidades/${id}`, { method: 'DELETE' }),

  // ===== HORARIOS =====
  
  /**
   * Listar horarios - GET /horarios
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
  
  /**
   * Listar valoraciones - GET /valoraciones
   */
  getValoraciones: () => apiRequest<Valoracion[]>('/valoraciones'),

  /**
   * Crear valoración - POST /valoraciones
   */
  createValoracion: (data: {
    usuarioId: string;
    canchaId: string;
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
   */
  rechazarDesafio: (id: string) =>
    apiRequest<Desafio>(`/desafios/${id}/rechazar`, { method: 'PATCH' }),


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
}

export default apiClient 