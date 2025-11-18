'use client'

/**
 * Court Ratings Component for CanchaYA
 * Displays and manages court ratings and reviews
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Star,
  ThumbsUp,
  MessageSquare,
  User,
  Trash2,
  AlertCircle
} from 'lucide-react'
import apiClient, { Valoracion } from '@/lib/api-client'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth/auth-context'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface CourtRatingsProps {
  canchaId: string
  canchaNombre: string
}

export default function CourtRatings({ canchaId, canchaNombre }: CourtRatingsProps) {
  const { isAuthenticated, personaId } = useAuth()
  const [ratings, setRatings] = useState<Valoracion[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showRatingForm, setShowRatingForm] = useState(false)

  // Form state
  const [selectedRating, setSelectedRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')

  useEffect(() => {
    loadRatings()
  }, [canchaId])

  const loadRatings = async () => {
    try {
      const response = await apiClient.getValoraciones()
      if (response.error) {
        console.error('Error loading ratings:', response.error)
        return
      }

      if (response.data) {
        // Filter ratings for this specific cancha
        const canchaRatings = response.data.filter(
          (rating) => rating.tipo_objetivo === 'cancha' && rating.id_objetivo === canchaId
        )
        setRatings(canchaRatings)
      }
    } catch (error) {
      console.error('Error loading ratings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitRating = async () => {
    if (!isAuthenticated || !personaId) {
      toast.error('Debes iniciar sesión para valorar')
      return
    }

    if (selectedRating === 0) {
      toast.error('Selecciona una calificación')
      return
    }

    setSubmitting(true)
    try {
      const response = await apiClient.createValoracion({
        tipo_objetivo: 'cancha',
        id_objetivo: canchaId,
        puntaje: selectedRating,
        comentario: comment.trim() || undefined,
      })

      if (response.error) {
        toast.error(response.error)
        return
      }

      if (response.data) {
        toast.success('¡Valoración enviada exitosamente!')
        setSelectedRating(0)
        setComment('')
        setShowRatingForm(false)
        loadRatings()
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
      toast.error('No se pudo enviar la valoración')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteRating = async (ratingId: string) => {
    try {
      const response = await apiClient.deleteValoracion(ratingId)
      if (response.error) {
        toast.error(response.error)
        return
      }

      toast.success('Valoración eliminada')
      loadRatings()
    } catch (error) {
      console.error('Error deleting rating:', error)
      toast.error('No se pudo eliminar la valoración')
    }
  }

  // Calculate average rating
  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.puntaje, 0) / ratings.length
    : 0

  // Count by stars
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    stars: star,
    count: ratings.filter((r) => r.puntaje === star).length,
  }))

  const renderStars = (rating: number, interactive: boolean = false, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    }

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const displayRating = interactive ? (hoverRating || selectedRating) : rating
          const isFilled = star <= displayRating

          return (
            <Star
              key={star}
              className={`${sizeClasses[size]} transition-all ${
                interactive ? 'cursor-pointer hover:scale-110' : ''
              } ${
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-300'
              }`}
              onClick={() => interactive && setSelectedRating(star)}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onMouseLeave={() => interactive && setHoverRating(0)}
            />
          )
        })}
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
            Valoraciones y Reseñas
          </div>
          {isAuthenticated && !showRatingForm && (
            <Button onClick={() => setShowRatingForm(true)} size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Escribir reseña
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Average Rating */}
          <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200/50 dark:border-yellow-700/30">
            <div className="text-5xl font-bold text-yellow-600 dark:text-yellow-400">
              {averageRating.toFixed(1)}
            </div>
            <div className="mt-2">
              {renderStars(averageRating, false, 'lg')}
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Basado en {ratings.length} {ratings.length === 1 ? 'valoración' : 'valoraciones'}
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {ratingCounts.map(({ stars, count }) => {
              const percentage = ratings.length > 0 ? (count / ratings.length) * 100 : 0
              return (
                <div key={stars} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium">{stars}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Rating Form */}
        {showRatingForm && (
          <>
            <Separator />
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/30">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <MessageSquare className="h-5 w-5" />
                Califica {canchaNombre}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-blue-900 dark:text-blue-100">
                    Tu calificación
                  </label>
                  {renderStars(selectedRating, true, 'lg')}
                  {selectedRating > 0 && (
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                      {selectedRating === 5 && '¡Excelente!'}
                      {selectedRating === 4 && 'Muy bueno'}
                      {selectedRating === 3 && 'Bueno'}
                      {selectedRating === 2 && 'Regular'}
                      {selectedRating === 1 && 'Necesita mejorar'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-blue-900 dark:text-blue-100">
                    Tu comentario (opcional)
                  </label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Comparte tu experiencia con otros jugadores..."
                    rows={4}
                    className="bg-white dark:bg-gray-800"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitRating}
                    disabled={submitting || selectedRating === 0}
                    className="flex-1"
                  >
                    {submitting ? 'Enviando...' : 'Enviar valoración'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowRatingForm(false)
                      setSelectedRating(0)
                      setComment('')
                    }}
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Reviews List */}
        {ratings.length > 0 ? (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <ThumbsUp className="h-5 w-5" />
                Reseñas de jugadores
              </h3>
              <div className="space-y-4">
                {ratings.map((rating) => (
                  <div
                    key={rating.id}
                    className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {rating.persona?.nombre || 'Usuario'}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {renderStars(rating.puntaje, false, 'sm')}
                            </Badge>
                          </div>
                          {rating.comentario && (
                            <p className="text-gray-700 dark:text-gray-300 mt-2">
                              {rating.comentario}
                            </p>
                          )}
                        </div>
                      </div>
                      {isAuthenticated && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRating(rating.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          !showRatingForm && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                Aún no hay valoraciones para esta cancha
              </p>
              {isAuthenticated && (
                <Button onClick={() => setShowRatingForm(true)} className="mt-4" size="sm">
                  Sé el primero en valorar
                </Button>
              )}
            </div>
          )
        )}
      </CardContent>
    </Card>
  )
}
