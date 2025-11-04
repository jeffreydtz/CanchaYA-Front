'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalyticsFilters, DateRangeFilter } from '@/lib/analytics/types';

interface AnalyticsFiltersProps {
  filters: AnalyticsFilters;
  onChange: (filters: AnalyticsFilters) => void;
  onReset?: () => void;
  className?: string;
}

export function AnalyticsFiltersComponent({
  filters,
  onChange,
  onReset,
  className
}: AnalyticsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const datePresets = [
    { value: 'today', label: 'Hoy' },
    { value: 'yesterday', label: 'Ayer' },
    { value: 'last7days', label: 'Últimos 7 días' },
    { value: 'last30days', label: 'Últimos 30 días' },
    { value: 'thisMonth', label: 'Este mes' },
    { value: 'lastMonth', label: 'Mes pasado' },
    { value: 'custom', label: 'Personalizado' }
  ];

  const handlePresetChange = (preset: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let start: Date;
    let end: Date = new Date(today);
    end.setHours(23, 59, 59, 999);

    switch (preset) {
      case 'today':
        start = new Date(today);
        break;
      case 'yesterday':
        start = new Date(today);
        start.setDate(start.getDate() - 1);
        end = new Date(start);
        end.setHours(23, 59, 59, 999);
        break;
      case 'last7days':
        start = new Date(today);
        start.setDate(start.getDate() - 7);
        break;
      case 'last30days':
        start = new Date(today);
        start.setDate(start.getDate() - 30);
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        return;
    }

    onChange({
      ...filters,
      dateRange: {
        start,
        end,
        preset: preset as any
      }
    });
  };

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    const date = new Date(value);

    onChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: date,
        preset: 'custom'
      }
    });
  };

  const handleReset = () => {
    const today = new Date();
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);

    const defaultFilters: AnalyticsFilters = {
      dateRange: {
        start: last30Days,
        end: today,
        preset: 'last30days'
      }
    };

    onChange(defaultFilters);
    onReset?.();
  };

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <h3 className="text-sm font-medium text-gray-900">Filtros</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Ocultar' : 'Mostrar'} filtros
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            </div>
          </div>

          {/* Date Presets */}
          <div className="flex flex-wrap gap-2">
            {datePresets.map((preset) => (
              <Button
                key={preset.value}
                variant={filters.dateRange.preset === preset.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePresetChange(preset.value)}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Custom Date Range */}
          {(isExpanded || filters.dateRange.preset === 'custom') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha inicio
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={filters.dateRange.start.toISOString().split('T')[0]}
                    onChange={(e) => handleDateChange('start', e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha fin
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={filters.dateRange.end.toISOString().split('T')[0]}
                    onChange={(e) => handleDateChange('end', e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Additional Filters (if expanded) */}
          {isExpanded && (
            <div className="space-y-4 pt-2 border-t">
              {/* Sport Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deportes
                </label>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    label="Todos"
                    active={!filters.sportIds || filters.sportIds.length === 0}
                    onClick={() => onChange({ ...filters, sportIds: undefined })}
                  />
                  {/* Add sport chips dynamically */}
                </div>
              </div>

              {/* User Segment Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Segmento de usuarios
                </label>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    label="Todos"
                    active={!filters.userSegment || filters.userSegment === 'ALL'}
                    onClick={() => onChange({ ...filters, userSegment: 'ALL' })}
                  />
                  <FilterChip
                    label="VIP"
                    active={filters.userSegment === 'VIP'}
                    onClick={() => onChange({ ...filters, userSegment: 'VIP' })}
                  />
                  <FilterChip
                    label="Regulares"
                    active={filters.userSegment === 'REGULAR'}
                    onClick={() => onChange({ ...filters, userSegment: 'REGULAR' })}
                  />
                  <FilterChip
                    label="Ocasionales"
                    active={filters.userSegment === 'OCCASIONAL'}
                    onClick={() => onChange({ ...filters, userSegment: 'OCCASIONAL' })}
                  />
                  <FilterChip
                    label="Inactivos"
                    active={filters.userSegment === 'INACTIVE'}
                    onClick={() => onChange({ ...filters, userSegment: 'INACTIVE' })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Filter Chip Component
interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1 text-sm rounded-full border transition-colors',
        active
          ? 'bg-blue-500 text-white border-blue-500'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
      )}
    >
      {label}
    </button>
  );
}

// Date Range Display Component
interface DateRangeDisplayProps {
  dateRange: DateRangeFilter;
  className?: string;
}

export function DateRangeDisplay({ dateRange, className }: DateRangeDisplayProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className={cn('flex items-center gap-2 text-sm text-gray-600', className)}>
      <Calendar className="h-4 w-4" />
      <span>
        {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
      </span>
    </div>
  );
}
