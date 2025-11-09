"use client"

import { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useGameStore } from "@/lib/game-store"

interface HolyWaterProps {
  id: string
  position: [number, number, number]
  velocity: [number, number, number]
  timestamp: number
}

const GRAVITY = -20
const LIFETIME = 5000 // 5 seconds

export function HolyWater({ id, position, velocity, timestamp }: HolyWaterProps) {
  const meshRef = useRef<THREE.Group>(null)
  const positionRef = useRef<THREE.Vector3>(new THREE.Vector3(...position))
  const velocityRef = useRef<THREE.Vector3>(new THREE.Vector3(...velocity))
  const { removeHolyWater, ghosts, removeGhost } = useGameStore()

  useEffect(() => {
    // Remove after lifetime
    const timer = setTimeout(() => {
      removeHolyWater(id)
    }, LIFETIME)

    return () => clearTimeout(timer)
  }, [id, removeHolyWater])

  useFrame((state, delta) => {
    if (!meshRef.current) return

    // Apply gravity
    velocityRef.current.y += GRAVITY * delta

    // Update position
    positionRef.current.add(
      velocityRef.current.clone().multiplyScalar(delta)
    )

    // Remove if below ground
    if (positionRef.current.y < 0) {
      removeHolyWater(id)
      return
    }

    meshRef.current.position.copy(positionRef.current)
    meshRef.current.rotation.x += delta * 10
    meshRef.current.rotation.y += delta * 5

    // Check collision with ghosts
    ghosts.forEach((ghost) => {
      const ghostPos = new THREE.Vector3(...ghost.position)
      const distance = positionRef.current.distanceTo(ghostPos)
      
      // Collision radius
      if (distance < 0.5) {
        // Destroy ghost and holy water
        removeGhost(ghost.id)
        removeHolyWater(id)
      }
    })
  })

  return (
    <group ref={meshRef} position={position}>
      {/* Holy water bottle */}
      <mesh castShadow>
        <cylinderGeometry args={[0.08, 0.06, 0.2, 8]} />
        <meshStandardMaterial 
          color="#4444ff" 
          transparent
          opacity={0.8}
          emissive="#88ccff"
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>
      
      {/* Cork/cap */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.04, 8]} />
        <meshStandardMaterial 
          color="#8b4513" 
          roughness={0.9}
        />
      </mesh>
      
      {/* Glow effect */}
      <pointLight
        position={[0, 0, 0]}
        color="#88ccff"
        intensity={0.5}
        distance={1}
      />
    </group>
  )
}

// Manager component to render all holy water projectiles
export function HolyWaterManager() {
  const holyWaters = useGameStore((state) => state.holyWaters)

  return (
    <>
      {holyWaters.map((hw) => (
        <HolyWater
          key={hw.id}
          id={hw.id}
          position={hw.position}
          velocity={hw.velocity}
          timestamp={hw.timestamp}
        />
      ))}
    </>
  )
}
