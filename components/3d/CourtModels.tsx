'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

// Cancha de Fútbol 5/7
export function SoccerCourt() {
  return (
    <group>
      {/* Césped principal con textura */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[20, 0.3, 12]} />
        <meshStandardMaterial 
          color="#1a5d1a" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Patrón de césped (rayas) */}
      {[-8, -4, 0, 4, 8].map((x, i) => (
        <mesh key={i} position={[x, 0.16, 0]} receiveShadow>
          <boxGeometry args={[3.8, 0.01, 12]} />
          <meshStandardMaterial 
            color={i % 2 === 0 ? "#1e6b1e" : "#1a5d1a"} 
            roughness={0.9}
          />
        </mesh>
      ))}
      
      {/* Líneas blancas del campo - Perimetro */}
      <mesh position={[0, 0.17, -6]} receiveShadow>
        <boxGeometry args={[20.2, 0.02, 0.12]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.17, 6]} receiveShadow>
        <boxGeometry args={[20.2, 0.02, 0.12]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[-10, 0.17, 0]} rotation={[0, 0, Math.PI / 2]} receiveShadow>
        <boxGeometry args={[12.2, 0.02, 0.12]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[10, 0.17, 0]} rotation={[0, 0, Math.PI / 2]} receiveShadow>
        <boxGeometry args={[12.2, 0.02, 0.12]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
      </mesh>
      
      {/* Línea central */}
      <mesh position={[0, 0.17, 0]} rotation={[0, 0, Math.PI / 2]} receiveShadow>
        <boxGeometry args={[12.2, 0.02, 0.12]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
      </mesh>
      
      {/* Círculo central */}
      <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[2, 2.12, 64]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
      </mesh>
      {/* Punto central (solo marca en el suelo, sin poste) */}
      <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.15, 32]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
      </mesh>
      
      {/* Áreas chicas */}
      <mesh position={[-8.5, 0.17, 0]} receiveShadow>
        <boxGeometry args={[3, 0.02, 5.5]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} transparent opacity={0.3} wireframe />
      </mesh>
      <mesh position={[8.5, 0.17, 0]} receiveShadow>
        <boxGeometry args={[3, 0.02, 5.5]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} transparent opacity={0.3} wireframe />
      </mesh>
      
      {/* Arcos profesionales */}
      {/* Arco izquierdo */}
      <group position={[-10.2, 0, 0]}>
        {/* Poste izquierdo */}
        <mesh position={[0, 1.1, -2.2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.06, 0.06, 2.2, 16]} />
          <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Poste derecho */}
        <mesh position={[0, 1.1, 2.2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.06, 0.06, 2.2, 16]} />
          <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Travesaño horizontal */}
        <mesh position={[0, 2.2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.06, 0.06, 4.4, 16]} />
          <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Red lateral */}
        <mesh position={[0.4, 1.1, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[4.4, 2.2]} />
          <meshStandardMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.3} 
            wireframe 
            side={2}
          />
        </mesh>
        {/* Red superior */}
        <mesh position={[0.2, 2.2, 0]} rotation={[-Math.PI / 4, 0, 0]}>
          <planeGeometry args={[0.6, 4.4]} />
          <meshStandardMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.25} 
            wireframe 
            side={2}
          />
        </mesh>
        {/* Red trasera */}
        <mesh position={[0.6, 1.1, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[4.4, 2.2]} />
          <meshStandardMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.25} 
            wireframe 
            side={2}
          />
        </mesh>
      </group>
      
      {/* Arco derecho */}
      <group position={[10.2, 0, 0]}>
        {/* Poste izquierdo */}
        <mesh position={[0, 1.1, -2.2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.06, 0.06, 2.2, 16]} />
          <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Poste derecho */}
        <mesh position={[0, 1.1, 2.2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.06, 0.06, 2.2, 16]} />
          <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Travesaño horizontal */}
        <mesh position={[0, 2.2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.06, 0.06, 4.4, 16]} />
          <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Red lateral */}
        <mesh position={[-0.4, 1.1, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[4.4, 2.2]} />
          <meshStandardMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.3} 
            wireframe 
            side={2}
          />
        </mesh>
        {/* Red superior */}
        <mesh position={[-0.2, 2.2, 0]} rotation={[-Math.PI / 4, 0, 0]}>
          <planeGeometry args={[0.6, 4.4]} />
          <meshStandardMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.25} 
            wireframe 
            side={2}
          />
        </mesh>
        {/* Red trasera */}
        <mesh position={[-0.6, 1.1, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[4.4, 2.2]} />
          <meshStandardMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.25} 
            wireframe 
            side={2}
          />
        </mesh>
      </group>

      {/* Gradas - Lado largo izquierdo */}
      {[...Array(5)].map((_, i) => (
        <mesh key={`grada-izq-${i}`} position={[-11 - i * 0.8, 0.3 + i * 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.7, 0.3, 13]} />
          <meshStandardMaterial 
            color={i % 2 === 0 ? "#2a3f5f" : "#1e2f4f"} 
            roughness={0.7}
          />
        </mesh>
      ))}

      {/* Gradas - Lado largo derecho */}
      {[...Array(5)].map((_, i) => (
        <mesh key={`grada-der-${i}`} position={[11 + i * 0.8, 0.3 + i * 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.7, 0.3, 13]} />
          <meshStandardMaterial 
            color={i % 2 === 0 ? "#2a3f5f" : "#1e2f4f"} 
            roughness={0.7}
          />
        </mesh>
      ))}

      {/* Gradas - Lado corto fondo */}
      {[...Array(3)].map((_, i) => (
        <mesh key={`grada-fondo-${i}`} position={[0, 0.3 + i * 0.4, 6.5 + i * 0.8]} castShadow receiveShadow>
          <boxGeometry args={[20, 0.3, 0.7]} />
          <meshStandardMaterial 
            color={i % 2 === 0 ? "#2a3f5f" : "#1e2f4f"} 
            roughness={0.7}
          />
        </mesh>
      ))}

      {/* Gradas - Lado corto adelante */}
      {[...Array(3)].map((_, i) => (
        <mesh key={`grada-adelante-${i}`} position={[0, 0.3 + i * 0.4, -6.5 - i * 0.8]} castShadow receiveShadow>
          <boxGeometry args={[20, 0.3, 0.7]} />
          <meshStandardMaterial 
            color={i % 2 === 0 ? "#2a3f5f" : "#1e2f4f"} 
            roughness={0.7}
          />
        </mesh>
      ))}

      {/* Torres de iluminación */}
      {[
        [-12, 8, -7],
        [-12, 8, 7],
        [12, 8, -7],
        [12, 8, 7]
      ].map((pos, i) => (
        <group key={`luz-${i}`}>
          {/* Poste */}
          <mesh position={[pos[0], pos[1] / 2, pos[2]]} castShadow>
            <cylinderGeometry args={[0.15, 0.2, pos[1], 8]} />
            <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Luz */}
          <mesh position={[pos[0], pos[1], pos[2]]} rotation={[Math.PI / 4, 0, 0]}>
            <boxGeometry args={[0.6, 0.3, 0.6]} />
            <meshStandardMaterial 
              color="#ffeb3b" 
              emissive="#ffeb3b" 
              emissiveIntensity={0.8}
            />
          </mesh>
          <pointLight 
            position={[pos[0], pos[1], pos[2]]} 
            intensity={0.5} 
            distance={20} 
            color="#ffffff"
            castShadow
          />
        </group>
      ))}

      {/* Marcador electrónico */}
      <group position={[0, 4, 8.5]}>
        <mesh castShadow>
          <boxGeometry args={[4, 1.5, 0.3]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            emissive="#0066ff" 
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>
    </group>
  )
}

// Cancha de Tenis
export function TennisCourt() {
  return (
    <group>
      {/* Superficie - tierra batida */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[23.77, 0.2, 10.97]} />
        <meshStandardMaterial color="#d17050" />
      </mesh>
      
      {/* Líneas blancas */}
      {/* Líneas laterales */}
      <mesh position={[0, 0.11, -5.485]}>
        <boxGeometry args={[23.77, 0.02, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.11, 5.485]}>
        <boxGeometry args={[23.77, 0.02, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Líneas de fondo */}
      <mesh position={[-11.885, 0.11, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[10.97, 0.02, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[11.885, 0.11, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[10.97, 0.02, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Línea central */}
      <mesh position={[0, 0.11, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[10.97, 0.02, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Líneas de servicio */}
      <mesh position={[-6.4, 0.11, 0]}>
        <boxGeometry args={[8.23, 0.02, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[6.4, 0.11, 0]}>
        <boxGeometry args={[8.23, 0.02, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Red */}
      <group position={[0, 0.5, 0]}>
        <mesh position={[0, 0, -5.485]}>
          <cylinderGeometry args={[0.05, 0.05, 1.07]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        <mesh position={[0, 0, 5.485]}>
          <cylinderGeometry args={[0.05, 0.05, 1.07]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 10.97]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        {/* Malla de la red */}
        <mesh position={[0, 0.4, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[10.97, 1]} />
          <meshStandardMaterial color="#1a1a1a" transparent opacity={0.4} wireframe />
        </mesh>
      </group>
    </group>
  )
}

// Cancha de Pádel
export function PadelCourt() {
  return (
    <group>
      {/* Superficie - césped sintético azul */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[20, 0.2, 10]} />
        <meshStandardMaterial color="#1e5f8c" />
      </mesh>
      
      {/* Líneas blancas */}
      <mesh position={[0, 0.11, -5]}>
        <boxGeometry args={[20, 0.02, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.11, 5]}>
        <boxGeometry args={[20, 0.02, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-10, 0.11, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[10, 0.02, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[10, 0.11, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[10, 0.02, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.11, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[10, 0.02, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Paredes de cristal */}
      {/* Paredes laterales */}
      <mesh position={[0, 2, -5]} receiveShadow castShadow>
        <boxGeometry args={[20, 4, 0.1]} />
        <meshPhysicalMaterial 
          color="#88ccff" 
          transparent 
          opacity={0.3} 
          transmission={0.9}
          thickness={0.5}
          roughness={0.05}
        />
      </mesh>
      <mesh position={[0, 2, 5]} receiveShadow castShadow>
        <boxGeometry args={[20, 4, 0.1]} />
        <meshPhysicalMaterial 
          color="#88ccff" 
          transparent 
          opacity={0.3} 
          transmission={0.9}
          thickness={0.5}
          roughness={0.05}
        />
      </mesh>
      
      {/* Paredes de fondo (parciales) */}
      <mesh position={[-10, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[10, 4, 0.1]} />
        <meshPhysicalMaterial 
          color="#88ccff" 
          transparent 
          opacity={0.3} 
          transmission={0.9}
          thickness={0.5}
          roughness={0.05}
        />
      </mesh>
      <mesh position={[10, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[10, 4, 0.1]} />
        <meshPhysicalMaterial 
          color="#88ccff" 
          transparent 
          opacity={0.3} 
          transmission={0.9}
          thickness={0.5}
          roughness={0.05}
        />
      </mesh>
      
      {/* Red central */}
      <group position={[0, 0.5, 0]}>
        <mesh position={[0, 0, -5]}>
          <cylinderGeometry args={[0.05, 0.05, 0.88]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        <mesh position={[0, 0, 5]}>
          <cylinderGeometry args={[0.05, 0.05, 0.88]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        <mesh position={[0, 0.44, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 10]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        <mesh position={[0, 0.3, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[10, 0.88]} />
          <meshStandardMaterial color="#1a1a1a" transparent opacity={0.4} wireframe />
        </mesh>
      </group>
    </group>
  )
}

// Cancha de Básquetbol
export function BasketballCourt() {
  return (
    <group>
      {/* Superficie - madera */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[28, 0.2, 15]} />
        <meshStandardMaterial color="#c19a6b" />
      </mesh>
      
      {/* Líneas del campo */}
      {/* Perímetro */}
      <mesh position={[0, 0.11, -7.5]}>
        <boxGeometry args={[28, 0.02, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.11, 7.5]}>
        <boxGeometry args={[28, 0.02, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-14, 0.11, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[15, 0.02, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[14, 0.11, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[15, 0.02, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Línea central */}
      <mesh position={[0, 0.11, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[15, 0.02, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Círculo central */}
      <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.8, 1.85, 32]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Áreas de 3 puntos (simplificadas) */}
      <mesh position={[-11, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6.7, 6.75, 32, 1, 0, Math.PI]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[11, 0.11, 0]} rotation={[-Math.PI / 2, 0, Math.PI]}>
        <ringGeometry args={[6.7, 6.75, 32, 1, 0, Math.PI]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Aros */}
      {/* Aro izquierdo */}
      <group position={[-13, 3.05, 0]}>
        {/* Tablero */}
        <mesh position={[0.5, 0, 0]}>
          <boxGeometry args={[0.1, 1.05, 1.8]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>
        {/* Aro */}
        <mesh position={[1, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.225, 0.02, 16, 32]} />
          <meshStandardMaterial color="#ff6600" />
        </mesh>
        {/* Red */}
        <mesh position={[1, -0.8, 0]}>
          <coneGeometry args={[0.225, 0.4, 32, 1, true]} />
          <meshStandardMaterial color="#ff0000" wireframe transparent opacity={0.6} />
        </mesh>
      </group>
      
      {/* Aro derecho */}
      <group position={[13, 3.05, 0]}>
        {/* Tablero */}
        <mesh position={[-0.5, 0, 0]}>
          <boxGeometry args={[0.1, 1.05, 1.8]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>
        {/* Aro */}
        <mesh position={[-1, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.225, 0.02, 16, 32]} />
          <meshStandardMaterial color="#ff6600" />
        </mesh>
        {/* Red */}
        <mesh position={[-1, -0.8, 0]}>
          <coneGeometry args={[0.225, 0.4, 32, 1, true]} />
          <meshStandardMaterial color="#ff0000" wireframe transparent opacity={0.6} />
        </mesh>
      </group>
    </group>
  )
}

// Cancha de Vóley
export function VolleyballCourt() {
  return (
    <group>
      {/* Superficie - arena/cancha sintética */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[18, 0.2, 9]} />
        <meshStandardMaterial color="#e8d4a0" />
      </mesh>
      
      {/* Líneas blancas */}
      <mesh position={[0, 0.11, -4.5]}>
        <boxGeometry args={[18, 0.02, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.11, 4.5]}>
        <boxGeometry args={[18, 0.02, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-9, 0.11, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[9, 0.02, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[9, 0.11, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[9, 0.02, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Línea central */}
      <mesh position={[0, 0.11, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[9, 0.02, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Líneas de ataque */}
      <mesh position={[0, 0.11, -3]}>
        <boxGeometry args={[9, 0.02, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.11, 3]}>
        <boxGeometry args={[9, 0.02, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Red */}
      <group position={[0, 1.2, 0]}>
        <mesh position={[0, 0, -4.5]}>
          <cylinderGeometry args={[0.05, 0.05, 2.43]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        <mesh position={[0, 0, 4.5]}>
          <cylinderGeometry args={[0.05, 0.05, 2.43]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        <mesh position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 9]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        <mesh position={[0, 0.6, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[9, 1]} />
          <meshStandardMaterial color="#1a1a1a" transparent opacity={0.5} wireframe />
        </mesh>
      </group>
    </group>
  )
}
