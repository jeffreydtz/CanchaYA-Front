'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { HelpCircle, TrendingUp, TrendingDown, Minus, CheckCircle, AlertTriangle } from 'lucide-react'

export function AnalyticsLegend() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-blue-500" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Guía de Lectura de Análisis
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status Colors */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Estados por Color</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900 dark:text-white">Bueno / Exitoso</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Métrica en buen desempeño</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900 dark:text-white">Advertencia</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Requiere atención, tendencia negativa</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900 dark:text-white">Crítico / Peligro</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Acción inmediata requerida</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-gray-400"></div>
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900 dark:text-white">Neutral</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Sin cambios significativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trends */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tendencias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900 dark:text-white">Tendencia Positiva</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Métrica en crecimiento</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900 dark:text-white">Tendencia Negativa</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Métrica en disminución</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Minus className="h-5 w-5 text-gray-500" />
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900 dark:text-white">Sin Cambios</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Métrica estable</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Explanation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Significado de Métricas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1">Ocupación</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Porcentaje de horas disponibles que fueron reservadas. Mayor ocupación = mejor rentabilidad.
            </p>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1">Ingresos</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Monto total generado por reservas confirmadas. Incluye todas las transacciones completadas en el período.
            </p>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1">Usuarios Activos</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Cantidad de usuarios que realizaron al menos una reserva en el período. Indica alcance y engagement.
            </p>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1">Reservas Confirmadas</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Cantidad de reservas que fueron confirmadas por los usuarios. Excluye cancelaciones y no-shows.
            </p>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1">Tasa de No-show</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Porcentaje de reservas confirmadas que no fueron utilizadas. Menor es mejor.
            </p>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1">Ingresos por Cancha</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Ingresos promedio generados por cada cancha. Útil para identificar canchas más rentables.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Consejo:</strong> Pasar el cursor sobre cualquier métrica para ver más detalles. Los números con porcentajes entre paréntesis indican el cambio respecto al período anterior.
        </AlertDescription>
      </Alert>
    </div>
  )
}
