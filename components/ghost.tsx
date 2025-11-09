"use client"

import { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useGameStore } from "@/lib/game-store"

interface GhostProps {
  id: string
  position: [number, number, number]
  velocity: [number, number, number]
}

const GHOST_SPEED = 3
const GHOST_FLOAT_SPEED = 1.5
const GHOST_FLOAT_AMOUNT = 0.3

export function Ghost({ id, position, velocity }: GhostProps) {
  const meshRef = useRef<THREE.Group>(null)
  const positionRef = useRef<THREE.Vector3>(new THREE.Vector3(...position))
  const velocityRef = useRef<THREE.Vector3>(new THREE.Vector3(...velocity))
  const floatOffset = useRef(Math.random() * Math.PI * 2)
  const { updateGhostPosition, playerPosition } = useGameStore()

  useFrame((state, delta) => {
    if (!meshRef.current) return

    // Get player position
    const playerPos = new THREE.Vector3(...playerPosition)
    const ghostPos = positionRef.current

    // Calculate direction to player
    const direction = new THREE.Vector3()
      .subVectors(playerPos, ghostPos)
      .normalize()

    // Move ghost towards player
    velocityRef.current.lerp(
      direction.multiplyScalar(GHOST_SPEED),
      delta * 2
    )

    // Update position
    positionRef.current.add(
      velocityRef.current.clone().multiplyScalar(delta)
    )

    // Add floating motion
    const floatY = Math.sin(state.clock.elapsedTime * GHOST_FLOAT_SPEED + floatOffset.current) * GHOST_FLOAT_AMOUNT
    
    meshRef.current.position.set(
      positionRef.current.x,
      positionRef.current.y + floatY + 0.5,
      positionRef.current.z
    )

    // Slight rotation for spooky effect
    meshRef.current.rotation.y += delta * 0.5

    // Update store
    updateGhostPosition(
      id,
      [positionRef.current.x, positionRef.current.y, positionRef.current.z],
      [velocityRef.current.x, velocityRef.current.y, velocityRef.current.z]
    )
  })

  return (
    <group ref={meshRef} position={position}>
      {/* Ghost body - semi-transparent sphere with tail */}
      <mesh castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent
          opacity={0.7}
          emissive="#8888ff"
          emissiveIntensity={0.3}
          roughness={0.3}
        />
      </mesh>
      
      {/* Ghost tail - cone shape */}
      <mesh position={[0, -0.3, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.25, 0.4, 8]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent
          opacity={0.6}
          emissive="#8888ff"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Glowing red eyes */}
      <mesh position={[-0.1, 0.05, 0.25]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000"
          emissiveIntensity={2}
        />
      </mesh>
      <mesh position={[0.1, 0.05, 0.25]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000"
          emissiveIntensity={2}
        />
      </mesh>
      
      {/* Spooky aura - outer glow */}
      <mesh>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial 
          color="#8888ff" 
          transparent
          opacity={0.1}
          emissive="#8888ff"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  )
}

// Manager component to render all ghosts
export function GhostManager() {
  const ghosts = useGameStore((state) => state.ghosts)

  return (
    <>
      {ghosts.map((ghost) => (
        <Ghost
          key={ghost.id}
          id={ghost.id}
          position={ghost.position}
          velocity={ghost.velocity}
        />
      ))}
    </>
  )
}
