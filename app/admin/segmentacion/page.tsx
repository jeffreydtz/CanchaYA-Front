'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Users, RefreshCw } from 'lucide-react';
import { UserSegmentation } from '@/components/analytics/UserSegmentation';
import { AnalyticsLegend } from '@/components/analytics/AnalyticsLegend';
import type { UserSegmentData } from '@/lib/analytics/types';
import { toast } from 'sonner';
import { downloadCSV, generateFilename } from '@/lib/analytics/export';

export default function SegmentacionPage() {
  const [segmentData, setSegmentData] = useState<UserSegmentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSegmentData();
  }, []);

  const loadSegmentData = async () => {
    try {
      setLoading(true);

      // In production, this would fetch from API
      // For now, generate mock data
      const mockData: UserSegmentData[] = [
        {
          segment: 'VIP',
          count: 147,
          percentage: 12,
          revenue: 98140,
          averageTicket: 667,
          averageFrequency: 11.3,
          retentionRate: 98.6,
          lifetimeValue: 87500
        },
        {
          segment: 'REGULAR',
          count: 498,
          percentage: 40,
          revenue: 112230,
          averageTicket: 225,
          averageFrequency: 6.2,
          retentionRate: 94.2,
          lifetimeValue: 42300
        },
        {
          segment: 'OCCASIONAL',
          count: 502,
          percentage: 40,
          revenue: 30980,
          averageTicket: 62,
          averageFrequency: 2.1,
          retentionRate: 78.4,
          lifetimeValue: 12500
        },
        {
          segment: 'INACTIVE',
          count: 100,
          percentage: 8,
          revenue: 0,
          averageTicket: 0,
          averageFrequency: 0,
          retentionRate: 0,
          lifetimeValue: 0
        }
      ];

      setSegmentData(mockData);
    } catch (error) {
      console.error('Error loading segment data:', error);
      toast.error('Error al cargar datos de segmentación');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      const exportData = segmentData.map(segment => ({
        'Segmento': getSegmentLabel(segment.segment),
        'Usuarios': segment.count,
        'Porcentaje': `${segment.percentage}%`,
        'Revenue': `$${segment.revenue.toLocaleString()}`,
        'Ticket Promedio': `$${segment.averageTicket.toLocaleString()}`,
        'Frecuencia Promedio': `${segment.averageFrequency} /mes`,
        'Tasa de Retención': `${segment.retentionRate}%`,
        'Lifetime Value': `$${segment.lifetimeValue.toLocaleString()}`
      }));

      const filename = generateFilename('segmentacion-usuarios', 'csv');
      downloadCSV(exportData, filename);

      toast.success('Datos exportados', {
        description: 'El archivo CSV se ha descargado correctamente'
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Error al exportar datos');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">
            Segmentación de Usuarios
          </h1>
          <p className="text-gray-600 mt-1">
            Análisis RFM (Recency, Frequency, Monetary) de tu base de usuarios
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSegmentData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* What is RFM? */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">
          📊 ¿Qué es el Análisis RFM?
        </h3>
        <p className="text-sm text-blue-800">
          El análisis RFM es una técnica de segmentación que clasifica a los usuarios según tres dimensiones:
        </p>
        <ul className="text-sm text-blue-800 mt-2 space-y-1 ml-4">
          <li>• <strong>Recency (Recencia):</strong> ¿Cuán recientemente hizo una reserva?</li>
          <li>• <strong>Frequency (Frecuencia):</strong> ¿Con qué frecuencia reserva?</li>
          <li>• <strong>Monetary (Monetario):</strong> ¿Cuánto gasta en total?</li>
        </ul>
      </div>

      {/* Segmentation Analysis */}
      <UserSegmentation segmentData={segmentData} />

      {/* Action Plan */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <h3 className="font-bold text-purple-900 mb-4 text-lg">
          🎯 Plan de Acción Sugerido
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ActionCard
            emoji="👑"
            title="Usuarios VIP"
            description="Implementar programa de beneficios exclusivos"
            actions={[
              'Descuentos especiales en horarios pico',
              'Prioridad en reservas',
              'Comunicación personalizada'
            ]}
          />
          <ActionCard
            emoji="📈"
            title="Usuarios Regulares"
            description="Estrategia de conversión a VIP"
            actions={[
              'Incentivos por mayor frecuencia',
              'Programa de puntos',
              'Desafíos con recompensas'
            ]}
          />
          <ActionCard
            emoji="⚠️"
            title="Usuarios en Riesgo"
            description="Campaña de retención inmediata"
            actions={[
              'Email personalizado',
              'Descuento 15-20% próxima reserva',
              'Encuesta de satisfacción'
            ]}
          />
          <ActionCard
            emoji="💤"
            title="Usuarios Inactivos"
            description="Campaña de reactivación"
            actions={[
              'Oferta especial win-back',
              'Recordatorio de beneficios',
              'Nuevas canchas/deportes disponibles'
            ]}
          />
        </div>
      </div>

      {/* Analytics Legend - Help Section */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <AnalyticsLegend />
      </div>
    </div>
  );
}

// Action Card Component
interface ActionCardProps {
  emoji: string;
  title: string;
  description: string;
  actions: string[];
}

function ActionCard({ emoji, title, description, actions }: ActionCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{emoji}</span>
        <h4 className="font-bold text-gray-900">{title}</h4>
      </div>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <ul className="text-sm text-gray-700 space-y-1">
        {actions.map((action, index) => (
          <li key={index}>• {action}</li>
        ))}
      </ul>
    </div>
  );
}

// Helper function
function getSegmentLabel(segment: string): string {
  const labels: Record<string, string> = {
    VIP: 'VIP',
    REGULAR: 'Regulares',
    OCCASIONAL: 'Ocasionales',
    INACTIVE: 'Inactivos',
    AT_RISK: 'En Riesgo',
    CHAMPIONS: 'Champions',
    NEW_CUSTOMERS: 'Nuevos Clientes',
    HIBERNATING: 'Hibernando',
    ALL: 'Todos'
  };
  return labels[segment] || segment;
}
