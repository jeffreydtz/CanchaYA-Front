/**
 * KPI Calculator
 * Calculates all Key Performance Indicators from raw data
 */

import { MetricStatus, TrendDirection } from './types';

// ============================================================================
// OPERATIONAL KPIs
// ============================================================================

/**
 * Calculate Occupancy Rate
 * Formula: (Horas Reservadas / Horas Disponibles) × 100
 */
export function calculateOccupancyRate(
  reservedHours: number,
  availableHours: number
): number {
  if (availableHours === 0) return 0;
  return (reservedHours / availableHours) * 100;
}

/**
 * Calculate No-Show Rate
 * Formula: (Reservas NO Confirmadas / Total Reservas) × 100
 */
export function calculateNoShowRate(
  unconfirmedReservations: number,
  totalReservations: number
): number {
  if (totalReservations === 0) return 0;
  return (unconfirmedReservations / totalReservations) * 100;
}

/**
 * Calculate Confirmation Rate
 * Formula: (Reservas Confirmadas / Total Reservas) × 100
 */
export function calculateConfirmationRate(
  confirmedReservations: number,
  totalReservations: number
): number {
  if (totalReservations === 0) return 0;
  return (confirmedReservations / totalReservations) * 100;
}

/**
 * Calculate Average Reservations Per Day
 */
export function calculateAverageReservationsPerDay(
  totalReservations: number,
  numberOfDays: number
): number {
  if (numberOfDays === 0) return 0;
  return totalReservations / numberOfDays;
}

// ============================================================================
// FINANCIAL KPIs
// ============================================================================

/**
 * Calculate Total Revenue
 * Formula: SUM(montos WHERE estado = 'PAGADO')
 */
export function calculateTotalRevenue(payments: Array<{ monto: number; estado: string }>): number {
  return payments
    .filter(p => p.estado === 'PAGADO')
    .reduce((sum, p) => sum + Number(p.monto || 0), 0);
}

/**
 * Calculate RevPAH (Revenue per Available Hour)
 * Formula: Ingresos Totales / Horas Disponibles
 */
export function calculateRevPAH(totalRevenue: number, availableHours: number): number {
  if (availableHours === 0) return 0;
  return totalRevenue / availableHours;
}

/**
 * Calculate Average Ticket
 * Formula: Ingresos Totales / Número de Reservas
 */
export function calculateAverageTicket(totalRevenue: number, totalReservations: number): number {
  if (totalReservations === 0) return 0;
  return totalRevenue / totalReservations;
}

/**
 * Calculate Delinquency Rate (Morosidad)
 * Formula: (Deudas Pendientes / Ingresos Esperados) × 100
 */
export function calculateDelinquencyRate(pendingDebts: number, expectedRevenue: number): number {
  if (expectedRevenue === 0) return 0;
  return (pendingDebts / expectedRevenue) * 100;
}

/**
 * Calculate Collection Rate (Tasa de Cobro)
 * Formula: (Montos Pagados / Montos Facturados) × 100
 */
export function calculateCollectionRate(paidAmount: number, billedAmount: number): number {
  if (billedAmount === 0) return 0;
  return (paidAmount / billedAmount) * 100;
}

// ============================================================================
// USER KPIs
// ============================================================================

/**
 * Calculate Retention Rate
 * Formula: (Usuarios Mes Actual ∩ Mes Anterior) / Usuarios Mes Anterior × 100
 */
export function calculateRetentionRate(
  currentMonthUsers: Set<string>,
  previousMonthUsers: Set<string>
): number {
  if (previousMonthUsers.size === 0) return 0;

  const retainedUsers = new Set(
    [...currentMonthUsers].filter(userId => previousMonthUsers.has(userId))
  );

  return (retainedUsers.size / previousMonthUsers.size) * 100;
}

/**
 * Calculate Average Frequency
 * Formula: AVG(reservas_por_usuario)
 */
export function calculateAverageFrequency(
  userReservations: Array<{ userId: string; count: number }>
): number {
  if (userReservations.length === 0) return 0;

  const totalReservations = userReservations.reduce((sum, u) => sum + Number(u.count || 0), 0);
  return totalReservations / userReservations.length;
}

/**
 * Calculate Customer Lifetime Value (LTV)
 * Formula: (Ticket Promedio × Frecuencia Mensual × Meses Promedio de Vida)
 */
export function calculateLTV(
  averageTicket: number,
  monthlyFrequency: number,
  averageLifetimeMonths: number
): number {
  return averageTicket * monthlyFrequency * averageLifetimeMonths;
}

// ============================================================================
// TREND & COMPARISON
// ============================================================================

/**
 * Calculate Change Percentage
 * Formula: ((Valor Actual - Valor Anterior) / Valor Anterior) × 100
 */
export function calculateChangePercent(currentValue: number, previousValue: number): number {
  if (previousValue === 0) {
    return currentValue > 0 ? 100 : 0;
  }
  return ((currentValue - previousValue) / previousValue) * 100;
}

/**
 * Determine Trend Direction
 */
export function determineTrend(
  currentValue: number,
  previousValue: number,
  threshold: number = 5
): TrendDirection {
  const changePercent = calculateChangePercent(currentValue, previousValue);

  if (Math.abs(changePercent) < threshold) {
    return 'neutral';
  }

  return changePercent > 0 ? 'up' : 'down';
}

/**
 * Determine Metric Status based on value and thresholds
 */
export function determineStatus(
  value: number,
  greenThreshold: number,
  yellowThreshold: number,
  higherIsBetter: boolean = true
): MetricStatus {
  if (higherIsBetter) {
    if (value >= greenThreshold) return 'success';
    if (value >= yellowThreshold) return 'warning';
    return 'danger';
  } else {
    if (value <= greenThreshold) return 'success';
    if (value <= yellowThreshold) return 'warning';
    return 'danger';
  }
}

// ============================================================================
// STATISTICAL FUNCTIONS
// ============================================================================

/**
 * Calculate Mean (Average)
 */
export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + Number(val || 0), 0) / values.length;
}

/**
 * Calculate Median
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Calculate Standard Deviation
 */
export function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = calculateMean(values);
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;

  return Math.sqrt(variance);
}

/**
 * Calculate Z-Score for a value
 */
export function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

/**
 * Calculate Quartiles (Q1, Q2, Q3)
 */
export function calculateQuartiles(values: number[]): [number, number, number] {
  if (values.length === 0) return [0, 0, 0];

  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  const q1 = sorted[Math.floor(n * 0.25)];
  const q2 = sorted[Math.floor(n * 0.50)];
  const q3 = sorted[Math.floor(n * 0.75)];

  return [q1, q2, q3];
}

/**
 * Calculate Interquartile Range (IQR)
 */
export function calculateIQR(values: number[]): number {
  const [q1, , q3] = calculateQuartiles(values);
  return q3 - q1;
}

// ============================================================================
// TIME SERIES ANALYSIS
// ============================================================================

/**
 * Calculate Moving Average
 */
export function calculateMovingAverage(values: number[], windowSize: number): number[] {
  const result: number[] = [];

  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const window = values.slice(start, i + 1);
    result.push(calculateMean(window));
  }

  return result;
}

/**
 * Calculate Growth Rate (CAGR - Compound Annual Growth Rate)
 */
export function calculateGrowthRate(
  initialValue: number,
  finalValue: number,
  numberOfPeriods: number
): number {
  if (initialValue === 0 || numberOfPeriods === 0) return 0;
  return (Math.pow(finalValue / initialValue, 1 / numberOfPeriods) - 1) * 100;
}

/**
 * Detect Trend using Linear Regression
 * Returns: { slope, intercept }
 */
export function calculateLinearTrend(values: number[]): { slope: number; intercept: number } {
  const n = values.length;
  if (n === 0) return { slope: 0, intercept: 0 };

  const x = Array.from({ length: n }, (_, i) => i);
  const y = values;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

// ============================================================================
// ANOMALY DETECTION
// ============================================================================

/**
 * Detect Outliers using Z-Score method
 * Returns array of indices where outliers were detected
 */
export function detectOutliersZScore(
  values: number[],
  threshold: number = 3
): { indices: number[]; values: number[]; zScores: number[] } {
  const mean = calculateMean(values);
  const stdDev = calculateStandardDeviation(values);

  const outliers: { index: number; value: number; zScore: number }[] = [];

  values.forEach((value, index) => {
    const zScore = calculateZScore(value, mean, stdDev);
    if (Math.abs(zScore) > threshold) {
      outliers.push({ index, value, zScore });
    }
  });

  return {
    indices: outliers.map(o => o.index),
    values: outliers.map(o => o.value),
    zScores: outliers.map(o => o.zScore)
  };
}

/**
 * Detect Outliers using IQR method
 * Returns array of indices where outliers were detected
 */
export function detectOutliersIQR(
  values: number[]
): { indices: number[]; values: number[]; bounds: { lower: number; upper: number } } {
  const [q1, , q3] = calculateQuartiles(values);
  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const outliers: { index: number; value: number }[] = [];

  values.forEach((value, index) => {
    if (value < lowerBound || value > upperBound) {
      outliers.push({ index, value });
    }
  });

  return {
    indices: outliers.map(o => o.index),
    values: outliers.map(o => o.value),
    bounds: { lower: lowerBound, upper: upperBound }
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Round to N decimal places
 */
export function roundTo(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculate percentage of total
 */
export function percentageOfTotal(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}
