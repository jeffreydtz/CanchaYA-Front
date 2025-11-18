/**
 * PersonaProfile Component
 * Displays persona profile with avatar, personal info
 * - Shows avatar with fallback to initials
 * - Displays nombre, apellido, email
 * - Edit button for owners/admins
 * - Handles loading and error states
 */

'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Edit, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import PersonaAvatar from './persona-avatar'
import PersonaEditForm from './persona-edit-form'
import apiClient, { Persona } from '@/lib/api-client'
import { toast } from 'sonner'

interface PersonaProfileProps {
  personaId: string
  isOwner?: boolean
  isAdmin?: boolean
  showEditButton?: boolean
}

export default function PersonaProfile({
  personaId,
  isOwner = false,
  isAdmin = false,
  showEditButton = true,
}: PersonaProfileProps) {
  const [persona, setPersona] = useState<Persona | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    loadPersona()
  }, [personaId])

  const loadPersona = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.getPersona(personaId)

      if (response.error) {
        if (response.status === 403) {
          setError('No tienes permiso para ver este perfil')
        } else if (response.status === 404) {
          setError('Persona no encontrada')
        } else {
          setError(response.error)
        }
      } else if (response.data) {
        setPersona(response.data)
      }
    } catch (err) {
      setError('Error al cargar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpdated = (newAvatarUrl: string) => {
    if (persona) {
      setPersona({ ...persona, avatarUrl: newAvatarUrl })
    }
  }

  const handleEditSuccess = (updatedPersona: Persona) => {
    setPersona(updatedPersona)
    setIsEditing(false)
  }

  if (loading) {
    return <PersonaProfileSkeleton />
  }

  if (error || !persona) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
        <CardContent className="p-8 text-center">
          <User className="h-16 w-16 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-semibold mb-2 text-red-800 dark:text-red-200">
            {error || 'No se pudo cargar el perfil'}
          </h2>
          <Button onClick={loadPersona} variant="outline" className="mt-4">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isEditing) {
    return (
      <PersonaEditForm
        persona={persona}
        onSuccess={handleEditSuccess}
        onCancel={() => setIsEditing(false)}
      />
    )
  }

  const canEdit = isOwner || isAdmin

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información Personal
          </CardTitle>
          {showEditButton && canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <PersonaAvatar
              personaId={persona.id}
              currentAvatarUrl={persona.avatarUrl}
              nombre={persona.nombre}
              apellido={persona.apellido}
              onAvatarUpdated={handleAvatarUpdated}
              readOnly={!canEdit}
              size="xl"
            />
            <div className="space-y-2 flex-1">
              <h3 className="text-xl font-semibold">
                {persona.nombre} {persona.apellido}
              </h3>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Mail className="h-4 w-4" />
                <span>{persona.email}</span>
              </div>
              {isAdmin && (
                <Badge variant="default">
                  <Shield className="h-3 w-3 mr-1" />
                  Vista de Administrador
                </Badge>
              )}
            </div>
          </div>

          {/* Personal Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
            <div className="space-y-1">
              <Label className="text-sm text-gray-500">Nombre</Label>
              <p className="text-base font-medium">{persona.nombre}</p>
            </div>

            <div className="space-y-1">
              <Label className="text-sm text-gray-500">Apellido</Label>
              <p className="text-base font-medium">{persona.apellido}</p>
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label className="text-sm text-gray-500">Email</Label>
              <p className="text-base font-medium">{persona.email}</p>
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label className="text-sm text-gray-500">ID</Label>
              <p className="text-xs font-mono text-gray-500">{persona.id}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}

function PersonaProfileSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6 mb-6">
          <Skeleton className="h-32 w-32 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
