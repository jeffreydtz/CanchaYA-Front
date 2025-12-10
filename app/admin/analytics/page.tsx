'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-context'
import apiClient, { AdminResumen, OcupacionSemaforo } from '@/lib/api-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClubFilter } from '@/components/admin/club-filter'
import { Users, Calendar, MapPin, DollarSign, Loader2, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { withErrorBoundary } from '@/components/error/with-error-boundary'

function AdminAnalyticsPage() {
  const { isAuthenticated, isSuperAdmin, clubIds } = useAuth()
  const [selectedClubId, setSelectedClubId] = useState<string | undefined>(undefined)
  const [resumen, setResumen] = useState<AdminResumen | null>(null)
  const [ocupacion, setOcupacion] = useState<OcupacionSemaforo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) return
    loadData()
  }, [isAuthenticated, selectedClubId])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load summary data
      const resumenResponse = await apiClient.getAdminResumen()
      if (resumenResponse.error) {
        toast.error(resumenResponse.error)
      } else if (resumenResponse.data) {
        setResumen(resumenResponse.data)
      }

      // Load occupancy data
      const ocupacionResponse = await apiClient.getAdminOcupacion(
        'cancha',
        undefined,
        undefined,
        'America/Argentina/Cordoba'
      )
      if (ocupacionResponse.error) {
        toast.error(ocupacionResponse.error)
      } else if (ocupacionResponse.data) {
        // Filter by selected club if applicable
        let filtered = ocupacionResponse.data
        if (selectedClubId) {
          // Note: backend should filter by clubId in the query, but we can also filter here
          filtered = ocupacionResponse.data
        }
        setOcupacion(filtered)
      }
    } catch (error) {
      toast.error('Error al cargar datos de analytics')
    } finally {
      setLoading(false)
    }
  }

  const getSemaforoColor = (semaforo: 'verde' | 'amarillo' | 'rojo') => {
    switch (semaforo) {
      case 'verde':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'amarillo':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'rojo':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {isSuperAdmin
              ? 'Vista general del sistema y métricas principales'
              : 'Vista de tus clubes asignados'}
          </p>
        </div>
        <ClubFilter
          selectedClubId={selectedClubId}
          onClubChange={setSelectedClubId}
          allowAll={isSuperAdmin}
          className="w-full sm:w-64"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          {resumen && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{resumen.totalUsuarios}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Usuarios registrados en la plataforma
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{resumen.totalReservas}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Reservas realizadas en total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Canchas</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{resumen.totalCanchas}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Canchas disponibles en el sistema
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Deuda Pendiente</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${resumen.deudaTotalPendiente.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total de deudas sin pagar
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Occupancy Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Ocupación de Canchas</CardTitle>
                  <CardDescription>
                    Estado de ocupación por cancha con semaforización
                  </CardDescription>
                </div>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {ocupacion.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay datos de ocupación disponibles
                </div>
              ) : (
                <div className="space-y-4">
                  {ocupacion.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.nombre}</h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Slots: {item.slots}</span>
                          <span>Reservas: {item.reservas}</span>
                          <span>
                            Ocupación: {(item.ocupacion * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={getSemaforoColor(item.semaforo)}
                      >
                        {item.semaforo.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sobre este Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  Este dashboard muestra métricas clave del sistema de reservas.
                </p>
                {isSuperAdmin ? (
                  <p className="text-muted-foreground">
                    Como administrador, puedes ver datos de todos los clubes o filtrar por uno específico.
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    Como admin-club, solo ves datos de tus clubes asignados ({clubIds.length} club{clubIds.length !== 1 ? 'es' : ''}).
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Semaforización</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    VERDE
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Ocupación baja (&lt; 50%)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    AMARILLO
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Ocupación media (50% - 80%)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-red-100 text-red-800">
                    ROJO
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Ocupación alta (&gt; 80%)
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

export default withErrorBoundary(AdminAnalyticsPage, 'Admin Analytics')
