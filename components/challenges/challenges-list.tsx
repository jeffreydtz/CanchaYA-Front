'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import apiClient, { Desafio } from '@/lib/api-client'
import { useAuth } from '@/components/auth/auth-context'
import { useChallengesNotifications } from './challenges-context'
import { ChallengeCard } from './challenge-card'
import { CreateChallengeDialog } from './create-challenge-dialog'
import { Trophy, Plus, Loader2 } from 'lucide-react'

type ChallengeFilter = 'all' | 'creados' | 'invitaciones' | 'jugando' | 'finalizados'

export default function ChallengesList() {
  const { user } = useAuth()
  const { notifyChallengePendingCountChanged } = useChallengesNotifications()
  const searchParams = useSearchParams()
  const [challenges, setChallenges] = useState<Desafio[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [activeFilter, setActiveFilter] = useState<ChallengeFilter>('all')

  useEffect(() => {
    // Check URL params for initial filter
    const tabParam = searchParams.get('tab')
    if (tabParam && ['all', 'creados', 'invitaciones', 'jugando', 'finalizados'].includes(tabParam)) {
      setActiveFilter(tabParam as ChallengeFilter)
    }
  }, [searchParams])

  useEffect(() => {
    loadChallenges()
  }, [])

  const loadChallenges = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.getDesafios()
      if (response.error) {
        toast.error(response.error)
        return
      }

      if (response.data) {
        // Sort by most recent first
        const sorted = response.data.sort((a, b) => {
          return new Date(b.creadoEl).getTime() - new Date(a.creadoEl).getTime()
        })
        setChallenges(sorted)
      }
    } catch (error) {
      toast.error('No se pudieron cargar los desafíos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptChallenge = async (challengeId: string) => {
    try {
      const response = await apiClient.aceptarDesafio(challengeId)
      if (response.error) {
        // Handle specific errors
        if (response.error.includes('La reserva ya pasó')) {
          toast.error('La reserva ya pasó, no se puede aceptar el desafío')
        } else if (response.error.includes('ya había aceptado')) {
          toast.error('Ya habías aceptado este desafío')
        } else {
          toast.error(response.error)
        }
        return
      }

      toast.success('Desafío aceptado exitosamente')
      notifyChallengePendingCountChanged()
      loadChallenges()
    } catch (error) {
      toast.error('No se pudo aceptar el desafío')
    }
  }

  const handleRejectChallenge = async (challengeId: string) => {
    try {
      const response = await apiClient.rechazarDesafio(challengeId)
      if (response.error) {
        toast.error(response.error)
        return
      }

      toast.success('Desafío rechazado')
      notifyChallengePendingCountChanged()
      loadChallenges()
    } catch (error) {
      toast.error('No se pudo rechazar el desafío')
    }
  }

  // Filter challenges based on active filter
  const getFilteredChallenges = () => {
    if (!user?.id) return []

    const personaId = user.id

    switch (activeFilter) {
      case 'creados':
        // Challenges created by me
        return challenges.filter(c => c.creador?.id === personaId)

      case 'invitaciones':
        // Challenges where I'm invited (in invitadosDesafiados)
        return challenges.filter(c =>
          Array.isArray(c.invitadosDesafiados) &&
          c.invitadosDesafiados.some(p => p?.id === personaId)
        )

      case 'jugando':
        // Challenges where I'm playing (in jugadoresCreador or jugadoresDesafiados)
        return challenges.filter(c =>
          (Array.isArray(c.jugadoresCreador) && c.jugadoresCreador.some(p => p?.id === personaId)) ||
          (Array.isArray(c.jugadoresDesafiados) && c.jugadoresDesafiados.some(p => p?.id === personaId))
        )

      case 'finalizados':
        // Finalized challenges where I participated
        return challenges.filter(c =>
          c.estado === 'finalizado' &&
          (c.creador?.id === personaId ||
           (Array.isArray(c.jugadoresCreador) && c.jugadoresCreador.some(p => p?.id === personaId)) ||
           (Array.isArray(c.jugadoresDesafiados) && c.jugadoresDesafiados.some(p => p?.id === personaId)))
        )

      case 'all':
      default:
        // All challenges where I'm involved in any way
        return challenges.filter(c =>
          c.creador?.id === personaId ||
          (Array.isArray(c.jugadoresCreador) && c.jugadoresCreador.some(p => p?.id === personaId)) ||
          (Array.isArray(c.jugadoresDesafiados) && c.jugadoresDesafiados.some(p => p?.id === personaId)) ||
          (Array.isArray(c.invitadosDesafiados) && c.invitadosDesafiados.some(p => p?.id === personaId))
        )
    }
  }

  const filteredChallenges = getFilteredChallenges()

  // Count challenges for each filter
  const getCounts = () => {
    if (!user?.id) return { all: 0, creados: 0, invitaciones: 0, jugando: 0, finalizados: 0 }

    const personaId = user.id

    return {
      all: challenges.filter(c =>
        c.creador?.id === personaId ||
        (Array.isArray(c.jugadoresCreador) && c.jugadoresCreador.some(p => p?.id === personaId)) ||
        (Array.isArray(c.jugadoresDesafiados) && c.jugadoresDesafiados.some(p => p?.id === personaId)) ||
        (Array.isArray(c.invitadosDesafiados) && c.invitadosDesafiados.some(p => p?.id === personaId))
      ).length,
      creados: challenges.filter(c => c.creador?.id === personaId).length,
      invitaciones: challenges.filter(c =>
        Array.isArray(c.invitadosDesafiados) &&
        c.invitadosDesafiados.some(p => p?.id === personaId)
      ).length,
      jugando: challenges.filter(c =>
        (Array.isArray(c.jugadoresCreador) && c.jugadoresCreador.some(p => p?.id === personaId)) ||
        (Array.isArray(c.jugadoresDesafiados) && c.jugadoresDesafiados.some(p => p?.id === personaId))
      ).length,
      finalizados: challenges.filter(c =>
        c.estado === 'finalizado' &&
        (c.creador?.id === personaId ||
         (Array.isArray(c.jugadoresCreador) && c.jugadoresCreador.some(p => p?.id === personaId)) ||
         (Array.isArray(c.jugadoresDesafiados) && c.jugadoresDesafiados.some(p => p?.id === personaId)))
      ).length,
    }
  }

  const counts = getCounts()

  if (!user?.id) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mis Desafíos</CardTitle>
          <CardDescription>
            Debes iniciar sesión para ver tus desafíos
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-600" />
                Mis Desafíos
              </CardTitle>
              <CardDescription>
                Crea, acepta y gestiona tus desafíos deportivos
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo desafío
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as ChallengeFilter)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            Todos ({counts.all})
          </TabsTrigger>
          <TabsTrigger value="creados">
            Creados ({counts.creados})
          </TabsTrigger>
          <TabsTrigger value="invitaciones">
            Invitaciones ({counts.invitaciones})
          </TabsTrigger>
          <TabsTrigger value="jugando">
            Jugando ({counts.jugando})
          </TabsTrigger>
          <TabsTrigger value="finalizados">
            Finalizados ({counts.finalizados})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeFilter} className="mt-6">
          {isLoading ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-muted-foreground">Cargando desafíos...</p>
                </div>
              </CardContent>
            </Card>
          ) : filteredChallenges.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <Trophy className="h-12 w-12 text-muted-foreground/50" />
                  <div className="text-center">
                    <p className="font-medium">No hay desafíos</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activeFilter === 'invitaciones' && 'No tienes invitaciones pendientes'}
                      {activeFilter === 'creados' && 'Crea tu primer desafío'}
                      {activeFilter === 'jugando' && 'No estás jugando ningún desafío activo'}
                      {activeFilter === 'finalizados' && 'No tienes desafíos finalizados'}
                      {activeFilter === 'all' && 'Crea tu primer desafío para comenzar'}
                    </p>
                  </div>
                  {(activeFilter === 'creados' || activeFilter === 'all') && (
                    <Button onClick={() => setShowCreateDialog(true)} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear desafío
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {filteredChallenges.map(challenge => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  currentPersonaId={user.id}
                  onAccept={handleAcceptChallenge}
                  onReject={handleRejectChallenge}
                  onUpdate={loadChallenges}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create challenge dialog */}
      <CreateChallengeDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={loadChallenges}
      />
    </div>
  )
}
