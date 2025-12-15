/**
 * Data Aggregator
 * Fetches and combines data from multiple API endpoints to calculate metrics
 */

import apiClient from '../api-client';
import {
  calculateOccupancyRate,
  calculateNoShowRate,
  calculateTotalRevenue,
  calculateRevPAH,
  calculateAverageTicket,
  calculateDelinquencyRate,
  calculateCollectionRate,
  calculateRetentionRate,
  calculateAverageFrequency,
  calculateChangePercent,
  determineTrend,
  determineStatus,
  roundTo
} from './kpi-calculator';
import type { DashboardData, DashboardMetrics, KPI, CourtPerformance, HeatmapData, TimeSeriesData } from './types';
import { ANALYTICS_DEFAULTS, STATUS_THRESHOLDS, TIME_CONFIG } from './config';

// ============================================================================
// MAIN DASHBOARD DATA AGGREGATOR
// ============================================================================

/**
 * Fetch and aggregate all dashboard data
 */
export async function fetchDashboardData(
  clubId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<DashboardData> {
  try {
    // Default to last 30 days if no dates provided
    const end = endDate || new Date();
    const start = startDate || new Date(end.getTime() - ANALYTICS_DEFAULTS.defaultDateRangeDays * 24 * 60 * 60 * 1000);

    // Fetch all data in parallel
    const [
      reservations,
      courts,
      users,
      topCourtsData,
      occupancyHourly
    ] = await Promise.all([
      fetchReservations(start, end, clubId),
      fetchCourts(clubId),
      fetchUsers(),
      fetchTopCourts(),
      fetchOccupancyHourly()
    ]);

    // Calculate metrics
    const metrics = calculateMetrics(reservations, courts, users, start, end);

    // Calculate KPIs with comparisons
    const kpis = await calculateKPIs(metrics, start, end, clubId);

    // Prepare trends data
    const trends = {
      occupancy: await fetchOccupancyTrend(start, end),
      revenue: await fetchRevenueTrend(start, end),
      users: await fetchUsersTrend(start, end)
    };

    // Prepare top courts
    const topCourts = processTopCourts(topCourtsData, reservations);

    // Prepare heatmap
    const heatmap = processHeatmap(occupancyHourly);

    return {
      metrics,
      kpis,
      trends,
      topCourts,
      heatmap
    };
  } catch (error) {
    throw error;
  }
}

// ============================================================================
// DATA FETCHERS
// ============================================================================

async function fetchReservations(start: Date, end: Date, clubId?: string) {
  const response = await apiClient.getReservas();

  if (response.error || !response.data) {
    return [];
  }

  // Filter by date range and club
  return response.data.filter((reserva: any) => {
    const reservaDate = new Date(reserva.fecha);
    const inDateRange = reservaDate >= start && reservaDate <= end;
    const matchesClub = !clubId || reserva.cancha?.clubId === clubId;
    return inDateRange && matchesClub;
  });
}

async function fetchCourts(clubId?: string) {
  const response = await apiClient.getCanchas();

  if (response.error || !response.data) {
    return [];
  }

  return clubId
    ? response.data.filter((cancha: any) => cancha.clubId === clubId)
    : response.data;
}

async function fetchUsers() {
  const response = await apiClient.getUsuarios();

  if (response.error || !response.data) {
    return [];
  }

  return response.data;
}

async function fetchTopCourts() {
  try {
    const response = await apiClient.getReporteCanchasTop();

    if (response.error || !response.data) {
      return [];
    }

    return response.data;
  } catch (error) {
    // Endpoint not available, return empty array to continue
    return [];
  }
}

async function fetchOccupancyHourly() {
  try {
    const response = await apiClient.getReporteOcupacionHorarios();

    if (response.error || !response.data) {
      return [];
    }

    return response.data;
  } catch (error) {
    // Endpoint not available, return empty array to continue
    return [];
  }
}

// ============================================================================
// METRICS CALCULATOR
// ============================================================================

function calculateMetrics(
  reservations: any[],
  courts: any[],
  users: any[],
  startDate: Date,
  endDate: Date
): DashboardMetrics {
  // Calculate time period
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // OPERATIONAL METRICS
  const totalReservations = reservations.length;
  const confirmedReservations = reservations.filter(r => r.confirmada).length;
  const cancelledReservations = reservations.filter(
    r => r.estado === 'CANCELADA' || !r.confirmada
  ).length;

  // Calculate total available hours
  const availableHours = courts.length * ANALYTICS_DEFAULTS.hoursPerDay * daysDiff;

  // Calculate reserved hours (assuming 1 hour per reservation on average)
  const reservedHours = totalReservations * ANALYTICS_DEFAULTS.hoursPerReservation;

  const occupancyRate = calculateOccupancyRate(reservedHours, availableHours);
  const noShowRate = calculateNoShowRate(cancelledReservations, totalReservations);
  const averageReservationsPerDay = totalReservations / daysDiff;

  // Peak hours calculation
  const hourCounts: Record<number, number> = {};
  reservations.forEach(r => {
    const hour = new Date(r.fecha).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  const sortedHours = Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, ANALYTICS_DEFAULTS.topHoursLimit)
    .map(([hour]) => `${hour}:00`);

  // FINANCIAL METRICS
  const payments = reservations.map(r => ({
    monto: Number(r.precio || 0),
    estado: r.estado === 'CONFIRMADA' ? 'PAGADO' : 'PENDIENTE'
  }));

  const totalRevenue = calculateTotalRevenue(payments);
  const revPAH = calculateRevPAH(totalRevenue, availableHours);
  const averageTicket = calculateAverageTicket(totalRevenue, totalReservations);

  const pendingPayments = payments
    .filter(p => p.estado === 'PENDIENTE')
    .reduce((sum, p) => sum + Number(p.monto || 0), 0);

  const expectedRevenue = payments.reduce((sum, p) => sum + Number(p.monto || 0), 0);

  const delinquencyRate = calculateDelinquencyRate(pendingPayments, expectedRevenue);
  const collectionRate = calculateCollectionRate(totalRevenue, expectedRevenue);

  // USER METRICS
  const activeUsers = users.filter(u => {
    // User is active if they have at least one reservation in the period
    return reservations.some(r => r.jugadorId === u.id);
  }).length;

  // New users (registered in the period)
  const newUsers = users.filter(u => {
    const regDate = new Date(u.createdAt);
    return regDate >= startDate && regDate <= endDate;
  }).length;

  // Calculate retention (simplified - users who had reservations in both current and previous period)
  const previousPeriodStart = new Date(startDate.getTime() - daysDiff * 24 * 60 * 60 * 1000);
  const currentPeriodUsers = new Set(reservations.map(r => r.jugadorId));
  const previousPeriodUsers = new Set(
    reservations
      .filter(r => {
        const date = new Date(r.fecha);
        return date >= previousPeriodStart && date < startDate;
      })
      .map(r => r.jugadorId)
  );

  const retentionRate = calculateRetentionRate(currentPeriodUsers, previousPeriodUsers);

  // Average frequency
  const userReservationCounts = Array.from(currentPeriodUsers).map(userId => ({
    userId,
    count: reservations.filter(r => r.jugadorId === userId).length
  }));

  const averageFrequency = calculateAverageFrequency(userReservationCounts);

  // Simplified LTV calculation
  const lifetimeValue = averageTicket * averageFrequency * ANALYTICS_DEFAULTS.averageUserLifetimeMonths;

  return {
    // Operational
    occupancyRate: roundTo(occupancyRate, 2),
    confirmedReservations,
    noShowRate: roundTo(noShowRate, 2),
    averageReservationsPerDay: roundTo(averageReservationsPerDay, 2),
    peakHours: sortedHours,

    // Financial
    totalRevenue: roundTo(totalRevenue, 2),
    revPAH: roundTo(revPAH, 2),
    averageTicket: roundTo(averageTicket, 2),
    delinquencyRate: roundTo(delinquencyRate, 2),
    collectionRate: roundTo(collectionRate, 2),

    // User
    activeUsers,
    newUsers,
    retentionRate: roundTo(retentionRate, 2),
    averageFrequency: roundTo(averageFrequency, 2),
    lifetimeValue: roundTo(lifetimeValue, 2),

    // Metadata
    period: {
      start: startDate,
      end: endDate
    },
    lastUpdated: new Date()
  };
}

// ============================================================================
// KPI CALCULATOR WITH COMPARISONS
// ============================================================================

async function calculateKPIs(
  currentMetrics: DashboardMetrics,
  startDate: Date,
  endDate: Date,
  clubId?: string
): Promise<KPI[]> {
  // Fetch previous period data for comparison
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const previousStart = new Date(startDate.getTime() - daysDiff * 24 * 60 * 60 * 1000);
  const previousEnd = startDate;

  // Fetch previous period data (simplified - reusing same function)
  // In production, this should be cached or fetched more efficiently
  try {
    const [prevReservations, courts, users] = await Promise.all([
      fetchReservations(previousStart, previousEnd, clubId),
      fetchCourts(clubId),
      fetchUsers()
    ]);

    const previousMetrics = calculateMetrics(prevReservations, courts, users, previousStart, previousEnd);

    // Build KPIs with comparisons
    const kpis: KPI[] = [
      // OPERATIONAL KPIs
      {
        id: 'occupancy-rate',
        name: 'Tasa de Ocupación',
        description: 'Porcentaje de horas reservadas vs disponibles',
        type: 'OPERATIONAL',
        value: currentMetrics.occupancyRate,
        previousValue: previousMetrics.occupancyRate,
        target: STATUS_THRESHOLDS.occupancy.green,
        change: currentMetrics.occupancyRate - previousMetrics.occupancyRate,
        changePercent: calculateChangePercent(currentMetrics.occupancyRate, previousMetrics.occupancyRate),
        trend: determineTrend(currentMetrics.occupancyRate, previousMetrics.occupancyRate),
        status: determineStatus(currentMetrics.occupancyRate, STATUS_THRESHOLDS.occupancy.green, STATUS_THRESHOLDS.occupancy.warning, true),
        unit: '%',
        format: 'percentage'
      },
      {
        id: 'confirmed-reservations',
        name: 'Reservas Confirmadas',
        description: 'Total de reservas confirmadas',
        type: 'OPERATIONAL',
        value: currentMetrics.confirmedReservations,
        previousValue: previousMetrics.confirmedReservations,
        change: currentMetrics.confirmedReservations - previousMetrics.confirmedReservations,
        changePercent: calculateChangePercent(currentMetrics.confirmedReservations, previousMetrics.confirmedReservations),
        trend: determineTrend(currentMetrics.confirmedReservations, previousMetrics.confirmedReservations),
        status: determineTrend(currentMetrics.confirmedReservations, previousMetrics.confirmedReservations) === 'up'
          ? 'success'
          : 'warning',
        format: 'number'
      },
      {
        id: 'no-show-rate',
        name: 'Tasa de No-Show',
        description: 'Porcentaje de ausentismo',
        type: 'OPERATIONAL',
        value: currentMetrics.noShowRate,
        previousValue: previousMetrics.noShowRate,
        target: STATUS_THRESHOLDS.noShowRate.green,
        change: currentMetrics.noShowRate - previousMetrics.noShowRate,
        changePercent: calculateChangePercent(currentMetrics.noShowRate, previousMetrics.noShowRate),
        trend: determineTrend(currentMetrics.noShowRate, previousMetrics.noShowRate),
        status: determineStatus(currentMetrics.noShowRate, STATUS_THRESHOLDS.noShowRate.green, STATUS_THRESHOLDS.noShowRate.warning, false),
        unit: '%',
        format: 'percentage'
      },

      // FINANCIAL KPIs
      {
        id: 'total-revenue',
        name: 'Ingresos Totales',
        description: 'Facturación del período',
        type: 'FINANCIAL',
        value: currentMetrics.totalRevenue,
        previousValue: previousMetrics.totalRevenue,
        change: currentMetrics.totalRevenue - previousMetrics.totalRevenue,
        changePercent: calculateChangePercent(currentMetrics.totalRevenue, previousMetrics.totalRevenue),
        trend: determineTrend(currentMetrics.totalRevenue, previousMetrics.totalRevenue),
        status: determineTrend(currentMetrics.totalRevenue, previousMetrics.totalRevenue) === 'up'
          ? 'success'
          : 'warning',
        unit: '$',
        format: 'currency'
      },
      {
        id: 'revpah',
        name: 'RevPAH',
        description: 'Ingreso por hora disponible',
        type: 'FINANCIAL',
        value: currentMetrics.revPAH,
        previousValue: previousMetrics.revPAH,
        change: currentMetrics.revPAH - previousMetrics.revPAH,
        changePercent: calculateChangePercent(currentMetrics.revPAH, previousMetrics.revPAH),
        trend: determineTrend(currentMetrics.revPAH, previousMetrics.revPAH),
        status: determineTrend(currentMetrics.revPAH, previousMetrics.revPAH) === 'up'
          ? 'success'
          : 'neutral',
        unit: '$/h',
        format: 'currency'
      },
      {
        id: 'average-ticket',
        name: 'Ticket Promedio',
        description: 'Gasto promedio por reserva',
        type: 'FINANCIAL',
        value: currentMetrics.averageTicket,
        previousValue: previousMetrics.averageTicket,
        change: currentMetrics.averageTicket - previousMetrics.averageTicket,
        changePercent: calculateChangePercent(currentMetrics.averageTicket, previousMetrics.averageTicket),
        trend: determineTrend(currentMetrics.averageTicket, previousMetrics.averageTicket),
        status: determineTrend(currentMetrics.averageTicket, previousMetrics.averageTicket) === 'up'
          ? 'success'
          : 'neutral',
        unit: '$',
        format: 'currency'
      },

      // USER KPIs
      {
        id: 'active-users',
        name: 'Usuarios Activos',
        description: 'Usuarios con actividad en el período',
        type: 'USER',
        value: currentMetrics.activeUsers,
        previousValue: previousMetrics.activeUsers,
        change: currentMetrics.activeUsers - previousMetrics.activeUsers,
        changePercent: calculateChangePercent(currentMetrics.activeUsers, previousMetrics.activeUsers),
        trend: determineTrend(currentMetrics.activeUsers, previousMetrics.activeUsers),
        status: determineTrend(currentMetrics.activeUsers, previousMetrics.activeUsers) === 'up'
          ? 'success'
          : 'warning',
        format: 'number'
      },
      {
        id: 'retention-rate',
        name: 'Tasa de Retención',
        description: 'Porcentaje de usuarios que regresan',
        type: 'USER',
        value: currentMetrics.retentionRate,
        previousValue: previousMetrics.retentionRate,
        target: STATUS_THRESHOLDS.retentionRate.green,
        change: currentMetrics.retentionRate - previousMetrics.retentionRate,
        changePercent: calculateChangePercent(currentMetrics.retentionRate, previousMetrics.retentionRate),
        trend: determineTrend(currentMetrics.retentionRate, previousMetrics.retentionRate),
        status: determineStatus(currentMetrics.retentionRate, STATUS_THRESHOLDS.retentionRate.green, STATUS_THRESHOLDS.retentionRate.warning, true),
        unit: '%',
        format: 'percentage'
      }
    ];

    return kpis;
  } catch (error) {
    // Return KPIs without comparison data
    return generateKPIsWithoutComparison(currentMetrics);
  }
}

function generateKPIsWithoutComparison(metrics: DashboardMetrics): KPI[] {
  return [
    {
      id: 'occupancy-rate',
      name: 'Tasa de Ocupación',
      description: 'Porcentaje de horas reservadas vs disponibles',
      type: 'OPERATIONAL',
      value: metrics.occupancyRate,
      change: 0,
      changePercent: 0,
      trend: 'neutral',
      status: determineStatus(metrics.occupancyRate, STATUS_THRESHOLDS.occupancy.green, STATUS_THRESHOLDS.occupancy.warning, true),
      unit: '%',
      format: 'percentage'
    },
    {
      id: 'total-revenue',
      name: 'Ingresos Totales',
      description: 'Facturación del período',
      type: 'FINANCIAL',
      value: metrics.totalRevenue,
      change: 0,
      changePercent: 0,
      trend: 'neutral',
      status: 'neutral',
      unit: '$',
      format: 'currency'
    },
    {
      id: 'active-users',
      name: 'Usuarios Activos',
      description: 'Usuarios con actividad en el período',
      type: 'USER',
      value: metrics.activeUsers,
      change: 0,
      changePercent: 0,
      trend: 'neutral',
      status: 'neutral',
      format: 'number'
    }
  ];
}

// ============================================================================
// TREND DATA PROCESSORS
// ============================================================================

async function fetchOccupancyTrend(start: Date, end: Date): Promise<TimeSeriesData[]> {
  // Return empty array - API endpoint not available yet
  // TODO: Implement when occupancy trend endpoint is available from backend
  return [];
}

async function fetchRevenueTrend(start: Date, end: Date): Promise<TimeSeriesData[]> {
  // Return empty array - API endpoint not available yet
  // TODO: Implement when revenue trend endpoint is available from backend
  return [];
}

async function fetchUsersTrend(start: Date, end: Date): Promise<TimeSeriesData[]> {
  // Return empty array - API endpoint not available yet
  // TODO: Implement when users trend endpoint is available from backend
  return [];
}

// ============================================================================
// TOP COURTS PROCESSOR
// ============================================================================

function processTopCourts(topCourtsData: any[], reservations: any[]): CourtPerformance[] {
  return topCourtsData.slice(0, ANALYTICS_DEFAULTS.topCourtsLimit).map(court => {
    const courtReservations = reservations.filter(r => r.canchaId === court.id);
    const revenue = courtReservations.reduce((sum, r) => sum + Number(r.precio || 0), 0);

    return {
      id: court.id,
      name: court.nombre,
      sport: court.deporte?.nombre || 'N/A',
      occupancyRate: court.ocupacion || 0,
      revenue: roundTo(revenue, 2),
      reservations: courtReservations.length,
      averageRating: court.rating || 0
    };
  });
}

// ============================================================================
// HEATMAP PROCESSOR
// ============================================================================

function processHeatmap(occupancyData: any[]): HeatmapData {
  const days = TIME_CONFIG.dayLabels;
  const hours = Array.from({ length: ANALYTICS_DEFAULTS.hoursPerDay }, (_, i) => `${i + TIME_CONFIG.hourDisplayStart}:00`);

  // Initialize matrix with zeros
  const data: number[][] = Array(days.length).fill(0).map(() => Array(hours.length).fill(0));

  // Fill with actual data if available
  occupancyData.forEach((item: any) => {
    const dayIndex = item.dayOfWeek ? days.indexOf(item.dayOfWeek) : -1;
    const hourIndex = item.hour ? item.hour - TIME_CONFIG.hourDisplayStart : -1;

    if (dayIndex >= 0 && hourIndex >= 0 && hourIndex < hours.length) {
      data[dayIndex][hourIndex] = item.occupancy || 0;
    }
  });

  return {
    rows: days,
    columns: hours,
    data
  };
}
