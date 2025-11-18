'use client'

import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei'
import { SoccerCourt, TennisCourt, PadelCourt, BasketballCourt, VolleyballCourt } from './CourtModels'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RotateCw, Maximize2, Minimize2 } from 'lucide-react'

interface Court3DViewerProps {
  sport: string
  className?: string
}

function CourtSelector({ sport }: { sport: string }) {
  const normalizedSport = sport.toLowerCase()
  
  if (normalizedSport.includes('fútbol') || normalizedSport.includes('futbol') || normalizedSport.includes('soccer')) {
    return <SoccerCourt />
  } else if (normalizedSport.includes('tenis') || normalizedSport.includes('tennis')) {
    return <TennisCourt />
  } else if (normalizedSport.includes('pádel') || normalizedSport.includes('padel')) {
    return <PadelCourt />
  } else if (normalizedSport.includes('básquet') || normalizedSport.includes('basquet') || normalizedSport.includes('basketball')) {
    return <BasketballCourt />
  } else if (normalizedSport.includes('vóley') || normalizedSport.includes('voley') || normalizedSport.includes('volleyball')) {
    return <VolleyballCourt />
  }
  
  // Default: Fútbol
  return <SoccerCourt />
}

function Scene({ sport }: { sport: string }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[25, 15, 25]} fov={50} />
      <OrbitControls 
        enablePan={false}
        minDistance={15}
        maxDistance={50}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
        enableDamping
        dampingFactor={0.05}
      />
      
      {/* Luces */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1.2} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-10, 10, -10]} intensity={0.5} />
      <pointLight position={[0, 10, 0]} intensity={0.5} />
      
      {/* Ambiente */}
      <Environment preset="city" />
      
      {/* Cancha según deporte */}
      <CourtSelector sport={sport} />
      
      {/* Sombras */}
      <ContactShadows 
        position={[0, 0, 0]} 
        opacity={0.4} 
        scale={50} 
        blur={2} 
        far={10} 
      />
      
      {/* Piso base */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[100, 0.1, 100]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </>
  )
}

function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        <p className="text-white text-sm">Cargando vista 3D...</p>
      </div>
    </div>
  )
}

export function Court3DViewer({ sport, className = '' }: Court3DViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [autoRotate, setAutoRotate] = useState(false)
  const [contextLost, setContextLost] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && canvasRef.current) {
      canvasRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else if (document.fullscreenElement) {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const getSportName = () => {
    const normalized = sport.toLowerCase()
    if (normalized.includes('fútbol') || normalized.includes('futbol')) return 'Fútbol'
    if (normalized.includes('tenis')) return 'Tenis'
    if (normalized.includes('pádel') || normalized.includes('padel')) return 'Pádel'
    if (normalized.includes('básquet') || normalized.includes('basquet')) return 'Básquetbol'
    if (normalized.includes('vóley') || normalized.includes('voley')) return 'Vóley'
    return sport
  }


  return (
    <Card className={`overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 ${className}`}>
      <div className="relative" ref={canvasRef}>
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                Vista 3D
              </Badge>
              <h3 className="text-white font-semibold text-lg">{getSportName()}</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/10 hover:bg-white/20 text-white"
                onClick={() => setAutoRotate(!autoRotate)}
                title={autoRotate ? 'Detener rotación' : 'Auto rotar'}
              >
                <RotateCw className={`h-4 w-4 ${autoRotate ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/10 hover:bg-white/20 text-white"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas 3D */}
        <div className="w-full h-[400px] md:h-[500px]">
          {!contextLost ? (
            <Canvas
              shadows
              dpr={[1, 1.5]}
              gl={{
                antialias: true,
                alpha: true,
                preserveDrawingBuffer: false,
                failIfMajorPerformanceCaveat: false
              }}
              onCreated={(state) => {
                state.gl.info.autoReset = true
                state.gl.domElement.addEventListener('webglcontextlost', (e: Event) => {
                  e.preventDefault()
                  setContextLost(true)
                  console.warn('WebGL context lost in Court3DViewer')
                })
              }}
            >
              <Suspense fallback={null}>
                <Scene sport={sport} />
              </Suspense>
            </Canvas>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
              <div className="text-center space-y-4">
                <p className="text-white text-sm">Contexto 3D perdido</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors text-sm"
                >
                  Recargar página
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer con instrucciones */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/60 to-transparent">
          <p className="text-white/80 text-xs text-center">
            🖱️ Arrastra para rotar • 🔍 Scroll para zoom • ✨ Modelo 3D interactivo
          </p>
        </div>
      </div>
    </Card>
  )
}

export default Court3DViewer
