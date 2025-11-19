/**
 * Create Cancha Dialog Component
 * Modal para crear nuevas canchas con validación y conexión al backend
 */

'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import apiClient, { Club, Deporte } from '@/lib/api-client'
import { Loader2, Building2, Trophy, FileText, DollarSign } from 'lucide-react'

interface CreateCanchaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateCanchaDialog({ open, onOpenChange, onSuccess }: CreateCanchaDialogProps) {
  const [loading, setLoading] = useState(false)
  const [clubs, setClubs] = useState<Club[]>([])
  const [deportes, setDeportes] = useState<Deporte[]>([])

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipoSuperficie: '',
    precioPorHora: 0,
    deporteId: '',
    clubId: '',
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
    if (open) {
      loadData()
    }
  }, [open])

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      tipoSuperficie: '',
      precioPorHora: 0,
      deporteId: '',
      clubId: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }
    if (!formData.descripcion.trim()) {
      toast.error('La descripción es requerida')
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
      const response = await apiClient.createCancha(formData)

      if (response.error) {
        toast.error('Error al crear', {
          description: response.error
        })
        return
      }

      toast.success('¡Cancha creada!', {
        description: `La cancha "${formData.nombre}" ha sido creada exitosamente.`
      })

      resetForm()
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error('Error al crear', {
        description: error.message || 'Ocurrió un error inesperado'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open)
      if (!open) resetForm()
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Crear Nueva Cancha
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Completa los datos de la nueva cancha deportiva
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

          {/* Descripción de la ubicación dentro del predio */}
          <div className="space-y-2">
            <Label htmlFor="descripcion" className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Descripción de Ubicación *
            </Label>
            <Input
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Ej: Cancha 3, sector norte del predio"
              className="border-gray-200 dark:border-gray-700"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Descripción de la ubicación dentro del predio del club. La ubicación geográfica viene del club.
            </p>
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
                  Creando...
                </>
              ) : (
                'Crear Cancha'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
