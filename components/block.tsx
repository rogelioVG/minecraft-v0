"use client"

import { useRef, useState, useEffect } from "react"
import { RigidBody } from "@react-three/rapier"
import { useGameStore, type BlockType } from "@/lib/game-store"
import type * as THREE from "three"
import { useFrame } from "@react-three/fiber"
import { Vector3 } from "three"

interface BlockProps {
  id: string
  position: [number, number, number]
  type: BlockType
}

const BLOCK_COLORS: Record<BlockType, string> = {
  grass: "#7cb342",
  dirt: "#8d6e63",
  stone: "#757575",
  wood: "#a1887f",
  sand: "#fdd835",
}

const BLOCK_TEXTURES: Record<BlockType, { top?: string; side: string; bottom?: string }> = {
  grass: { top: "#7cb342", side: "#6a9b3d", bottom: "#8d6e63" },
  dirt: { side: "#8d6e63" },
  stone: { side: "#757575" },
  wood: { side: "#a1887f" },
  sand: { side: "#fdd835" },
}

export function Block({ id, position, type }: BlockProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const rigidBodyRef = useRef<any>(null)
  const [hovered, setHovered] = useState(false)
  const [isDynamic, setIsDynamic] = useState(false)
  const { removeBlock, addBlock, selectedBlockType, isPlaying, explosionForces, clearExplosionForces } = useGameStore()

  const handleClick = (e: any) => {
    if (!isPlaying) return
    e.stopPropagation()

    if (e.button === 0) {
      // Left click - remove block
      removeBlock(id)
    } else if (e.button === 2) {
      // Right click - place block
      const face = e.face
      const normal = face.normal
      const newPos: [number, number, number] = [position[0] + normal.x, position[1] + normal.y, position[2] + normal.z]
      addBlock(newPos, selectedBlockType)
    }
  }

  // Check for explosions and apply forces
  useFrame(() => {
    if (explosionForces.length > 0 && rigidBodyRef.current) {
      const blockPos = isDynamic ? rigidBodyRef.current.translation() : { x: position[0], y: position[1], z: position[2] }
      
      explosionForces.forEach((explosion) => {
        const distance = Math.sqrt(
          Math.pow(blockPos.x - explosion.position[0], 2) +
          Math.pow(blockPos.y - explosion.position[1], 2) +
          Math.pow(blockPos.z - explosion.position[2], 2)
        )
        
        if (distance < explosion.radius) {
          // Make block dynamic if it's not already
          if (!isDynamic) {
            setIsDynamic(true)
          }
          
          // Apply impulse away from explosion
          if (isDynamic && rigidBodyRef.current) {
            const direction = new Vector3(
              blockPos.x - explosion.position[0],
              blockPos.y - explosion.position[1],
              blockPos.z - explosion.position[2]
            ).normalize()
            
            // Force decreases with distance (inverse square)
            const forceMagnitude = explosion.force * (1 - distance / explosion.radius)
            
            rigidBodyRef.current.applyImpulse({
              x: direction.x * forceMagnitude,
              y: direction.y * forceMagnitude + 5, // Add upward boost
              z: direction.z * forceMagnitude,
            }, true)
          }
        }
      })
    }
  })

  // Clear explosion forces after processing (only once per frame)
  useEffect(() => {
    if (explosionForces.length > 0) {
      const timeout = setTimeout(() => {
        clearExplosionForces()
      }, 300) // Increased to 300ms to give player time to process
      return () => clearTimeout(timeout)
    }
  }, [explosionForces, clearExplosionForces])

  const texture = BLOCK_TEXTURES[type]

  return (
    <RigidBody 
      ref={rigidBodyRef}
      type={isDynamic ? "dynamic" : "fixed"} 
      colliders="cuboid" 
      position={position}
      mass={isDynamic ? 2 : undefined}
      gravityScale={isDynamic ? 1 : undefined}
    >
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onClick={handleClick}
        onContextMenu={handleClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <boxGeometry args={[1, 1, 1]} />
        {texture.top ? (
          <>
            <meshStandardMaterial attach="material-0" color={texture.side} />
            <meshStandardMaterial attach="material-1" color={texture.side} />
            <meshStandardMaterial attach="material-2" color={texture.top} />
            <meshStandardMaterial attach="material-3" color={texture.bottom || texture.side} />
            <meshStandardMaterial attach="material-4" color={texture.side} />
            <meshStandardMaterial attach="material-5" color={texture.side} />
          </>
        ) : (
          <meshStandardMaterial color={hovered ? "#ffffff" : texture.side} />
        )}
      </mesh>
    </RigidBody>
  )
}
