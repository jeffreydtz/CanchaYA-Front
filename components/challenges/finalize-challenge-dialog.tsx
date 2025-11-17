'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import apiClient, { Desafio } from '@/lib/api-client'
import { Star, Trophy } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface FinalizeChallengeDialogProps {
  challenge: Desafio
  onClose: () => void
  onSuccess: () => void
}

export function FinalizeChallengeDialog({
  challenge,
  onClose,
  onSuccess,
}: FinalizeChallengeDialogProps) {
  const [ganadorLado, setGanadorLado] = useState<'creador' | 'desafiado'>('creador')
  const [resultado, setResultado] = useState('')
  const [valoracion, setValoracion] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    // Validate resultado format if provided
    if (resultado) {
      const regex = /^\d+-\d+$/
      if (!regex.test(resultado)) {
        toast.error('Formato de resultado inválido. Usa el formato "3-2"')
        return
      }
    }

    setIsSubmitting(true)
    try {
      const data: {
        ganadorLado: 'creador' | 'desafiado'
        resultado?: string
        valoracion?: number
      } = {
        ganadorLado,
      }

      if (resultado) {
        data.resultado = resultado
      }

      if (valoracion > 0) {
        data.valoracion = valoracion
      }

      const response = await apiClient.finalizarDesafio(challenge.id, data)

      if (response.error) {
        // Check for specific error messages
        if (response.error.includes('Aún no se puede finalizar')) {
          toast.error('Aún no se puede finalizar: el partido no ha ocurrido')
        } else if (response.error.includes('Formato de resultado inválido')) {
          toast.error('Formato de resultado inválido. Usa el formato "3-2"')
        } else {
          toast.error(response.error)
        }
        return
      }

      toast.success('Desafío finalizado exitosamente. Rankings actualizados!')
      onSuccess()
    } catch (error) {
      console.error('Error finalizing challenge:', error)
      toast.error('No se pudo finalizar el desafío')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Cargar resultado del desafío
          </DialogTitle>
          <DialogDescription>
            Registra el resultado del partido y actualiza los rankings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Winner selection */}
          <div className="space-y-3">
            <Label>¿Qué equipo ganó?</Label>
            <RadioGroup value={ganadorLado} onValueChange={(value) => setGanadorLado(value as 'creador' | 'desafiado')}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted cursor-pointer">
                <RadioGroupItem value="creador" id="creador" />
                <Label htmlFor="creador" className="flex-1 cursor-pointer">
                  <div className="font-medium">Equipo Creador</div>
                  <div className="text-sm text-muted-foreground">
                    {challenge.jugadoresCreador.map(j => `${j.nombre} ${j.apellido}`).join(', ')}
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted cursor-pointer">
                <RadioGroupItem value="desafiado" id="desafiado" />
                <Label htmlFor="desafiado" className="flex-1 cursor-pointer">
                  <div className="font-medium">Equipo Desafiado</div>
                  <div className="text-sm text-muted-foreground">
                    {challenge.jugadoresDesafiados.length > 0
                      ? challenge.jugadoresDesafiados.map(j => `${j.nombre} ${j.apellido}`).join(', ')
                      : 'Sin jugadores'}
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Score input */}
          <div className="space-y-2">
            <Label htmlFor="resultado">
              Resultado (opcional)
            </Label>
            <Input
              id="resultado"
              placeholder="Ej: 3-2"
              value={resultado}
              onChange={(e) => setResultado(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Formato: golesCreador-golesDesafiado (ej: 3-2)
            </p>
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <Label>Valoración del partido (opcional)</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setValoracion(rating)}
                  className="transition-colors"
                >
                  <Star
                    className={`h-8 w-8 ${
                      rating <= valoracion
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {valoracion > 0 && (
              <p className="text-sm text-muted-foreground">
                {valoracion} de 5 estrellas
              </p>
            )}
          </div>

          {/* Info message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <p className="font-medium text-blue-900">Qué sucederá:</p>
            <ul className="list-disc list-inside text-blue-700 space-y-1 mt-1">
              <li>Se actualizarán los rankings ELO de todos los jugadores</li>
              <li>Se registrarán las estadísticas del partido</li>
              <li>Se guardarán goles, victorias y rachas</li>
              <li>Se notificará a todos los participantes</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Finalizando...' : 'Finalizar desafío'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
