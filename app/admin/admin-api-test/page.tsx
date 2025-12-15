"use client"

/**
 * Página de prueba para verificar todos los endpoints del dashboard administrativo
 * Esta página demuestra el uso de los 8 endpoints principales de /admin
 */

import { useEffect, useState } from 'react'
import apiClient from '@/lib/api-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'

interface EndpointTest {
  name: string
  endpoint: string
  status: 'pending' | 'success' | 'error'
  data?: any
  error?: string
}

const TIMEZONE = 'America/Argentina/Cordoba'
const DATE_FROM = '2025-06-01'
const DATE_TO = '2025-11-01'

export default function AdminApiTestPage() {
  const [tests, setTests] = useState<EndpointTest[]>([
    { name: '1️⃣ Resumen General', endpoint: 'GET /admin/resumen', status: 'pending' },
    { name: '2️⃣ Top Jugadores', endpoint: 'GET /admin/top-jugadores', status: 'pending' },
    { name: '3️⃣ Canchas Más Usadas', endpoint: 'GET /admin/canchas-mas-usadas', status: 'pending' },
    { name: '4️⃣ Personas con Deuda', endpoint: 'GET /admin/personas-con-deuda', status: 'pending' },
    { name: '5️⃣ Reservas Aggregate', endpoint: 'GET /admin/reservas/aggregate', status: 'pending' },
    { name: '6️⃣ Drilldown - Club', endpoint: 'GET /admin/reservas/drilldown?level=club', status: 'pending' },
    { name: '6️⃣b Drilldown - Cancha', endpoint: 'GET /admin/reservas/drilldown?level=cancha', status: 'pending' },
    { name: '6️⃣c Drilldown - Detalle', endpoint: 'GET /admin/reservas/drilldown?level=detalle', status: 'pending' },
    { name: '7️⃣ Ocupación', endpoint: 'GET /admin/ocupacion', status: 'pending' },
    { name: '8️⃣ Heatmap', endpoint: 'GET /admin/reservas/heatmap', status: 'pending' },
  ])
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    const newTests: EndpointTest[] = []

    try {
      // 1️⃣ Resumen General
      const resumen = await apiClient.getAdminResumen()
      newTests.push({
        name: '1️⃣ Resumen General',
        endpoint: 'GET /admin/resumen',
        status: resumen.error ? 'error' : 'success',
        data: resumen.data,
        error: resumen.error
      })

      // 2️⃣ Top Jugadores
      const topJugadores = await apiClient.getAdminTopJugadores(DATE_FROM, DATE_TO)
      newTests.push({
        name: '2️⃣ Top Jugadores',
        endpoint: 'GET /admin/top-jugadores',
        status: topJugadores.error ? 'error' : 'success',
        data: topJugadores.data,
        error: topJugadores.error
      })

      // 3️⃣ Canchas Más Usadas
      const canchasMasUsadas = await apiClient.getAdminCanchasMasUsadas(DATE_FROM, DATE_TO, TIMEZONE)
      newTests.push({
        name: '3️⃣ Canchas Más Usadas',
        endpoint: 'GET /admin/canchas-mas-usadas',
        status: canchasMasUsadas.error ? 'error' : 'success',
        data: canchasMasUsadas.data,
        error: canchasMasUsadas.error
      })

      // 4️⃣ Personas con Deuda
      const personasConDeuda = await apiClient.getAdminPersonasConDeuda()
      newTests.push({
        name: '4️⃣ Personas con Deuda',
        endpoint: 'GET /admin/personas-con-deuda',
        status: personasConDeuda.error ? 'error' : 'success',
        data: personasConDeuda.data,
        error: personasConDeuda.error
      })

      // 5️⃣ Reservas Aggregate
      const aggregate = await apiClient.getAdminReservasAggregate('week', DATE_FROM, DATE_TO, TIMEZONE)
      newTests.push({
        name: '5️⃣ Reservas Aggregate',
        endpoint: 'GET /admin/reservas/aggregate',
        status: aggregate.error ? 'error' : 'success',
        data: aggregate.data,
        error: aggregate.error
      })

      // 6️⃣ Drilldown - Club
      const drilldownClub = await apiClient.getAdminReservasDrilldownClub(DATE_FROM, DATE_TO)
      newTests.push({
        name: '6️⃣ Drilldown - Club',
        endpoint: 'GET /admin/reservas/drilldown?level=club',
        status: drilldownClub.error ? 'error' : 'success',
        data: drilldownClub.data,
        error: drilldownClub.error
      })

      // 6️⃣b Drilldown - Cancha (si hay clubes)
      if (drilldownClub.data && drilldownClub.data.length > 0) {
        const clubId = drilldownClub.data[0].id
        const drilldownCancha = await apiClient.getAdminReservasDrilldownCancha(clubId, DATE_FROM, DATE_TO)
        newTests.push({
          name: '6️⃣b Drilldown - Cancha',
          endpoint: 'GET /admin/reservas/drilldown?level=cancha',
          status: drilldownCancha.error ? 'error' : 'success',
          data: drilldownCancha.data,
          error: drilldownCancha.error
        })

        // 6️⃣c Drilldown - Detalle (si hay canchas)
        if (drilldownCancha.data && drilldownCancha.data.length > 0) {
          const canchaId = drilldownCancha.data[0].id
          const drilldownDetalle = await apiClient.getAdminReservasDrilldownDetalle(canchaId, DATE_FROM, DATE_TO)
          newTests.push({
            name: '6️⃣c Drilldown - Detalle',
            endpoint: 'GET /admin/reservas/drilldown?level=detalle',
            status: drilldownDetalle.error ? 'error' : 'success',
            data: drilldownDetalle.data,
            error: drilldownDetalle.error
          })
        }
      }

      // 7️⃣ Ocupación
      const ocupacion = await apiClient.getAdminOcupacion('cancha', DATE_FROM, DATE_TO, TIMEZONE)
      newTests.push({
        name: '7️⃣ Ocupación',
        endpoint: 'GET /admin/ocupacion',
        status: ocupacion.error ? 'error' : 'success',
        data: ocupacion.data,
        error: ocupacion.error
      })

      // 8️⃣ Heatmap
      const heatmap = await apiClient.getAdminReservasHeatmap(undefined, DATE_FROM, DATE_TO, TIMEZONE)
      newTests.push({
        name: '8️⃣ Heatmap',
        endpoint: 'GET /admin/reservas/heatmap',
        status: heatmap.error ? 'error' : 'success',
        data: heatmap.data,
        error: heatmap.error
      })

      setTests(newTests)

      const successCount = newTests.filter(t => t.status === 'success').length
      const errorCount = newTests.filter(t => t.status === 'error').length

      if (errorCount === 0) {
        toast.success('✅ Todos los endpoints funcionan correctamente', {
          description: `${successCount}/${newTests.length} endpoints exitosos`
        })
      } else {
        toast.warning(`⚠️ ${errorCount} endpoints con errores`, {
          description: `${successCount}/${newTests.length} endpoints exitosos`
        })
      }
    } catch (error) {
      toast.error('Error al ejecutar pruebas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runTests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            Test Admin API Endpoints
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Verificación de los 8 endpoints del dashboard administrativo
          </p>
        </div>
        <Button onClick={runTests} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Probar Endpoints
        </Button>
      </div>

      <div className="grid gap-4">
        {tests.map((test, idx) => (
          <Card key={idx}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {test.status === 'success' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    {test.status === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
                    {test.name}
                  </CardTitle>
                  <CardDescription>{test.endpoint}</CardDescription>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  test.status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  test.status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {test.status === 'success' ? 'Success' : test.status === 'error' ? 'Error' : 'Pending'}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {test.error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-400 font-medium">Error:</p>
                  <p className="text-red-700 dark:text-red-500 text-sm mt-1">{test.error}</p>
                </div>
              )}
              {test.data && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 overflow-auto">
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Respuesta:</p>
                  <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto">
                    {JSON.stringify(test.data, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle>ℹ️ Información de Prueba</CardTitle>
          <CardDescription>Configuración utilizada para las pruebas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Rango de fechas:</strong> {DATE_FROM} a {DATE_TO}</p>
          <p><strong>Zona horaria:</strong> {TIMEZONE}</p>
          <p><strong>Granularidad:</strong> week (para aggregate)</p>
          <p><strong>Agrupación:</strong> cancha (para ocupación)</p>
        </CardContent>
      </Card>
    </div>
  )
}
