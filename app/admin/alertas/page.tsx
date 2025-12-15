'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { AlertConfig, AlertListItem } from '@/components/analytics/AlertConfig';
import type { Alert } from '@/lib/analytics/types';
import { toast } from 'sonner';
import { withErrorBoundary } from '@/components/error/with-error-boundary';

function AlertasPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);

  // Load alerts from localStorage (in production, this would be from API)
  useEffect(() => {
    const savedAlerts = localStorage.getItem('analytics-alerts');
    if (savedAlerts) {
      try {
        const parsed = JSON.parse(savedAlerts);
        setAlerts(parsed.map((a: any) => ({
          ...a,
          createdAt: new Date(a.createdAt),
          updatedAt: new Date(a.updatedAt),
          lastTriggered: a.lastTriggered ? new Date(a.lastTriggered) : undefined
        })));
      } catch (error) {
        // Error loading alerts from localStorage
      }
    }
  }, []);

  // Save alerts to localStorage
  const saveAlerts = (newAlerts: Alert[]) => {
    setAlerts(newAlerts);
    localStorage.setItem('analytics-alerts', JSON.stringify(newAlerts));
  };

  const handleCreateAlert = (alertData: Partial<Alert>) => {
    const newAlert: Alert = {
      ...alertData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Alert;

    saveAlerts([...alerts, newAlert]);
    setIsCreating(false);
    toast.success('Alerta creada', {
      description: `La alerta "${newAlert.name}" ha sido configurada correctamente`
    });
  };

  const handleUpdateAlert = (alertData: Partial<Alert>) => {
    const updatedAlerts = alerts.map((alert) =>
      alert.id === editingAlert?.id
        ? { ...alert, ...alertData, updatedAt: new Date() }
        : alert
    );
    saveAlerts(updatedAlerts);
    setEditingAlert(null);
    toast.success('Alerta actualizada', {
      description: 'Los cambios han sido guardados correctamente'
    });
  };

  const handleToggleAlert = (alertId: string) => {
    const updatedAlerts = alerts.map((alert) =>
      alert.id === alertId
        ? { ...alert, active: !alert.active, updatedAt: new Date() }
        : alert
    );
    saveAlerts(updatedAlerts);

    const alert = updatedAlerts.find(a => a.id === alertId);
    toast.info(
      alert?.active ? 'Alerta activada' : 'Alerta desactivada',
      {
        description: `La alerta "${alert?.name}" ha sido ${alert?.active ? 'activada' : 'desactivada'}`
      }
    );
  };

  const handleDeleteAlert = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (window.confirm(`¿Eliminar la alerta "${alert?.name}"?`)) {
      saveAlerts(alerts.filter((a) => a.id !== alertId));
      toast.success('Alerta eliminada', {
        description: 'La alerta ha sido eliminada correctamente'
      });
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingAlert(null);
  };

  const activeAlerts = alerts.filter(a => a.active).length;
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">
            Gestión de Alertas
          </h1>
          <p className="text-gray-600 mt-1">
            Configura alertas automáticas para monitorear métricas clave
          </p>
        </div>
        {!isCreating && !editingAlert && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Alerta
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      {!isCreating && !editingAlert && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Info className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Total de alertas</p>
                <p className="text-2xl font-bold text-blue-900">{alerts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-green-600 font-medium">Alertas activas</p>
                <p className="text-2xl font-bold text-green-900">{activeAlerts}</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-red-600 font-medium">Alertas críticas</p>
                <p className="text-2xl font-bold text-red-900">{criticalAlerts}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Config Form */}
      {(isCreating || editingAlert) && (
        <AlertConfig
          alert={editingAlert || undefined}
          onSave={editingAlert ? handleUpdateAlert : handleCreateAlert}
          onCancel={handleCancel}
        />
      )}

      {/* Alerts List */}
      {!isCreating && !editingAlert && (
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay alertas configuradas
              </h3>
              <p className="text-gray-600 mb-4">
                Crea tu primera alerta para comenzar a monitorear tus métricas
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Alerta
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <AlertListItem
                  key={alert.id}
                  alert={alert}
                  onEdit={() => setEditingAlert(alert)}
                  onToggle={() => handleToggleAlert(alert.id)}
                  onDelete={() => handleDeleteAlert(alert.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Help Section */}
      {!isCreating && !editingAlert && alerts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">
            💡 Consejos para configurar alertas
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Configura alertas para métricas críticas como ocupación baja o morosidad alta</li>
            <li>• Usa severidad CRÍTICA solo para situaciones que requieran atención inmediata</li>
            <li>• Ajusta el tiempo de espera (cooldown) para evitar spam de notificaciones</li>
            <li>• Combina múltiples canales de notificación para alertas importantes</li>
            <li>• Revisa y ajusta tus alertas periódicamente según necesidades</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default withErrorBoundary(AlertasPage, 'Gestión de Alertas')
