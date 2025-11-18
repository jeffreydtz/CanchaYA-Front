'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Minus, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import type { KPI } from '@/lib/analytics/types';
import {
  formatMetricValue,
  formatChangePercent,
  getTrendColor,
  getStatusBadgeColor,
  getStatusLabel
} from '@/lib/analytics/formatters';
import { cn } from '@/lib/utils';
import { CHART_CONFIG, COLOR_PALETTES, LAYOUT_CONFIG } from '@/lib/analytics/config';

interface KPICardProps {
  kpi: KPI;
  onClick?: () => void;
  showSparkline?: boolean;
  className?: string;
}

export function KPICard({ kpi, onClick, showSparkline = true, className }: KPICardProps) {
  const formattedValue = formatMetricValue(kpi.value, kpi.format);
  const formattedChange = formatChangePercent(kpi.changePercent);

  const TrendIcon = kpi.trend === 'up' ? ArrowUp : kpi.trend === 'down' ? ArrowDown : Minus;

  const StatusIcon = kpi.status === 'success' ? CheckCircle :
                     kpi.status === 'danger' ? AlertTriangle :
                     kpi.trend === 'up' ? TrendingUp : TrendingDown;

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-lg cursor-pointer',
        onClick && 'hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {kpi.name}
        </CardTitle>
        <div className={cn(
          'p-2 rounded-full',
          getStatusBadgeColor(kpi.status).replace('text-', 'bg-').replace('bg-bg-', 'bg-') + '/20'
        )}>
          <StatusIcon className={cn('h-4 w-4', getStatusBadgeColor(kpi.status).split(' ')[1])} />
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {/* Main Value */}
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-bold text-gray-900">
              {formattedValue}
            </div>

            {/* Change Indicator */}
            {kpi.previousValue !== undefined && (
              <div className={cn(
                'flex items-center gap-1 text-sm font-medium',
                getTrendColor(kpi.trend)
              )}>
                <TrendIcon className="h-4 w-4" />
                <span>{formattedChange}</span>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={cn(
              'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
              getStatusBadgeColor(kpi.status)
            )}>
              {getStatusLabel(kpi.status)}
            </span>

            {/* Target Indicator */}
            {kpi.target !== undefined && (
              <span className="text-xs text-gray-500">
                Meta: {formatMetricValue(kpi.target, kpi.format)}
              </span>
            )}
          </div>

          {/* Sparkline */}
          {showSparkline && kpi.sparklineData && kpi.sparklineData.length > 0 && (
            <div className="mt-3">
              <MiniSparkline data={kpi.sparklineData} trend={kpi.trend} />
            </div>
          )}

          {/* Description */}
          {kpi.description && (
            <p className="text-xs text-gray-500 mt-2">
              {kpi.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Mini Sparkline Component
interface MiniSparklineProps {
  data: number[];
  trend: 'up' | 'down' | 'neutral';
}

function MiniSparkline({ data, trend }: MiniSparklineProps) {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  const height = CHART_CONFIG.sparkline.height;
  const width = CHART_CONFIG.sparkline.width;
  const padding = CHART_CONFIG.sparkline.padding;

  // Normalize data points to fit in height
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const normalizedY = range === 0 ? height / 2 : ((value - min) / range) * (height - padding * 2);
    const y = height - normalizedY - padding;
    return `${x},${y}`;
  }).join(' ');

  const lineColor = trend === 'up' ? COLOR_PALETTES.trend.up : trend === 'down' ? COLOR_PALETTES.trend.down : COLOR_PALETTES.trend.neutral;
  const fillColor = trend === 'up' ? COLOR_PALETTES.trendFill.up : trend === 'down' ? COLOR_PALETTES.trendFill.down : COLOR_PALETTES.trendFill.neutral;

  return (
    <div className="w-full h-10">
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        {/* Fill area */}
        <polygon
          points={`0,${height} ${points} ${width},${height}`}
          fill={fillColor}
        />

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={lineColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// KPI Grid Layout Component
interface KPIGridProps {
  kpis: KPI[];
  onKPIClick?: (kpi: KPI) => void;
  columns?: 2 | 3 | 4;
}

export function KPIGrid({ kpis, onKPIClick, columns = LAYOUT_CONFIG.kpiGridColumns as 2 | 3 | 4 }: KPIGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns])}>
      {kpis.map((kpi) => (
        <KPICard
          key={kpi.id}
          kpi={kpi}
          onClick={onKPIClick ? () => onKPIClick(kpi) : undefined}
        />
      ))}
    </div>
  );
}
