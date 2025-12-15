/**
 * PersonaAvatar Component
 * Avatar upload with preview, validation, and loading state
 * - Validates file type (JPEG/PNG) and size (< 5MB)
 * - Shows preview before upload
 * - Displays loading spinner during upload
 * - Success/error feedback with toast
 */

'use client'

import { useState } from 'react'
import { Edit, Upload, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import apiClient from '@/lib/api-client'
import { toast } from 'sonner'

interface PersonaAvatarProps {
  personaId: string
  currentAvatarUrl?: string
  nombre: string
  apellido: string
  onAvatarUpdated?: (newAvatarUrl: string) => void
  readOnly?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function PersonaAvatar({
  personaId,
  currentAvatarUrl,
  nombre,
  apellido,
  onAvatarUpdated,
  readOnly = false,
  size = 'lg',
}: PersonaAvatarProps) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
    xl: 'h-32 w-32',
  }

  const getInitials = () => {
    return `${nombre.charAt(0)}${apellido?.charAt(0) || ''}`.toUpperCase()
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo debe ser menor a 5MB')
      return
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error('El archivo debe ser JPEG o PNG')
      return
    }

    setAvatarFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!avatarFile) return

    setUploading(true)
    try {
      const response = await apiClient.uploadPersonaAvatar(personaId, avatarFile)

      if (response.error) {
        // Handle specific error codes
        if (response.status === 403) {
          toast.error('No tienes permiso para actualizar este avatar')
        } else if (response.status === 404) {
          toast.error('Persona no encontrada')
        } else if (response.status === 409) {
          toast.error('Conflicto al subir el avatar')
        } else {
          toast.error(response.error)
        }
      } else if ('data' in response && response.data) {
        toast.success('Avatar actualizado correctamente')

        // Extract avatar URL from response
        // Response format: { avatarUrl: string, persona: Persona } or { persona: { avatarUrl: string } }
        const responseData = response.data as any
        const newAvatarUrl = responseData?.avatarUrl || responseData?.persona?.avatarUrl

        if (newAvatarUrl && onAvatarUpdated) {
          onAvatarUpdated(newAvatarUrl)
        }

        // Clear preview
        setAvatarFile(null)
        setAvatarPreview(null)
      }
    } catch (error) {
      toast.error('Error al subir el avatar')
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative group">
        <Avatar className={`${sizeClasses[size]} ring-2 ring-primary/20 transition-all duration-300 ${!readOnly ? 'group-hover:ring-primary/50' : ''}`}>
          <AvatarImage
            src={avatarPreview || currentAvatarUrl || '/placeholder-user.png'}
            alt={`${nombre} ${apellido}`}
            className="object-cover"
          />
          <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-secondary text-white">
            {getInitials()}
          </AvatarFallback>
        </Avatar>

        {/* Upload overlay - only show if not read-only */}
        {!readOnly && !avatarFile && (
          <>
            <label
              htmlFor={`avatar-upload-${personaId}`}
              className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Edit className="h-6 w-6 text-white" />
            </label>
            <input
              id={`avatar-upload-${personaId}`}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleAvatarChange}
              className="hidden"
              disabled={uploading}
            />
          </>
        )}
      </div>

      {/* Upload controls - only show when file selected */}
      {avatarFile && !readOnly && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Avatar
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={uploading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            {avatarFile.name} ({(avatarFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        </div>
      )}
    </div>
  )
}
