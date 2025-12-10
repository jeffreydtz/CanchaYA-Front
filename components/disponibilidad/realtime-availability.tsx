'use client'

import { useState } from 'react'
import { AvailabilitySlotRealTime } from '@/lib/api-client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, Lock, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RealtimeAvailabilityProps {
  slots: AvailabilitySlotRealTime[]
  selectedDate: string // YYYY-MM-DD
  onSlotSelect?: (slot: AvailabilitySlotRealTime) => void
  selectedSlotId?: string
  title?: string
  groupByCancha?: boolean
}

/**
 * RealtimeAvailability Component
 *
 * Displays real-time availability for booking with occupied/free status
 *
 * Features:
 * - Shows only enabled time slots from weekly pattern
 * - Marks occupied slots (with existing reservations) as disabled
 * - Allows clicking on free slots to select for booking
 * - Groups by cancha when multiple courts shown
 * - Visual feedback for free vs occupied slots
 *
 * @param slots Array of real-time availability slots from backend
 * @param selectedDate Date being viewed (YYYY-MM-DD)
 * @param onSlotSelect Callback when a free slot is clicked
 * @param selectedSlotId Currently selected slot ID for visual feedback
 * @param title Optional card title
 * @param groupByCancha Group slots by court (for multi-court views)
 */
export function RealtimeAvailability({
  slots,
  selectedDate,
  onSlotSelect,
  selectedSlotId,
  title = 'Horarios Disponibles',
  groupByCancha = false,
}: RealtimeAvailabilityProps) {
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null)

  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  // Group slots by cancha if needed
  const groupedSlots = groupByCancha
    ? slots.reduce((acc, slot) => {
        if (!acc[slot.canchaId]) {
          acc[slot.canchaId] = { canchaNombre: slot.canchaNombre, slots: [] }
        }
        acc[slot.canchaId].slots.push(slot)
        return acc
      }, {} as Record<string, { canchaNombre: string; slots: AvailabilitySlotRealTime[] }>)
    : null

  if (slots.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{formatDate(selectedDate)}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="h-16 w-16 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground font-medium">No hay horarios disponibles</p>
            <p className="text-sm text-muted-foreground/70 mt-2">
              Esta cancha no tiene configurados horarios para este día
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderSlot = (slot: AvailabilitySlotRealTime) => {
    const isFree = !slot.ocupado && slot.estado === 'libre'
    const isSelected = selectedSlotId === slot.disponibilidadId
    const isHovered = hoveredSlot === slot.disponibilidadId

    return (
      <button
        key={slot.disponibilidadId}
        onClick={() => isFree && onSlotSelect?.(slot)}
        disabled={!isFree}
        onMouseEnter={() => setHoveredSlot(slot.disponibilidadId)}
        onMouseLeave={() => setHoveredSlot(null)}
        className={cn(
          'relative p-4 rounded-lg border-2 transition-all duration-200 text-left',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          isFree
            ? cn(
                'cursor-pointer border-green-200 dark:border-green-800',
                isSelected
                  ? 'bg-green-100 border-green-500 dark:bg-green-950 dark:border-green-600 ring-2 ring-green-500'
                  : isHovered
                  ? 'bg-green-50 border-green-300 dark:bg-green-950/50 dark:border-green-700 shadow-md'
                  : 'bg-white dark:bg-gray-950 hover:bg-green-50 dark:hover:bg-green-950/30 hover:border-green-300 hover:shadow-sm'
              )
            : 'cursor-not-allowed bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700 opacity-60'
        )}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className={cn('h-5 w-5', isFree ? 'text-green-600 dark:text-green-400' : 'text-gray-400')} />
            <span className={cn('font-bold text-lg', isFree ? 'text-gray-900 dark:text-white' : 'text-gray-500')}>
              {slot.horaInicio.substring(0, 5)} - {slot.horaFin.substring(0, 5)}
            </span>
          </div>
          {isFree ? (
            <CheckCircle2 className={cn('h-5 w-5', isSelected ? 'text-green-600' : 'text-green-500')} />
          ) : (
            <Lock className="h-5 w-5 text-red-500" />
          )}
        </div>

        <Badge
          variant={isFree ? 'default' : 'secondary'}
          className={cn(
            'text-xs font-semibold',
            isFree
              ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-700'
              : 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-300 dark:border-red-700'
          )}
        >
          {isFree ? 'Disponible' : 'Ocupado'}
        </Badge>

        {isSelected && (
          <div className="absolute inset-0 rounded-lg bg-green-500/10 pointer-events-none animate-pulse" />
        )}
      </button>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription className="capitalize">{formatDate(selectedDate)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {groupByCancha && groupedSlots ? (
          // Grouped by cancha view
          Object.entries(groupedSlots).map(([canchaId, { canchaNombre, slots: canchaSlots }]) => (
            <div key={canchaId} className="space-y-3">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white border-b pb-2">
                {canchaNombre}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {canchaSlots
                  .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
                  .map((slot) => renderSlot(slot))}
              </div>
            </div>
          ))
        ) : (
          // Simple list view
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {slots
              .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
              .map((slot) => renderSlot(slot))}
          </div>
        )}

        {/* Summary Stats */}
        <div className="pt-4 border-t flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-muted-foreground">
              {slots.filter((s) => s.estado === 'libre').length} disponibles
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-muted-foreground">
              {slots.filter((s) => s.estado === 'ocupado').length} ocupados
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-semibold">
              Total: {slots.length} horarios configurados
            </span>
          </div>
        </div>

        {onSlotSelect && (
          <p className="text-sm text-muted-foreground italic">
            💡 Haz clic en un horario disponible para reservar
          </p>
        )}
      </CardContent>
    </Card>
  )
}
