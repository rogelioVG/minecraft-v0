"use client"

import { useRef, useState } from "react"
import { RigidBody } from "@react-three/rapier"
import { useGameStore, type BlockType } from "@/lib/game-store"
import type * as THREE from "three"

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
  const [hovered, setHovered] = useState(false)
  const { removeBlock, addBlock, selectedBlockType, isPlaying } = useGameStore()

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

  const texture = BLOCK_TEXTURES[type]

  return (
    <RigidBody type="fixed" colliders="cuboid" position={position}>
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
