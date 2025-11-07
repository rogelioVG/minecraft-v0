"use client"

import { useRef } from "react"
import { Group } from "three"

export function LinkCharacter() {
  const groupRef = useRef<Group>(null)

  return (
    <group ref={groupRef}>
      {/* Head - beige/tan */}
      <mesh position={[0, 1.75, 0]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>

      {/* Hat - purple pointed */}
      <mesh position={[0, 2.15, 0]} castShadow>
        <boxGeometry args={[0.5, 0.3, 0.5]} />
        <meshStandardMaterial color="#6b2d8c" />
      </mesh>
      <mesh position={[0, 2.4, 0]} castShadow>
        <boxGeometry args={[0.4, 0.2, 0.4]} />
        <meshStandardMaterial color="#6b2d8c" />
      </mesh>
      <mesh position={[0, 2.55, 0]} castShadow>
        <boxGeometry args={[0.3, 0.15, 0.3]} />
        <meshStandardMaterial color="#6b2d8c" />
      </mesh>

      {/* Hair - blonde */}
      <mesh position={[-0.25, 1.85, 0.1]} castShadow>
        <boxGeometry args={[0.15, 0.3, 0.3]} />
        <meshStandardMaterial color="#c49a3a" />
      </mesh>
      <mesh position={[0.25, 1.85, 0.1]} castShadow>
        <boxGeometry args={[0.15, 0.3, 0.3]} />
        <meshStandardMaterial color="#c49a3a" />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.15, 1.8, 0.26]} castShadow>
        <boxGeometry args={[0.1, 0.1, 0.05]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.15, 1.8, 0.26]} castShadow>
        <boxGeometry args={[0.1, 0.1, 0.05]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Body/Tunic - purple */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[0.7, 0.8, 0.5]} />
        <meshStandardMaterial color="#7b3fa0" />
      </mesh>

      {/* Belt - brown */}
      <mesh position={[0, 0.9, 0.01]} castShadow>
        <boxGeometry args={[0.75, 0.15, 0.52]} />
        <meshStandardMaterial color="#5c3317" />
      </mesh>

      {/* Belt buckle - gold */}
      <mesh position={[0, 0.9, 0.27]} castShadow>
        <boxGeometry args={[0.15, 0.15, 0.05]} />
        <meshStandardMaterial color="#ffd700" />
      </mesh>

      {/* Arms - purple tunic sleeves */}
      <mesh position={[-0.45, 1.1, 0]} castShadow>
        <boxGeometry args={[0.25, 0.7, 0.25]} />
        <meshStandardMaterial color="#7b3fa0" />
      </mesh>
      <mesh position={[0.45, 1.1, 0]} castShadow>
        <boxGeometry args={[0.25, 0.7, 0.25]} />
        <meshStandardMaterial color="#7b3fa0" />
      </mesh>

      {/* Hands - beige/tan */}
      <mesh position={[-0.45, 0.6, 0]} castShadow>
        <boxGeometry args={[0.2, 0.25, 0.2]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      <mesh position={[0.45, 0.6, 0]} castShadow>
        <boxGeometry args={[0.2, 0.25, 0.2]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>

      {/* Legs - white/cream leggings */}
      <mesh position={[-0.2, 0.35, 0]} castShadow>
        <boxGeometry args={[0.25, 0.7, 0.3]} />
        <meshStandardMaterial color="#f5f5dc" />
      </mesh>
      <mesh position={[0.2, 0.35, 0]} castShadow>
        <boxGeometry args={[0.25, 0.7, 0.3]} />
        <meshStandardMaterial color="#f5f5dc" />
      </mesh>

      {/* Boots - brown */}
      <mesh position={[-0.2, -0.05, 0.05]} castShadow>
        <boxGeometry args={[0.3, 0.2, 0.4]} />
        <meshStandardMaterial color="#5c3317" />
      </mesh>
      <mesh position={[0.2, -0.05, 0.05]} castShadow>
        <boxGeometry args={[0.3, 0.2, 0.4]} />
        <meshStandardMaterial color="#5c3317" />
      </mesh>

      {/* Sword on back - simple gray blade */}
      <mesh position={[-0.35, 1.3, -0.3]} rotation={[0, 0, Math.PI / 6]} castShadow>
        <boxGeometry args={[0.1, 0.8, 0.05]} />
        <meshStandardMaterial color="#8b8b8b" />
      </mesh>
      {/* Sword hilt - brown */}
      <mesh position={[-0.35, 0.85, -0.3]} rotation={[0, 0, Math.PI / 6]} castShadow>
        <boxGeometry args={[0.1, 0.2, 0.05]} />
        <meshStandardMaterial color="#5c3317" />
      </mesh>
      {/* Sword guard - gold */}
      <mesh position={[-0.35, 0.95, -0.3]} rotation={[0, 0, Math.PI / 6]} castShadow>
        <boxGeometry args={[0.25, 0.05, 0.05]} />
        <meshStandardMaterial color="#ffd700" />
      </mesh>

      {/* Shield on back - simple */}
      <mesh position={[0.35, 1.2, -0.3]} castShadow>
        <boxGeometry args={[0.4, 0.5, 0.1]} />
        <meshStandardMaterial color="#4169e1" />
      </mesh>
      {/* Shield emblem - triforce hint */}
      <mesh position={[0.35, 1.2, -0.24]} castShadow>
        <boxGeometry args={[0.15, 0.15, 0.05]} />
        <meshStandardMaterial color="#ffd700" />
      </mesh>
    </group>
  )
}
