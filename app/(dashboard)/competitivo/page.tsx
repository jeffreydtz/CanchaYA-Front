/**
 * Competitive Page for CanchaYA
 * Challenge system and competitive match management
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Trophy, 
  Users, 
  Calendar, 
  Target, 
  Star,
  Award,
  Zap,
  TrendingUp,
  BarChart3,
  Swords,
  Plus,
  Crown,
  Medal,
  Clock,
  MapPin
} from 'lucide-react'
import apiClient, { Desafio, PerfilCompetitivo, Reserva, Persona, Deporte } from '@/lib/api-client'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Navbar from '@/components/navbar/navbar'
import { useAuth } from '@/components/auth/auth-context'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

function LeaderBoard() {
  const [perfiles, setPerfiles] = useState<PerfilCompetitivo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await apiClient.getPerfilCompetitivo()
        if (response.data) {
          setPerfiles(response.data)
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Ranking ELO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Ranking ELO
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {perfiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No hay rankings disponibles aún</p>
            </div>
          ) : (
            perfiles.slice(0, 10).map((perfil, index) => {
              const position = index + 1
              const medalColor = 
                position === 1 ? 'text-blue-500' :
                position === 2 ? 'text-gray-400' :
                position === 3 ? 'text-slate-600' : 'text-gray-600'
              
              const MedalIcon = position <= 3 ? Medal : Trophy

              return (
                <div 
                  key={perfil.id} 
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all hover:shadow-md ${
                    position <= 3 
                      ? 'bg-gradient-to-r from-blue-50 to-slate-50 dark:from-blue-900/20 dark:to-slate-900/20 border border-blue-200/50 dark:border-blue-700/30'
                      : 'bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      position <= 3 ? 'bg-gradient-to-br from-blue-400 to-slate-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      <span className={`font-bold text-sm ${
                        position <= 3 ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                      }`}>
                        {position}
                      </span>
                    </div>
                    <MedalIcon className={`h-5 w-5 ${medalColor}`} />
                  </div>
                  
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder-user.png" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                      {perfil.personaId?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Jugador #{position}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {perfil.partidosJugados} partidos • {perfil.partidosGanados}W/{perfil.partidosPerdidos}L
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {perfil.elo}
                    </div>
                    <div className="text-xs text-gray-500">
                      ELO
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ActiveChallenges() {
  const [desafios, setDesafios] = useState<Desafio[]>([])
  const [loading, setLoading] = useState(true)
  const { personaId } = useAuth()

  const fetchDesafios = async () => {
    try {
      const response = await apiClient.getDesafios()
      if (response.data) {
        setDesafios(response.data.filter(d => d.estado === 'Pendiente' || d.estado === 'Aceptado'))
      }
    } catch (error) {
      console.error('Error fetching challenges:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDesafios()
  }, [])
  
  const handleAceptar = async (desafioId: string) => {
    if (!personaId) {
      toast.error('Debes iniciar sesión')
      return
    }
    
    try {
      const response = await apiClient.aceptarDesafio(desafioId)
      if (response.error) {
        toast.error(response.error)
      } else {
        toast.success('¡Desafío aceptado!')
        fetchDesafios() // Reload
      }
    } catch (error) {
      toast.error('Error al aceptar el desafío')
    }
  }
  
  const handleRechazar = async (desafioId: string) => {
    if (!personaId) {
      toast.error('Debes iniciar sesión')
      return
    }
    
    try {
      const response = await apiClient.rechazarDesafio(desafioId)
      if (response.error) {
        toast.error(response.error)
      } else {
        toast.success('Desafío rechazado')
        fetchDesafios() // Reload
      }
    } catch (error) {
      toast.error('Error al rechazar el desafío')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5" />
            Desafíos Activos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5" />
            Desafíos Activos
          </CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Crear Desafío
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Desafío</DialogTitle>
              </DialogHeader>
              <CreateChallengeForm />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {desafios.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Swords className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No hay desafíos activos</p>
              <p className="text-sm mt-1">Crea un desafío para competir con otros equipos</p>
            </div>
          ) : (
            desafios.map((desafio) => (
              <div key={desafio.id} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    {desafio.creador?.nombre} vs {desafio.jugadoresDesafiados?.length > 0 ? desafio.jugadoresDesafiados.map(j => j.nombre).join(', ') : 'Esperando rival'}
                  </h3>
                  <Badge
                    variant={desafio.estado === 'Aceptado' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {desafio.estado}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{desafio.deporte?.nombre}</span>
                  </div>
                  {desafio.resultado && (
                    <div className="flex items-center gap-2">
                      <span>Resultado: {desafio.resultado}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  {desafio.estado === 'Pendiente' && personaId && desafio.invitadosDesafiados.some(inv => inv.id === personaId) && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleAceptar(desafio.id)}>
                        Aceptar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleRechazar(desafio.id)}>
                        Rechazar
                      </Button>
                    </>
                  )}
                  {desafio.estado === 'Aceptado' && (
                    <Button size="sm" disabled>
                      Pendiente de jugar
                    </Button>
                  )}
                  {desafio.estado === 'Pendiente' && (!personaId || !desafio.invitadosDesafiados.some(inv => inv.id === personaId)) && (
                    <Badge variant="secondary">Esperando respuesta</Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function CreateChallengeForm() {
  const [loading, setLoading] = useState(false)
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [deportes, setDeportes] = useState<Deporte[]>([])
  const [personas, setPersonas] = useState<Persona[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReservaId, setSelectedReservaId] = useState('')
  const [selectedDeporteId, setSelectedDeporteId] = useState('')
  const [selectedInvitados, setSelectedInvitados] = useState<string[]>([])
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user's future reservations (confirmed ones)
        const reservasResponse = await apiClient.getReservas()
        if (reservasResponse.data) {
          // Filter for future confirmed reservations without challenges
          const futureReservas = reservasResponse.data.filter(r => {
            const reservaDate = new Date(r.fechaHora)
            return reservaDate > new Date() && r.estado === 'confirmada'
          })
          setReservas(futureReservas)
        }
        
        // Fetch sports
        const deportesResponse = await apiClient.getDeportes()
        if (deportesResponse.data) {
          setDeportes(deportesResponse.data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    
    fetchData()
  }, [])
  
  // Search for personas to invite
  useEffect(() => {
    const searchPersonas = async () => {
      if (searchQuery.length >= 2) {
        try {
          const response = await apiClient.searchPersonas(searchQuery)
          if (response.data) {
            setPersonas(response.data)
          }
        } catch (error) {
          console.error('Error searching personas:', error)
        }
      } else {
        setPersonas([])
      }
    }
    
    const debounce = setTimeout(searchPersonas, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (!selectedReservaId) {
        toast.error('Debes seleccionar una reserva')
        return
      }
      
      if (!selectedDeporteId) {
        toast.error('Debes seleccionar un deporte')
        return
      }
      
      if (selectedInvitados.length === 0) {
        toast.error('Debes invitar al menos a una persona')
        return
      }
      
      const response = await apiClient.createDesafio({
        reservaId: selectedReservaId,
        deporteId: selectedDeporteId,
        invitadosDesafiadosIds: selectedInvitados
      })
      
      if (response.error) {
        toast.error(response.error)
      } else {
        toast.success('¡Desafío creado exitosamente! Se enviaron invitaciones.')
        // Reload page to show new challenge
        window.location.reload()
      }
    } catch (error) {
      toast.error('Error al crear el desafío')
    } finally {
      setLoading(false)
    }
  }
  
  const toggleInvitado = (personaId: string) => {
    setSelectedInvitados(prev => 
      prev.includes(personaId) 
        ? prev.filter(id => id !== personaId)
        : [...prev, personaId]
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reserva">Reserva Confirmada</Label>
        <select 
          id="reserva"
          value={selectedReservaId}
          onChange={(e) => setSelectedReservaId(e.target.value)}
          className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white"
          required
        >
          <option value="">Selecciona una reserva</option>
          {reservas.map((reserva) => (
            <option key={reserva.id} value={reserva.id}>
              {reserva.disponibilidad?.cancha?.nombre || 'Cancha'} - {new Date(reserva.fechaHora).toLocaleString('es-ES')}
            </option>
          ))}
        </select>
        {reservas.length === 0 && (
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            ⚠️ Necesitas una reserva confirmada para crear un desafío. <Link href="/buscar" className="underline">Crear reserva</Link>
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="deporte">Deporte</Label>
        <select 
          id="deporte"
          value={selectedDeporteId}
          onChange={(e) => setSelectedDeporteId(e.target.value)}
          className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white"
          required
        >
          <option value="">Selecciona un deporte</option>
          {deportes.map((deporte) => (
            <option key={deporte.id} value={deporte.id}>
              {deporte.nombre}
            </option>
          ))}
        </select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="buscar">Buscar jugadores para invitar</Label>
        <Input 
          id="buscar"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Busca por nombre o email..."
          className="bg-white dark:bg-gray-800 dark:text-white"
        />
        {personas.length > 0 && (
          <div className="border rounded-lg p-2 max-h-48 overflow-y-auto bg-white dark:bg-gray-800">
            {personas.map((persona) => (
              <div 
                key={persona.id}
                onClick={() => toggleInvitado(persona.id)}
                className={`p-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  selectedInvitados.includes(persona.id) ? 'bg-blue-100 dark:bg-blue-900' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="dark:text-white">{persona.nombre} {persona.apellido}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{persona.email}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {selectedInvitados.length > 0 && (
        <div className="space-y-2">
          <Label>Invitados seleccionados ({selectedInvitados.length})</Label>
          <div className="flex flex-wrap gap-2">
            {selectedInvitados.map(id => {
              const persona = personas.find(p => p.id === id)
              return persona ? (
                <Badge key={id} variant="secondary" className="cursor-pointer" onClick={() => toggleInvitado(id)}>
                  {persona.nombre} {persona.apellido} ×
                </Badge>
              ) : null
            })}
          </div>
        </div>
      )}
      
      <Button type="submit" disabled={loading || reservas.length === 0} className="w-full">
        {loading ? 'Creando...' : 'Crear Desafío'}
      </Button>
    </form>
  )
}

export default function CompetitivePage() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Inicia sesión para competir</h2>
            <p className="text-gray-600 mb-4">
              Únete al sistema competitivo de CanchaYA
            </p>
            <Link href="/login">
              <Button>Iniciar Sesión</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-8">
      <Navbar />
      
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed bottom-6 right-6 z-50">
        <ThemeToggle />
      </div>
      
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            Competitivo
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Sistema de desafíos y ranking ELO para partidos competitivos
          </p>
        </div>

        <Tabs defaultValue="leaderboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
            <TabsTrigger value="challenges">Desafíos</TabsTrigger>
            <TabsTrigger value="teams">Equipos</TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="mt-6">
            <LeaderBoard />
          </TabsContent>

          <TabsContent value="challenges" className="mt-6">
            <ActiveChallenges />
          </TabsContent>

          <TabsContent value="teams" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gestión de Equipos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Gestión de equipos próximamente disponible</p>
                  <p className="text-sm mt-1">Crea y administra tus equipos para competir</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}