'use client'

import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Text, Html, Environment } from '@react-three/drei'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Navigation, AlertTriangle, Info, Zap } from 'lucide-react'
import * as THREE from 'three'

interface Location {
  id: string
  name: string
  position: [number, number, number]
  color: string
  available: number
  total: number
  sport?: string
  price?: number
  club?: string
}

interface LocationMap3DProps {
  locations: Location[]
  onLocationClick?: (location: Location) => void
  className?: string
}

function LocationMarker({ location, onClick, isHovered }: {
  location: Location
  onClick: () => void
  isHovered: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const sphereRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      // Animación de flotación más suave
      meshRef.current.position.y = location.position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.15

      // Rotación suave del cilindro
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.3

      // Escala al hacer hover
      const targetScale = hovered || isHovered ? 1.4 : 1
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }

    if (sphereRef.current) {
      // Rotación de la esfera superior
      sphereRef.current.rotation.y += 0.01

      // Oscilación de brillo
      if (sphereRef.current.material instanceof THREE.MeshStandardMaterial) {
        const brightness = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2
        sphereRef.current.material.emissiveIntensity = hovered || isHovered ? 0.8 : brightness
      }
    }
  })

  const occupancyRate = (location.available / location.total) * 100
  const pinColor = location.color || (occupancyRate > 50 ? '#10b981' : occupancyRate > 20 ? '#f59e0b' : '#ef4444')

  return (
    <group position={location.position}>
      {/* Pin base cilindro */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        <cylinderGeometry args={[0.25, 0.15, 1.2, 16]} />
        <meshStandardMaterial
          color={pinColor}
          emissive={pinColor}
          emissiveIntensity={hovered || isHovered ? 0.6 : 0.25}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* Esfera superior con brillo */}
      <mesh
        ref={sphereRef}
        position={[0, 0.85, 0]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial
          color={pinColor}
          emissive={pinColor}
          emissiveIntensity={0.3}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>

      {/* Anillo de pulso en el suelo con animación */}
      <mesh
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.4, 0.8, 64]} />
        <meshBasicMaterial
          color={pinColor}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Aura luminosa alrededor */}
      <mesh
        position={[0, 0.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[1.5, 1.5, 0.05, 32]} />
        <meshBasicMaterial
          color={pinColor}
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Label flotante mejorado */}
      {(hovered || isHovered) && (
        <Html position={[0, 2.2, 0]} center>
          <div className="bg-gray-900/98 backdrop-blur-md text-white px-4 py-3 rounded-lg shadow-2xl border border-gray-600 min-w-[220px] pointer-events-none">
            <div className="space-y-2">
              <p className="font-bold text-sm">{location.name}</p>

              {location.sport && (
                <p className="text-xs text-gray-300">
                  <span className="text-gray-400">Deporte:</span> {location.sport}
                </p>
              )}

              {location.club && (
                <p className="text-xs text-gray-300">
                  <span className="text-gray-400">Club:</span> {location.club}
                </p>
              )}

              <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-700">
                <span className="text-gray-300">Disponibilidad:</span>
                <Badge
                  variant="secondary"
                  className="ml-2 bg-white/10 text-white border-white/20"
                >
                  {location.available}/{location.total}
                </Badge>
              </div>

              {location.price !== undefined && (
                <p className="text-xs text-gray-300">
                  <span className="text-gray-400">Precio:</span> ${location.price}/hora
                </p>
              )}

              <p className="text-xs text-gray-400 pt-1">Click para ver detalles →</p>
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

function Grid3D() {
  return (
    <group>
      {/* Grilla */}
      <gridHelper args={[50, 50, '#1f2937', '#0f172a']} position={[0, 0, 0]} />

      {/* Plano base con gradiente visual */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Paredes invisibles para contener la vista */}
      <mesh position={[30, 15, 0]} receiveShadow>
        <boxGeometry args={[0.1, 30, 60]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={0} />
      </mesh>
      <mesh position={[-30, 15, 0]} receiveShadow>
        <boxGeometry args={[0.1, 30, 60]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={0} />
      </mesh>
      <mesh position={[0, 15, 30]} receiveShadow>
        <boxGeometry args={[60, 30, 0.1]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={0} />
      </mesh>
      <mesh position={[0, 15, -30]} receiveShadow>
        <boxGeometry args={[60, 30, 0.1]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={0} />
      </mesh>
    </group>
  )
}

function Scene({ locations, onLocationClick }: {
  locations: Location[]
  onLocationClick?: (location: Location) => void
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <>
      <PerspectiveCamera makeDefault position={[20, 15, 20]} fov={55} />
      <OrbitControls
        enablePan={true}
        minDistance={15}
        maxDistance={50}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.1}
        enableDamping
        dampingFactor={0.04}
        autoRotate={false}
      />

      {/* Sistema de iluminación profesional */}
      <ambientLight intensity={0.5} color="#ffffff" />

      {/* Luz directa principal */}
      <directionalLight
        position={[20, 30, 20]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />

      {/* Luces ambientales de relleno */}
      <pointLight position={[0, 15, 0]} intensity={0.6} color="#60a5fa" />
      <pointLight position={[25, 8, 25]} intensity={0.4} color="#34d399" />
      <pointLight position={[-25, 8, -25]} intensity={0.3} color="#f472b6" />

      {/* Luz de fondo suave */}
      <directionalLight position={[-20, 20, -20]} intensity={0.4} color="#93c5fd" />

      {/* Grilla */}
      <Grid3D />

      {/* Marcadores de ubicación */}
      {locations.map((location) => (
        <LocationMarker
          key={location.id}
          location={location}
          onClick={() => onLocationClick?.(location)}
          isHovered={hoveredId === location.id}
        />
      ))}

      {/* Texto de título en 3D */}
      {locations.length > 0 && (
        <Text
          position={[0, 8, -25]}
          fontSize={1.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.08}
          outlineColor="#000000"
        >
          {locations.length} Canchas Disponibles
        </Text>
      )}
    </>
  )
}

export function LocationMap3D({ locations, onLocationClick, className = '' }: LocationMap3DProps) {
  const [hasError, setHasError] = useState(false)
  const [isWebGLSupported, setIsWebGLSupported] = useState(true)

  useEffect(() => {
    // Check WebGL support
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) {
        setIsWebGLSupported(false)
      }
    } catch (e) {
      setIsWebGLSupported(false)
    }

    // Handle WebGL context loss
    const handleContextLost = (event: Event) => {
      event.preventDefault()
      console.warn('WebGL context lost. 3D map disabled.')
      setHasError(true)
    }

    window.addEventListener('webglcontextlost', handleContextLost)
    return () => {
      window.removeEventListener('webglcontextlost', handleContextLost)
    }
  }, [])

  if (!isWebGLSupported || hasError) {
    return (
      <Card className={`overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 border-gray-700 ${className}`}>
        <div className="relative h-[500px] md:h-[600px] flex items-center justify-center">
          <div className="text-center p-8">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-white font-semibold text-lg mb-2">
              Mapa 3D no disponible
            </h3>
            <p className="text-white/60 text-sm max-w-md">
              {!isWebGLSupported
                ? 'Tu navegador no soporta WebGL o está deshabilitado. Por favor, usa la vista de lista o mapa 2D.'
                : 'Hubo un problema al cargar el mapa 3D. Por favor, recarga la página o usa la vista de lista.'}
            </p>
          </div>
        </div>
      </Card>
    )
  }

  // Calcular estadísticas (solo si WebGL está soportado)
  const totalAvailable = locations.reduce((sum, loc) => sum + loc.available, 0)
  const totalCapacity = locations.reduce((sum, loc) => sum + loc.total, 0)
  const occupancyRate = totalCapacity > 0 ? Math.round((totalAvailable / totalCapacity) * 100) : 0

  return (
    <Card className={`overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 border-gray-700 ${className}`}>
      <div className="relative">
        {/* Header mejorado con estadísticas */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500/30 to-purple-500/30 p-2 rounded-lg">
                <Navigation className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Mapa 3D de Canchas</h3>
                <p className="text-white/60 text-xs">{locations.length} ubicaciones detectadas</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                <Zap className="h-3 w-3 mr-1" />
                En Vivo
              </Badge>
            </div>
          </div>

          {/* Mini estadísticas */}
          {locations.length > 0 && (
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-white/10">
                <p className="text-white/60">Disponibles</p>
                <p className="text-white font-semibold">{totalAvailable}/{totalCapacity}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-white/10">
                <p className="text-white/60">Ocupación</p>
                <p className="text-white font-semibold">{occupancyRate}%</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-white/10">
                <p className="text-white/60">Canchas</p>
                <p className="text-white font-semibold">{locations.length}</p>
              </div>
            </div>
          )}
        </div>

        {/* Canvas 3D */}
        <div className="w-full h-[500px] md:h-[600px] lg:h-[700px]">
          <Canvas
            shadows
            dpr={[1, 2]}
            onCreated={({ gl }) => {
              gl.domElement.addEventListener('webglcontextlost', (e) => {
                e.preventDefault()
                setHasError(true)
              })
            }}
          >
            <Suspense fallback={null}>
              <Scene locations={locations} onLocationClick={onLocationClick} />
            </Suspense>
          </Canvas>
        </div>

        {/* Leyenda mejorada */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
          <div className="grid grid-cols-3 gap-4 text-white/80 text-xs mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>Alta disponibilidad (&gt;50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
              <span>Media (20-50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span>Baja (&lt;20%)</span>
            </div>
          </div>
          <p className="text-white/50 text-xs text-center font-medium">
            🖱️ Arrastra para rotar  •  🔍 Scroll para zoom  •  📌 Hover para detalles  •  Click para ir
          </p>
        </div>
      </div>
    </Card>
  )
}

export default LocationMap3D
