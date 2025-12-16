/**
 * Analytics & BI Module - Type Definitions
 * Defines all types used across the analytics module
 */

// ============================================================================
// KPI & METRICS TYPES
// ============================================================================

export type MetricType =
  | 'OPERATIONAL'
  | 'FINANCIAL'
  | 'USER'
  | 'COMPETITIVE';

export type MetricPeriod = 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';

export type TrendDirection = 'up' | 'down' | 'neutral';

export type MetricStatus = 'success' | 'warning' | 'danger' | 'neutral';

export interface MetricValue {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  trend: TrendDirection;
  status: MetricStatus;
  unit?: string;
  format?: 'number' | 'currency' | 'percentage';
}

export interface KPI {
  id: string;
  name: string;
  description: string;
  type: MetricType;
  value: number;
  previousValue?: number;
  target?: number;
  change: number;
  changePercent: number;
  trend: TrendDirection;
  status: MetricStatus;
  sparklineData?: number[];
  unit?: string;
  format: 'number' | 'currency' | 'percentage';
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface DashboardMetrics {
  // Operational KPIs
  occupancyRate: number;
  confirmedReservations: number;
  noShowRate: number;
  averageReservationsPerDay: number;
  peakHours: string[];

  // Financial KPIs
  totalRevenue: number;
  revPAH: number; // Revenue per Available Hour
  averageTicket: number;
  delinquencyRate: number;
  collectionRate: number;

  // User KPIs
  activeUsers: number;
  newUsers: number;
  retentionRate: number;
  averageFrequency: number;
  lifetimeValue: number;

  // Metadata
  period: {
    start: Date;
    end: Date;
  };
  lastUpdated: Date;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  kpis: KPI[];
  trends: {
    occupancy: TimeSeriesData[];
    revenue: TimeSeriesData[];
    users: TimeSeriesData[];
  };
  topCourts: CourtPerformance[];
  heatmap: HeatmapData;
}

// ============================================================================
// CHART & VISUALIZATION TYPES
// ============================================================================

export interface TimeSeriesData {
  timestamp: Date | string;
  value: number;
  label?: string;
}

export interface CategoryData {
  category: string;
  value: number;
  percentage?: number;
  color?: string;
}

export interface HeatmapData {
  rows: string[]; // Days of week
  columns: string[]; // Hours
  data: number[][];  // Matrix of values
}

export interface CourtPerformance {
  id: string;
  name: string;
  sport: string;
  occupancyRate: number;
  revenue: number;
  reservations: number;
  averageRating?: number;
}

// ============================================================================
// ALERT TYPES
// ============================================================================

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AlertCondition = '>' | '<' | '=' | '>=' | '<=' | 'between';

export type AlertChannel = 'EMAIL' | 'PUSH' | 'SMS' | 'IN_APP';

export type EmailTemplate =
  | 'METRIC_THRESHOLD'
  | 'ANOMALY_DETECTED'
  | 'CRITICAL_ALERT'
  | 'DAILY_SUMMARY'
  | 'WEEKLY_REPORT';

export interface EmailConfig {
  enabled: boolean;
  recipients: string[];
  cc?: string[];
  bcc?: string[];
  template: EmailTemplate;
  includeChart?: boolean;
  includeHistoricalData?: boolean;
  customSubject?: string;
  customMessage?: string;
}

export interface Alert {
  id: string;
  name: string;
  description?: string;
  metricId: string;
  metricName: string;
  condition: AlertCondition;
  threshold: number | [number, number];
  severity: AlertSeverity;
  channels: AlertChannel[];
  emailConfig?: EmailConfig;
  active: boolean;
  cooldownMinutes: number;
  lastTriggered?: Date;
  lastValue?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertTrigger {
  alertId: string;
  alert: Alert;
  triggeredAt: Date;
  value: number;
  previousValue?: number;
  message: string;
  emailSent?: boolean;
  emailError?: string;
}

export interface EmailNotification {
  id: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  template: EmailTemplate;
  templateData: Record<string, any>;
  sentAt?: Date;
  status: 'pending' | 'sent' | 'failed' | 'queued';
  error?: string;
  retryCount?: number;
}

// ============================================================================
// REPORT TYPES
// ============================================================================

export type ReportType =
  | 'OPERATIONAL'
  | 'FINANCIAL'
  | 'USER'
  | 'COMPETITIVE'
  | 'PREDICTIVE';

export type ReportFormat = 'PDF' | 'EXCEL' | 'CSV' | 'HTML';

export interface ReportConfig {
  type: ReportType;
  name: string;
  description?: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: string[];
  includeCharts: boolean;
  includeTables: boolean;
  format: ReportFormat;
  scheduledDelivery?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    recipients: string[];
  };
}

export interface Report {
  id: string;
  name: string;
  type: ReportType;
  config: ReportConfig;
  generatedAt: Date;
  downloadUrl?: string;
  expiresAt?: Date;
}

// ============================================================================
// ANALYTICS FILTER TYPES
// ============================================================================

export interface DateRangeFilter {
  start: Date;
  end: Date;
  preset?: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'custom';
}

export interface AnalyticsFilters {
  dateRange: DateRangeFilter;
  sportIds?: string[];
  clubIds?: string[];
  courtIds?: string[];
  userSegment?: UserSegment;
}

// ============================================================================
// USER SEGMENTATION TYPES
// ============================================================================

export type UserSegment =
  | 'VIP'           // >8 reservations/month
  | 'REGULAR'       // 4-8 reservations/month
  | 'OCCASIONAL'    // 1-3 reservations/month
  | 'INACTIVE'      // 0 reservations last month
  | 'AT_RISK'       // Declining activity
  | 'CHAMPIONS'     // High RFM score
  | 'NEW_CUSTOMERS' // Recently registered
  | 'HIBERNATING'   // Long inactive period
  | 'ALL';

export interface UserSegmentData {
  segment: UserSegment;
  count: number;
  percentage: number;
  revenue: number;
  averageTicket: number;
  averageFrequency: number;
  retentionRate: number;
  lifetimeValue: number;
}

export interface RFMScore {
  userId: string;
  recency: number;      // Days since last reservation
  frequency: number;    // Number of reservations
  monetary: number;     // Total spent
  rScore: 1 | 2 | 3 | 4;
  fScore: 1 | 2 | 3 | 4;
  mScore: 1 | 2 | 3 | 4;
  segment: UserSegment;
}

// ============================================================================
// PREDICTION & ML TYPES
// ============================================================================

export interface Prediction {
  id: string;
  metricId: string;
  metricName: string;
  modelUsed: 'ARIMA' | 'Prophet' | 'LinearRegression';
  horizonDays: number;
  predictions: TimeSeriesData[];
  confidenceIntervals: {
    lower: number[];
    upper: number[];
  };
  accuracy: number; // MAPE (Mean Absolute Percentage Error)
  generatedAt: Date;
  validUntil: Date;
}

export interface Anomaly {
  id: string;
  metricId: string;
  metricName: string;
  detectedAt: Date;
  value: number;
  expectedValue: number;
  deviation: number;
  zScore: number;
  severity: AlertSeverity;
  method: 'Z_SCORE' | 'IQR' | 'ISOLATION_FOREST';
}

// ============================================================================
// COMPARISON TYPES
// ============================================================================

export interface PeriodComparison {
  metric: string;
  period1: {
    label: string;
    value: number;
    data?: TimeSeriesData[];
  };
  period2: {
    label: string;
    value: number;
    data?: TimeSeriesData[];
  };
  change: number;
  changePercent: number;
  trend: TrendDirection;
}

// ============================================================================
// DRILL-DOWN TYPES
// ============================================================================

export interface DrillDownDimension {
  name: string;
  type: 'court' | 'sport' | 'day' | 'hour' | 'user';
  values: Array<{
    label: string;
    value: number;
    percentage: number;
  }>;
}

export interface DrillDownData {
  metric: string;
  value: number;
  dimensions: DrillDownDimension[];
  insights: string[];
  recommendations: string[];
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export interface ExportOptions {
  format?: 'CSV' | 'EXCEL' | 'PDF' | 'JSON';
  filename?: string;
  includeHeaders?: boolean;
  includeMetadata?: boolean;
}

export interface ExportResult {
  success: boolean;
  filename: string;
  downloadUrl?: string;
  error?: string;
}
