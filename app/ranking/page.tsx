'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import apiClient, { RankingPublico, PerfilCompletoPublico } from '@/lib/api-client'
import { useAuth } from '@/components/auth/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Trophy, Medal, TrendingUp, Target, Crown, User } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function RankingPage() {
  const router = useRouter()
  const { isAuthenticated, userId } = useAuth()
  const [ranking, setRanking] = useState<RankingPublico[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlayer, setSelectedPlayer] = useState<PerfilCompletoPublico | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadRanking()
  }, [router])

  const loadRanking = async () => {
    setLoading(true)
    setError(null)
    const response = await apiClient.getRanking()

    if (response.error) {
      setError(response.error)
    } else if (response.data) {
      setRanking(response.data)
    }
    setLoading(false)
  }

  const handleViewProfile = async (usuarioId: string) => {
    setLoadingProfile(true)
    setShowProfileModal(true)

    const response = await apiClient.getRankingByUsuarioId(usuarioId)

    if (response.error) {
      alert(response.error)
      setShowProfileModal(false)
    } else if (response.data) {
      setSelectedPlayer(response.data)
    }
    setLoadingProfile(false)
  }

  const getPosicionIcon = (posicion: number) => {
    if (posicion === 1) return <Crown className="h-5 w-5 text-yellow-500" />
    if (posicion === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (posicion === 3) return <Medal className="h-5 w-5 text-amber-600" />
    return null
  }

  const getWinRate = (player: RankingPublico | PerfilCompletoPublico): number => {
    if (player.partidosJugados === 0) return 0
    return (player.victorias / player.partidosJugados) * 100
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p>Cargando ranking...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Ranking Global
          </h1>
          <p className="text-muted-foreground mt-2">
            Clasificación de los mejores jugadores
          </p>
        </div>
        <Button onClick={() => router.push('/perfil-competitivo')}>
          Mi Perfil
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {ranking.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No hay jugadores en el ranking aún
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Posición</TableHead>
                  <TableHead>Jugador</TableHead>
                  <TableHead className="text-center">Ranking ELO</TableHead>
                  <TableHead className="text-center">Partidos</TableHead>
                  <TableHead className="text-center">Victorias</TableHead>
                  <TableHead className="text-center">Empates</TableHead>
                  <TableHead className="text-center">Derrotas</TableHead>
                  <TableHead className="text-center">% Victorias</TableHead>
                  <TableHead className="w-32"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranking.map((player) => {
                  const isCurrentUser = userId && player.usuarioId === userId

                  return (
                    <TableRow
                      key={player.usuarioId}
                      className={`${isCurrentUser ? 'bg-accent' : ''} hover:bg-accent/50 cursor-pointer`}
                      onClick={() => handleViewProfile(player.usuarioId)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPosicionIcon(player.posicion)}
                          <span className="font-semibold">#{player.posicion}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {player.nombre} {player.apellido}
                          </span>
                          {isCurrentUser && <Badge variant="outline">Tú</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span className="font-bold text-lg">{player.ranking}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{player.partidosJugados}</TableCell>
                      <TableCell className="text-center text-green-600 font-semibold">
                        {player.victorias}
                      </TableCell>
                      <TableCell className="text-center text-gray-600">
                        {player.empates}
                      </TableCell>
                      <TableCell className="text-center text-red-600 font-semibold">
                        {player.derrotas}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getWinRate(player) >= 50 ? 'default' : 'secondary'}>
                          {getWinRate(player).toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewProfile(player.usuarioId)
                          }}
                        >
                          Ver Perfil
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil del Jugador
            </DialogTitle>
          </DialogHeader>

          {loadingProfile ? (
            <div className="py-8 text-center">
              <p>Cargando perfil...</p>
            </div>
          ) : selectedPlayer ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedPlayer.nombre} {selectedPlayer.apellido}
                  </h2>
                  <Badge className="mt-2" variant={selectedPlayer.activo ? 'default' : 'secondary'}>
                    {selectedPlayer.activo ? 'Perfil Activo' : 'Perfil Inactivo'}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Ranking ELO</p>
                  <p className="text-4xl font-bold text-yellow-600">{selectedPlayer.ranking}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Target className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-2xl font-bold">{selectedPlayer.partidosJugados}</p>
                      <p className="text-xs text-muted-foreground">Partidos</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <TrendingUp className="h-8 w-8 mx-auto text-green-600 mb-2" />
                      <p className="text-2xl font-bold text-green-600">{selectedPlayer.victorias}</p>
                      <p className="text-xs text-muted-foreground">Victorias</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="h-8 w-8 mx-auto bg-gray-300 rounded-full mb-2" />
                      <p className="text-2xl font-bold text-gray-600">{selectedPlayer.empates}</p>
                      <p className="text-xs text-muted-foreground">Empates</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="h-8 w-8 mx-auto bg-red-200 rounded-full mb-2" />
                      <p className="text-2xl font-bold text-red-600">{selectedPlayer.derrotas}</p>
                      <p className="text-xs text-muted-foreground">Derrotas</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Estadísticas de Goles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Goles a Favor</p>
                      <p className="text-2xl font-bold text-green-600">{selectedPlayer.golesFavor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Goles en Contra</p>
                      <p className="text-2xl font-bold text-red-600">{selectedPlayer.golesContra}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Diferencia</p>
                      <p className={`text-2xl font-bold ${
                        (selectedPlayer.golesFavor - selectedPlayer.golesContra) > 0
                          ? 'text-green-600'
                          : (selectedPlayer.golesFavor - selectedPlayer.golesContra) < 0
                          ? 'text-red-600'
                          : 'text-muted-foreground'
                      }`}>
                        {selectedPlayer.golesFavor - selectedPlayer.golesContra > 0 ? '+' : ''}
                        {selectedPlayer.golesFavor - selectedPlayer.golesContra}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Racha Actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    {selectedPlayer.racha === 0 ? (
                      <div>
                        <p className="text-3xl font-bold text-muted-foreground">-</p>
                        <p className="text-sm text-muted-foreground mt-2">Sin racha activa</p>
                      </div>
                    ) : selectedPlayer.racha > 0 ? (
                      <div>
                        <p className="text-3xl font-bold text-green-600">+{selectedPlayer.racha}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {selectedPlayer.racha} {selectedPlayer.racha === 1 ? 'victoria consecutiva' : 'victorias consecutivas'}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-3xl font-bold text-red-600">{selectedPlayer.racha}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {Math.abs(selectedPlayer.racha)} {Math.abs(selectedPlayer.racha) === 1 ? 'derrota consecutiva' : 'derrotas consecutivas'}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {selectedPlayer.historialElo && selectedPlayer.historialElo.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Últimos Partidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedPlayer.historialElo.slice(0, 5).reverse().map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">
                              {new Date(entry.creadoEl).toLocaleDateString('es-AR', {
                                day: '2-digit',
                                month: '2-digit'
                              })}
                            </span>
                            <span className="text-sm">
                              {entry.rankingAnterior} → {entry.rankingNuevo}
                            </span>
                          </div>
                          <Badge
                            variant={entry.delta > 0 ? 'default' : entry.delta < 0 ? 'destructive' : 'secondary'}
                          >
                            {entry.delta > 0 ? '+' : ''}{entry.delta}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No se pudo cargar el perfil</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
