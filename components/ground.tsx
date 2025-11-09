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

  return (
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
  )
}
