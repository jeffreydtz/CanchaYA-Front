/**
 * Alert System Demo & Testing Page
 *
 * Página de demostración y testing del sistema de alertas con patrón Observer
 * Permite probar todas las funcionalidades del sistema de alertas y emails
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Bell,
  Mail,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  DollarSign,
  AlertCircle,
  CheckCircle,
  PlayCircle,
  Trash2,
} from 'lucide-react'
import { Alert, AlertSeverity, AlertTrigger } from '@/lib/analytics/types'
import { useAlertObserver, useAlertStats, getSeverityColor, getSeverityIcon } from '@/lib/patterns/alert-observer'
import { useNotification } from '@/lib/patterns/notification-observer'
import { emailService } from '@/lib/email/email-service'
import { cn } from '@/lib/utils'

// Demo alerts for testing
const DEMO_ALERTS: Alert[] = [
  {
    id: 'alert-1',
    name: 'Ocupación Baja',
    description: 'Alerta cuando la ocupación cae por debajo del 60%',
    metricId: 'occupancy-rate',
    metricName: 'Tasa de Ocupación',
    condition: '<',
    threshold: 60,
    severity: 'MEDIUM',
    channels: ['EMAIL', 'IN_APP'],
    emailConfig: {
      enabled: true,
      recipients: ['admin@canchaya.com'],
      template: 'METRIC_THRESHOLD',
    },
    active: true,
    cooldownMinutes: 30,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'alert-2',
    name: 'Ingresos Críticos',
    description: 'Alerta crítica cuando los ingresos caen por debajo de $5000',
    metricId: 'revenue',
    metricName: 'Ingresos Diarios',
    condition: '<',
    threshold: 5000,
    severity: 'CRITICAL',
    channels: ['EMAIL', 'PUSH', 'IN_APP'],
    emailConfig: {
      enabled: true,
      recipients: ['admin@canchaya.com', 'finance@canchaya.com'],
      template: 'CRITICAL_ALERT',
      customSubject: '🚨 CRÍTICO: Ingresos por debajo del mínimo',
    },
    active: true,
    cooldownMinutes: 60,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'alert-3',
    name: 'Alta Demanda',
    description: 'Alerta cuando usuarios activos superan 200',
    metricId: 'active-users',
    metricName: 'Usuarios Activos',
    condition: '>',
    threshold: 200,
    severity: 'LOW',
    channels: ['IN_APP'],
    active: true,
    cooldownMinutes: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'alert-4',
    name: 'Tasa de No-Show Alta',
    description: 'Alerta de alta prioridad cuando el no-show supera el 15%',
    metricId: 'no-show-rate',
    metricName: 'Tasa de No-Show',
    condition: '>',
    threshold: 15,
    severity: 'HIGH',
    channels: ['EMAIL', 'IN_APP'],
    emailConfig: {
      enabled: true,
      recipients: ['operations@canchaya.com'],
      template: 'METRIC_THRESHOLD',
      includeChart: true,
      includeHistoricalData: true,
    },
    active: true,
    cooldownMinutes: 45,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export default function AlertDemoPage() {
  const { monitorMetric, triggeredAlerts, getActiveAlerts, clearAlertHistory, subscribeToAlerts } = useAlertObserver()
  const stats = useAlertStats(5000) // Refresh every 5 seconds
  const { notifySuccess, notifyInfo } = useNotification()

  const [metrics, setMetrics] = useState({
    occupancyRate: 75,
    revenue: 8500,
    activeUsers: 150,
    noShowRate: 10,
  })

  const [simulationRunning, setSimulationRunning] = useState(false)
  const [testEmail, setTestEmail] = useState('test@canchaya.com')

  // Subscribe to critical alerts
  useEffect(() => {
    const unsubscribe = subscribeToAlerts('CRITICAL', (trigger) => {
      console.log('🚨 CRITICAL ALERT DETECTED:', trigger)
    })

    return unsubscribe
  }, [subscribeToAlerts])

  // Handle metric change
  const handleMetricChange = (metricId: string, value: number) => {
    setMetrics((prev) => ({ ...prev, [metricId]: value }))
    monitorMetric(metricId, value, DEMO_ALERTS)
  }

  // Simulate metric fluctuations
  const startSimulation = () => {
    setSimulationRunning(true)
    notifyInfo('Simulación Iniciada', 'Las métricas cambiarán aleatoriamente cada 3 segundos')

    const interval = setInterval(() => {
      setMetrics((prev) => {
        const newMetrics = {
          occupancyRate: Math.max(0, Math.min(100, prev.occupancyRate + (Math.random() - 0.5) * 20)),
          revenue: Math.max(0, prev.revenue + (Math.random() - 0.5) * 3000),
          activeUsers: Math.max(0, Math.floor(prev.activeUsers + (Math.random() - 0.5) * 50)),
          noShowRate: Math.max(0, Math.min(100, prev.noShowRate + (Math.random() - 0.5) * 5)),
        }

        // Monitor all metrics
        monitorMetric('occupancy-rate', newMetrics.occupancyRate, DEMO_ALERTS)
        monitorMetric('revenue', newMetrics.revenue, DEMO_ALERTS)
        monitorMetric('active-users', newMetrics.activeUsers, DEMO_ALERTS)
        monitorMetric('no-show-rate', newMetrics.noShowRate, DEMO_ALERTS)

        return newMetrics
      })
    }, 3000)

    // Stop after 1 minute
    setTimeout(() => {
      clearInterval(interval)
      setSimulationRunning(false)
      notifySuccess('Simulación Finalizada', 'La simulación se ha detenido')
    }, 60000)
  }

  // Send test email
  const sendTestEmail = async () => {
    const mockTrigger: AlertTrigger = {
      alertId: 'test-alert',
      alert: DEMO_ALERTS[0],
      triggeredAt: new Date(),
      value: 45,
      previousValue: 75,
      message: 'Este es un email de prueba del sistema de alertas',
    }

    const result = await emailService.sendAlertEmail(mockTrigger, {
      enabled: true,
      recipients: [testEmail],
      template: 'METRIC_THRESHOLD',
    })

    if (result.success) {
      notifySuccess('Email Enviado', `Email de prueba enviado a ${testEmail}`)
    } else {
      notifyInfo('Error al enviar email', result.error || 'Error desconocido')
    }
  }

  // Send daily summary
  const sendDailySummary = async () => {
    await emailService.sendDailySummary([testEmail], {
      date: new Date(),
      metrics: [
        { name: 'Tasa de Ocupación', value: metrics.occupancyRate, change: 5, status: 'success' },
        { name: 'Ingresos', value: metrics.revenue, change: -2, status: 'warning' },
        { name: 'Usuarios Activos', value: metrics.activeUsers, change: 10, status: 'success' },
      ],
      alerts: triggeredAlerts.length,
      topInsights: [
        'La ocupación aumentó 5% respecto a ayer',
        'Ingresos ligeramente por debajo del objetivo',
        'Gran aumento en usuarios activos (+10%)',
      ],
    })

    notifySuccess('Resumen Enviado', 'Resumen diario enviado exitosamente')
  }

  // Send weekly report
  const sendWeeklyReport = async () => {
    await emailService.sendWeeklyReport([testEmail], {
      weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      weekEnd: new Date(),
      summary: {
        totalReservations: 245,
        totalRevenue: 45000,
        occupancyRate: 78,
        newUsers: 34,
      },
      highlights: [
        'Record de reservas en día sábado',
        'Nuevo usuario premium registrado',
        '95% de satisfacción en encuestas',
      ],
      topCourts: [
        { name: 'Cancha Fútbol 1', revenue: 12500 },
        { name: 'Cancha Tenis 2', revenue: 9800 },
        { name: 'Cancha Paddle 1', revenue: 8200 },
      ],
    })

    notifySuccess('Reporte Enviado', 'Reporte semanal enviado exitosamente')
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">🔬 Sistema de Alertas - Demo & Testing</h1>
        <p className="text-muted-foreground">
          Prueba el sistema de alertas con patrón Observer y notificaciones por email
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Alertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Últimas 24h
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.last24Hours}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Emails Enviados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.emailsSent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Alertas Críticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {stats.bySeverity.CRITICAL}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">📊 Métricas</TabsTrigger>
          <TabsTrigger value="alerts">🚨 Alertas Disparadas</TabsTrigger>
          <TabsTrigger value="email">📧 Email Testing</TabsTrigger>
          <TabsTrigger value="config">⚙️ Configuración</TabsTrigger>
        </TabsList>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={startSimulation}
              disabled={simulationRunning}
              className="gap-2"
            >
              <PlayCircle className="h-4 w-4" />
              {simulationRunning ? 'Simulación en Curso...' : 'Iniciar Simulación'}
            </Button>
            <Button variant="outline" onClick={() => clearAlertHistory()}>
              <Trash2 className="h-4 w-4 mr-2" />
              Limpiar Historial
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Occupancy Rate */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Tasa de Ocupación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold">{metrics.occupancyRate.toFixed(1)}%</span>
                  <Badge variant={metrics.occupancyRate < 60 ? 'destructive' : 'default'}>
                    {metrics.occupancyRate < 60 ? 'Bajo' : 'Normal'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label>Simular Valor</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={metrics.occupancyRate.toFixed(0)}
                    onChange={(e) => handleMetricChange('occupancy-rate', parseFloat(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Revenue */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Ingresos Diarios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold">${metrics.revenue.toFixed(0)}</span>
                  <Badge variant={metrics.revenue < 5000 ? 'destructive' : 'default'}>
                    {metrics.revenue < 5000 ? 'Crítico' : 'Normal'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label>Simular Valor</Label>
                  <Input
                    type="number"
                    min="0"
                    value={metrics.revenue.toFixed(0)}
                    onChange={(e) => handleMetricChange('revenue', parseFloat(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Active Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Usuarios Activos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold">{metrics.activeUsers}</span>
                  <Badge variant={metrics.activeUsers > 200 ? 'default' : 'secondary'}>
                    {metrics.activeUsers > 200 ? 'Alta Demanda' : 'Normal'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label>Simular Valor</Label>
                  <Input
                    type="number"
                    min="0"
                    value={metrics.activeUsers}
                    onChange={(e) => handleMetricChange('active-users', parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* No-Show Rate */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Tasa de No-Show
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold">{metrics.noShowRate.toFixed(1)}%</span>
                  <Badge variant={metrics.noShowRate > 15 ? 'destructive' : 'default'}>
                    {metrics.noShowRate > 15 ? 'Alto' : 'Normal'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label>Simular Valor</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={metrics.noShowRate.toFixed(0)}
                    onChange={(e) => handleMetricChange('no-show-rate', parseFloat(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Alertas Disparadas</CardTitle>
              <CardDescription>
                Mostrando {triggeredAlerts.length} alertas disparadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {triggeredAlerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay alertas disparadas aún. Modifica las métricas para generar alertas.
                  </div>
                ) : (
                  triggeredAlerts.slice().reverse().map((trigger, index) => (
                    <div
                      key={index}
                      className={cn(
                        'p-4 rounded-lg border-l-4',
                        trigger.alert.severity === 'CRITICAL' && 'bg-red-50 border-red-500',
                        trigger.alert.severity === 'HIGH' && 'bg-orange-50 border-orange-500',
                        trigger.alert.severity === 'MEDIUM' && 'bg-yellow-50 border-yellow-500',
                        trigger.alert.severity === 'LOW' && 'bg-green-50 border-green-500'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">
                              {getSeverityIcon(trigger.alert.severity)}
                            </span>
                            <span className="font-semibold">{trigger.alert.name}</span>
                            <Badge
                              style={{
                                backgroundColor: getSeverityColor(trigger.alert.severity),
                                color: 'white',
                              }}
                            >
                              {trigger.alert.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {trigger.message}
                          </p>
                          <div className="flex gap-4 text-xs">
                            <span>
                              <strong>Valor:</strong> {trigger.value.toLocaleString('es-ES')}
                            </span>
                            {trigger.previousValue && (
                              <span>
                                <strong>Anterior:</strong>{' '}
                                {trigger.previousValue.toLocaleString('es-ES')}
                              </span>
                            )}
                            <span>
                              <strong>Hora:</strong>{' '}
                              {new Date(trigger.triggeredAt).toLocaleTimeString()}
                            </span>
                          </div>
                          {trigger.emailSent !== undefined && (
                            <div className="mt-2 flex items-center gap-2 text-xs">
                              {trigger.emailSent ? (
                                <>
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                  <span className="text-green-600">Email enviado</span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-3 w-3 text-red-600" />
                                  <span className="text-red-600">
                                    Error: {trigger.emailError}
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Testing Tab */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Pruebas de Email
              </CardTitle>
              <CardDescription>
                Envía emails de prueba para verificar los templates y configuración
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-email">Email de Prueba</Label>
                <Input
                  id="test-email"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="tu-email@ejemplo.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={sendTestEmail} className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Email de Alerta
                </Button>
                <Button onClick={sendDailySummary} variant="outline" className="w-full">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Resumen Diario
                </Button>
                <Button onClick={sendWeeklyReport} variant="outline" className="w-full">
                  <TrendingDown className="mr-2 h-4 w-4" />
                  Reporte Semanal
                </Button>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Nota:</strong> Los emails se envían a través del servicio de backend.
                  En desarrollo, los emails se simulan y se muestran en la consola.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertas Configuradas para Demo</CardTitle>
              <CardDescription>
                Estas son las alertas que se utilizan en la demostración
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {DEMO_ALERTS.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{alert.name}</h4>
                          <Badge
                            style={{
                              backgroundColor: getSeverityColor(alert.severity),
                              color: 'white',
                            }}
                          >
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {alert.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs">
                          <span>
                            <strong>Métrica:</strong> {alert.metricName}
                          </span>
                          <span>
                            <strong>Condición:</strong> {alert.condition}{' '}
                            {alert.threshold.toString()}
                          </span>
                          <span>
                            <strong>Canales:</strong> {alert.channels.join(', ')}
                          </span>
                          <span>
                            <strong>Cooldown:</strong> {alert.cooldownMinutes}min
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
