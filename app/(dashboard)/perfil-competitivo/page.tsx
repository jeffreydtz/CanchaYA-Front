'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import apiClient, { PerfilCompetitivo, EloHistory } from '@/lib/api-client'
import { isClientAuthenticated } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Trophy, TrendingUp, TrendingDown, Target, Zap } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

export default function PerfilCompetitivoPage() {
  const router = useRouter()
  const [perfil, setPerfil] = useState<PerfilCompetitivo | null>(null)
  const [historial, setHistorial] = useState<EloHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingActivo, setUpdatingActivo] = useState(false)

  useEffect(() => {
    if (!isClientAuthenticated()) {
      router.push('/login')
      return
    }
    loadPerfil()
    loadHistorial()
  }, [router])

  const loadPerfil = async () => {
    setLoading(true)
    setError(null)
    const response = await apiClient.getPerfilCompetitivo()

    if (response.error) {
      setError(response.error)
    } else if (response.data) {
      setPerfil(response.data)
    }
    setLoading(false)
  }

  const loadHistorial = async () => {
    const response = await apiClient.getHistorialElo()
    if (response.data) {
      setHistorial(response.data)
    }
  }

  const handleToggleActivo = async (checked: boolean) => {
    if (!perfil) return

    setUpdatingActivo(true)
    const response = await apiClient.updatePerfilCompetitivo({ activo: checked })

    if (response.error) {
      alert(response.error)
    } else if (response.data) {
      setPerfil(response.data)
    }
    setUpdatingActivo(false)
  }

  const getWinRate = (): number => {
    if (!perfil || perfil.partidosJugados === 0) return 0
    return (perfil.victorias / perfil.partidosJugados) * 100
  }

  const getGoalDifference = (): number => {
    if (!perfil) return 0
    return perfil.golesFavor - perfil.golesContra
  }

  const formatChartData = () => {
    return historial.map((entry) => ({
      fecha: new Date(entry.creadoEl).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit'
      }),
      ranking: entry.rankingNuevo,
      delta: entry.delta
    }))
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p>Cargando perfil competitivo...</p>
      </div>
    )
  }

  if (error || !perfil) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600">{error || 'No se pudo cargar el perfil'}</p>
            <Button onClick={() => router.push('/dashboard')} className="mt-4">
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Mi Perfil Competitivo
          </h1>
          <p className="text-muted-foreground mt-2">
            {perfil.usuario.persona.nombre} {perfil.usuario.persona.apellido}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/ranking')}>
          Ver Ranking Global
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuración</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="activo">Participar en Ranking Público</Label>
              <p className="text-sm text-muted-foreground">
                {perfil.activo
                  ? 'Tu perfil aparece en el ranking global'
                  : 'Tus estadísticas se siguen acumulando pero no apareces en el ranking público'}
              </p>
            </div>
            <Switch
              id="activo"
              checked={perfil.activo}
              onCheckedChange={handleToggleActivo}
              disabled={updatingActivo}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ranking ELO</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{perfil.ranking}</div>
            {historial.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {historial[historial.length - 1].delta > 0 ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +{historial[historial.length - 1].delta} desde último partido
                  </span>
                ) : historial[historial.length - 1].delta < 0 ? (
                  <span className="text-red-600 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    {historial[historial.length - 1].delta} desde último partido
                  </span>
                ) : (
                  <span>Sin cambios</span>
                )}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partidos Jugados</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{perfil.partidosJugados}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {perfil.victorias}V - {perfil.empates}E - {perfil.derrotas}D
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">% Victorias</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{getWinRate().toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {perfil.victorias} victorias de {perfil.partidosJugados} partidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Racha Actual</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {perfil.racha === 0 ? (
                <span className="text-muted-foreground">-</span>
              ) : perfil.racha > 0 ? (
                <span className="text-green-600">+{perfil.racha}</span>
              ) : (
                <span className="text-red-600">{perfil.racha}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {perfil.racha === 0
                ? 'Sin racha activa'
                : perfil.racha > 0
                ? `${perfil.racha} ${perfil.racha === 1 ? 'victoria' : 'victorias'} consecutivas`
                : `${Math.abs(perfil.racha)} ${Math.abs(perfil.racha) === 1 ? 'derrota' : 'derrotas'} consecutivas`}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas Detalladas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Goles a Favor</p>
                <p className="text-2xl font-bold text-green-600">{perfil.golesFavor}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Goles en Contra</p>
                <p className="text-2xl font-bold text-red-600">{perfil.golesContra}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">Diferencia de Goles</p>
              <p className={`text-3xl font-bold ${
                getGoalDifference() > 0
                  ? 'text-green-600'
                  : getGoalDifference() < 0
                  ? 'text-red-600'
                  : 'text-muted-foreground'
              }`}>
                {getGoalDifference() > 0 ? '+' : ''}{getGoalDifference()}
              </p>
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Victorias</span>
                <span className="font-semibold">{perfil.victorias}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Empates</span>
                <span className="font-semibold">{perfil.empates}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Derrotas</span>
                <span className="font-semibold">{perfil.derrotas}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolución del Ranking</CardTitle>
          </CardHeader>
          <CardContent>
            {historial.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>Aún no tienes historial de partidos</p>
                <p className="text-sm mt-2">Juega tu primer desafío para ver tu evolución</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formatChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="fecha"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="text-sm font-semibold">{data.fecha}</p>
                            <p className="text-sm">Ranking: {data.ranking}</p>
                            <p className={`text-sm ${
                              data.delta > 0 ? 'text-green-600' : data.delta < 0 ? 'text-red-600' : ''
                            }`}>
                              Cambio: {data.delta > 0 ? '+' : ''}{data.delta}
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ranking"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {historial.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Partidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {historial.slice().reverse().map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 border rounded hover:bg-accent"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.creadoEl).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">
                        {entry.rankingAnterior} → {entry.rankingNuevo}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Ranking {entry.delta > 0 ? 'aumentó' : entry.delta < 0 ? 'disminuyó' : 'sin cambios'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Badge
                      variant={entry.delta > 0 ? 'default' : entry.delta < 0 ? 'destructive' : 'secondary'}
                    >
                      {entry.delta > 0 ? '+' : ''}{entry.delta}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
