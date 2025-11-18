'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Download, FileText, X } from 'lucide-react';
import type { ReportConfig, ReportType, ReportFormat } from '@/lib/analytics/types';
import { cn } from '@/lib/utils';
import { downloadCSV, downloadJSON, generateFilename } from '@/lib/analytics/export';
import { ANALYTICS_DEFAULTS, LAYOUT_CONFIG } from '@/lib/analytics/config';

interface ReportBuilderProps {
  onGenerate: (config: ReportConfig) => void;
  onCancel?: () => void;
}

const REPORT_TYPES: Array<{ value: ReportType; label: string; description: string }> = [
  {
    value: 'OPERATIONAL',
    label: 'Reporte Operativo',
    description: 'Ocupación, reservas, confirmaciones y horarios pico'
  },
  {
    value: 'FINANCIAL',
    label: 'Reporte Financiero',
    description: 'Ingresos, RevPAH, morosidad y cobros'
  },
  {
    value: 'USER',
    label: 'Reporte de Usuarios',
    description: 'Usuarios activos, retención y segmentación'
  },
  {
    value: 'COMPETITIVE',
    label: 'Reporte Competitivo',
    description: 'Rankings, desafíos y perfil competitivo'
  },
  {
    value: 'PREDICTIVE',
    label: 'Reporte Predictivo',
    description: 'Proyecciones y tendencias futuras'
  },
];

const FORMATS: Array<{ value: ReportFormat; label: string; icon: React.ReactNode }> = [
  { value: 'PDF', label: 'PDF', icon: <FileText className="h-4 w-4" /> },
  { value: 'EXCEL', label: 'Excel', icon: <FileText className="h-4 w-4" /> },
  { value: 'CSV', label: 'CSV', icon: <FileText className="h-4 w-4" /> },
  { value: 'HTML', label: 'HTML', icon: <FileText className="h-4 w-4" /> },
];

const METRICS_BY_TYPE: Record<ReportType, Array<{ value: string; label: string }>> = {
  OPERATIONAL: [
    { value: 'occupancy-rate', label: 'Tasa de Ocupación' },
    { value: 'confirmed-reservations', label: 'Reservas Confirmadas' },
    { value: 'no-show-rate', label: 'Tasa de No-Show' },
    { value: 'peak-hours', label: 'Horarios Pico' },
    { value: 'court-distribution', label: 'Distribución por Cancha' },
  ],
  FINANCIAL: [
    { value: 'total-revenue', label: 'Ingresos Totales' },
    { value: 'revpah', label: 'RevPAH' },
    { value: 'average-ticket', label: 'Ticket Promedio' },
    { value: 'delinquency-rate', label: 'Tasa de Morosidad' },
    { value: 'collection-rate', label: 'Tasa de Cobro' },
  ],
  USER: [
    { value: 'active-users', label: 'Usuarios Activos' },
    { value: 'new-users', label: 'Nuevos Usuarios' },
    { value: 'retention-rate', label: 'Tasa de Retención' },
    { value: 'user-segments', label: 'Segmentación de Usuarios' },
    { value: 'ltv', label: 'Lifetime Value' },
  ],
  COMPETITIVE: [
    { value: 'player-rankings', label: 'Rankings de Jugadores' },
    { value: 'team-rankings', label: 'Rankings de Equipos' },
    { value: 'challenges', label: 'Desafíos' },
    { value: 'win-loss-records', label: 'Récord de Victorias/Derrotas' },
  ],
  PREDICTIVE: [
    { value: 'occupancy-forecast', label: 'Proyección de Ocupación' },
    { value: 'revenue-forecast', label: 'Proyección de Ingresos' },
    { value: 'trend-analysis', label: 'Análisis de Tendencias' },
    { value: 'anomaly-detection', label: 'Detección de Anomalías' },
  ],
};

export function ReportBuilder({ onGenerate, onCancel }: ReportBuilderProps) {
  const [reportType, setReportType] = useState<ReportType>('OPERATIONAL');
  const [reportName, setReportName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - ANALYTICS_DEFAULTS.defaultDateRangeDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [format, setFormat] = useState<ReportFormat>('PDF');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeTables, setIncludeTables] = useState(true);

  const handleMetricToggle = (metric: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metric) ? prev.filter((m) => m !== metric) : [...prev, metric]
    );
  };

  const handleSelectAll = () => {
    const allMetrics = METRICS_BY_TYPE[reportType].map(m => m.value);
    setSelectedMetrics(allMetrics);
  };

  const handleClearAll = () => {
    setSelectedMetrics([]);
  };

  const handleSubmit = () => {
    const config: ReportConfig = {
      type: reportType,
      name: reportName || `Reporte ${REPORT_TYPES.find(t => t.value === reportType)?.label}`,
      description,
      period: {
        start: new Date(startDate),
        end: new Date(endDate)
      },
      metrics: selectedMetrics,
      includeCharts,
      includeTables,
      format
    };

    onGenerate(config);
  };

  const isValid = selectedMetrics.length > 0 && startDate && endDate;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generar Reporte</CardTitle>
        <CardDescription>
          Configura los parámetros del reporte que deseas generar
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Report Type */}
        <div className="space-y-3">
          <Label>Tipo de reporte</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {REPORT_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => {
                  setReportType(type.value);
                  setSelectedMetrics([]); // Reset metrics when type changes
                }}
                className={cn(
                  'text-left p-4 rounded-lg border-2 transition-all',
                  reportType === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <p className="font-medium text-gray-900 mb-1">{type.label}</p>
                <p className="text-xs text-gray-600">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Report Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del reporte (opcional)</Label>
          <Input
            id="name"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            placeholder="Ej: Reporte Mensual Noviembre"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Descripción (opcional)</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Agrega una descripción para este reporte"
          />
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Fecha inicio</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Fecha fin</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Metrics Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Métricas a incluir</Label>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                Seleccionar todas
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClearAll}>
                Limpiar
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
            {METRICS_BY_TYPE[reportType].map((metric) => (
              <label
                key={metric.value}
                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <Checkbox
                  checked={selectedMetrics.includes(metric.value)}
                  onCheckedChange={() => handleMetricToggle(metric.value)}
                />
                <span className="text-sm">{metric.label}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            {selectedMetrics.length} métrica{selectedMetrics.length !== 1 ? 's' : ''} seleccionada{selectedMetrics.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <Label>Formato de exportación</Label>
          <div className={`grid grid-cols-${LAYOUT_CONFIG.reportFormatColumns} gap-2`}>
            {FORMATS.map((fmt) => (
              <button
                key={fmt.value}
                onClick={() => setFormat(fmt.value)}
                className={cn(
                  'flex items-center justify-center gap-2 p-3 rounded-md border-2 transition-all',
                  format === fmt.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                {fmt.icon}
                <span className="text-sm font-medium">{fmt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3 p-4 bg-gray-50 rounded-md">
          <Label>Opciones adicionales</Label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={includeCharts}
                onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
              />
              <span className="text-sm">Incluir gráficos</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={includeTables}
                onCheckedChange={(checked) => setIncludeTables(checked as boolean)}
              />
              <span className="text-sm">Incluir tablas detalladas</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-4 border-t">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={!isValid}>
            <Download className="h-4 w-4 mr-2" />
            Generar Reporte
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Report History Item Component
interface ReportHistoryItemProps {
  report: import('@/lib/analytics/types').Report;
  onDownload: () => void;
  onDelete: () => void;
}

export function ReportHistoryItem({ report, onDownload, onDelete }: ReportHistoryItemProps) {
  const typeConfig = REPORT_TYPES.find(t => t.value === report.type);
  const format = report.config.format;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-gray-900">{report.name}</h3>
              <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                {format}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{typeConfig?.label}</span>
              <span>•</span>
              <span>Generado: {report.generatedAt.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
