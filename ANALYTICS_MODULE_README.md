# Analytics & Business Intelligence Module

Comprehensive Analytics and BI module for CanchaYa - Sports Court Booking Platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Components](#components)
- [Utilities](#utilities)
- [Pages](#pages)
- [Usage](#usage)
- [Development](#development)

---

## 🎯 Overview

The Analytics & BI Module provides administrators with powerful tools to monitor, analyze, and optimize their sports court operations through:

- **Real-time KPI Dashboard**: Track key metrics with live updates
- **Automated Alerts**: Configure custom alerts for critical metrics
- **Report Generation**: Create customizable reports in multiple formats
- **Trend Analysis**: Visualize historical data and identify patterns
- **User Segmentation**: RFM (Recency, Frequency, Monetary) analysis
- **Data Export**: Export data in CSV, Excel, JSON, and PDF formats

---

## ✨ Features

### 1. Dashboard Analytics (`/admin/dashboard`)

**Real-time KPI tracking with visual indicators:**
- Occupancy Rate
- Total Revenue
- Active Users
- Confirmed Reservations
- No-Show Rate
- RevPAH (Revenue per Available Hour)
- Retention Rate
- And more...

**Visual Components:**
- KPI Cards with sparklines and trend indicators
- Interactive charts (Line, Bar, Area, Pie)
- Occupancy heatmap by day/hour
- Top performing courts table

**Features:**
- Auto-refresh every 5 minutes
- Date range filtering
- Export capabilities
- Drill-down analysis

### 2. Alert System (`/admin/alertas`)

**Configurable automated alerts:**
- Monitor any metric with custom thresholds
- Multiple notification channels (Email, Push, SMS, In-app)
- Severity levels (Low, Medium, High, Critical)
- Cooldown periods to prevent spam
- Alert history tracking

**Use Cases:**
- Low occupancy warnings
- High no-show rates
- Revenue drops
- User churn risk
- Delinquency alerts

### 3. Report Generation (`/admin/reportes-analytics`)

**Create customizable reports:**

**Report Types:**
- **Operational**: Occupancy, reservations, peak hours
- **Financial**: Revenue, RevPAH, delinquency
- **User**: Active users, retention, segmentation
- **Competitive**: Rankings, challenges
- **Predictive**: Forecasts and trends

**Export Formats:**
- PDF (visual reports)
- Excel (detailed data)
- CSV (raw data)
- JSON (API integration)

**Features:**
- Custom date ranges
- Metric selection
- Chart/table inclusion
- Report history
- Quick report templates

### 4. User Segmentation (`/admin/segmentacion`)

**RFM Analysis:**
- **VIP**: >8 reservations/month
- **Regular**: 4-8 reservations/month
- **Occasional**: 1-3 reservations/month
- **Inactive**: 0 reservations last month
- **At Risk**: Declining activity
- **Champions**: High RFM score
- **New Customers**: Recently registered
- **Hibernating**: Long inactive period

**Insights:**
- Revenue contribution by segment
- Average ticket per segment
- Retention rates
- Lifetime Value (LTV)
- Strategic recommendations

---

## 🏗️ Architecture

```
analytics/
├── lib/analytics/              # Core utilities
│   ├── types.ts               # TypeScript definitions
│   ├── kpi-calculator.ts      # KPI calculation functions
│   ├── data-aggregator.ts     # Data fetching and aggregation
│   ├── formatters.ts          # Display formatters
│   ├── export.ts              # Export utilities
│   └── index.ts               # Main export
│
├── components/analytics/       # React components
│   ├── KPICard.tsx            # KPI display card
│   ├── AnalyticsChart.tsx     # Chart components
│   ├── AnalyticsFilters.tsx   # Filter components
│   ├── AlertConfig.tsx        # Alert configuration
│   ├── ReportBuilder.tsx      # Report builder
│   ├── TrendAnalysis.tsx      # Trend visualization
│   ├── UserSegmentation.tsx   # RFM segmentation
│   └── index.ts               # Component exports
│
└── app/admin/                  # Admin pages
    ├── dashboard/page.tsx     # Main analytics dashboard
    ├── alertas/page.tsx       # Alert management
    ├── reportes-analytics/    # Report generation
    └── segmentacion/page.tsx  # User segmentation
```

---

## 🧩 Components

### KPICard

Display key performance indicators with trend visualization.

```tsx
import { KPICard } from '@/components/analytics';

<KPICard
  kpi={{
    id: 'occupancy-rate',
    name: 'Tasa de Ocupación',
    value: 78.5,
    previousValue: 70.3,
    change: 8.2,
    changePercent: 11.7,
    trend: 'up',
    status: 'success',
    format: 'percentage',
    sparklineData: [60, 65, 70, 68, 75, 78, 78.5]
  }}
  onClick={() => console.log('KPI clicked')}
/>
```

### AnalyticsChart

Flexible chart component supporting multiple chart types.

```tsx
import { AnalyticsChart } from '@/components/analytics';

<AnalyticsChart
  title="Revenue Trend"
  type="area"
  data={[
    { name: 'Jan', value: 12000 },
    { name: 'Feb', value: 15000 },
    { name: 'Mar', value: 18000 }
  ]}
  dataKeys={[
    { key: 'value', label: 'Revenue', color: '#3b82f6', format: 'currency' }
  ]}
  height={300}
/>
```

### AlertConfig

Configure custom alerts with thresholds and notifications.

```tsx
import { AlertConfig } from '@/components/analytics';

<AlertConfig
  onSave={(alertData) => console.log('Alert saved:', alertData)}
  onCancel={() => console.log('Cancelled')}
/>
```

### UserSegmentation

Display RFM segmentation analysis.

```tsx
import { UserSegmentation } from '@/components/analytics';

<UserSegmentation
  segmentData={[
    {
      segment: 'VIP',
      count: 147,
      percentage: 12,
      revenue: 98140,
      averageTicket: 667,
      averageFrequency: 11.3,
      retentionRate: 98.6,
      lifetimeValue: 87500
    }
    // ... more segments
  ]}
/>
```

---

## 🛠️ Utilities

### KPI Calculators

```typescript
import {
  calculateOccupancyRate,
  calculateRevPAH,
  calculateRetentionRate,
  calculateLTV
} from '@/lib/analytics';

// Calculate occupancy
const occupancy = calculateOccupancyRate(reservedHours, availableHours);

// Calculate Revenue per Available Hour
const revpah = calculateRevPAH(totalRevenue, availableHours);

// Calculate retention
const currentUsers = new Set(['user1', 'user2', 'user3']);
const previousUsers = new Set(['user1', 'user2']);
const retention = calculateRetentionRate(currentUsers, previousUsers);

// Calculate Customer Lifetime Value
const ltv = calculateLTV(averageTicket, monthlyFrequency, lifetimeMonths);
```

### Formatters

```typescript
import {
  formatCurrency,
  formatPercentage,
  formatNumber,
  formatChangePercent,
  formatRelativeTime
} from '@/lib/analytics';

formatCurrency(1234.56);        // "$1.234,56"
formatPercentage(78.5);         // "78,5%"
formatNumber(1000000);          // "1.000.000"
formatChangePercent(15.5);      // "+15,5%"
formatRelativeTime(new Date()); // "hace un momento"
```

### Data Aggregation

```typescript
import { fetchDashboardData } from '@/lib/analytics';

// Fetch all dashboard data
const data = await fetchDashboardData(
  clubId,
  startDate,
  endDate
);

// Returns:
// {
//   metrics: DashboardMetrics,
//   kpis: KPI[],
//   trends: { occupancy, revenue, users },
//   topCourts: CourtPerformance[],
//   heatmap: HeatmapData
// }
```

### Export Functions

```typescript
import {
  downloadCSV,
  downloadExcel,
  downloadJSON,
  exportChartAsPNG
} from '@/lib/analytics';

// Export data as CSV
downloadCSV(data, 'reporte.csv');

// Export as Excel
downloadExcel(data, 'reporte.xlsx', 'Sheet1');

// Export as JSON
downloadJSON(data, 'data.json');

// Export chart as image
exportChartAsPNG('chart-id', 'chart.png');
```

---

## 📄 Pages

### Dashboard Analytics

**Route**: `/admin/dashboard`

**Features**:
- 8+ KPI cards with real-time data
- Occupancy trend chart (30 days)
- Court distribution bar chart
- Occupancy heatmap (day × hour)
- Top courts performance table
- Auto-refresh every 5 minutes
- Date range filters
- Export capabilities

### Alert Management

**Route**: `/admin/alertas`

**Features**:
- List all configured alerts
- Create new alerts with custom thresholds
- Edit existing alerts
- Enable/disable alerts
- View alert history
- Test alert notifications

### Report Generation

**Route**: `/admin/reportes-analytics`

**Features**:
- Report builder with custom parameters
- Multiple report types (Operational, Financial, User, Competitive, Predictive)
- Export in PDF, Excel, CSV, HTML
- Report history with download links
- Quick report templates

### User Segmentation

**Route**: `/admin/segmentacion`

**Features**:
- RFM segmentation analysis
- Segment comparison
- Revenue contribution by segment
- Retention rates per segment
- LTV calculations
- Strategic action recommendations
- Export segment data

---

## 🚀 Usage

### Basic Setup

1. **Import utilities**:
```typescript
import { fetchDashboardData, formatCurrency } from '@/lib/analytics';
```

2. **Fetch data**:
```typescript
const data = await fetchDashboardData();
```

3. **Display components**:
```tsx
import { KPIGrid, AnalyticsChart } from '@/components/analytics';

<KPIGrid kpis={data.kpis} columns={4} />
<AnalyticsChart
  title="Occupancy Trend"
  type="area"
  data={data.trends.occupancy}
  dataKeys={[{ key: 'value', label: 'Occupancy', color: '#3b82f6' }]}
/>
```

### Creating Custom KPIs

```typescript
import { calculateMean, determineStatus, determineTrend } from '@/lib/analytics';

const customKPI = {
  id: 'custom-metric',
  name: 'Custom Metric',
  value: currentValue,
  previousValue: lastMonthValue,
  change: currentValue - lastMonthValue,
  changePercent: ((currentValue - lastMonthValue) / lastMonthValue) * 100,
  trend: determineTrend(currentValue, lastMonthValue),
  status: determineStatus(currentValue, 75, 60, true),
  format: 'number' as const
};
```

### Configuring Alerts

```typescript
const alertConfig = {
  name: 'Low Occupancy Alert',
  metricId: 'occupancy-rate',
  condition: '<',
  threshold: 50,
  severity: 'HIGH',
  channels: ['EMAIL', 'PUSH'],
  cooldownMinutes: 30,
  active: true
};
```

---

## 💻 Development

### Adding New KPIs

1. **Define KPI calculation function** in `lib/analytics/kpi-calculator.ts`:
```typescript
export function calculateNewMetric(data: DataType): number {
  // Your calculation logic
  return result;
}
```

2. **Update data aggregator** in `lib/analytics/data-aggregator.ts`:
```typescript
const newMetric = calculateNewMetric(rawData);
```

3. **Add KPI to dashboard**:
```typescript
const newKPI: KPI = {
  id: 'new-metric',
  name: 'New Metric',
  value: newMetric,
  // ... other properties
};
```

### Adding New Chart Types

Extend `AnalyticsChart` component:
```tsx
{type === 'scatter' && (
  <ScatterChart data={data}>
    {/* Scatter chart configuration */}
  </ScatterChart>
)}
```

### Custom Formatters

Add to `lib/analytics/formatters.ts`:
```typescript
export function customFormat(value: number): string {
  // Your formatting logic
  return formatted;
}
```

---

## 📊 Key Metrics Reference

### Operational KPIs

| Metric | Formula | Target |
|--------|---------|--------|
| Occupancy Rate | (Reserved Hours / Available Hours) × 100 | > 75% |
| Confirmation Rate | (Confirmed / Total Reservations) × 100 | > 90% |
| No-Show Rate | (No Shows / Total Reservations) × 100 | < 10% |
| Avg Reservations/Day | Total Reservations / Days | Trend ↑ |

### Financial KPIs

| Metric | Formula | Target |
|--------|---------|--------|
| Total Revenue | SUM(paid_amounts) | Trend ↑ |
| RevPAH | Revenue / Available Hours | Maximize |
| Average Ticket | Revenue / Reservations | Trend ↑ |
| Delinquency Rate | (Pending / Expected) × 100 | < 5% |
| Collection Rate | (Paid / Billed) × 100 | > 95% |

### User KPIs

| Metric | Formula | Target |
|--------|---------|--------|
| Active Users | COUNT(users with recent activity) | Trend ↑ |
| Retention Rate | (Current ∩ Previous) / Previous × 100 | > 80% |
| New Users | COUNT(new registrations) | > 50/month |
| Avg Frequency | AVG(reservations_per_user) | > 3/month |
| LTV | Ticket × Frequency × Lifetime Months | Maximize |

---

## 🎨 Theming

The module supports light/dark themes via Tailwind CSS and `next-themes`.

Custom theme colors can be configured in `tailwind.config.js`:
```javascript
{
  theme: {
    extend: {
      colors: {
        primary: {...},
        secondary: {...},
        // Add custom colors
      }
    }
  }
}
```

---

## 🧪 Testing

### Unit Tests

```bash
npm test lib/analytics/
```

### Component Tests

```bash
npm test components/analytics/
```

### E2E Tests

```bash
npm run test:e2e -- --grep "Analytics"
```

---

## 📝 Notes

- All monetary values are in Argentine Pesos (ARS)
- Dates use `es-AR` locale
- Charts use Recharts library
- Export functions work client-side (no server required)
- LocalStorage used for alert/report history (use API in production)

---

## 🤝 Contributing

When adding new features to the Analytics module:

1. Add TypeScript types in `lib/analytics/types.ts`
2. Implement calculation logic in appropriate utility file
3. Create reusable components in `components/analytics/`
4. Update this documentation
5. Add unit tests
6. Update the CLAUDE.md file if needed

---

## 📚 References

- [Requirements Document](./requirements-analytics.md)
- [CLAUDE.md](./CLAUDE.md) - Project conventions
- [Recharts Documentation](https://recharts.org/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Version**: 1.0.0
**Last Updated**: November 2024
**Author**: CanchaYa Development Team
