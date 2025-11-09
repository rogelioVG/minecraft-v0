"use client"

import { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useGameStore } from "@/lib/game-store"

interface GhostProps {
  id: string
  position: [number, number, number]
}

export function Ghost({ id, position }: GhostProps) {
  const groupRef = useRef<THREE.Group>(null)
  const floatOffset = useRef(Math.random() * Math.PI * 2)

  useFrame((state) => {
    if (groupRef.current) {
      // Floating animation
      const time = state.clock.getElapsedTime()
      groupRef.current.position.y = position[1] + Math.sin(time * 2 + floatOffset.current) * 0.1
      
      // Slight rotation for spooky effect
      groupRef.current.rotation.y = Math.sin(time + floatOffset.current) * 0.3
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Ghost body - semi-transparent sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial 
          color="#88ff88" 
          transparent
          opacity={0.6}
          emissive="#44ff44"
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>

      {/* Ghostly trail/tail */}
      <mesh position={[0, -0.2, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.2, 0.4, 8]} />
        <meshStandardMaterial 
          color="#88ff88" 
          transparent
          opacity={0.4}
          emissive="#44ff44"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Glowing eyes - evil red */}
      <mesh position={[-0.08, 0.05, 0.2]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial 
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={2}
        />
      </mesh>
      <mesh position={[0.08, 0.05, 0.2]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial 
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={2}
        />
      </mesh>

      {/* Ghostly aura - point light */}
      <pointLight 
        color="#44ff44" 
        intensity={1} 
        distance={3}
        decay={2}
      />
    </group>
  )
}

// Manager component to render all ghosts
export function GhostManager() {
  const ghosts = useGameStore((state) => state.ghosts)
  const updateGhosts = useGameStore((state) => state.updateGhosts)
  const convertSkullsToGhosts = useGameStore((state) => state.convertSkullsToGhosts)

  useFrame((state, delta) => {
    // Check for skulls ready to convert
    convertSkullsToGhosts()
    
    // Update ghost positions to chase player
    updateGhosts(delta)
  })

  return (
    <>
      {ghosts.map((ghost) => (
        <Ghost
          key={ghost.id}
          id={ghost.id}
          position={ghost.position}
        />
      ))}
    </>
  )
}
