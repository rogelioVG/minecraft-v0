"use client"

import { RigidBody } from "@react-three/rapier"

export function DekuTree() {
  // Create a large Deku Tree in the center
  return (
    <group position={[0, 0, 0]}>
      {/* Large trunk - brown color */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[3, 1, 3]} />
          <meshStandardMaterial color="#5a3a1a" />
        </mesh>
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 2, 2.5]} />
          <meshStandardMaterial color="#5a3a1a" />
        </mesh>
        <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="#5a3a1a" />
        </mesh>
        <mesh position={[0, 5.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 2, 1.8]} />
          <meshStandardMaterial color="#5a3a1a" />
        </mesh>
        <mesh position={[0, 7.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 2, 1.6]} />
          <meshStandardMaterial color="#5a3a1a" />
        </mesh>
        <mesh position={[0, 9.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 2, 1.4]} />
          <meshStandardMaterial color="#5a3a1a" />
        </mesh>
      </RigidBody>

      {/* Leafy canopy - multiple layers */}
      <RigidBody type="fixed" colliders="cuboid">
        {/* Bottom layer of leaves - widest */}
        <mesh position={[0, 11, 0]} castShadow receiveShadow>
          <boxGeometry args={[7, 1, 7]} />
          <meshStandardMaterial color="#2d5016" />
        </mesh>
        <mesh position={[0, 12, 0]} castShadow receiveShadow>
          <boxGeometry args={[6, 1, 6]} />
          <meshStandardMaterial color="#3a6b1f" />
        </mesh>
        <mesh position={[0, 13, 0]} castShadow receiveShadow>
          <boxGeometry args={[5, 1, 5]} />
          <meshStandardMaterial color="#2d5016" />
        </mesh>
        <mesh position={[0, 14, 0]} castShadow receiveShadow>
          <boxGeometry args={[4, 1, 4]} />
          <meshStandardMaterial color="#3a6b1f" />
        </mesh>
        <mesh position={[0, 15, 0]} castShadow receiveShadow>
          <boxGeometry args={[3, 1, 3]} />
          <meshStandardMaterial color="#2d5016" />
        </mesh>
        <mesh position={[0, 16, 0]} castShadow receiveShadow>
          <boxGeometry args={[2, 1, 2]} />
          <meshStandardMaterial color="#3a6b1f" />
        </mesh>
      </RigidBody>

      {/* Face on the tree - eyes and mouth */}
      <group position={[0, 6, 1.1]}>
        {/* Left eye */}
        <mesh position={[-0.4, 0.3, 0]} castShadow>
          <boxGeometry args={[0.3, 0.4, 0.1]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Right eye */}
        <mesh position={[0.4, 0.3, 0]} castShadow>
          <boxGeometry args={[0.3, 0.4, 0.1]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Mouth */}
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.8, 0.3, 0.1]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>

      {/* Roots spreading out */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[1.5, -0.3, 0]} rotation={[0, 0, 0.3]} castShadow receiveShadow>
          <boxGeometry args={[2, 0.6, 1.5]} />
          <meshStandardMaterial color="#4a2a0a" />
        </mesh>
        <mesh position={[-1.5, -0.3, 0]} rotation={[0, 0, -0.3]} castShadow receiveShadow>
          <boxGeometry args={[2, 0.6, 1.5]} />
          <meshStandardMaterial color="#4a2a0a" />
        </mesh>
        <mesh position={[0, -0.3, 1.5]} rotation={[0.3, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.6, 2]} />
          <meshStandardMaterial color="#4a2a0a" />
        </mesh>
        <mesh position={[0, -0.3, -1.5]} rotation={[-0.3, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.6, 2]} />
          <meshStandardMaterial color="#4a2a0a" />
        </mesh>
      </RigidBody>
    </group>
  )
}
