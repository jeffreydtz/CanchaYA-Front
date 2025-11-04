/**
 * Formatters
 * Utilities for formatting numbers, currencies, dates, and percentages
 */

import { TrendDirection, MetricStatus } from './types';

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

/**
 * Format number with thousands separators
 * Example: 1234567 -> "1,234,567"
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Format number as currency (Argentine Peso)
 * Example: 1234.56 -> "$1.234,56"
 */
export function formatCurrency(value: number, showSymbol: boolean = true): string {
  const formatted = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);

  return showSymbol ? formatted : formatted.replace(/[^\d,.-]/g, '');
}

/**
 * Format number as percentage
 * Example: 0.7534 -> "75.34%"
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${formatNumber(value, decimals)}%`;
}

/**
 * Format large numbers with abbreviations
 * Example: 1234567 -> "1.23M"
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return formatNumber(value);
}

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Format date as "DD/MM/YYYY"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);
}

/**
 * Format date as "DD MMM YYYY"
 * Example: "15 Nov 2024"
 */
export function formatDateLong(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(d);
}

/**
 * Format date and time as "DD/MM/YYYY HH:mm"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}

/**
 * Format relative time (e.g., "hace 5 minutos", "hace 2 horas")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'hace un momento';
  if (diffMins < 60) return `hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  return formatDate(d);
}

/**
 * Format date range as "DD MMM - DD MMM YYYY"
 */
export function formatDateRange(start: Date | string, end: Date | string): string {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;

  const startFormatted = new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short'
  }).format(startDate);

  const endFormatted = new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(endDate);

  return `${startFormatted} - ${endFormatted}`;
}

// ============================================================================
// CHANGE FORMATTING
// ============================================================================

/**
 * Format change value with + or - sign
 * Example: 15.5 -> "+15.5", -8.2 -> "-8.2"
 */
export function formatChange(value: number, decimals: number = 2): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatNumber(value, decimals)}`;
}

/**
 * Format change percentage with + or - sign and %
 * Example: 15.5 -> "+15.5%", -8.2 -> "-8.2%"
 */
export function formatChangePercent(value: number, decimals: number = 2): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatNumber(value, decimals)}%`;
}

/**
 * Get trend icon based on direction
 */
export function getTrendIcon(trend: TrendDirection): string {
  switch (trend) {
    case 'up':
      return '↑';
    case 'down':
      return '↓';
    case 'neutral':
      return '→';
  }
}

/**
 * Get trend color class (Tailwind CSS)
 */
export function getTrendColor(trend: TrendDirection, inversePositive: boolean = false): string {
  const positive = inversePositive ? 'down' : 'up';
  const negative = inversePositive ? 'up' : 'down';

  switch (trend) {
    case positive:
      return 'text-green-600';
    case negative:
      return 'text-red-600';
    case 'neutral':
      return 'text-gray-600';
  }
}

// ============================================================================
// STATUS FORMATTING
// ============================================================================

/**
 * Get status color class (Tailwind CSS)
 */
export function getStatusColor(status: MetricStatus): string {
  switch (status) {
    case 'success':
      return 'text-green-600 bg-green-50';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50';
    case 'danger':
      return 'text-red-600 bg-red-50';
    case 'neutral':
      return 'text-gray-600 bg-gray-50';
  }
}

/**
 * Get status badge color (Tailwind CSS)
 */
export function getStatusBadgeColor(status: MetricStatus): string {
  switch (status) {
    case 'success':
      return 'bg-green-100 text-green-800';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800';
    case 'danger':
      return 'bg-red-100 text-red-800';
    case 'neutral':
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Get status text label
 */
export function getStatusLabel(status: MetricStatus): string {
  switch (status) {
    case 'success':
      return 'Excelente';
    case 'warning':
      return 'Atención';
    case 'danger':
      return 'Crítico';
    case 'neutral':
      return 'Normal';
  }
}

// ============================================================================
// METRIC VALUE FORMATTING
// ============================================================================

/**
 * Format metric value based on type
 */
export function formatMetricValue(
  value: number,
  format: 'number' | 'currency' | 'percentage',
  decimals: number = 2
): string {
  switch (format) {
    case 'currency':
      return formatCurrency(value);
    case 'percentage':
      return formatPercentage(value, decimals);
    case 'number':
    default:
      return formatNumber(value, decimals);
  }
}

/**
 * Format metric with its unit
 */
export function formatMetricWithUnit(value: number, unit?: string, format?: 'number' | 'currency' | 'percentage'): string {
  if (format === 'currency' || unit === '$') {
    return formatCurrency(value);
  }

  if (format === 'percentage' || unit === '%') {
    return formatPercentage(value);
  }

  const formattedValue = formatNumber(value);
  return unit ? `${formattedValue} ${unit}` : formattedValue;
}

// ============================================================================
// CHART FORMATTING
// ============================================================================

/**
 * Format chart tooltip value
 */
export function formatChartTooltip(
  value: number,
  format: 'number' | 'currency' | 'percentage' = 'number',
  label?: string
): string {
  const formattedValue = formatMetricValue(value, format);
  return label ? `${label}: ${formattedValue}` : formattedValue;
}

/**
 * Format chart axis label (compact for large numbers)
 */
export function formatChartAxis(value: number): string {
  return formatCompactNumber(value);
}

// ============================================================================
// TIME PERIOD FORMATTING
// ============================================================================

/**
 * Get period label from preset
 */
export function getPeriodLabel(preset: string): string {
  const labels: Record<string, string> = {
    today: 'Hoy',
    yesterday: 'Ayer',
    last7days: 'Últimos 7 días',
    last30days: 'Últimos 30 días',
    thisMonth: 'Este mes',
    lastMonth: 'Mes pasado',
    thisYear: 'Este año',
    lastYear: 'Año pasado',
    custom: 'Personalizado'
  };

  return labels[preset] || preset;
}

/**
 * Format duration in minutes to hours and minutes
 * Example: 135 -> "2h 15m"
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// ============================================================================
// FILE SIZE FORMATTING
// ============================================================================

/**
 * Format file size in bytes to human-readable format
 * Example: 1536 -> "1.5 KB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// ============================================================================
// LIST FORMATTING
// ============================================================================

/**
 * Format array as comma-separated list
 * Example: ["Fútbol", "Pádel", "Tenis"] -> "Fútbol, Pádel y Tenis"
 */
export function formatList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} y ${items[1]}`;

  const last = items[items.length - 1];
  const rest = items.slice(0, -1).join(', ');
  return `${rest} y ${last}`;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Check if value is valid number
 */
export function isValidNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Safe format - returns fallback if value is invalid
 */
export function safeFormat(
  value: any,
  formatter: (val: number) => string,
  fallback: string = 'N/A'
): string {
  return isValidNumber(value) ? formatter(value) : fallback;
}
