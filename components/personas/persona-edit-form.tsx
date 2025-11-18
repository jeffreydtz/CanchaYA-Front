/**
 * PersonaEditForm Component
 * Edit form for persona with validation using React Hook Form + Zod
 * - Only allows editing: nombre, apellido, email
 * - Handles 403 (forbidden), 409 (email duplicate), 400 (invalid data) errors
 * - Shows success toast on update
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, X, User, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import apiClient, { Persona } from '@/lib/api-client'
import { toast } from 'sonner'

const personaSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
})

type PersonaFormData = z.infer<typeof personaSchema>

interface PersonaEditFormProps {
  persona: Persona
  onSuccess?: (updatedPersona: Persona) => void
  onCancel?: () => void
}

export default function PersonaEditForm({
  persona,
  onSuccess,
  onCancel,
}: PersonaEditFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<PersonaFormData>({
    resolver: zodResolver(personaSchema),
    defaultValues: {
      nombre: persona.nombre,
      apellido: persona.apellido,
      email: persona.email,
    },
  })

  const onSubmit = async (data: PersonaFormData) => {
    try {
      const response = await apiClient.updatePersona(persona.id, data)

      if (response.error) {
        // Handle specific error codes
        if (response.status === 403) {
          toast.error('No tienes permiso para acceder a este perfil')
        } else if (response.status === 409) {
          toast.error('El email ya está registrado')
        } else if (response.status === 400) {
          toast.error('Revisá los datos e intentá nuevamente')
        } else if (response.status === 404) {
          toast.error('Persona no encontrada')
        } else {
          toast.error(response.error)
        }
      } else {
        toast.success('Perfil actualizado correctamente')
        if (response.data && onSuccess) {
          onSuccess(response.data)
        }
      }
    } catch (error) {
      console.error('Error updating persona:', error)
      toast.error('Error al actualizar el perfil')
    }
  }

  const handleCancel = () => {
    reset()
    onCancel?.()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Editar Información Personal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="nombre"
                  {...register('nombre')}
                  disabled={isSubmitting}
                  className="pl-10"
                  placeholder="Juan"
                />
              </div>
              {errors.nombre && (
                <p className="text-sm text-red-600">{errors.nombre.message}</p>
              )}
            </div>

            {/* Apellido */}
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="apellido"
                  {...register('apellido')}
                  disabled={isSubmitting}
                  className="pl-10"
                  placeholder="Pérez"
                />
              </div>
              {errors.apellido && (
                <p className="text-sm text-red-600">{errors.apellido.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  disabled={isSubmitting}
                  className="pl-10"
                  placeholder="juan@ejemplo.com"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={isSubmitting || !isDirty}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
