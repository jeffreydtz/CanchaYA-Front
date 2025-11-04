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
    const start = startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

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
    console.error('Error fetching dashboard data:', error);
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
  const response = await apiClient.getReporteCanchasTop();

  if (response.error || !response.data) {
    return [];
  }

  return response.data;
}

async function fetchOccupancyHourly() {
  const response = await apiClient.getReporteOcupacionHorarios();

  if (response.error || !response.data) {
    return [];
  }

  return response.data;
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
  const hoursPerDay = 14; // Assuming courts open 10am-12am (14 hours)
  const availableHours = courts.length * hoursPerDay * daysDiff;

  // Calculate reserved hours (assuming 1 hour per reservation on average)
  const reservedHours = totalReservations;

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
    .slice(0, 3)
    .map(([hour]) => `${hour}:00`);

  // FINANCIAL METRICS
  const payments = reservations.map(r => ({
    monto: r.precio || 0,
    estado: r.estado === 'CONFIRMADA' ? 'PAGADO' : 'PENDIENTE'
  }));

  const totalRevenue = calculateTotalRevenue(payments);
  const revPAH = calculateRevPAH(totalRevenue, availableHours);
  const averageTicket = calculateAverageTicket(totalRevenue, totalReservations);

  const pendingPayments = payments
    .filter(p => p.estado === 'PENDIENTE')
    .reduce((sum, p) => sum + p.monto, 0);

  const expectedRevenue = payments.reduce((sum, p) => sum + p.monto, 0);

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
  const averageLifetimeMonths = 18; // Assumption: average user lifetime is 18 months
  const lifetimeValue = averageTicket * averageFrequency * averageLifetimeMonths;

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
        target: 75,
        change: currentMetrics.occupancyRate - previousMetrics.occupancyRate,
        changePercent: calculateChangePercent(currentMetrics.occupancyRate, previousMetrics.occupancyRate),
        trend: determineTrend(currentMetrics.occupancyRate, previousMetrics.occupancyRate),
        status: determineStatus(currentMetrics.occupancyRate, 75, 60, true),
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
        target: 10,
        change: currentMetrics.noShowRate - previousMetrics.noShowRate,
        changePercent: calculateChangePercent(currentMetrics.noShowRate, previousMetrics.noShowRate),
        trend: determineTrend(currentMetrics.noShowRate, previousMetrics.noShowRate),
        status: determineStatus(currentMetrics.noShowRate, 10, 15, false),
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
        target: 80,
        change: currentMetrics.retentionRate - previousMetrics.retentionRate,
        changePercent: calculateChangePercent(currentMetrics.retentionRate, previousMetrics.retentionRate),
        trend: determineTrend(currentMetrics.retentionRate, previousMetrics.retentionRate),
        status: determineStatus(currentMetrics.retentionRate, 80, 70, true),
        unit: '%',
        format: 'percentage'
      }
    ];

    return kpis;
  } catch (error) {
    console.error('Error calculating KPIs:', error);
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
      status: determineStatus(metrics.occupancyRate, 75, 60, true),
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
  // Simplified - generate mock trend data
  // In production, fetch from API or calculate from reservations
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const data: TimeSeriesData[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    data.push({
      timestamp: date,
      value: Math.random() * 30 + 60, // Random value between 60-90
      label: date.toLocaleDateString()
    });
  }

  return data;
}

async function fetchRevenueTrend(start: Date, end: Date): Promise<TimeSeriesData[]> {
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const data: TimeSeriesData[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    data.push({
      timestamp: date,
      value: Math.random() * 5000 + 3000, // Random value between 3000-8000
      label: date.toLocaleDateString()
    });
  }

  return data;
}

async function fetchUsersTrend(start: Date, end: Date): Promise<TimeSeriesData[]> {
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const data: TimeSeriesData[] = [];

  let baseValue = 1000;

  for (let i = 0; i < days; i++) {
    const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    baseValue += Math.random() * 10 - 3; // Slight growth over time
    data.push({
      timestamp: date,
      value: Math.floor(baseValue),
      label: date.toLocaleDateString()
    });
  }

  return data;
}

// ============================================================================
// TOP COURTS PROCESSOR
// ============================================================================

function processTopCourts(topCourtsData: any[], reservations: any[]): CourtPerformance[] {
  return topCourtsData.slice(0, 5).map(court => {
    const courtReservations = reservations.filter(r => r.canchaId === court.id);
    const revenue = courtReservations.reduce((sum, r) => sum + (r.precio || 0), 0);

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
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const hours = Array.from({ length: 14 }, (_, i) => `${i + 10}:00`); // 10am-12am

  // Initialize matrix with zeros
  const data: number[][] = Array(7).fill(0).map(() => Array(14).fill(0));

  // Fill with actual data if available
  occupancyData.forEach((item: any) => {
    const dayIndex = item.dayOfWeek ? days.indexOf(item.dayOfWeek) : -1;
    const hourIndex = item.hour ? item.hour - 10 : -1;

    if (dayIndex >= 0 && hourIndex >= 0 && hourIndex < 14) {
      data[dayIndex][hourIndex] = item.occupancy || 0;
    }
  });

  return {
    rows: days,
    columns: hours,
    data
  };
}
