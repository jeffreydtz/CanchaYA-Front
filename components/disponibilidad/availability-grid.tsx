'use client'

import { DisponibilidadHorario } from '@/lib/api-client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Calendar } from 'lucide-react'

interface AvailabilityGridProps {
  disponibilidades: DisponibilidadHorario[]
  title?: string
  description?: string
  showCanchaName?: boolean
}

const DIAS_SEMANA = [
  { value: 0, label: 'Domingo', short: 'Dom' },
  { value: 1, label: 'Lunes', short: 'Lun' },
  { value: 2, label: 'Martes', short: 'Mar' },
  { value: 3, label: 'Miércoles', short: 'Mié' },
  { value: 4, label: 'Jueves', short: 'Jue' },
  { value: 5, label: 'Viernes', short: 'Vie' },
  { value: 6, label: 'Sábado', short: 'Sáb' },
]

/**
 * AvailabilityGrid Component
 *
 * Displays a weekly grid view of availability patterns (DisponibilidadHorario)
 *
 * Features:
 * - Matrix layout: columns = days (Mon-Sun), rows = time slots
 * - Visual indicators for available vs unavailable slots
 * - Optional cancha name display for multi-court views
 * - Responsive design with proper mobile handling
 *
 * @param disponibilidades Array of weekly availability patterns
 * @param title Optional grid title
 * @param description Optional grid description
 * @param showCanchaName Show court name in each cell (for multi-court grids)
 */
export function AvailabilityGrid({
  disponibilidades,
  title = 'Patrón de Disponibilidad Semanal',
  description = 'Vista de horarios configurados por día de la semana',
  showCanchaName = false,
}: AvailabilityGridProps) {
  // Extract unique time slots (horarios)
  const uniqueHorarios = Array.from(
    new Map(
      disponibilidades
        .filter((d) => d.horarioId) // Filter out entries without horarioId
        .map((d) => [
          d.horarioId,
          { id: d.horarioId!, horaInicio: d.horario.horaInicio, horaFin: d.horario.horaFin },
        ])
    ).values()
  ).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))

  // Create a map for quick lookup: diaSemana -> horarioId -> DisponibilidadHorario
  const gridMap = new Map<number, Map<string, DisponibilidadHorario>>()
  disponibilidades.forEach((disp) => {
    if (!disp.horarioId) return // Skip entries without horarioId
    if (!gridMap.has(disp.diaSemana)) {
      gridMap.set(disp.diaSemana, new Map())
    }
    gridMap.get(disp.diaSemana)!.set(disp.horarioId, disp)
  })

  if (disponibilidades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="h-16 w-16 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">No hay disponibilidades configuradas</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header Row - Days of Week */}
            <div className="grid grid-cols-8 gap-2 mb-2">
              <div className="font-semibold text-sm text-muted-foreground flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Horario
              </div>
              {DIAS_SEMANA.map((dia) => (
                <div
                  key={dia.value}
                  className="font-semibold text-sm text-center py-2 bg-muted/50 rounded-md"
                >
                  {dia.short}
                </div>
              ))}
            </div>

            {/* Grid Rows - Time Slots */}
            {uniqueHorarios.map((horario) => (
              <div key={horario.id} className="grid grid-cols-8 gap-2 mb-2">
                {/* Time Label */}
                <div className="flex items-center text-sm font-medium text-muted-foreground">
                  {horario.horaInicio.substring(0, 5)} - {horario.horaFin.substring(0, 5)}
                </div>

                {/* Cells for each day */}
                {DIAS_SEMANA.map((dia) => {
                  const slot = gridMap.get(dia.value)?.get(horario.id)
                  const isAvailable = slot?.disponible !== false

                  return (
                    <div
                      key={`${dia.value}-${horario.id}`}
                      className={`
                        min-h-[60px] rounded-md border-2 flex flex-col items-center justify-center p-2 text-center transition-all
                        ${
                          slot
                            ? isAvailable
                              ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                              : 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700'
                            : 'bg-white border-gray-100 dark:bg-gray-950 dark:border-gray-800 opacity-40'
                        }
                      `}
                    >
                      {slot ? (
                        <>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              isAvailable
                                ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300'
                                : 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400'
                            }`}
                          >
                            {isAvailable ? 'Habilitado' : 'Bloqueado'}
                          </Badge>
                          {showCanchaName && slot.cancha && (
                            <p className="text-xs text-muted-foreground mt-1 truncate w-full">
                              {slot.cancha.nombre}
                            </p>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">—</span>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-50 border-2 border-green-200 rounded dark:bg-green-950/20 dark:border-green-800"></div>
            <span className="text-muted-foreground">Habilitado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-50 border-2 border-gray-200 rounded dark:bg-gray-900 dark:border-gray-700"></div>
            <span className="text-muted-foreground">Bloqueado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border-2 border-gray-100 rounded opacity-40 dark:bg-gray-950 dark:border-gray-800"></div>
            <span className="text-muted-foreground">Sin configurar</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
