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
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, Smartphone, MessageSquare, X } from 'lucide-react';
import type { Alert, AlertCondition, AlertSeverity, AlertChannel } from '@/lib/analytics/types';
import { cn } from '@/lib/utils';

interface AlertConfigProps {
  alert?: Alert;
  onSave: (alert: Partial<Alert>) => void;
  onCancel: () => void;
}

const METRICS = [
  { value: 'occupancy-rate', label: 'Tasa de Ocupación' },
  { value: 'revenue', label: 'Ingresos' },
  { value: 'no-show-rate', label: 'Tasa de No-Show' },
  { value: 'active-users', label: 'Usuarios Activos' },
  { value: 'retention-rate', label: 'Tasa de Retención' },
  { value: 'delinquency-rate', label: 'Tasa de Morosidad' },
];

const CONDITIONS: Array<{ value: AlertCondition; label: string }> = [
  { value: '>', label: 'Mayor que (>)' },
  { value: '<', label: 'Menor que (<)' },
  { value: '>=', label: 'Mayor o igual (>=)' },
  { value: '<=', label: 'Menor o igual (<=)' },
  { value: '=', label: 'Igual a (=)' },
  { value: 'between', label: 'Entre (rango)' },
];

const SEVERITIES: Array<{ value: AlertSeverity; label: string; color: string }> = [
  { value: 'LOW', label: 'Baja', color: 'bg-blue-100 text-blue-800' },
  { value: 'MEDIUM', label: 'Media', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'HIGH', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { value: 'CRITICAL', label: 'Crítica', color: 'bg-red-100 text-red-800' },
];

const CHANNELS: Array<{ value: AlertChannel; label: string; icon: React.ReactNode }> = [
  { value: 'EMAIL', label: 'Email', icon: <Mail className="h-4 w-4" /> },
  { value: 'PUSH', label: 'Notificación Push', icon: <Bell className="h-4 w-4" /> },
  { value: 'SMS', label: 'SMS', icon: <Smartphone className="h-4 w-4" /> },
  { value: 'IN_APP', label: 'En la aplicación', icon: <MessageSquare className="h-4 w-4" /> },
];

export function AlertConfig({ alert, onSave, onCancel }: AlertConfigProps) {
  const [name, setName] = useState(alert?.name || '');
  const [description, setDescription] = useState(alert?.description || '');
  const [metricId, setMetricId] = useState(alert?.metricId || '');
  const [condition, setCondition] = useState<AlertCondition>(alert?.condition || '>');
  const [threshold, setThreshold] = useState<string>(
    Array.isArray(alert?.threshold) ? alert.threshold.join(',') : String(alert?.threshold || '')
  );
  const [severity, setSeverity] = useState<AlertSeverity>(alert?.severity || 'MEDIUM');
  const [channels, setChannels] = useState<AlertChannel[]>(alert?.channels || ['EMAIL']);
  const [cooldownMinutes, setCooldownMinutes] = useState(alert?.cooldownMinutes || 30);
  const [active, setActive] = useState(alert?.active ?? true);

  const handleChannelToggle = (channel: AlertChannel) => {
    setChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  const handleSubmit = () => {
    const parsedThreshold: number | [number, number] = condition === 'between'
      ? threshold.split(',').map(Number).slice(0, 2) as [number, number]
      : Number(threshold);

    onSave({
      ...alert,
      name,
      description,
      metricId,
      metricName: METRICS.find(m => m.value === metricId)?.label || '',
      condition,
      threshold: parsedThreshold,
      severity,
      channels,
      cooldownMinutes,
      active,
      updatedAt: new Date(),
      ...(alert ? {} : { createdAt: new Date() })
    });
  };

  const isValid = name && metricId && threshold && channels.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{alert ? 'Editar Alerta' : 'Nueva Alerta'}</CardTitle>
        <CardDescription>
          Configura las condiciones para recibir notificaciones automáticas
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Nombre de la alerta</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Ocupación baja en fin de semana"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Descripción (opcional)</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe qué monitorea esta alerta"
          />
        </div>

        {/* Metric */}
        <div className="space-y-2">
          <Label htmlFor="metric">Métrica a monitorear</Label>
          <Select value={metricId} onValueChange={setMetricId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una métrica" />
            </SelectTrigger>
            <SelectContent>
              {METRICS.map((metric) => (
                <SelectItem key={metric.value} value={metric.value}>
                  {metric.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Condition and Threshold */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="condition">Condición</Label>
            <Select value={condition} onValueChange={(v) => setCondition(v as AlertCondition)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map((cond) => (
                  <SelectItem key={cond.value} value={cond.value}>
                    {cond.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="threshold">
              Umbral {condition === 'between' && '(min,max)'}
            </Label>
            <Input
              id="threshold"
              type="text"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder={condition === 'between' ? '40,60' : '50'}
            />
          </div>
        </div>

        {/* Severity */}
        <div className="space-y-2">
          <Label>Severidad</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {SEVERITIES.map((sev) => (
              <button
                key={sev.value}
                onClick={() => setSeverity(sev.value)}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-all',
                  severity === sev.value
                    ? sev.color
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {sev.label}
              </button>
            ))}
          </div>
        </div>

        {/* Channels */}
        <div className="space-y-2">
          <Label>Canales de notificación</Label>
          <div className="grid grid-cols-2 gap-2">
            {CHANNELS.map((channel) => (
              <label
                key={channel.value}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-md border cursor-pointer transition-colors',
                  channels.includes(channel.value)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <input
                  type="checkbox"
                  checked={channels.includes(channel.value)}
                  onChange={() => handleChannelToggle(channel.value)}
                  className="sr-only"
                />
                <div className="flex items-center gap-2 flex-1">
                  {channel.icon}
                  <span className="text-sm font-medium">{channel.label}</span>
                </div>
                {channels.includes(channel.value) && (
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Cooldown */}
        <div className="space-y-2">
          <Label htmlFor="cooldown">Tiempo de espera entre alertas (minutos)</Label>
          <Input
            id="cooldown"
            type="number"
            min="1"
            value={cooldownMinutes}
            onChange={(e) => setCooldownMinutes(Number(e.target.value))}
          />
          <p className="text-xs text-gray-500">
            Evita spam esperando este tiempo antes de enviar otra alerta igual
          </p>
        </div>

        {/* Active Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
          <div>
            <Label htmlFor="active" className="cursor-pointer">
              Alerta activa
            </Label>
            <p className="text-xs text-gray-500">
              {active ? 'Esta alerta está habilitada' : 'Esta alerta está deshabilitada'}
            </p>
          </div>
          <Switch id="active" checked={active} onCheckedChange={setActive} />
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            <Bell className="h-4 w-4 mr-2" />
            {alert ? 'Guardar Cambios' : 'Crear Alerta'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Alert List Item Component
interface AlertListItemProps {
  alert: Alert;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

export function AlertListItem({ alert, onEdit, onToggle, onDelete }: AlertListItemProps) {
  const severityConfig = SEVERITIES.find(s => s.value === alert.severity);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-gray-900">{alert.name}</h3>
              <span className={cn('px-2 py-0.5 text-xs rounded-full', severityConfig?.color)}>
                {severityConfig?.label}
              </span>
              {!alert.active && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                  Inactiva
                </span>
              )}
            </div>
            {alert.description && (
              <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
            )}
            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
              <span>
                <strong>Métrica:</strong> {alert.metricName}
              </span>
              <span>•</span>
              <span>
                <strong>Condición:</strong> {alert.condition} {Array.isArray(alert.threshold) ? alert.threshold.join('-') : alert.threshold}
              </span>
              <span>•</span>
              <span>
                <strong>Canales:</strong> {alert.channels.join(', ')}
              </span>
            </div>
            {alert.lastTriggered && (
              <p className="text-xs text-gray-400 mt-2">
                Última activación: {new Date(alert.lastTriggered).toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Switch checked={alert.active} onCheckedChange={onToggle} />
            <Button variant="outline" size="sm" onClick={onEdit}>
              Editar
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
