'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, Users, Trophy, Star } from 'lucide-react'
import { Desafio } from '@/lib/api-client'
import { formatDate, formatTime } from '@/lib/date-utils'
import { useState } from 'react'
import { AddPlayersDialog } from './add-players-dialog'
import { FinalizeChallengeDialog } from './finalize-challenge-dialog'

interface ChallengeCardProps {
  challenge: Desafio
  currentPersonaId: string
  onAccept: (id: string) => Promise<void>
  onReject: (id: string) => Promise<void>
  onUpdate: () => void
}

export function ChallengeCard({
  challenge,
  currentPersonaId,
  onAccept,
  onReject,
  onUpdate,
}: ChallengeCardProps) {
  const [showAddPlayers, setShowAddPlayers] = useState(false)
  const [showFinalize, setShowFinalize] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check user role in this challenge
  const isCreator = challenge.creador.id === currentPersonaId
  const isInvited = challenge.invitadosDesafiados.some(p => p.id === currentPersonaId)
  const isJugadorCreador = challenge.jugadoresCreador.some(p => p.id === currentPersonaId)
  const isJugadorDesafiado = challenge.jugadoresDesafiados.some(p => p.id === currentPersonaId)
  const isParticipant = isCreator || isJugadorCreador || isJugadorDesafiado

  // Check if reservation is in the past
  const reservationDate = new Date(challenge.reserva.fechaHora)
  const isPast = reservationDate < new Date()

  // Determine which side can add players
  const canAddCreadores = isCreator || isJugadorCreador
  const canAddDesafiados = isJugadorDesafiado

  // Can finalize if:
  // - User is a participant
  // - Estado is 'Aceptado'
  // - Reservation is in the past
  const canFinalize = isParticipant && challenge.estado === 'Aceptado' && isPast

  const getEstadoBadge = (estado: Desafio['estado']) => {
    switch (estado) {
      case 'Pendiente':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case 'Aceptado':
        return <Badge variant="default" className="bg-green-100 text-green-800">Aceptado</Badge>
      case 'Cancelado':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Cancelado</Badge>
      case 'Finalizado':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Finalizado</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const handleAccept = async () => {
    setIsLoading(true)
    try {
      await onAccept(challenge.id)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    setIsLoading(true)
    try {
      await onReject(challenge.id)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              {challenge.deporte.nombre}
            </CardTitle>
            <div className="text-sm text-muted-foreground mt-1">
              Creado por {challenge.creador.nombre} {challenge.creador.apellido}
            </div>
          </div>
          {getEstadoBadge(challenge.estado)}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Reservation details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(challenge.reserva.fechaHora)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formatTime(challenge.reserva.fechaHora)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{challenge.reserva.disponibilidad?.cancha?.nombre || 'Cancha'}</span>
          </div>
        </div>

        {/* Teams */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          {/* Team Creador */}
          <div className="space-y-2">
            <div className="font-semibold text-sm flex items-center gap-1">
              <Users className="h-4 w-4" />
              Equipo Creador
            </div>
            <div className="space-y-1">
              {challenge.jugadoresCreador.map(jugador => (
                <div key={jugador.id} className="text-sm">
                  {jugador.nombre} {jugador.apellido}
                  {jugador.id === challenge.creador.id && (
                    <Badge variant="outline" className="ml-1 text-xs">Capitán</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Team Desafiado */}
          <div className="space-y-2">
            <div className="font-semibold text-sm flex items-center gap-1">
              <Users className="h-4 w-4" />
              Equipo Desafiado
            </div>
            <div className="space-y-1">
              {/* Invited players */}
              {challenge.invitadosDesafiados.map(invitado => (
                <div key={invitado.id} className="text-sm text-muted-foreground italic">
                  {invitado.nombre} {invitado.apellido} (invitado)
                </div>
              ))}
              {/* Accepted players */}
              {challenge.jugadoresDesafiados.map(jugador => (
                <div key={jugador.id} className="text-sm">
                  {jugador.nombre} {jugador.apellido}
                </div>
              ))}
              {challenge.jugadoresDesafiados.length === 0 && challenge.invitadosDesafiados.length === 0 && (
                <div className="text-sm text-muted-foreground">Sin jugadores</div>
              )}
            </div>
          </div>
        </div>

        {/* Result if finalized */}
        {challenge.estado === 'Finalizado' && challenge.resultado && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Resultado: {challenge.resultado}</div>
              {challenge.ganadorLado && (
                <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                  Ganador: {challenge.ganadorLado === 'creador' ? 'Equipo Creador' : 'Equipo Desafiado'}
                </Badge>
              )}
            </div>
            {(challenge.valoracionCreador || challenge.valoracionDesafiado) && (
              <div className="flex items-center gap-4 mt-2 text-sm">
                {challenge.valoracionCreador && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Creador: {challenge.valoracionCreador}/5
                  </div>
                )}
                {challenge.valoracionDesafiado && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Desafiado: {challenge.valoracionDesafiado}/5
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          {/* Accept/Reject for invited players */}
          {isInvited && !isPast && (
            <>
              <Button
                size="sm"
                onClick={handleAccept}
                disabled={isLoading}
              >
                Aceptar desafío
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReject}
                disabled={isLoading}
              >
                Rechazar
              </Button>
            </>
          )}

          {/* Add players */}
          {(canAddCreadores || canAddDesafiados) && (challenge.estado === 'Pendiente' || challenge.estado === 'Aceptado') && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddPlayers(true)}
            >
              Agregar compañeros
            </Button>
          )}

          {/* Finalize */}
          {canFinalize && (
            <Button
              size="sm"
              onClick={() => setShowFinalize(true)}
            >
              Cargar resultado
            </Button>
          )}

          {/* Info for past pending challenges */}
          {isPast && challenge.estado === 'Pendiente' && (
            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
              Desafío expirado
            </Badge>
          )}
        </div>
      </CardContent>

      {/* Dialogs */}
      {showAddPlayers && (
        <AddPlayersDialog
          challenge={challenge}
          canAddCreadores={canAddCreadores}
          canAddDesafiados={canAddDesafiados}
          onClose={() => setShowAddPlayers(false)}
          onSuccess={() => {
            setShowAddPlayers(false)
            onUpdate()
          }}
        />
      )}

      {showFinalize && (
        <FinalizeChallengeDialog
          challenge={challenge}
          onClose={() => setShowFinalize(false)}
          onSuccess={() => {
            setShowFinalize(false)
            onUpdate()
          }}
        />
      )}
    </Card>
  )
}
