'use client'

import React, { ReactNode } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'

interface MetricTooltipProps {
  title: string
  description: string
  children?: ReactNode
  example?: string
  tip?: string
}

export function MetricTooltip({ title, description, children, example, tip }: MetricTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || (
            <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
          )}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium text-sm">{title}</p>
            <p className="text-xs text-gray-300">{description}</p>
            {example && (
              <p className="text-xs text-gray-400 italic">
                <strong>Ejemplo:</strong> {example}
              </p>
            )}
            {tip && (
              <p className="text-xs text-blue-200 bg-blue-900/20 p-1 rounded">
                <strong>💡 Consejo:</strong> {tip}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Predefined tooltips for common metrics
 */

export function OccupancyTooltip() {
  return (
    <MetricTooltip
      title="Ocupación"
      description="Porcentaje de horas disponibles que fueron reservadas en el período"
      example="Si hay 100 horas disponibles y 75 fueron reservadas, la ocupación es 75%"
      tip="Una ocupación mayor al 70% generalmente indica buena demanda. Por debajo del 50%, considera revisar precios o marketing."
    />
  )
}

export function RevenueTooltip() {
  return (
    <MetricTooltip
      title="Ingresos"
      description="Monto total en pesos generado por todas las reservas confirmadas"
      example="10 reservas × $1.000 por hora = $10.000 en ingresos"
      tip="Compara con el mes anterior para identificar tendencias. Un crecimiento sostenido indica estrategia exitosa."
    />
  )
}

export function ActiveUsersTooltip() {
  return (
    <MetricTooltip
      title="Usuarios Activos"
      description="Cantidad total de usuarios distintos que realizaron al menos una reserva"
      example="Si 50 usuarios diferentes hicieron reservas, son 50 usuarios activos"
      tip="Crecimiento en usuarios activos indica expansión de mercado. Stagnación sugiere saturación."
    />
  )
}

export function ConfirmedReservationsTooltip() {
  return (
    <MetricTooltip
      title="Reservas Confirmadas"
      description="Número de reservas que fueron confirmadas por los usuarios (no incluye cancelaciones)"
      example="100 reservas totales - 10 cancelaciones = 90 reservas confirmadas"
      tip="Esta métrica refleja la demanda real. Compara con reservas totales para identificar tasa de cancelación."
    />
  )
}

export function NoShowRateTooltip() {
  return (
    <MetricTooltip
      title="Tasa de No-show"
      description="Porcentaje de reservas confirmadas que no fueron utilizadas (el usuario no se presentó)"
      example="Si 100 reservas fueron confirmadas pero 15 no fueron utilizadas, la tasa es 15%"
      tip="Una tasa alta indica problemas de confiabilidad. Considera un sistema de confirmación 24h antes."
    />
  )
}

export function RevenuePerCourtTooltip() {
  return (
    <MetricTooltip
      title="Ingresos por Cancha"
      description="Promedio de ingresos generados por cada cancha disponible"
      example="$50.000 de ingresos totales ÷ 10 canchas = $5.000 por cancha"
      tip="Útil para identificar canchas bajo-rendimiento. Las que caen bajo el promedio necesitan revisión."
    />
  )
}

export function BookingRateTooltip() {
  return (
    <MetricTooltip
      title="Tasa de Reserva"
      description="Porcentaje de horarios disponibles que fueron reservados respecto a los visitantes"
      example="De 1.000 visitas al sitio, 150 resultaron en reservas = 15% tasa de conversión"
      tip="Mejora esto con marketing efectivo, UX mejorada, y precios competitivos."
    />
  )
}

export function AverageReservationValueTooltip() {
  return (
    <MetricTooltip
      title="Valor Promedio de Reserva"
      description="Promedio de dinero generado por cada reserva confirmada"
      example="$50.000 en ingresos ÷ 100 reservas = $500 por reserva"
      tip="Aumenta esto mejorando los precios, ofertas de paquetes o servicios adicionales."
    />
  )
}
