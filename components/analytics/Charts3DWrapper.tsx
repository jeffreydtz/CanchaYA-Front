/**
 * Charts 3D Wrapper - Client-safe wrapper for 3D visualizations
 * 
 * Now compatible with React 19 + @react-three/fiber v9 + @react-three/drei v10
 */

'use client'

import { useEffect, useState, Suspense } from 'react'
import dynamic from 'next/dynamic'

// Loading component
const LoadingFallback = ({ height = 500 }: { height?: number }) => (
  <div 
    className="w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl overflow-hidden flex items-center justify-center"
    style={{ height: `${height}px` }}
  >
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-gray-500">Cargando visualización 3D...</p>
    </div>
  </div>
)

// Dynamically import 3D components with no SSR
const Revenue3DBarChartDynamic = dynamic(
  () => import('./Charts3D').then(mod => ({ default: mod.Revenue3DBarChart })),
  { 
    ssr: false,
    loading: () => <LoadingFallback height={500} />
  }
)

const Heatmap3DDynamic = dynamic(
  () => import('./Charts3D').then(mod => ({ default: mod.Heatmap3D })),
  { 
    ssr: false,
    loading: () => <LoadingFallback height={600} />
  }
)

const Court3DSphereDynamic = dynamic(
  () => import('./Charts3D').then(mod => ({ default: mod.Court3DSphere })),
  { 
    ssr: false,
    loading: () => <LoadingFallback height={600} />
  }
)

// Wrapper components with client-side check
interface Revenue3DBarChartProps {
  data: Array<{ label: string; value: number; color?: string }>
  maxValue?: number
}

export function Revenue3DBarChart(props: Revenue3DBarChartProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <LoadingFallback height={500} />
  }

  return (
    <Suspense fallback={<LoadingFallback height={500} />}>
      <Revenue3DBarChartDynamic {...props} />
    </Suspense>
  )
}

interface Heatmap3DProps {
  data: number[][]
  dayLabels: string[]
  hourLabels: string[]
}

export function Heatmap3D(props: Heatmap3DProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <LoadingFallback height={600} />
  }

  return (
    <Suspense fallback={<LoadingFallback height={600} />}>
      <Heatmap3DDynamic {...props} />
    </Suspense>
  )
}

interface Court3DSphereProps {
  courts: Array<{
    id: string
    name: string
    sport: string
    occupancy: number
    revenue: number
    color: string
  }>
}

export function Court3DSphere(props: Court3DSphereProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <LoadingFallback height={600} />
  }

  return (
    <Suspense fallback={<LoadingFallback height={600} />}>
      <Court3DSphereDynamic {...props} />
    </Suspense>
  )
}
