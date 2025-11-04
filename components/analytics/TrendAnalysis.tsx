'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { AnalyticsChart } from './AnalyticsChart';
import type { TimeSeriesData } from '@/lib/analytics/types';
import { calculateLinearTrend, calculateMean, calculateStandardDeviation } from '@/lib/analytics/kpi-calculator';
import { formatNumber, formatPercentage } from '@/lib/analytics/formatters';
import { cn } from '@/lib/utils';

interface TrendAnalysisProps {
  title: string;
  description?: string;
  data: TimeSeriesData[];
  format?: 'number' | 'currency' | 'percentage';
  className?: string;
}

export function TrendAnalysis({
  title,
  description,
  data,
  format = 'number',
  className
}: TrendAnalysisProps) {
  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">
            No hay datos suficientes para analizar
          </p>
        </CardContent>
      </Card>
    );
  }

  // Extract values
  const values = data.map(d => d.value);

  // Calculate statistics
  const mean = calculateMean(values);
  const stdDev = calculateStandardDeviation(values);
  const { slope, intercept } = calculateLinearTrend(values);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min;
  const variationCoeff = (stdDev / mean) * 100;

  // Determine trend direction
  const trendDirection = slope > 0.05 ? 'up' : slope < -0.05 ? 'down' : 'neutral';
  const TrendIcon = trendDirection === 'up' ? TrendingUp : trendDirection === 'down' ? TrendingDown : Minus;

  // Calculate percentage change from first to last
  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  const totalChange = lastValue - firstValue;
  const totalChangePercent = (totalChange / firstValue) * 100;

  // Add trend line to chart data
  const chartData = data.map((d, index) => ({
    name: typeof d.timestamp === 'string' ? d.timestamp : d.timestamp.toLocaleDateString(),
    value: d.value,
    trend: slope * index + intercept
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Chart */}
        <AnalyticsChart
          title=""
          type="line"
          data={chartData}
          dataKeys={[
            { key: 'value', label: 'Valor Real', color: '#3b82f6' },
            { key: 'trend', label: 'Tendencia', color: '#9ca3af' }
          ]}
          height={300}
          showLegend={true}
          showExport={false}
        />

        {/* Statistics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <StatItem
            label="Media"
            value={formatNumber(mean, 2)}
            format={format}
          />
          <StatItem
            label="Máximo"
            value={formatNumber(max, 2)}
            format={format}
          />
          <StatItem
            label="Mínimo"
            value={formatNumber(min, 2)}
            format={format}
          />
          <StatItem
            label="Desv. Est."
            value={formatNumber(stdDev, 2)}
            format={format}
          />
        </div>

        {/* Trend Analysis */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Análisis de Tendencia</h4>
            <div className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium',
              trendDirection === 'up' ? 'bg-green-100 text-green-800' :
              trendDirection === 'down' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            )}>
              <TrendIcon className="h-4 w-4" />
              <span>
                {trendDirection === 'up' ? 'Creciente' :
                 trendDirection === 'down' ? 'Decreciente' :
                 'Estable'}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Cambio total:</span>
              <span className={cn(
                'font-medium',
                totalChange > 0 ? 'text-green-600' : totalChange < 0 ? 'text-red-600' : 'text-gray-600'
              )}>
                {totalChange > 0 ? '+' : ''}{formatNumber(totalChange, 2)} ({formatPercentage(totalChangePercent, 2)})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Variabilidad:</span>
              <span className="font-medium text-gray-900">
                {formatPercentage(variationCoeff, 1)} (Coef. Variación)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rango:</span>
              <span className="font-medium text-gray-900">
                {formatNumber(range, 2)} ({formatNumber(min, 2)} - {formatNumber(max, 2)})
              </span>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">💡 Insights</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {generateInsights(trendDirection, totalChangePercent, variationCoeff, values)}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

// Stat Item Component
interface StatItemProps {
  label: string;
  value: string;
  format: 'number' | 'currency' | 'percentage';
}

function StatItem({ label, value, format }: StatItemProps) {
  const prefix = format === 'currency' ? '$' : '';
  const suffix = format === 'percentage' ? '%' : '';

  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-gray-900">
        {prefix}{value}{suffix}
      </p>
    </div>
  );
}

// Generate insights based on trend data
function generateInsights(
  trend: 'up' | 'down' | 'neutral',
  changePercent: number,
  variationCoeff: number,
  values: number[]
): React.ReactNode[] {
  const insights: React.ReactNode[] = [];

  // Trend insight
  if (trend === 'up') {
    insights.push(
      <li key="trend">
        • Tendencia <strong>positiva</strong> con crecimiento del {formatPercentage(Math.abs(changePercent), 1)}
      </li>
    );
  } else if (trend === 'down') {
    insights.push(
      <li key="trend">
        • Tendencia <strong>negativa</strong> con caída del {formatPercentage(Math.abs(changePercent), 1)}
      </li>
    );
  } else {
    insights.push(
      <li key="trend">
        • Tendencia <strong>estable</strong> sin cambios significativos
      </li>
    );
  }

  // Volatility insight
  if (variationCoeff < 10) {
    insights.push(
      <li key="volatility">
        • <strong>Baja variabilidad</strong> - Los valores son consistentes
      </li>
    );
  } else if (variationCoeff > 30) {
    insights.push(
      <li key="volatility">
        • <strong>Alta variabilidad</strong> - Se observan fluctuaciones importantes
      </li>
    );
  }

  // Recent performance
  const recentValues = values.slice(-7);
  const recentMean = calculateMean(recentValues);
  const overallMean = calculateMean(values);
  const recentVsOverall = ((recentMean - overallMean) / overallMean) * 100;

  if (Math.abs(recentVsOverall) > 10) {
    insights.push(
      <li key="recent">
        • Últimos 7 días: {recentVsOverall > 0 ? 'por encima' : 'por debajo'} de la media ({formatPercentage(Math.abs(recentVsOverall), 1)})
      </li>
    );
  }

  return insights;
}

// Period Comparison Component
interface PeriodComparisonProps {
  period1Data: TimeSeriesData[];
  period2Data: TimeSeriesData[];
  period1Label: string;
  period2Label: string;
  format?: 'number' | 'currency' | 'percentage';
}

export function PeriodComparison({
  period1Data,
  period2Data,
  period1Label,
  period2Label,
  format = 'number'
}: PeriodComparisonProps) {
  const period1Values = period1Data.map(d => d.value);
  const period2Values = period2Data.map(d => d.value);

  const period1Mean = calculateMean(period1Values);
  const period2Mean = calculateMean(period2Values);

  const change = period2Mean - period1Mean;
  const changePercent = (change / period1Mean) * 100;

  const chartData = [
    { name: period1Label, value: period1Mean },
    { name: period2Label, value: period2Mean }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparación de Períodos</CardTitle>
        <CardDescription>
          {period1Label} vs {period2Label}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <AnalyticsChart
          title=""
          type="bar"
          data={chartData}
          dataKeys={[{ key: 'value', label: 'Promedio', color: '#3b82f6' }]}
          height={200}
          showExport={false}
        />

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Cambio</p>
            <p className="text-2xl font-bold text-gray-900">
              {change > 0 ? '+' : ''}{formatNumber(change, 2)}
            </p>
          </div>
          <div className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium',
            change > 0 ? 'bg-green-100 text-green-800' : change < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
          )}>
            {change > 0 ? <TrendingUp className="h-4 w-4" /> : change < 0 ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
            <span>{formatPercentage(Math.abs(changePercent), 1)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
