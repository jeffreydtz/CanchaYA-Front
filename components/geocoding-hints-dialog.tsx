'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { AlertCircle, MapPin, Lightbulb } from 'lucide-react'
import { geocodeAddress } from '@/lib/geocoding'
import { Cancha } from '@/lib/api-client'
import { useState } from 'react'

interface GeocodingHintsDialogProps {
  court: Cancha | null
  open: boolean
  onOpenChange: (open: boolean) => void
  hints: string[]
  onAddressUpdate?: (court: Cancha, latitude: number, longitude: number) => void
}

export function GeocodingHintsDialog({
  court,
  open,
  onOpenChange,
  hints,
  onAddressUpdate,
}: GeocodingHintsDialogProps) {
  const [address, setAddress] = useState('')
  const [isRetrying, setIsRetrying] = useState(false)

  if (!court) return null

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setAddress(court.ubicacion)
    }
    onOpenChange(newOpen)
  }

  const handleRetry = async () => {
    if (!address.trim()) {
      toast.error('Por favor ingresa una dirección')
      return
    }

    setIsRetrying(true)
    try {
      const result = await geocodeAddress(address)

      if (result) {
        toast.success(`¡Ubicación encontrada para ${court.nombre}!`)
        onAddressUpdate?.(court, result.latitude, result.longitude)
        handleOpenChange(false)
      } else {
        toast.error('No se pudo encontrar la ubicación. Intenta con más detalles.')
      }
    } catch (error) {
      toast.error('Error al buscar la ubicación')
      console.error('Error geocoding:', error)
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <DialogTitle className="text-lg font-bold">
                No se pudo ubicar: {court.nombre}
              </DialogTitle>
              <DialogDescription>
                La dirección no coincidió con ninguna ubicación en el mapa
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Address */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Dirección actual:</Label>
            <p className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-sm">
              {court.ubicacion}
            </p>
          </div>

          {/* Suggestions */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Sugerencias para mejorar:
            </Label>
            <div className="space-y-2">
              {hints.map((hint, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                  <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">{hint}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Improved Address Input */}
          <div className="space-y-2">
            <Label htmlFor="improved-address" className="text-sm font-semibold">
              Dirección mejorada:
            </Label>
            <Input
              id="improved-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ej: Av. Principal 123, Villa Crespo, Buenos Aires, Argentina"
              className="border-gray-200 dark:border-gray-700"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isRetrying}
          >
            Cerrar
          </Button>
          <Button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="bg-primary hover:bg-primary/90"
          >
            {isRetrying ? 'Buscando...' : 'Intentar de nuevo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
