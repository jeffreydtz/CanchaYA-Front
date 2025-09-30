'use client'

import { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Text, Html } from '@react-three/drei'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Navigation } from 'lucide-react'
import * as THREE from 'three'

interface Location {
  id: string
  name: string
  position: [number, number, number]
  color: string
  available: number
  total: number
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
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      // Animación de flotación
      meshRef.current.position.y = location.position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1
      
      // Rotación suave
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
      
      // Escala al hacer hover
      const targetScale = hovered || isHovered ? 1.3 : 1
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }
  })

  const occupancyRate = (location.available / location.total) * 100
  const pinColor = occupancyRate > 50 ? '#10b981' : occupancyRate > 20 ? '#f59e0b' : '#ef4444'

  return (
    <group position={location.position}>
      {/* Pin base */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[0.3, 0.1, 1.5, 8]} />
        <meshStandardMaterial 
          color={pinColor} 
          emissive={pinColor}
          emissiveIntensity={hovered || isHovered ? 0.5 : 0.2}
        />
      </mesh>
      
      {/* Esfera superior */}
      <mesh 
        position={[0, 0.9, 0]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial 
          color={pinColor}
          emissive={pinColor}
          emissiveIntensity={hovered || isHovered ? 0.6 : 0.3}
        />
      </mesh>
      
      {/* Círculo de pulso en el suelo */}
      <mesh 
        position={[0, 0.01, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.5, 0.7, 32]} />
        <meshBasicMaterial 
          color={pinColor} 
          transparent 
          opacity={hovered || isHovered ? 0.5 : 0.2} 
        />
      </mesh>
      
      {/* Label flotante */}
      {(hovered || isHovered) && (
        <Html position={[0, 2, 0]} center>
          <div className="bg-gray-900/95 backdrop-blur-sm text-white px-3 py-2 rounded-lg shadow-xl border border-gray-700 min-w-[150px]">
            <p className="font-semibold text-sm mb-1">{location.name}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300">Disponibles:</span>
              <Badge variant="secondary" className="ml-2 bg-white/10">
                {location.available}/{location.total}
              </Badge>
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
      <gridHelper args={[40, 40, '#444444', '#222222']} position={[0, 0, 0]} />
      
      {/* Plano base */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          color="#0a0a0a" 
          roughness={0.8}
          metalness={0.2}
        />
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
      <PerspectiveCamera makeDefault position={[15, 12, 15]} fov={60} />
      <OrbitControls 
        enablePan={true}
        minDistance={10}
        maxDistance={40}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        enableDamping
        dampingFactor={0.05}
      />
      
      {/* Luces */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1} 
        castShadow
      />
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#4a90e2" />
      <pointLight position={[10, 5, 10]} intensity={0.3} color="#e24a90" />
      
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
      <Text
        position={[0, 5, -15]}
        fontSize={1.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.1}
        outlineColor="#000000"
      >
        Ubicaciones de Canchas
      </Text>
    </>
  )
}

export function LocationMap3D({ locations, onLocationClick, className = '' }: LocationMap3DProps) {
  return (
    <Card className={`overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 border-gray-700 ${className}`}>
      <div className="relative">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg">
                <Navigation className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Mapa 3D de Ubicaciones</h3>
                <p className="text-white/60 text-sm">{locations.length} ubicaciones disponibles</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
              Interactivo
            </Badge>
          </div>
        </div>

        {/* Canvas 3D */}
        <div className="w-full h-[500px] md:h-[600px]">
          <Canvas shadows>
            <Suspense fallback={null}>
              <Scene locations={locations} onLocationClick={onLocationClick} />
            </Suspense>
          </Canvas>
        </div>

        {/* Leyenda */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex items-center justify-center gap-6 text-white/80 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Alta disponibilidad</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Media disponibilidad</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Baja disponibilidad</span>
            </div>
          </div>
          <p className="text-white/60 text-xs text-center mt-2">
            🖱️ Arrastra para rotar • Click en los marcadores para más detalles
          </p>
        </div>
      </div>
    </Card>
  )
}

export default LocationMap3D
