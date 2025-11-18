'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import apiClient, { Desafio, Persona } from '@/lib/api-client'
import { Search, UserPlus, X } from 'lucide-react'

interface AddPlayersDialogProps {
  challenge: Desafio
  canAddCreadores: boolean
  canAddDesafiados: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddPlayersDialog({
  challenge,
  canAddCreadores,
  canAddDesafiados,
  onClose,
  onSuccess,
}: AddPlayersDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Persona[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<Persona[]>([])
  const [selectedSide, setSelectedSide] = useState<'creador' | 'desafiado'>(
    canAddCreadores ? 'creador' : 'desafiado'
  )
  const [isSearching, setIsSearching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const response = await apiClient.searchPersonas(searchQuery)
        if (response.error) {
          toast.error(response.error)
          return
        }

        if (response.data) {
          // Filter out players already in the challenge
          const allPlayers = [
            ...challenge.jugadoresCreador,
            ...challenge.jugadoresDesafiados,
            ...challenge.invitadosDesafiados,
          ]
          const filtered = response.data.filter(
            p => !allPlayers.some(existing => existing.id === p.id) &&
                 !selectedPlayers.some(selected => selected.id === p.id)
          )
          setSearchResults(filtered)
        }
      } catch (error) {
        console.error('Error searching personas:', error)
        toast.error('Error al buscar jugadores')
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, challenge, selectedPlayers])

  const handleAddPlayer = (player: Persona) => {
    setSelectedPlayers(prev => [...prev, player])
    setSearchResults(prev => prev.filter(p => p.id !== player.id))
    setSearchQuery('')
  }

  const handleRemovePlayer = (playerId: string) => {
    setSelectedPlayers(prev => prev.filter(p => p.id !== playerId))
  }

  const handleSubmit = async () => {
    if (selectedPlayers.length === 0) {
      toast.error('Debes seleccionar al menos un jugador')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await apiClient.agregarJugadoresDesafio(challenge.id, {
        lado: selectedSide,
        jugadoresIds: selectedPlayers.map(p => p.id),
      })

      if (response.error) {
        toast.error(response.error)
        return
      }

      toast.success('Jugadores agregados exitosamente')
      onSuccess()
    } catch (error) {
      console.error('Error adding players:', error)
      toast.error('No se pudieron agregar los jugadores')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar jugadores</DialogTitle>
          <DialogDescription>
            Busca y agrega compañeros a tu equipo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Side selector if user can add to both sides */}
          {canAddCreadores && canAddDesafiados && (
            <div className="space-y-2">
              <Label>Agregar a equipo</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={selectedSide === 'creador' ? 'default' : 'outline'}
                  onClick={() => setSelectedSide('creador')}
                  className="flex-1"
                >
                  Equipo Creador
                </Button>
                <Button
                  type="button"
                  variant={selectedSide === 'desafiado' ? 'default' : 'outline'}
                  onClick={() => setSelectedSide('desafiado')}
                  className="flex-1"
                >
                  Equipo Desafiado
                </Button>
              </div>
            </div>
          )}

          {/* Single side display */}
          {!(canAddCreadores && canAddDesafiados) && (
            <div className="space-y-2">
              <Label>Agregar a equipo</Label>
              <Badge variant="outline">
                {selectedSide === 'creador' ? 'Equipo Creador' : 'Equipo Desafiado'}
              </Badge>
            </div>
          )}

          {/* Search input */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar jugadores</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Nombre, apellido o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-lg p-2">
              {searchResults.map(person => (
                <div
                  key={person.id}
                  className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                  onClick={() => handleAddPlayer(person)}
                >
                  <div>
                    <div className="font-medium text-sm">
                      {person.nombre} {person.apellido}
                    </div>
                    <div className="text-xs text-muted-foreground">{person.email}</div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {isSearching && (
            <div className="text-sm text-muted-foreground text-center">
              Buscando...
            </div>
          )}

          {/* Selected players */}
          {selectedPlayers.length > 0 && (
            <div className="space-y-2">
              <Label>Jugadores seleccionados ({selectedPlayers.length})</Label>
              <div className="space-y-1">
                {selectedPlayers.map(player => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-2 bg-muted rounded"
                  >
                    <div className="text-sm">
                      {player.nombre} {player.apellido}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemovePlayer(player.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedPlayers.length === 0 || isSubmitting}
          >
            {isSubmitting ? 'Agregando...' : `Agregar ${selectedPlayers.length} jugador${selectedPlayers.length !== 1 ? 'es' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
