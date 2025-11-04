'use client';

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatChartTooltip, formatChartAxis } from '@/lib/analytics/formatters';
import { exportChartAsPNG } from '@/lib/analytics/export';

type ChartType = 'line' | 'bar' | 'area' | 'pie';

interface ChartDataPoint {
  [key: string]: string | number;
}

interface AnalyticsChartProps {
  title: string;
  description?: string;
  type: ChartType;
  data: ChartDataPoint[];
  dataKeys: Array<{
    key: string;
    label: string;
    color?: string;
    format?: 'number' | 'currency' | 'percentage';
  }>;
  xAxisKey?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  showExport?: boolean;
  chartId?: string;
  className?: string;
}

const COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
];

export function AnalyticsChart({
  title,
  description,
  type,
  data,
  dataKeys,
  xAxisKey = 'name',
  height = 300,
  showLegend = true,
  showGrid = true,
  showExport = true,
  chartId,
  className
}: AnalyticsChartProps) {
  const handleExport = () => {
    if (chartId) {
      exportChartAsPNG(chartId, `${title.toLowerCase().replace(/\s+/g, '-')}.png`);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {showExport && (
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        )}
      </CardHeader>

      <CardContent>
        <div id={chartId} className="w-full">
          <ResponsiveContainer width="100%" height={height}>
            {type === 'line' && (
              <LineChart data={data}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
                <XAxis
                  dataKey={xAxisKey}
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatChartAxis(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                {showLegend && <Legend />}
                {dataKeys.map((dk, index) => (
                  <Line
                    key={dk.key}
                    type="monotone"
                    dataKey={dk.key}
                    name={dk.label}
                    stroke={dk.color || COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            )}

            {type === 'bar' && (
              <BarChart data={data}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
                <XAxis
                  dataKey={xAxisKey}
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatChartAxis(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                {showLegend && <Legend />}
                {dataKeys.map((dk, index) => (
                  <Bar
                    key={dk.key}
                    dataKey={dk.key}
                    name={dk.label}
                    fill={dk.color || COLORS[index % COLORS.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            )}

            {type === 'area' && (
              <AreaChart data={data}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
                <XAxis
                  dataKey={xAxisKey}
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatChartAxis(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                {showLegend && <Legend />}
                {dataKeys.map((dk, index) => (
                  <Area
                    key={dk.key}
                    type="monotone"
                    dataKey={dk.key}
                    name={dk.label}
                    stroke={dk.color || COLORS[index % COLORS.length]}
                    fill={dk.color || COLORS[index % COLORS.length]}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            )}

            {type === 'pie' && (
              <PieChart>
                <Pie
                  data={data}
                  dataKey={dataKeys[0].key}
                  nameKey={xAxisKey}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry[xAxisKey]}: ${entry[dataKeys[0].key]}`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                {showLegend && <Legend />}
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Custom Tooltip Component
function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
      {label && (
        <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
      )}
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600">{entry.name}:</span>
          <span className="text-sm font-medium text-gray-900">
            {formatChartTooltip(entry.value as number, 'number')}
          </span>
        </div>
      ))}
    </div>
  );
}

// Quick Chart Presets

interface TimeSeriesChartProps {
  title: string;
  data: Array<{ timestamp: string | Date; value: number }>;
  height?: number;
  format?: 'number' | 'currency' | 'percentage';
}

export function TimeSeriesChart({ title, data, height = 300, format = 'number' }: TimeSeriesChartProps) {
  const formattedData = data.map(d => ({
    name: typeof d.timestamp === 'string' ? d.timestamp : d.timestamp.toLocaleDateString(),
    value: d.value
  }));

  return (
    <AnalyticsChart
      title={title}
      type="area"
      data={formattedData}
      dataKeys={[{ key: 'value', label: 'Valor', color: '#3b82f6', format }]}
      height={height}
    />
  );
}

interface ComparisonChartProps {
  title: string;
  data: Array<{ category: string; value1: number; value2: number }>;
  label1: string;
  label2: string;
  height?: number;
}

export function ComparisonChart({ title, data, label1, label2, height = 300 }: ComparisonChartProps) {
  return (
    <AnalyticsChart
      title={title}
      type="bar"
      data={data}
      dataKeys={[
        { key: 'value1', label: label1, color: '#3b82f6' },
        { key: 'value2', label: label2, color: '#10b981' }
      ]}
      xAxisKey="category"
      height={height}
    />
  );
}

interface DistributionChartProps {
  title: string;
  data: Array<{ name: string; value: number }>;
  height?: number;
}

export function DistributionChart({ title, data, height = 300 }: DistributionChartProps) {
  return (
    <AnalyticsChart
      title={title}
      type="pie"
      data={data}
      dataKeys={[{ key: 'value', label: 'Valor' }]}
      height={height}
    />
  );
}
