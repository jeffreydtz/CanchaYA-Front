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
import { CHART_CONFIG, COLOR_PALETTES } from '@/lib/analytics/config';

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

const COLORS = COLOR_PALETTES.chart;

export function AnalyticsChart({
  title,
  description,
  type,
  data,
  dataKeys,
  xAxisKey = 'name',
  height = CHART_CONFIG.defaultHeight,
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

  // Validate data and dataKeys
  const validData = Array.isArray(data) ? data.filter(d => d !== null && d !== undefined) : []
  const validDataKeys = Array.isArray(dataKeys) ? dataKeys.filter(dk => dk && dk.key) : []

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

      <CardContent className="pt-6">
        <div id={chartId} className="w-full">
          {(!validData || validData.length === 0 || validDataKeys.length === 0) ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No hay datos disponibles
            </div>
          ) : (
            <>
          {type === 'line' && (
            <ResponsiveContainer width="100%" height={height}>
              <LineChart data={validData}>
                {showGrid && <CartesianGrid strokeDasharray={CHART_CONFIG.grid.strokeDasharray} stroke={CHART_CONFIG.grid.color} />}
                <XAxis
                  dataKey={xAxisKey}
                  stroke={CHART_CONFIG.axis.strokeColor}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={CHART_CONFIG.axis.strokeColor}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatChartAxis(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                {showLegend && <Legend />}
                {validDataKeys.map((dk, index) => (
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
            </ResponsiveContainer>
          )}

          {type === 'bar' && (
            <ResponsiveContainer width="100%" height={height}>
              <BarChart data={validData}>
                {showGrid && <CartesianGrid strokeDasharray={CHART_CONFIG.grid.strokeDasharray} stroke={CHART_CONFIG.grid.color} />}
                <XAxis
                  dataKey={xAxisKey}
                  stroke={CHART_CONFIG.axis.strokeColor}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={CHART_CONFIG.axis.strokeColor}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatChartAxis(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                {showLegend && <Legend />}
                {validDataKeys.map((dk, index) => (
                  <Bar
                    key={dk.key}
                    dataKey={dk.key}
                    name={dk.label}
                    fill={dk.color || COLORS[index % COLORS.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}

          {type === 'area' && (
            <ResponsiveContainer width="100%" height={height}>
              <AreaChart data={validData}>
                {showGrid && <CartesianGrid strokeDasharray={CHART_CONFIG.grid.strokeDasharray} stroke={CHART_CONFIG.grid.color} />}
                <XAxis
                  dataKey={xAxisKey}
                  stroke={CHART_CONFIG.axis.strokeColor}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={CHART_CONFIG.axis.strokeColor}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatChartAxis(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                {showLegend && <Legend />}
                {validDataKeys.map((dk, index) => (
                  <Area
                    key={dk.key}
                    type="monotone"
                    dataKey={dk.key}
                    name={dk.label}
                    stroke={dk.color || COLORS[index % COLORS.length]}
                    fill={dk.color || COLORS[index % COLORS.length]}
                    fillOpacity={CHART_CONFIG.areaChartFillOpacity}
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          )}

          {type === 'pie' && validDataKeys.length > 0 && (
            <ResponsiveContainer width="100%" height={height}>
              <PieChart>
                <Pie
                  data={validData}
                  dataKey={validDataKeys[0].key}
                  nameKey={xAxisKey}
                  cx={CHART_CONFIG.pieChart.cx}
                  cy={CHART_CONFIG.pieChart.cy}
                  outerRadius={CHART_CONFIG.pieChart.outerRadius}
                  label={(entry: any) => `${entry[xAxisKey]}: ${entry[validDataKeys[0].key]}`}
                >
                  {validData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                {showLegend && <Legend />}
              </PieChart>
            </ResponsiveContainer>
          )}
          </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Custom Tooltip Component
function CustomTooltip(props: any) {
  const { active, payload, label } = props;
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
      {label && (
        <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
      )}
      {payload.map((entry: any, index: number) => (
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

export function TimeSeriesChart({ title, data, height = CHART_CONFIG.defaultHeight, format = 'number' }: TimeSeriesChartProps) {
  const formattedData = data.map(d => ({
    name: typeof d.timestamp === 'string' ? d.timestamp : d.timestamp.toLocaleDateString(),
    value: d.value
  }));

  return (
    <AnalyticsChart
      title={title}
      type="area"
      data={formattedData}
      dataKeys={[{ key: 'value', label: 'Valor', color: COLOR_PALETTES.comparison.primary, format }]}
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

export function ComparisonChart({ title, data, label1, label2, height = CHART_CONFIG.defaultHeight }: ComparisonChartProps) {
  return (
    <AnalyticsChart
      title={title}
      type="bar"
      data={data}
      dataKeys={[
        { key: 'value1', label: label1, color: COLOR_PALETTES.comparison.primary },
        { key: 'value2', label: label2, color: COLOR_PALETTES.comparison.secondary }
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

export function DistributionChart({ title, data, height = CHART_CONFIG.defaultHeight }: DistributionChartProps) {
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
