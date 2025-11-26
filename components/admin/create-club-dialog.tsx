/**
 * Create Club Dialog Component
 * Modal para crear nuevos clubes con validación y conexión al backend
 */

'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import apiClient from '@/lib/api-client'
import { Loader2, MapPin, Phone, Mail, Building2, Map } from 'lucide-react'
import { LocationSearchMap } from './location-search-map'

interface CreateClubDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateClubDialog({ open, onOpenChange, onSuccess }: CreateClubDialogProps) {
  const [loading, setLoading] = useState(false)
  const [locationTab, setLocationTab] = useState<'manual' | 'map'>('manual')

  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    latitud: undefined as number | undefined,
    longitud: undefined as number | undefined,
  })

  const resetForm = () => {
    setFormData({
      nombre: '',
      direccion: '',
      telefono: '',
      email: '',
      latitud: undefined,
      longitud: undefined,
    })
    setLocationTab('manual')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
      // Filtrar los campos undefined
      const submitData = {
        nombre: formData.nombre,
        direccion: formData.direccion,
        ...(formData.telefono && { telefono: formData.telefono }),
        ...(formData.email && { email: formData.email }),
        ...(formData.latitud !== undefined && { latitud: formData.latitud }),
        ...(formData.longitud !== undefined && { longitud: formData.longitud }),
      }
      const response = await apiClient.createClub(submitData)

      if (response.error) {
        toast.error('Error al crear', {
          description: response.error
        })
        return
      }

      toast.success('¡Club creado!', {
        description: `El club "${formData.nombre}" ha sido creado exitosamente.`
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
            Crear Nuevo Club
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Completa los datos del nuevo club deportivo
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

          {/* Dirección y Ubicación Geográfica */}
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

          {/* Ubicación Geográfica (Coordenadas) */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Map className="h-4 w-4" />
              Ubicación Geográfica (Opcional)
            </Label>

            <Tabs value={locationTab} onValueChange={(v) => setLocationTab(v as 'manual' | 'map')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">Manual</TabsTrigger>
                <TabsTrigger value="map" className="flex items-center gap-2">
                  <Map className="h-4 w-4" />
                  Mapa
                </TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="space-y-3 mt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="latitud" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Latitud
                    </Label>
                    <Input
                      id="latitud"
                      type="number"
                      step="0.000001"
                      value={formData.latitud ?? ''}
                      onChange={(e) => setFormData({ ...formData, latitud: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="-34.603722"
                      className="border-gray-200 dark:border-gray-700 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitud" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Longitud
                    </Label>
                    <Input
                      id="longitud"
                      type="number"
                      step="0.000001"
                      value={formData.longitud ?? ''}
                      onChange={(e) => setFormData({ ...formData, longitud: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="-58.381592"
                      className="border-gray-200 dark:border-gray-700 text-sm"
                    />
                  </div>
                </div>
                {formData.latitud && formData.longitud && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <p className="font-semibold mb-1">Coordenadas guardadas:</p>
                    <p>{Number(formData.latitud).toFixed(6)}, {Number(formData.longitud).toFixed(6)}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="map" className="mt-3">
                <LocationSearchMap
                  initialAddress={formData.direccion}
                  initialLat={formData.latitud}
                  initialLng={formData.longitud}
                  onLocationSelect={(location) => {
                    setFormData({
                      ...formData,
                      latitud: location.latitude,
                      longitud: location.longitude
                    })
                  }}
                />
              </TabsContent>
            </Tabs>
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
                  Creando...
                </>
              ) : (
                'Crear Club'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
