'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react'
import { CanchaFoto } from '@/lib/api-client'

interface CourtPhotosCarouselProps {
  photos?: CanchaFoto[]
  courtName: string
  className?: string
}

export function CourtPhotosCarousel({ photos, courtName, className = '' }: CourtPhotosCarouselProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  if (!photos || photos.length === 0) {
    return (
      <Card className={`bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="aspect-video flex flex-col items-center justify-center gap-3">
          <ImageIcon className="h-12 w-12 text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">No hay fotos disponibles para esta cancha</p>
        </div>
      </Card>
    )
  }

  const currentPhoto = photos[currentPhotoIndex]

  const handlePrevious = () => {
    setCurrentPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
  }

  return (
    <Card className={`relative overflow-hidden bg-gray-900 border-gray-700 group ${className}`}>
      <div className="relative aspect-video bg-gray-900">
        <Image
          src={currentPhoto.url}
          alt={`${courtName} - Foto ${currentPhotoIndex + 1}`}
          fill
          className="object-cover"
          priority={currentPhotoIndex === 0}
        />

        {/* Navigation Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between">
          {/* Top Info */}
          <div className="p-4">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white rounded-full px-3 py-1 w-fit">
              <span className="text-sm font-medium">{currentPhotoIndex + 1}</span>
              <span className="text-sm">/</span>
              <span className="text-sm font-medium">{photos.length}</span>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="p-4 flex justify-between items-end gap-3">
            <Button
              onClick={handlePrevious}
              size="icon"
              variant="ghost"
              className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex gap-2">
              {photos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPhotoIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentPhotoIndex
                      ? 'w-6 bg-white'
                      : 'w-2 bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              size="icon"
              variant="ghost"
              className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
