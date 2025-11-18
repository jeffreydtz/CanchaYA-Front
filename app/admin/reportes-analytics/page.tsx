'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Download } from 'lucide-react';
import { ReportBuilder, ReportHistoryItem } from '@/components/analytics/ReportBuilder';
import { AnalyticsLegend } from '@/components/analytics/AnalyticsLegend';
import type { ReportConfig, Report } from '@/lib/analytics/types';
import { toast } from 'sonner';
import { downloadCSV, downloadExcel, generateFilename } from '@/lib/analytics/export';
import { fetchDashboardData } from '@/lib/analytics/data-aggregator';

export default function ReportesAnalyticsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Load reports from localStorage
  useEffect(() => {
    const savedReports = localStorage.getItem('analytics-reports');
    if (savedReports) {
      try {
        const parsed = JSON.parse(savedReports);
        setReports(parsed.map((r: any) => ({
          ...r,
          generatedAt: new Date(r.generatedAt),
          config: {
            ...r.config,
            period: {
              start: new Date(r.config.period.start),
              end: new Date(r.config.period.end)
            }
          }
        })));
      } catch (error) {
        console.error('Error loading reports:', error);
      }
    }
  }, []);

  // Save reports to localStorage
  const saveReports = (newReports: Report[]) => {
    setReports(newReports);
    localStorage.setItem('analytics-reports', JSON.stringify(newReports));
  };

  const handleGenerateReport = async (config: ReportConfig) => {
    setGenerating(true);

    try {
      // Fetch dashboard data for the report period
      const data = await fetchDashboardData(
        undefined,
        config.period.start,
        config.period.end
      );

      // Create report data structure
      const reportData = {
        config,
        data: {
          metrics: data.metrics,
          kpis: data.kpis.filter(kpi => config.metrics.includes(kpi.id)),
          trends: data.trends,
          topCourts: data.topCourts,
          heatmap: data.heatmap
        },
        generatedAt: new Date()
      };

      // Generate file based on format
      let result;
      const filename = generateFilename(
        `reporte-${config.type.toLowerCase()}`,
        config.format.toLowerCase()
      );

      switch (config.format) {
        case 'CSV':
          // Flatten KPIs data for CSV
          const csvData = reportData.data.kpis.map(kpi => ({
            'Métrica': kpi.name,
            'Valor Actual': kpi.value,
            'Valor Anterior': kpi.previousValue || 'N/A',
            'Cambio': kpi.change,
            'Cambio %': kpi.changePercent,
            'Tendencia': kpi.trend,
            'Estado': kpi.status
          }));
          result = downloadCSV(csvData, filename);
          break;

        case 'EXCEL':
          // Similar to CSV but with Excel format
          const excelData = reportData.data.kpis.map(kpi => ({
            'Métrica': kpi.name,
            'Valor Actual': kpi.value,
            'Valor Anterior': kpi.previousValue || 'N/A',
            'Cambio': kpi.change,
            'Cambio %': kpi.changePercent,
            'Tendencia': kpi.trend,
            'Estado': kpi.status
          }));
          result = downloadExcel(excelData, filename, 'Reporte Analytics');
          break;

        case 'PDF':
        case 'HTML':
          // For PDF/HTML, we'd need a more complex implementation
          // For now, download as CSV as fallback
          toast.info('Formato no implementado aún', {
            description: `El formato ${config.format} estará disponible próximamente. Descargando como CSV...`
          });
          const fallbackData = reportData.data.kpis.map(kpi => ({
            'Métrica': kpi.name,
            'Valor Actual': kpi.value,
            'Valor Anterior': kpi.previousValue || 'N/A',
            'Cambio': kpi.change,
            'Cambio %': kpi.changePercent,
            'Tendencia': kpi.trend,
            'Estado': kpi.status
          }));
          result = downloadCSV(fallbackData, filename.replace(`.${config.format.toLowerCase()}`, '.csv'));
          break;

        default:
          throw new Error(`Formato no soportado: ${config.format}`);
      }

      if (result.success) {
        // Save report to history
        const newReport: Report = {
          id: Math.random().toString(36).substr(2, 9),
          name: config.name,
          type: config.type,
          config,
          generatedAt: new Date(),
          downloadUrl: result.downloadUrl
        };

        saveReports([newReport, ...reports]);
        setIsCreating(false);

        toast.success('Reporte generado', {
          description: `El reporte "${config.name}" se ha descargado correctamente`
        });
      } else {
        throw new Error(result.error || 'Error al generar reporte');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error al generar reporte', {
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (report: Report) => {
    // Re-download the report
    handleGenerateReport(report.config);
  };

  const handleDelete = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (window.confirm(`¿Eliminar el reporte "${report?.name}"?`)) {
      saveReports(reports.filter(r => r.id !== reportId));
      toast.success('Reporte eliminado');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">
            Generador de Reportes
          </h1>
          <p className="text-gray-600 mt-1">
            Crea reportes personalizados con las métricas que necesites
          </p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Reporte
          </Button>
        )}
      </div>

      {/* Stats */}
      {!isCreating && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Total de reportes</p>
                <p className="text-2xl font-bold text-blue-900">{reports.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Download className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-green-600 font-medium">Últimos 7 días</p>
                <p className="text-2xl font-bold text-green-900">
                  {reports.filter(r => {
                    const diff = Date.now() - r.generatedAt.getTime();
                    return diff < 7 * 24 * 60 * 60 * 1000;
                  }).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600 font-medium">Tipo más usado</p>
                <p className="text-lg font-bold text-purple-900">
                  {getMostUsedType(reports)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Builder */}
      {isCreating && (
        <ReportBuilder
          onGenerate={handleGenerateReport}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {/* Report History */}
      {!isCreating && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Historial de Reportes
            </h2>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay reportes generados
              </h3>
              <p className="text-gray-600 mb-4">
                Crea tu primer reporte para comenzar
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Generar Primer Reporte
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <ReportHistoryItem
                  key={report.id}
                  report={report}
                  onDownload={() => handleDownload(report)}
                  onDelete={() => handleDelete(report.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      {!isCreating && reports.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">
            🚀 Acciones rápidas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => {
                setIsCreating(true);
                // TODO: Pre-fill with operational report
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Reporte Operativo Rápido
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => {
                setIsCreating(true);
                // TODO: Pre-fill with financial report
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Reporte Financiero Rápido
            </Button>
          </div>
        </div>
      )}

      {/* Analytics Legend - Help Section */}
      {!isCreating && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <AnalyticsLegend />
        </div>
      )}
    </div>
  );
}

// Helper function to get most used report type
function getMostUsedType(reports: Report[]): string {
  if (reports.length === 0) return 'N/A';

  const typeCounts = reports.reduce((acc, report) => {
    acc[report.type] = (acc[report.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostUsed = Object.entries(typeCounts).sort(([, a], [, b]) => b - a)[0];

  const typeLabels: Record<string, string> = {
    OPERATIONAL: 'Operativo',
    FINANCIAL: 'Financiero',
    USER: 'Usuarios',
    COMPETITIVE: 'Competitivo',
    PREDICTIVE: 'Predictivo'
  };

  return typeLabels[mostUsed[0]] || mostUsed[0];
}
