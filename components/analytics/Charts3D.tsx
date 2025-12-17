/**
 * 3D Analytics Visualizations using Three.js
 * Interactive 3D charts for revenue, occupancy, and court distribution
 * 
 * Compatible with:
 * - React 19.2.3
 * - @react-three/fiber 9.4.2
 * - @react-three/drei 10.7.7
 * - Three.js 0.182.0
 * 
 * IMPORTANT: These components MUST be loaded with next/dynamic and ssr: false
 * to avoid SSR issues with Three.js
 */

'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Environment, PerspectiveCamera, Stars } from '@react-three/drei'
import * as THREE from 'three'

// ============================================================================
// TYPES
// ============================================================================

interface Revenue3DBarChartProps {
  data: Array<{ label: string; value: number; color?: string }>
  maxValue?: number
}

interface Heatmap3DProps {
  data: number[][] // 7 days × 16 hours matrix
  dayLabels: string[]
  hourLabels: string[]
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

// ============================================================================
// 3D BAR CHART FOR REVENUE
// ============================================================================

// Helper function to get color based on value (height)
const getColorByValue = (value: number, maxValue: number): string => {
  const percentage = (value / maxValue) * 100
  
  // Color gradient: Low (blue) -> Medium (green/yellow) -> High (orange/red)
  if (percentage >= 80) return '#ef4444' // Red - Very High
  if (percentage >= 60) return '#f59e0b' // Amber - High
  if (percentage >= 40) return '#10b981' // Green - Medium-High
  if (percentage >= 20) return '#3b82f6' // Blue - Medium
  return '#94a3b8' // Gray - Low
}

function Bar3D({
  position,
  height,
  color,
  label,
  value,
  maxValue
}: {
  position: [number, number, number]
  height: number
  color?: string
  label: string
  value: number
  maxValue: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  // Calculate color based on value height
  const barColor = color || getColorByValue(value, maxValue)
  const hoverColor = hovered ? '#60a5fa' : barColor

  useFrame(() => {
    if (meshRef.current) {
      // Smooth animation
      meshRef.current.scale.y = THREE.MathUtils.lerp(
        meshRef.current.scale.y,
        hovered ? 1.1 : 1,
        0.1
      )
    }
  })

  return (
    <group position={position}>
      {/* Bar */}
      <mesh
        ref={meshRef}
        position={[0, height / 2, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[0.8, height, 0.8]} />
        <meshStandardMaterial
          color={hoverColor}
          metalness={0.3}
          roughness={0.4}
          emissive={barColor}
          emissiveIntensity={hovered ? 0.3 : 0.1}
        />
      </mesh>

      {/* Label */}
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.3}
        color="#374151"
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI / 2, 0, 0]}
      >
        {label}
      </Text>

      {/* Value label */}
      {hovered && (
        <Text
          position={[0, height + 0.5, 0]}
          fontSize={0.25}
          color="#1f2937"
          anchorX="center"
          anchorY="middle"
        >
          ${value.toLocaleString()}
        </Text>
      )}
    </group>
  )
}

export function Revenue3DBarChart({ data, maxValue }: Revenue3DBarChartProps) {
  const [mounted, setMounted] = useState(false)

  // Ensure client-side only rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !data || data.length === 0) {
    return (
      <div className="w-full h-[500px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl overflow-hidden flex items-center justify-center">
        <p className="text-gray-500">Cargando visualización 3D...</p>
      </div>
    )
  }

  const max = maxValue || Math.max(...data.map(d => d.value), 1)
  const normalizedData = data.map(d => ({
    ...d,
    normalizedHeight: (d.value / max) * 5 // Scale to max height of 5 units
  }))

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl overflow-hidden">
      {/* Color Legend */}
      <div className="p-4 bg-white/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Intensidad por valor:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#94a3b8' }}></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">0-20%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">20-40%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">40-60%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">60-80%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">80-100%</span>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="w-full h-[500px]">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[8, 8, 8]} />
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={5}
            maxDistance={20}
          />

          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={2048}
          />
          <pointLight position={[-10, 10, -10]} intensity={0.5} />

          {/* Grid floor */}
          <gridHelper args={[20, 20, '#94a3b8', '#cbd5e1']} position={[0, 0, 0]} />

          {/* Bars */}
          {normalizedData.map((item, index) => {
            const xPos = (index - normalizedData.length / 2) * 1.5
            return (
              <Bar3D
                key={`bar-${index}`}
                position={[xPos, 0, 0]}
                height={item.normalizedHeight}
                color={item.color} // Optional: can override with sport color
                label={item.label}
                value={item.value}
                maxValue={max}
              />
            )
          })}

          {/* Environment */}
          <Environment preset="city" />
        </Canvas>
      </div>
    </div>
  )
}

// ============================================================================
// 3D HEATMAP FOR OCCUPANCY
// ============================================================================

function HeatmapCell({
  position,
  intensity,
  day,
  hour
}: {
  position: [number, number, number]
  intensity: number
  day: string
  hour: string
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  // Color based on intensity (0-100%)
  const color = useMemo(() => {
    if (intensity > 75) return '#ef4444' // Red - High
    if (intensity > 50) return '#f59e0b' // Amber - Medium
    if (intensity > 25) return '#3b82f6' // Blue - Low
    return '#94a3b8' // Gray - Very low
  }, [intensity])

  const height = Math.max(intensity / 20, 0.2) // Min height 0.2

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        hovered ? height + 0.3 : height / 2,
        0.1
      )
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[0.9, height, 0.9]} />
      <meshStandardMaterial
        color={color}
        metalness={0.2}
        roughness={0.6}
        emissive={color}
        emissiveIntensity={hovered ? 0.3 : 0.1}
      />
      {hovered && (
        <Text
          position={[0, height + 0.5, 0]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {day} {hour}
          {'\n'}
          {intensity.toFixed(0)}%
        </Text>
      )}
    </mesh>
  )
}

export function Heatmap3D({ data, dayLabels, hourLabels }: Heatmap3DProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !data || data.length === 0) {
    return (
      <div className="w-full h-[600px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl overflow-hidden flex items-center justify-center">
        <p className="text-gray-500">Cargando visualización 3D...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-[600px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl overflow-hidden">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[10, 12, 10]} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={8}
          maxDistance={25}
        />

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 15, 5]} intensity={0.8} castShadow />
        <pointLight position={[-10, 10, -10]} intensity={0.3} color="#60a5fa" />

        {/* Grid */}
        <gridHelper args={[20, 20, '#94a3b8', '#cbd5e1']} position={[0, 0, 0]} />

        {/* Heatmap cells */}
        {data.map((dayData, dayIndex) =>
          dayData.map((value, hourIndex) => {
            const xPos = (hourIndex - hourLabels.length / 2) * 1.2
            const zPos = (dayIndex - dayLabels.length / 2) * 1.2
            return (
              <HeatmapCell
                key={`heatmap-${dayIndex}-${hourIndex}`}
                position={[xPos, 0, zPos]}
                intensity={value}
                day={dayLabels[dayIndex]}
                hour={hourLabels[hourIndex]}
              />
            )
          })
        )}

        {/* Day labels */}
        {dayLabels.map((day, index) => {
          const zPos = (index - dayLabels.length / 2) * 1.2
          return (
            <Text
              key={`day-label-${index}`}
              position={[-hourLabels.length * 0.6 - 1, 0.1, zPos]}
              fontSize={0.3}
              color="#1f2937"
              anchorX="right"
              anchorY="middle"
              rotation={[-Math.PI / 2, 0, 0]}
            >
              {day}
            </Text>
          )
        })}

        {/* Hour labels (every 2 hours) */}
        {hourLabels.filter((_, i) => i % 2 === 0).map((hour, index) => {
          const actualIndex = index * 2
          const xPos = (actualIndex - hourLabels.length / 2) * 1.2
          return (
            <Text
              key={`hour-label-${actualIndex}`}
              position={[xPos, 0.1, dayLabels.length * 0.6 + 1]}
              fontSize={0.25}
              color="#1f2937"
              anchorX="center"
              anchorY="top"
              rotation={[-Math.PI / 2, 0, 0]}
            >
              {hour}
            </Text>
          )
        })}

        <Environment preset="sunset" />
      </Canvas>
    </div>
  )
}

// ============================================================================
// 3D SPHERE VISUALIZATION - Courts Distribution
// ============================================================================

function CourtSphere({
  position,
  court,
  index,
  total
}: {
  position: [number, number, number]
  court: Court3DSphereProps['courts'][0]
  index: number
  total: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      // Orbit animation
      const angle = (index / total) * Math.PI * 2 + state.clock.elapsedTime * 0.3
      const radius = 4
      meshRef.current.position.x = Math.cos(angle) * radius
      meshRef.current.position.z = Math.sin(angle) * radius

      // Scale on hover
      const targetScale = hovered ? 1.5 : 1
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      )
    }
  })

  const size = Math.max((court.occupancy / 100) * 0.8, 0.3)

  return (
    <group>
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={court.color}
          metalness={0.5}
          roughness={0.2}
          emissive={court.color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
        />
      </mesh>

      {hovered && (
        <Text
          position={[position[0], position[1] + size + 1, position[2]]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          {court.name}
          {'\n'}
          {court.sport}
          {'\n'}
          Ocupación: {court.occupancy.toFixed(1)}%
          {'\n'}
          Ingresos: ${court.revenue.toLocaleString()}
        </Text>
      )}
    </group>
  )
}

export function Court3DSphere({ courts }: Court3DSphereProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !courts || courts.length === 0) {
    return (
      <div className="w-full h-[600px] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:to-purple-900 rounded-xl overflow-hidden flex items-center justify-center">
        <p className="text-gray-500">Cargando visualización 3D...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-[600px] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:to-purple-900 rounded-xl overflow-hidden">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 5, 10]} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          autoRotate
          autoRotateSpeed={0.5}
        />

        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#a855f7" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
        <spotLight
          position={[0, 15, 0]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          castShadow
        />

        {/* Center sphere (hub) */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial
            color="#8b5cf6"
            metalness={0.8}
            roughness={0.2}
            emissive="#8b5cf6"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Court spheres */}
        {courts.map((court, index) => (
          <CourtSphere
            key={`sphere-${court.id}`}
            position={[0, 0, 0]}
            court={court}
            index={index}
            total={courts.length}
          />
        ))}

        {/* Particles */}
        <Stars radius={50} depth={50} count={1000} factor={2} fade speed={0.5} />

        <Environment preset="night" />
      </Canvas>
    </div>
  )
}
