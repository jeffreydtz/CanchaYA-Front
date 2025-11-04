'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { AnalyticsChart } from './AnalyticsChart';
import type { UserSegment, UserSegmentData } from '@/lib/analytics/types';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/analytics/formatters';
import { cn } from '@/lib/utils';

interface UserSegmentationProps {
  segmentData: UserSegmentData[];
  className?: string;
}

export function UserSegmentation({ segmentData, className }: UserSegmentationProps) {
  const totalUsers = segmentData.reduce((sum, s) => sum + s.count, 0);
  const totalRevenue = segmentData.reduce((sum, s) => sum + s.revenue, 0);

  // Prepare chart data
  const chartData = segmentData.map(s => ({
    name: getSegmentLabel(s.segment),
    users: s.count,
    revenue: s.revenue,
    percentage: s.percentage
  }));

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(totalUsers)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Revenue Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Ticket Promedio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalRevenue / totalUsers)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Usuarios por Segmento</CardTitle>
          <CardDescription>
            Análisis de segmentación basado en RFM (Recency, Frequency, Monetary)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnalyticsChart
            title=""
            type="bar"
            data={chartData}
            dataKeys={[
              { key: 'users', label: 'Usuarios', color: '#3b82f6' },
              { key: 'revenue', label: 'Revenue', color: '#10b981' }
            ]}
            height={300}
            showExport={false}
          />
        </CardContent>
      </Card>

      {/* Segment Details */}
      <div className="space-y-3">
        {segmentData.map(segment => (
          <SegmentCard key={segment.segment} data={segment} />
        ))}
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Recomendaciones Estratégicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {generateRecommendations(segmentData).map((rec, index) => (
            <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">{rec}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// Segment Card Component
interface SegmentCardProps {
  data: UserSegmentData;
}

function SegmentCard({ data }: SegmentCardProps) {
  const config = getSegmentConfig(data.segment);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn('w-3 h-3 rounded-full', config.color)} />
              <h3 className="font-bold text-gray-900 text-lg">{config.label}</h3>
              <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                {formatPercentage(data.percentage, 1)}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-3">{config.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatBox
                icon={<Users className="h-4 w-4" />}
                label="Usuarios"
                value={formatNumber(data.count)}
              />
              <StatBox
                icon={<DollarSign className="h-4 w-4" />}
                label="Revenue"
                value={formatCurrency(data.revenue)}
              />
              <StatBox
                icon={<TrendingUp className="h-4 w-4" />}
                label="Ticket Prom."
                value={formatCurrency(data.averageTicket)}
              />
              <StatBox
                icon={<Calendar className="h-4 w-4" />}
                label="Frecuencia"
                value={`${data.averageFrequency.toFixed(1)}/mes`}
              />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-xs text-gray-600">Retención</p>
                <p className="text-sm font-bold text-gray-900">
                  {formatPercentage(data.retentionRate, 1)}
                </p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-xs text-gray-600">LTV</p>
                <p className="text-sm font-bold text-gray-900">
                  {formatCurrency(data.lifetimeValue)}
                </p>
              </div>
            </div>
          </div>

          <div className="ml-4">
            {config.icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Stat Box Component
interface StatBoxProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatBox({ icon, label, value }: StatBoxProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-gray-400">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-600">{label}</p>
        <p className="text-sm font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

// Get segment configuration
function getSegmentConfig(segment: UserSegment): {
  label: string;
  description: string;
  color: string;
  icon: React.ReactNode;
} {
  const configs = {
    VIP: {
      label: 'VIP',
      description: 'Usuarios premium con alta frecuencia (>8 reservas/mes)',
      color: 'bg-purple-500',
      icon: '👑'
    },
    REGULAR: {
      label: 'Regulares',
      description: 'Usuarios frecuentes con actividad constante (4-8 reservas/mes)',
      color: 'bg-blue-500',
      icon: '⭐'
    },
    OCCASIONAL: {
      label: 'Ocasionales',
      description: 'Usuarios con actividad esporádica (1-3 reservas/mes)',
      color: 'bg-green-500',
      icon: '✓'
    },
    INACTIVE: {
      label: 'Inactivos',
      description: 'Usuarios sin reservas en el último mes',
      color: 'bg-gray-400',
      icon: '💤'
    },
    AT_RISK: {
      label: 'En Riesgo',
      description: 'Usuarios con actividad decreciente',
      color: 'bg-orange-500',
      icon: '⚠️'
    },
    CHAMPIONS: {
      label: 'Champions',
      description: 'Mejores clientes con alto RFM',
      color: 'bg-yellow-500',
      icon: '🏆'
    },
    NEW_CUSTOMERS: {
      label: 'Nuevos Clientes',
      description: 'Usuarios recientemente registrados',
      color: 'bg-teal-500',
      icon: '🎉'
    },
    HIBERNATING: {
      label: 'Hibernando',
      description: 'Usuarios inactivos por largo período',
      color: 'bg-red-500',
      icon: '❄️'
    },
    ALL: {
      label: 'Todos',
      description: 'Todos los usuarios',
      color: 'bg-gray-500',
      icon: '👥'
    }
  };

  return configs[segment] || configs.ALL;
}

// Get segment label
function getSegmentLabel(segment: UserSegment): string {
  return getSegmentConfig(segment).label;
}

// Generate strategic recommendations
function generateRecommendations(segmentData: UserSegmentData[]): string[] {
  const recommendations: string[] = [];

  const vipSegment = segmentData.find(s => s.segment === 'VIP');
  const regularSegment = segmentData.find(s => s.segment === 'REGULAR');
  const inactiveSegment = segmentData.find(s => s.segment === 'INACTIVE');
  const atRiskSegment = segmentData.find(s => s.segment === 'AT_RISK');

  // VIP recommendations
  if (vipSegment && vipSegment.count > 0) {
    const vipRevenue = (vipSegment.revenue / segmentData.reduce((sum, s) => sum + s.revenue, 0)) * 100;
    recommendations.push(
      `🌟 Usuarios VIP representan ${formatPercentage(vipRevenue, 1)} de los ingresos con solo ${formatPercentage(vipSegment.percentage, 1)} de usuarios. Implementar programa de beneficios exclusivos para retenerlos.`
    );
  }

  // Regular to VIP conversion
  if (regularSegment && regularSegment.count > 10) {
    recommendations.push(
      `📈 Hay ${formatNumber(regularSegment.count)} usuarios regulares. Crear campaña para convertirlos en VIP con incentivos por mayor frecuencia.`
    );
  }

  // At-risk users
  if (atRiskSegment && atRiskSegment.count > 0) {
    recommendations.push(
      `⚠️ ${formatNumber(atRiskSegment.count)} usuarios en riesgo de churn. Enviar campaña de reactivación con descuento del 15-20%.`
    );
  }

  // Inactive users
  if (inactiveSegment && inactiveSegment.percentage > 10) {
    recommendations.push(
      `💤 ${formatPercentage(inactiveSegment.percentage, 1)} de usuarios están inactivos. Considerar campaña de win-back con oferta especial.`
    );
  }

  // General recommendation
  recommendations.push(
    `💡 Implementar sistema de puntos o membresías para aumentar la frecuencia de reservas en todos los segmentos.`
  );

  return recommendations;
}
