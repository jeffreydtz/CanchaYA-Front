'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import apiClient, { Desafio, FiltroDesafioDto, Deporte } from '@/lib/api-client'
import { useAuth } from '@/components/auth/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Trophy, Calendar, MapPin, Users, Plus, Filter } from 'lucide-react'

export default function DesafiosPage() {
  const router = useRouter()
  const { isAuthenticated, personaId } = useAuth()
  const [desafios, setDesafios] = useState<Desafio[]>([])
  const [deportes, setDeportes] = useState<Deporte[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<FiltroDesafioDto>({})
  const [activeTab, setActiveTab] = useState<string>('todos')
  const [selectedDeporte, setSelectedDeporte] = useState<string>('todos')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadDeportes()
    loadDesafios()
  }, [filtro, router])

  const loadDeportes = async () => {
    const response = await apiClient.getDeportes()
    if (response.data) {
      setDeportes(response.data)
    }
  }

  const loadDesafios = async () => {
    setLoading(true)
    setError(null)
    const response = await apiClient.getDesafios(filtro)

    if (response.error) {
      setError(response.error)
    } else if (response.data) {
      setDesafios(response.data)
    }
    setLoading(false)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const newFiltro: FiltroDesafioDto = { ...filtro }

    if (value === 'pendientes') {
      newFiltro.estado = 'pendiente'
    } else if (value === 'aceptados') {
      newFiltro.estado = 'aceptado'
    } else if (value === 'finalizados') {
      newFiltro.estado = 'finalizado'
    } else {
      delete newFiltro.estado
    }

    setFiltro(newFiltro)
  }

  const handleDeporteChange = (value: string) => {
    setSelectedDeporte(value)
    const newFiltro: FiltroDesafioDto = { ...filtro }

    if (value === 'todos') {
      delete newFiltro.deporteId
    } else {
      newFiltro.deporteId = value
    }

    setFiltro(newFiltro)
  }

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      pendiente: 'secondary',
      aceptado: 'default',
      finalizado: 'outline',
      cancelado: 'destructive'
    }

    return <Badge variant={variants[estado] || 'default'}>{estado.toUpperCase()}</Badge>
  }

  const getUserRole = (desafio: Desafio): string => {
    if (!personaId) return 'Espectador'

    if (desafio.creador.id === personaId) return 'Creador'

    if (desafio.jugadoresCreador.some(j => j.id === personaId)) return 'Equipo Creador'
    if (desafio.jugadoresDesafiados.some(j => j.id === personaId)) return 'Equipo Desafiado'

    if (desafio.invitadosCreador.some(i => i.id === personaId)) return 'Invitado (Creador)'
    if (desafio.invitadosDesafiados.some(i => i.id === personaId)) return 'Invitado (Desafiado)'

    return 'Espectador'
  }

  const handleAccept = async (desafioId: string) => {
    const response = await apiClient.aceptarDesafio(desafioId)
    if (response.error) {
      alert(response.error)
    } else {
      loadDesafios()
    }
  }

  const handleReject = async (desafioId: string) => {
    const response = await apiClient.rechazarDesafio(desafioId)
    if (response.error) {
      alert(response.error)
    } else {
      loadDesafios()
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p>Cargando desafíos...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8" />
            Mis Desafíos
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestiona tus partidos competitivos
          </p>
        </div>
        <Button onClick={() => router.push('/desafios/crear')}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Desafío
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1">
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
            <TabsTrigger value="aceptados">Aceptados</TabsTrigger>
            <TabsTrigger value="finalizados">Finalizados</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="w-full md:w-64">
          <Select value={selectedDeporte} onValueChange={handleDeporteChange}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filtrar por deporte" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los deportes</SelectItem>
              {deportes.map((deporte) => (
                <SelectItem key={deporte.id} value={deporte.id}>
                  {deporte.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {desafios.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No hay desafíos {activeTab !== 'todos' ? activeTab : ''} para mostrar
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {desafios.map((desafio) => {
                const userRole = getUserRole(desafio)
                const isInvited = userRole.includes('Invitado')
                const canAcceptReject = isInvited && desafio.estado === 'pendiente'

                return (
                  <Card key={desafio.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          {desafio.deporte.nombre}
                        </CardTitle>
                        {getEstadoBadge(desafio.estado)}
                      </div>
                      <Badge variant="outline" className="w-fit mt-2">
                        {userRole}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {desafio.reserva.disponibilidad.cancha.club.nombre} -{' '}
                          {desafio.reserva.disponibilidad.cancha.nombre}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Date(desafio.reserva.fechaHora).toLocaleDateString('es-AR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {desafio.jugadoresCreador.length} vs {desafio.jugadoresDesafiados.length}
                        </span>
                      </div>

                      {desafio.estado === 'finalizado' && desafio.ganador && (
                        <div className="pt-2 border-t">
                          <p className="text-sm font-semibold">
                            Ganador: {desafio.ganador === 'creador' ? 'Equipo Creador' : 'Equipo Desafiado'}
                          </p>
                          {desafio.golesCreador !== null && desafio.golesDesafiado !== null && (
                            <p className="text-sm text-muted-foreground">
                              Resultado: {desafio.golesCreador} - {desafio.golesDesafiado}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        {canAcceptReject && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleAccept(desafio.id)}
                              className="flex-1"
                            >
                              Aceptar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(desafio.id)}
                              className="flex-1"
                            >
                              Rechazar
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/desafios/${desafio.id}`)}
                          className={canAcceptReject ? '' : 'w-full'}
                        >
                          Ver Detalle
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
      </div>
    </div>
  )
}
