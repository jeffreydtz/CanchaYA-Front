/**
 * Rating Display Component
 * Displays ratings and reviews for courts, clubs, and users
 */

'use client'

import { useState, useEffect } from 'react'
import { Star, MessageSquare, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import apiClient, { Valoracion } from '@/lib/api-client'
import { toast } from 'sonner'

interface RatingDisplayProps {
  objectiveType: 'cancha' | 'club' | 'usuario'
  objectiveId: string
  title?: string
  showCreateButton?: boolean
  onCreateNew?: () => void
  maxHeight?: string
}

interface RatingStats {
  averageRating: number
  totalRatings: number
  ratingDistribution: Record<number, number>
}

export function RatingDisplay({
  objectiveType,
  objectiveId,
  title = 'Valoraciones',
  showCreateButton = false,
  onCreateNew,
  maxHeight = 'max-h-[600px]'
}: RatingDisplayProps) {
  const [ratings, setRatings] = useState<Valoracion[]>([])
  const [stats, setStats] = useState<RatingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent')

  useEffect(() => {
    loadRatings()
  }, [objectiveId, objectiveType])

  const loadRatings = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getValoraciones()
      if (response.data) {
        // Filter ratings for this specific objective
        const filtered = response.data.filter(
          v => v.tipo_objetivo === objectiveType && v.id_objetivo === objectiveId
        )
        setRatings(filtered)

        // Calculate statistics
        if (filtered.length > 0) {
          const average = filtered.reduce((sum, r) => sum + (Number(r.puntaje) || 0), 0) / filtered.length
          const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          filtered.forEach(r => {
            const score = Number(r.puntaje)
            if (score >= 1 && score <= 5) {
              distribution[Math.round(score)]++
            }
          })

          // Ensure average is a valid number
          const validAverage = !isNaN(average) && isFinite(average) ? average : 0

          setStats({
            averageRating: Math.round(validAverage * 10) / 10,
            totalRatings: filtered.length,
            ratingDistribution: distribution
          })
        } else {
          setStats({
            averageRating: 0,
            totalRatings: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          })
        }
      }
    } catch (error) {
      console.error('Error loading ratings:', error)
      toast.error('Error al cargar valoraciones')
    } finally {
      setLoading(false)
    }
  }

  const getSortedRatings = () => {
    const sorted = [...ratings]
    switch (sortBy) {
      case 'rating':
        return sorted.sort((a, b) => b.puntaje - a.puntaje)
      case 'recent':
      default:
        return sorted
    }
  }

  const getRatingColor = (rating: number): string => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 3.5) return 'text-blue-600'
    if (rating >= 2.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRatingBgColor = (rating: number): string => {
    if (rating >= 4.5) return 'bg-green-50 dark:bg-green-900/20'
    if (rating >= 3.5) return 'bg-blue-50 dark:bg-blue-900/20'
    if (rating >= 2.5) return 'bg-yellow-50 dark:bg-yellow-900/20'
    return 'bg-red-50 dark:bg-red-900/20'
  }

  const StarRating = ({ rating, showValue = true }: { rating: number; showValue?: boolean }) => {
    const numericRating = Number(rating) || 0
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < numericRating
                ? `fill-yellow-400 ${getRatingColor(numericRating)}`
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
        {showValue && <span className="ml-1 font-semibold text-sm">
          {numericRating.toFixed(1)}
        </span>}
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">Cargando valoraciones...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-bold">{title}</CardTitle>
          {showCreateButton && (
            <Button size="sm" onClick={onCreateNew} className="font-semibold">
              Agregar Valoración
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {stats && stats.totalRatings > 0 ? (
            <>
              {/* Rating Summary */}
              <div className="flex flex-col md:flex-row gap-8">
                {/* Average Rating */}
                <div className="flex-1 text-center md:text-left md:border-r border-gray-200 dark:border-gray-700 md:pr-8">
                  <div className="mb-4">
                    <div className={`text-5xl font-bold mb-2 ${getRatingColor(stats.averageRating)}`}>
                      {typeof stats.averageRating === 'number' && !isNaN(stats.averageRating) 
                        ? stats.averageRating.toFixed(1) 
                        : '0.0'}
                    </div>
                    <StarRating rating={Math.round(stats.averageRating || 0)} showValue={false} />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Basado en {stats.totalRatings} {stats.totalRatings === 1 ? 'valoración' : 'valoraciones'}
                    </p>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = stats.ratingDistribution[rating] || 0
                    const percentage = stats.totalRatings > 0 ? (count / stats.totalRatings) * 100 : 0
                    return (
                      <div key={rating} className="flex items-center gap-2">
                        <div className="flex items-center gap-1 min-w-[60px]">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              rating >= 4
                                ? 'bg-green-500'
                                : rating >= 3
                                  ? 'bg-blue-500'
                                  : rating >= 2
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[40px] text-right">
                          {count}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Sort Options */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2 flex-wrap">
                  {(['recent', 'rating'] as const).map((sort) => (
                    <Button
                      key={sort}
                      variant={sortBy === sort ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy(sort)}
                      className="font-medium"
                    >
                      {sort === 'recent' ? 'Más Recientes' : 'Mejor Calificación'}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Aún no hay valoraciones para este {objectiveType}
              </p>
              {showCreateButton && (
                <Button onClick={onCreateNew} className="font-semibold">
                  Sé el primero en valorar
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ratings List */}
      {getSortedRatings().length > 0 && (
        <div className={`space-y-4 ${maxHeight} overflow-y-auto pr-2`}>
          {getSortedRatings().map((rating) => (
            <Card key={rating.id} className={getRatingBgColor(rating.puntaje)}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">
                          {rating.persona?.nombre || 'Usuario Anónimo'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-semibold">
                    {rating.puntaje}/5
                  </Badge>
                </div>

                <div className="mb-3">
                  <StarRating rating={rating.puntaje} showValue={false} />
                </div>

                {rating.comentario && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {rating.comentario}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Export a simplified star rating component
export function StarRatingInput({
  value = 0,
  onChange,
  size = 'md',
  interactive = true
}: {
  value?: number
  onChange?: (rating: number) => void
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
}) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          disabled={!interactive}
          onMouseEnter={() => interactive && setHoverRating(rating)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          onClick={() => interactive && onChange?.(rating)}
          className={`transition-colors ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            className={`${sizeMap[size]} ${
              rating <= (hoverRating || value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  )
}
