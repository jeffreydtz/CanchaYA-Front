/**
 * Club Location Map Component
 * Displays club geographical location on a map using Leaflet
 */

'use client'

import dynamic from 'next/dynamic'

interface ClubLocationMapProps {
  latitude: number
  longitude: number
  clubName: string
  address?: string
}

const DynamicMap = dynamic(() => import('./dynamic-leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="text-gray-600 dark:text-gray-400">Cargando mapa...</div>
    </div>
  ),
})

export default function ClubLocationMap({
  latitude,
  longitude,
  clubName,
  address,
}: ClubLocationMapProps) {
  return (
    <div className="w-full rounded-lg overflow-hidden">
      <DynamicMap
        latitude={latitude}
        longitude={longitude}
        clubName={clubName}
        address={address}
        zoom={15}
        height="400px"
      />
    </div>
  )
}
