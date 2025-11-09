"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useGameStore } from "@/lib/game-store"

interface HolyWaterProps {
  id: string
  position: [number, number, number]
}

export function HolyWater({ id, position }: HolyWaterProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const trailRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      // Rotate the bottle for visual effect
      meshRef.current.rotation.x += 0.2
      meshRef.current.rotation.y += 0.1
    }
    
    if (trailRef.current) {
      // Pulse the trail
      const scale = 1 + Math.sin(state.clock.getElapsedTime() * 10) * 0.2
      trailRef.current.scale.set(scale, scale, scale)
    }
  })

  return (
    <group position={position}>
      {/* Holy water bottle - blue glowing sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial 
          color="#4444ff"
          emissive="#6666ff"
          emissiveIntensity={1}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Glowing trail */}
      <mesh ref={trailRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial 
          color="#8888ff"
          transparent
          opacity={0.3}
          emissive="#6666ff"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Light source */}
      <pointLight 
        color="#6666ff" 
        intensity={0.5} 
        distance={2}
      />
    </group>
  )
}

// Manager component to render all holy water projectiles
export function HolyWaterManager() {
  const holyWater = useGameStore((state) => state.holyWater)
  const updateHolyWater = useGameStore((state) => state.updateHolyWater)

  useFrame((state, delta) => {
    // Update holy water physics and collisions
    updateHolyWater(delta)
  })

  return (
    <>
      {holyWater.map((water) => (
        <HolyWater
          key={water.id}
          id={water.id}
          position={water.position}
        />
      ))}
    </>
  )
}
