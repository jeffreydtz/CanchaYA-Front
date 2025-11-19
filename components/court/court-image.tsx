'use client'

import { useState } from 'react'
import Image from 'next/image'

interface CourtImageProps {
  src?: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  objectFit?: 'cover' | 'contain' | 'fill'
  priority?: boolean
  sizes?: string
}

/**
 * CourtImage Component
 * Handles court image display with proper fallback and error handling
 * Works with Cloudinary URLs and local placeholders
 */
export function CourtImage({
  src,
  alt,
  width = 400,
  height = 300,
  className = '',
  fill = false,
  objectFit = 'cover',
  priority = false,
  sizes
}: CourtImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(src || '/cancha.png')
  const [isError, setIsError] = useState(false)

  const handleError = () => {
    if (!isError) {
      setIsError(true)
      setImageSrc('/cancha.png')
    }
  }

  const imageClassName = `${className} ${
    objectFit === 'cover'
      ? 'object-cover'
      : objectFit === 'contain'
        ? 'object-contain'
        : 'object-fill'
  }`

  if (fill) {
    return (
      <Image
        src={imageSrc}
        alt={alt}
        fill
        className={imageClassName}
        onError={handleError}
        priority={priority}
        sizes={sizes}
      />
    )
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={imageClassName}
      onError={handleError}
      priority={priority}
      sizes={sizes}
    />
  )
}
