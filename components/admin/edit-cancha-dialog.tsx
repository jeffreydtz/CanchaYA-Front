/**
 * Edit Cancha Dialog Component
 * Modal para editar canchas existentes con validación y conexión al backend
 */

'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import apiClient, { Cancha, Club, Deporte } from '@/lib/api-client'
import { Loader2, MapPin, DollarSign, Building2, Trophy, Compass } from 'lucide-react'

interface EditCanchaDialogProps {
  cancha: Cancha | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditCanchaDialog({ cancha, open, onOpenChange, onSuccess }: EditCanchaDialogProps) {
  const [loading, setLoading] = useState(false)
  const [clubs, setClubs] = useState<Club[]>([])
  const [deportes, setDeportes] = useState<Deporte[]>([])
  
  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    tipoSuperficie: '',
    precioPorHora: 0,
    activa: true,
    deporteId: '',
    clubId: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  })

  // Cargar clubs y deportes
  useEffect(() => {
    const loadData = async () => {
      try {
        const [clubsRes, deportesRes] = await Promise.all([
          apiClient.getClubes(),
          apiClient.getDeportes()
        ])
        
        if (clubsRes.data) setClubs(clubsRes.data)
        if (deportesRes.data) setDeportes(deportesRes.data)
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    loadData()
  }, [])

  // Actualizar form cuando cambia la cancha
  useEffect(() => {
    if (cancha) {
      setFormData({
        nombre: cancha.nombre || '',
        ubicacion: cancha.ubicacion || '',
        tipoSuperficie: cancha.tipoSuperficie || '',
        precioPorHora: cancha.precioPorHora || 0,
        activa: cancha.activa ?? true,
        deporteId: cancha.deporte?.id || '',
        clubId: cancha.club?.id || '',
        latitude: (cancha as any).latitude,
        longitude: (cancha as any).longitude,
      })
    }
  }, [cancha])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!cancha) return

    // Validaciones
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }
    if (!formData.ubicacion.trim()) {
      toast.error('La ubicación es requerida')
      return
    }
    if (formData.precioPorHora <= 0) {
      toast.error('El precio debe ser mayor a 0')
      return
    }
    if (!formData.deporteId) {
      toast.error('Debes seleccionar un deporte')
      return
    }
    if (!formData.clubId) {
      toast.error('Debes seleccionar un club')
      return
    }

    setLoading(true)
    try {
      // Prepare data for API - include coordinates if provided
      const updateData = {
        nombre: formData.nombre,
        ubicacion: formData.ubicacion,
        tipoSuperficie: formData.tipoSuperficie,
        precioPorHora: formData.precioPorHora,
        activa: formData.activa,
        deporteId: formData.deporteId,
        clubId: formData.clubId,
        ...(formData.latitude !== undefined && { latitude: formData.latitude }),
        ...(formData.longitude !== undefined && { longitude: formData.longitude }),
      }

      const response = await apiClient.updateCancha(cancha.id, updateData)
      
      if (response.error) {
        toast.error('Error al actualizar', {
          description: response.error
        })
        return
      }

      toast.success('¡Cancha actualizada!', {
        description: `La cancha "${formData.nombre}" ha sido actualizada exitosamente.`
      })
      
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error('Error al actualizar', {
        description: error.message || 'Ocurrió un error inesperado'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Editar Cancha
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Modifica los datos de la cancha. Los cambios se guardarán inmediatamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Nombre de la Cancha *
            </Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Cancha Principal"
              className="border-gray-200 dark:border-gray-700"
              required
            />
          </div>

          {/* Ubicación */}
          <div className="space-y-2">
            <Label htmlFor="ubicacion" className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Ubicación *
            </Label>
            <Input
              id="ubicacion"
              value={formData.ubicacion}
              onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
              placeholder="Ej: Av. Principal 123, Rosario"
              className="border-gray-200 dark:border-gray-700"
              required
            />
          </div>

          {/* Coordenadas Geográficas */}
          <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Compass className="h-4 w-4" />
              Coordenadas Geográficas
            </Label>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Ajusta manualmente las coordenadas si el geocoding automático no fue preciso
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Latitud
                </Label>
                <Input
                  id="latitude"
                  type="number"
                  value={formData.latitude ?? ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    latitude: e.target.value ? parseFloat(e.target.value) : undefined
                  })}
                  placeholder="Ej: -34.6037"
                  step="0.00001"
                  className="border-gray-200 dark:border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Longitud
                </Label>
                <Input
                  id="longitude"
                  type="number"
                  value={formData.longitude ?? ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    longitude: e.target.value ? parseFloat(e.target.value) : undefined
                  })}
                  placeholder="Ej: -58.3816"
                  step="0.00001"
                  className="border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Grid de Deporte y Club */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Deporte */}
            <div className="space-y-2">
              <Label htmlFor="deporte" className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Deporte *
              </Label>
              <Select 
                value={formData.deporteId} 
                onValueChange={(value) => setFormData({ ...formData, deporteId: value })}
              >
                <SelectTrigger className="border-gray-200 dark:border-gray-700">
                  <SelectValue placeholder="Seleccionar deporte" />
                </SelectTrigger>
                <SelectContent>
                  {deportes.map((deporte) => (
                    <SelectItem key={deporte.id} value={deporte.id}>
                      {deporte.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Club */}
            <div className="space-y-2">
              <Label htmlFor="club" className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Club *
              </Label>
              <Select 
                value={formData.clubId} 
                onValueChange={(value) => setFormData({ ...formData, clubId: value })}
              >
                <SelectTrigger className="border-gray-200 dark:border-gray-700">
                  <SelectValue placeholder="Seleccionar club" />
                </SelectTrigger>
                <SelectContent>
                  {clubs.map((club) => (
                    <SelectItem key={club.id} value={club.id}>
                      {club.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tipo de Superficie */}
          <div className="space-y-2">
            <Label htmlFor="tipoSuperficie" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Tipo de Superficie
            </Label>
            <Input
              id="tipoSuperficie"
              value={formData.tipoSuperficie}
              onChange={(e) => setFormData({ ...formData, tipoSuperficie: e.target.value })}
              placeholder="Ej: Césped sintético, Cemento, Parquet"
              className="border-gray-200 dark:border-gray-700"
            />
          </div>

          {/* Precio por Hora */}
          <div className="space-y-2">
            <Label htmlFor="precio" className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Precio por Hora *
            </Label>
            <Input
              id="precio"
              type="number"
              value={formData.precioPorHora}
              onChange={(e) => setFormData({ ...formData, precioPorHora: parseFloat(e.target.value) || 0 })}
              placeholder="0"
              min="0"
              step="100"
              className="border-gray-200 dark:border-gray-700"
              required
            />
          </div>

          {/* Disponibilidad */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="activa" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Cancha Disponible
              </Label>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Los usuarios pueden reservar esta cancha
              </p>
            </div>
            <Switch
              id="activa"
              checked={formData.activa}
              onCheckedChange={(checked) => setFormData({ ...formData, activa: checked })}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="border-gray-200 dark:border-gray-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
