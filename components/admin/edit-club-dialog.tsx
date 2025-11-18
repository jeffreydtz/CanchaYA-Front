/**
 * Edit Club Dialog Component
 * Modal para editar clubes existentes con validación y conexión al backend
 */

'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import apiClient, { Club } from '@/lib/api-client'
import { Loader2, MapPin, Phone, Mail, Building2 } from 'lucide-react'

interface EditClubDialogProps {
  club: Club | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditClubDialog({ club, open, onOpenChange, onSuccess }: EditClubDialogProps) {
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
  })

  // Actualizar form cuando cambia el club
  useEffect(() => {
    if (club) {
      setFormData({
        nombre: club.nombre || '',
        direccion: club.direccion || '',
        telefono: club.telefono || '',
        email: club.email || '',
      })
    }
  }, [club])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!club) return

    // Validaciones
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }
    if (!formData.direccion.trim()) {
      toast.error('La dirección es requerida')
      return
    }

    setLoading(true)
    try {
      const response = await apiClient.updateClub(club.id, formData)

      if (response.error) {
        toast.error('Error al actualizar', {
          description: response.error
        })
        return
      }

      toast.success('¡Club actualizado!', {
        description: `El club "${formData.nombre}" ha sido actualizado exitosamente.`
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
            Editar Club
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Modifica los datos del club. Los cambios se guardarán inmediatamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Nombre del Club *
            </Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Club San Martín"
              className="border-gray-200 dark:border-gray-700"
              required
            />
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <Label htmlFor="direccion" className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Dirección *
            </Label>
            <Input
              id="direccion"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              placeholder="Ej: Av. Siempre Viva 742"
              className="border-gray-200 dark:border-gray-700"
              required
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="telefono" className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Teléfono
            </Label>
            <Input
              id="telefono"
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              placeholder="Ej: +54 341 555-1234"
              className="border-gray-200 dark:border-gray-700"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Ej: contacto@clubsanmartin.com"
              className="border-gray-200 dark:border-gray-700"
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
