"use client"

import { useRef } from "react"
import * as THREE from "three"
import { useGameStore } from "@/lib/game-store"

interface DebrisProps {
  id: string
  position: [number, number, number]
  type: "ash" | "skull"
}

export function Debris({ id, position, type }: DebrisProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  if (type === "ash") {
    return (
      <mesh ref={meshRef} position={position}>
        <cylinderGeometry args={[0.4, 0.4, 0.05, 16]} />
        <meshStandardMaterial 
          color="#2a2a2a" 
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
    )
  }

  // Skull
  return (
    <group position={position}>
      {/* Main skull - sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial 
          color="#e8e8e8" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Eye sockets - dark holes */}
      <mesh position={[-0.06, 0.03, 0.12]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.06, 0.03, 0.12]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Nose hole */}
      <mesh position={[0, -0.02, 0.13]}>
        <coneGeometry args={[0.02, 0.04, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Jaw - lower part */}
      <mesh position={[0, -0.08, 0.05]}>
        <boxGeometry args={[0.12, 0.05, 0.08]} />
        <meshStandardMaterial 
          color="#e8e8e8" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
    </group>
  )
}

// Manager component to render all debris
export function DebrisManager() {
  const debris = useGameStore((state) => state.debris)

  return (
    <>
      {debris.map((item) => (
        <Debris
          key={item.id}
          id={item.id}
          position={item.position}
          type={item.type}
        />
      ))}
    </>
  )
}
