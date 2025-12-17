/**
 * Analytics Constants
 * Static strings, enums, and mappings for analytics
 */

// ============================================================================
// DATE PRESET LABELS
// ============================================================================

export const DATE_PRESETS = {
  today: { label: 'Hoy', value: 'today' },
  yesterday: { label: 'Ayer', value: 'yesterday' },
  last7days: { label: 'Últimos 7 días', value: 'last7days' },
  last30days: { label: 'Últimos 30 días', value: 'last30days' },
  thisMonth: { label: 'Este mes', value: 'thisMonth' },
  lastMonth: { label: 'Mes pasado', value: 'lastMonth' },
  custom: { label: 'Personalizado', value: 'custom' }
}

// ============================================================================
// PERIOD LABELS (for formatting periods in exports/reports)
// ============================================================================

export const PERIOD_LABELS: Record<string, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual',
  quarterly: 'Trimestral',
  yearly: 'Anual',
  allTime: 'Todo el tiempo',
  custom: 'Personalizado',
  lastWeek: 'Última semana'
}

// ============================================================================
// SPORTS & COLORS MAPPING
// ============================================================================

export const SPORTS_COLORS: Record<string, string> = {
  // Primary sports - normalize names
  'Fútbol': '#ef4444',      // red
  'Futbol': '#ef4444',      // red (fallback)
  'Fútbol 5': '#dc2626',    // darker red
  'Fútbol 7': '#b91c1c',    // darkest red
  'Tenis': '#f59e0b',       // amber
  'Pádel': '#10b981',       // green
  'Paddle': '#10b981',      // green (fallback)
  'Básquet': '#3b82f6',     // blue
  'Basquetbol': '#3b82f6',  // blue (fallback)
  'Baloncesto': '#3b82f6',  // blue (fallback)
  'Vóley': '#8b5cf6',       // violet
  'Voleibol': '#8b5cf6',    // violet (fallback)
  'Badminton': '#ec4899',   // pink
  'Hockey': '#14b8a6',      // teal
  'Squash': '#f97316',      // orange
  'Handball': '#06b6d4',    // cyan
  'Otro': '#6b7280'         // gray
}

// ============================================================================
// STATUS LABELS
// ============================================================================

export const STATUS_LABELS = {
  success: 'Exitoso',
  warning: 'Advertencia',
  danger: 'Crítico',
  neutral: 'Neutral'
}

// ============================================================================
// TREND LABELS
// ============================================================================

export const TREND_LABELS = {
  up: 'Tendencia Positiva',
  down: 'Tendencia Negativa',
  neutral: 'Sin Cambios'
}

// ============================================================================
// METRIC DESCRIPTIONS (for tooltips and help text)
// ============================================================================

export const METRIC_DESCRIPTIONS: Record<string, { title: string; description: string; example?: string; tip?: string }> = {
  occupancy: {
    title: 'Ocupación',
    description: 'Porcentaje de horas disponibles que fueron reservadas en el período',
    example: 'Si hay 100 horas disponibles y 75 fueron reservadas, la ocupación es 75%',
    tip: 'Una ocupación mayor al 70% generalmente indica buena demanda. Por debajo del 50%, considera revisar precios o marketing.'
  },
  revenue: {
    title: 'Ingresos',
    description: 'Monto total en pesos generado por todas las reservas confirmadas',
    example: '10 reservas × $1.000 por hora = $10.000 en ingresos',
    tip: 'Compara con el mes anterior para identificar tendencias. Un crecimiento sostenido indica estrategia exitosa.'
  },
  activeUsers: {
    title: 'Usuarios Activos',
    description: 'Cantidad total de usuarios distintos que realizaron al menos una reserva',
    example: 'Si 50 usuarios diferentes hicieron reservas, son 50 usuarios activos',
    tip: 'Crecimiento en usuarios activos indica expansión de mercado. Stagnación sugiere saturación.'
  },
  confirmedReservations: {
    title: 'Reservas Confirmadas',
    description: 'Número de reservas que fueron confirmadas por los usuarios (no incluye cancelaciones)',
    example: '100 reservas totales - 10 cancelaciones = 90 reservas confirmadas',
    tip: 'Esta métrica refleja la demanda real. Compara con reservas totales para identificar tasa de cancelación.'
  },
  noShowRate: {
    title: 'Tasa de No-show',
    description: 'Porcentaje de reservas confirmadas que no fueron utilizadas (el usuario no se presentó)',
    example: 'Si 100 reservas fueron confirmadas pero 15 no fueron utilizadas, la tasa es 15%',
    tip: 'Una tasa alta indica problemas de confiabilidad. Considera un sistema de confirmación 24h antes.'
  },
  revenuePerCourt: {
    title: 'Ingresos por Cancha',
    description: 'Promedio de ingresos generados por cada cancha disponible',
    example: '$50.000 de ingresos totales ÷ 10 canchas = $5.000 por cancha',
    tip: 'Útil para identificar canchas bajo-rendimiento. Las que caen bajo el promedio necesitan revisión.'
  },
  bookingRate: {
    title: 'Tasa de Reserva',
    description: 'Porcentaje de horarios disponibles que fueron reservados respecto a los visitantes',
    example: 'De 1.000 visitas al sitio, 150 resultaron en reservas = 15% tasa de conversión',
    tip: 'Mejora esto con marketing efectivo, UX mejorada, y precios competitivos.'
  },
  averageReservationValue: {
    title: 'Valor Promedio de Reserva',
    description: 'Promedio de dinero generado por cada reserva confirmada',
    example: '$50.000 en ingresos ÷ 100 reservas = $500 por reserva',
    tip: 'Aumenta esto mejorando los precios, ofertas de paquetes o servicios adicionales.'
  }
}

// ============================================================================
// ALERT SEVERITY LABELS
// ============================================================================

export const ALERT_SEVERITY_LABELS: Record<string, string> = {
  LOW: 'Bajo',
  MEDIUM: 'Medio',
  HIGH: 'Alto',
  CRITICAL: 'Crítico'
}

// ============================================================================
// USER SEGMENT LABELS & DESCRIPTIONS
// ============================================================================

export const USER_SEGMENT_DESCRIPTIONS: Record<string, { icon: string; description: string }> = {
  VIP: {
    icon: '👑',
    description: 'Clientes premium con alta frecuencia de reserva'
  },
  REGULAR: {
    icon: '⭐',
    description: 'Usuarios consistentes con reservas regulares'
  },
  OCCASIONAL: {
    icon: '📅',
    description: 'Usuarios que reservan esporádicamente'
  },
  INACTIVE: {
    icon: '⏸️',
    description: 'Usuarios sin actividad reciente'
  }
}

// ============================================================================
// ERROR & SUCCESS MESSAGES
// ============================================================================

export const MESSAGES = {
  // Chart/Data messages
  noData: 'No hay datos disponibles para el período seleccionado',
  loading: 'Cargando datos...',
  error: 'Error al cargar los datos',

  // Action messages
  exportSuccess: 'Reporte exportado exitosamente',
  exportError: 'Error al exportar reporte',

  // Validation messages
  invalidDateRange: 'Rango de fechas inválido',
  futureDate: 'No puedes seleccionar fechas futuras'
}

// ============================================================================
// HEATMAP CONFIGURATION
// ============================================================================

export const HEATMAP_CONFIG = {
  rows: 7,          // 7 days of week
  columns: 14       // 14 hours (10am-12am)
}

// ============================================================================
// EXPORT FORMAT OPTIONS
// ============================================================================

export const EXPORT_FORMATS = {
  pdf: { label: 'PDF', value: 'pdf' },
  csv: { label: 'CSV', value: 'csv' },
  excel: { label: 'Excel', value: 'excel' },
  json: { label: 'JSON', value: 'json' }
}

// ============================================================================
// CHART TYPES
// ============================================================================

export const CHART_TYPES = {
  timeSeries: 'timeSeries',
  comparison: 'comparison',
  distribution: 'distribution',
  heatmap: 'heatmap',
  pie: 'pie'
}
