/**
 * Cancha Photos Manager Component
 * Galería de fotos para una cancha con upload y eliminación
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import apiClient, { Cancha, CanchaFoto } from '@/lib/api-client'
import { Loader2, Upload, Trash2, Image as ImageIcon, X } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface CanchaPhotosManagerProps {
  cancha: Cancha | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CanchaPhotosManager({ cancha, open, onOpenChange }: CanchaPhotosManagerProps) {
  const [photos, setPhotos] = useState<CanchaFoto[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [photoToDelete, setPhotoToDelete] = useState<CanchaFoto | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadPhotos = async () => {
    if (!cancha) return

    setLoading(true)
    try {
      const response = await apiClient.getCanchaFotos(cancha.id)
      if (response.data) {
        setPhotos(response.data)
      } else {
        setPhotos([])
      }
    } catch (error) {
      toast.error('Error al cargar fotos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && cancha) {
      loadPhotos()
    }
  }, [open, cancha])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !cancha) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen')
      return
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5MB')
      return
    }

    setUploading(true)
    try {
      const response = await apiClient.uploadCanchaFoto(cancha.id, file)

      if (response.error) {
        toast.error('Error al subir foto', {
          description: response.error
        })
        return
      }

      toast.success('Foto subida exitosamente')
      loadPhotos()
    } catch (error: any) {
      toast.error('Error al subir foto', {
        description: error.message || 'Ocurrió un error inesperado'
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteClick = (photo: CanchaFoto) => {
    setPhotoToDelete(photo)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!photoToDelete || !cancha) return

    setDeletingPhotoId(photoToDelete.id)
    try {
      const response = await apiClient.deleteCanchaFoto(cancha.id, photoToDelete.id)

      if (response.error) {
        toast.error('Error al eliminar', {
          description: response.error
        })
        return
      }

      toast.success('Foto eliminada exitosamente')
      setPhotos(prev => prev.filter(p => p.id !== photoToDelete.id))
      setDeleteDialogOpen(false)
      setPhotoToDelete(null)
    } catch (error) {
      toast.error('Error al eliminar foto')
    } finally {
      setDeletingPhotoId(null)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Galería de Fotos
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {cancha?.nombre} - Administra las fotos de la cancha
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Upload Button */}
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || loading}
                className="bg-primary hover:bg-primary/90"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir Foto
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Max 5MB, formatos: JPG, PNG, WEBP
              </p>
            </div>

            {/* Photos Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : photos.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-300 dark:border-gray-700">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ImageIcon className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    No hay fotos para esta cancha.
                    <br />
                    Haz clic en &quot;Subir Foto&quot; para agregar imágenes.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo) => (
                  <Card key={photo.id} className="group relative overflow-hidden border-gray-200 dark:border-gray-800">
                    <CardContent className="p-0">
                      <div className="relative aspect-video">
                        <img
                          src={photo.url}
                          alt={`Foto ${photo.orden}`}
                          className="object-cover w-full h-full"
                        />
                        {/* Delete Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteClick(photo)}
                            disabled={deletingPhotoId === photo.id}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {deletingPhotoId === photo.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta foto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La foto será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-200 dark:border-gray-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deletingPhotoId !== null}
            >
              {deletingPhotoId ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
