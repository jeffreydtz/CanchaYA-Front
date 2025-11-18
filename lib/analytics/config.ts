/**
 * Analytics Configuration
 * Centralized configuration for all analytics thresholds, limits, and defaults
 */

// ============================================================================
// STATUS THRESHOLDS
// ============================================================================

export const STATUS_THRESHOLDS = {
  // Occupancy Rate (%)
  occupancy: {
    green: 75,
    warning: 60
  },
  // No-show Rate (%)
  noShowRate: {
    green: 10,
    warning: 15
  },
  // Retention Rate (%)
  retentionRate: {
    green: 80,
    warning: 70
  }
}

// ============================================================================
// ANALYTICS DEFAULTS & LIMITS
// ============================================================================

export const ANALYTICS_DEFAULTS = {
  // Default date range in days
  defaultDateRangeDays: 30,
  // Default hours available per court per day (10am-12am = 14 hours)
  hoursPerDay: 14,
  // Default hours assumed per reservation
  hoursPerReservation: 1,
  // Number of top items to display
  topCourtsLimit: 6,
  topHoursLimit: 3,
  // Average user lifetime in months (for LTV calculation)
  averageUserLifetimeMonths: 18
}

// ============================================================================
// TREND & STATISTICAL THRESHOLDS
// ============================================================================

export const TREND_THRESHOLDS = {
  // Minimum percentage change to detect a trend
  detectionThreshold: 5,
  // Z-Score threshold for outlier detection
  outlierZScore: 3,
  // Recent data window in days (for recent vs overall comparison)
  recentDataWindowDays: 7,
  // Volatility thresholds
  lowVolatilityPercent: 10,
  highVolatilityPercent: 30,
  // Variance threshold for trend comparison
  varianceThreshold: 10
}

// ============================================================================
// CHART DIMENSIONS & STYLING
// ============================================================================

export const CHART_CONFIG = {
  // Default chart height in pixels
  defaultHeight: 300,
  // Sparkline dimensions
  sparkline: {
    height: 40,
    width: 100,
    padding: 2
  },
  // Grid styling
  grid: {
    strokeDasharray: '3 3',
    color: '#e5e7eb'
  },
  // Axis styling
  axis: {
    strokeColor: '#6b7280'
  },
  // Area chart fill opacity
  areaChartFillOpacity: 0.2,
  // Pie chart configuration
  pieChart: {
    cx: '50%',
    cy: '50%',
    outerRadius: 100
  }
}

// ============================================================================
// COLOR PALETTES
// ============================================================================

export const COLOR_PALETTES = {
  // Primary chart colors for multiple datasets
  chart: [
    '#3b82f6', // blue-500
    '#10b981', // green-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#14b8a6', // teal-500
    '#f97316'  // orange-500
  ],
  // Comparison chart colors
  comparison: {
    primary: '#3b82f6',
    secondary: '#10b981'
  },
  // Trend sparkline colors
  trend: {
    up: '#10b981',
    down: '#ef4444',
    neutral: '#6b7280'
  },
  // Trend sparkline fill colors
  trendFill: {
    up: 'rgba(16, 185, 129, 0.1)',
    down: 'rgba(239, 68, 68, 0.1)',
    neutral: 'rgba(107, 114, 128, 0.1)'
  },
  // Alert severity colors
  severity: {
    LOW: '#10b981',      // green
    MEDIUM: '#f59e0b',   // amber
    HIGH: '#ef4444',     // red
    CRITICAL: '#dc2626'  // red-600
  },
  // Status colors
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    neutral: '#6b7280'
  }
}

// ============================================================================
// TIME PERIOD CONFIGURATION
// ============================================================================

export const TIME_CONFIG = {
  // Hours range for heatmap (0-24 for 24 hours)
  hoursStart: 0,
  hoursEnd: 24,
  // Default filter preset
  defaultPreset: 'last30days',
  // Day labels (for heatmap)
  dayLabels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
  // Hour display format start and end
  hourDisplayStart: 10,
  hourDisplayEnd: 24,
  hourDisplayLabel: '10:00 a 24:00'
}

// ============================================================================
// USER SEGMENTATION CONFIGURATION
// ============================================================================

export const USER_SEGMENTS = {
  ALL: {
    label: 'Todos',
    description: 'Todos los usuarios'
  },
  VIP: {
    label: 'VIP',
    description: 'Usuarios con > 8 reservas/mes',
    minBookingsPerMonth: 8
  },
  REGULAR: {
    label: 'Regular',
    description: 'Usuarios con 4-8 reservas/mes',
    minBookingsPerMonth: 4,
    maxBookingsPerMonth: 8
  },
  OCCASIONAL: {
    label: 'Ocasional',
    description: 'Usuarios con 1-3 reservas/mes',
    minBookingsPerMonth: 1,
    maxBookingsPerMonth: 3
  },
  INACTIVE: {
    label: 'Inactivo',
    description: 'Usuarios sin reservas recientes',
    minBookingsPerMonth: 0,
    maxBookingsPerMonth: 0
  }
}

// ============================================================================
// ALERT CONFIGURATION
// ============================================================================

export const ALERT_CONFIG = {
  // Default cooldown period in minutes
  defaultCooldownMinutes: 30,
  // Severity colors
  severityColors: {
    LOW: '#10b981',
    MEDIUM: '#f59e0b',
    HIGH: '#ef4444',
    CRITICAL: '#dc2626'
  },
  // Default alert thresholds (can be customized per alert)
  defaultThresholds: {
    occupancy: 50,
    revenue: 5000,
    noShowRate: 20
  }
}

// ============================================================================
// REPORT CONFIGURATION
// ============================================================================

export const REPORT_CONFIG = {
  // Default date range for reports in days
  defaultDateRangeDays: 30,
  // Default sheet name for Excel exports
  excelSheetName: 'Reporte Analytics',
  // Print configuration
  printConfig: {
    maxWidth: '210mm',  // A4 width
    padding: '20px',
    borderColor: '#e5e7eb',
    headerBackground: '#f3f4f6'
  }
}

// ============================================================================
// NUMBER FORMATTING CONFIGURATION
// ============================================================================

export const FORMAT_CONFIG = {
  // Locale for number/currency formatting
  locale: 'es-AR',
  // Currency code
  currency: 'ARS',
  // Number abbreviation thresholds
  abbreviationThresholds: {
    million: 1_000_000,
    thousand: 1_000
  },
  // File size calculation constant
  fileSizeKbConstant: 1024
}

// ============================================================================
// GRID & LAYOUT CONFIGURATION
// ============================================================================

export const LAYOUT_CONFIG = {
  // Default KPI grid columns
  kpiGridColumns: 4,
  // Report format grid columns
  reportFormatColumns: 4
}

// ============================================================================
// AUTO-REFRESH CONFIGURATION
// ============================================================================

export const AUTO_REFRESH_CONFIG = {
  // Dashboard auto-refresh interval in milliseconds (5 minutes)
  dashboardIntervalMs: 5 * 60 * 1000,
  // Disabled by default
  enabled: false
}
