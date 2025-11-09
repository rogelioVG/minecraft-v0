"use client"

import { RigidBody } from "@react-three/rapier"
import { useGameStore } from "@/lib/game-store"

interface GroundProps {
  size: number
}

export function Ground({ size }: GroundProps) {
  const { addBlock, selectedBlockType, isPlaying } = useGameStore()

  const handleClick = (e: any) => {
    if (!isPlaying) return
    e.stopPropagation()

    // Only handle right-click for placing blocks
    if (e.button === 2) {
      // Get the intersection point
      const point = e.point
      
      // Round to nearest block position and place on top of ground (y=0)
      const newPos: [number, number, number] = [
        Math.round(point.x),
        0,
        Math.round(point.z)
      ]
      
      addBlock(newPos, selectedBlockType)
    }
  }

  // Zona de juegos en la esquina suroeste
  const playgroundSize = 20
  const playgroundX = -size + playgroundSize / 2
  const playgroundZ = -size + playgroundSize / 2

  return (
    <>
      {/* Suelo principal verde */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, -0.5, 0]}>
        <mesh 
          receiveShadow
          onClick={handleClick}
          onContextMenu={handleClick}
        >
          <boxGeometry args={[size * 2, 1, size * 2]} />
          <meshStandardMaterial color="#6a9b3d" />
        </mesh>
      </RigidBody>

      {/* Zona de juegos con suelo arena en la esquina suroeste */}
      <RigidBody type="fixed" colliders="cuboid" position={[playgroundX, -0.4, playgroundZ]}>
        <mesh 
          receiveShadow
          onClick={handleClick}
          onContextMenu={handleClick}
        >
          <boxGeometry args={[playgroundSize, 1.2, playgroundSize]} />
          <meshStandardMaterial color="#c2b280" />
        </mesh>
      </RigidBody>
    </>
  )
}
