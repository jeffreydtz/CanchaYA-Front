'use client'

/**
 * Court Photo Gallery Component for CanchaYA
 * Displays and manages court photos with upload/delete functionality
 */

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Camera,
  Upload,
  Trash2,
  X,
  Image as ImageIcon,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ZoomIn
} from 'lucide-react'
import apiClient, { CanchaFoto } from '@/lib/api-client'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth/auth-context'
import Image from 'next/image'

interface CourtPhotoGalleryProps {
  canchaId: string
  canchaNombre: string
  isAdmin?: boolean
}

export default function CourtPhotoGallery({
  canchaId,
  canchaNombre,
  isAdmin = false
}: CourtPhotoGalleryProps) {
  const { isAuthenticated } = useAuth()
  const [photos, setPhotos] = useState<CanchaFoto[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<CanchaFoto | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadPhotos()
  }, [canchaId])

  const loadPhotos = async () => {
    try {
      const response = await apiClient.getCanchaFotos(canchaId)
      if (response.error) {
        console.error('Error loading photos:', response.error)
        return
      }

      if (response.data) {
        // Sort by orden
        const sortedPhotos = response.data.sort((a, b) => a.orden - b.orden)
        setPhotos(sortedPhotos)
      }
    } catch (error) {
      console.error('Error loading photos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error('La imagen es muy grande. Máximo 5MB')
      return
    }

    handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para subir fotos')
      return
    }

    setUploading(true)
    try {
      const response = await apiClient.uploadCanchaFoto(canchaId, file)

      if (response.error) {
        toast.error(response.error)
        return
      }

      if (response.data) {
        toast.success('Foto subida exitosamente')
        loadPhotos()

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      toast.error('No se pudo subir la foto')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (photoId: string) => {
    if (!isAdmin) {
      toast.error('No tienes permisos para eliminar fotos')
      return
    }

    try {
      const response = await apiClient.deleteCanchaFoto(canchaId, photoId)
      if (response.error) {
        toast.error(response.error)
        return
      }

      toast.success('Foto eliminada')
      setPhotos(prev => prev.filter(p => p.id !== photoId))
      setSelectedPhoto(null)
    } catch (error) {
      console.error('Error deleting photo:', error)
      toast.error('No se pudo eliminar la foto')
    }
  }

  const handlePrevImage = () => {
    if (photos.length === 0) return
    setCurrentImageIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
    setSelectedPhoto(photos[currentImageIndex === 0 ? photos.length - 1 : currentImageIndex - 1])
  }

  const handleNextImage = () => {
    if (photos.length === 0) return
    setCurrentImageIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
    setSelectedPhoto(photos[currentImageIndex === photos.length - 1 ? 0 : currentImageIndex + 1])
  }

  const openLightbox = (photo: CanchaFoto, index: number) => {
    setSelectedPhoto(photo)
    setCurrentImageIndex(index)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-6 w-6 text-primary" />
              Galería de Fotos
              {photos.length > 0 && (
                <Badge variant="secondary">{photos.length} {photos.length === 1 ? 'foto' : 'fotos'}</Badge>
              )}
            </CardTitle>
            {isAdmin && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="photo-upload"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  size="sm"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Subir foto
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {photos.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No hay fotos disponibles para esta cancha
              </p>
              {isAdmin && (
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Subir primera foto
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="relative group cursor-pointer overflow-hidden rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary transition-all duration-200"
                  onClick={() => openLightbox(photo, index)}
                >
                  <div className="relative aspect-square">
                    <Image
                      src={photo.url}
                      alt={`${canchaNombre} - Foto ${photo.orden + 1}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                      <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  </div>

                  {/* Photo number badge */}
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="bg-black/60 text-white border-0">
                      #{photo.orden + 1}
                    </Badge>
                  </div>

                  {/* Delete button for admins */}
                  {isAdmin && (
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(photo.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lightbox Dialog */}
      <Dialog open={selectedPhoto !== null} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center justify-between">
              <span>
                {canchaNombre} - Foto {(selectedPhoto?.orden ?? 0) + 1} de {photos.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedPhoto(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          {selectedPhoto && (
            <div className="relative">
              <div className="relative aspect-video w-full bg-gray-900">
                <Image
                  src={selectedPhoto.url}
                  alt={`${canchaNombre} - Foto ${selectedPhoto.orden + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  priority
                />
              </div>

              {/* Navigation buttons */}
              {photos.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white border-0"
                    onClick={handlePrevImage}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white border-0"
                    onClick={handleNextImage}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              {/* Photo info */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Subida el {new Date(selectedPhoto.creadaEl).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                {isAdmin && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-2"
                    onClick={() => handleDelete(selectedPhoto.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar foto
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
