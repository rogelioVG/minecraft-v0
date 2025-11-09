"use client"

import { useRef } from "react"
import { Group } from "three"

interface LinkCharacterProps {
  leftLegRef?: React.RefObject<Group>
  rightLegRef?: React.RefObject<Group>
  leftArmRef?: React.RefObject<Group>
  rightArmRef?: React.RefObject<Group>
  bodyRef?: React.RefObject<Group>
}

export function LinkCharacter({ leftLegRef, rightLegRef, leftArmRef, rightArmRef, bodyRef }: LinkCharacterProps) {
  const groupRef = useRef<Group>(null)

  return (
    <group ref={bodyRef} position={[0, 0, 0]}>
      {/* Head - beige/tan */}
      <mesh position={[0, 1.75, 0]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>

      {/* Hat - green pointed */}
      <mesh position={[0, 2.15, 0]} castShadow>
        <boxGeometry args={[0.5, 0.3, 0.5]} />
        <meshStandardMaterial color="#2d5016" />
      </mesh>
      <mesh position={[0, 2.4, 0]} castShadow>
        <boxGeometry args={[0.4, 0.2, 0.4]} />
        <meshStandardMaterial color="#2d5016" />
      </mesh>
      <mesh position={[0, 2.55, 0]} castShadow>
        <boxGeometry args={[0.3, 0.15, 0.3]} />
        <meshStandardMaterial color="#2d5016" />
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

      {/* Body/Tunic - green */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[0.7, 0.8, 0.5]} />
        <meshStandardMaterial color="#2d5016" />
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

      {/* Arms - green tunic sleeves with animation */}
      <group ref={leftArmRef} position={[-0.45, 1.1, 0]} rotation={[0, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.25, 0.7, 0.25]} />
          <meshStandardMaterial color="#2d5016" />
        </mesh>
        {/* Hand - beige/tan */}
        <mesh position={[0, -0.5, 0]} castShadow>
          <boxGeometry args={[0.2, 0.25, 0.2]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
      </group>
      
      <group ref={rightArmRef} position={[0.45, 1.1, 0]} rotation={[0, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.25, 0.7, 0.25]} />
          <meshStandardMaterial color="#2d5016" />
        </mesh>
        {/* Hand - beige/tan */}
        <mesh position={[0, -0.5, 0]} castShadow>
          <boxGeometry args={[0.2, 0.25, 0.2]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
      </group>

      {/* Legs - white/cream leggings with animation */}
      <group ref={leftLegRef} position={[-0.2, 0.35, 0]} rotation={[0, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.25, 0.7, 0.3]} />
          <meshStandardMaterial color="#f5f5dc" />
        </mesh>
        {/* Boot - brown */}
        <mesh position={[0, -0.4, 0.05]} castShadow>
          <boxGeometry args={[0.3, 0.2, 0.4]} />
          <meshStandardMaterial color="#5c3317" />
        </mesh>
      </group>
      
      <group ref={rightLegRef} position={[0.2, 0.35, 0]} rotation={[0, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.25, 0.7, 0.3]} />
          <meshStandardMaterial color="#f5f5dc" />
        </mesh>
        {/* Boot - brown */}
        <mesh position={[0, -0.4, 0.05]} castShadow>
          <boxGeometry args={[0.3, 0.2, 0.4]} />
          <meshStandardMaterial color="#5c3317" />
        </mesh>
      </group>

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
