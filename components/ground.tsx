"use client"

import { RigidBody } from "@react-three/rapier"

interface GroundProps {
  size: number
}

export function Ground({ size }: GroundProps) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, -0.5, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[size * 2, 1, size * 2]} />
        <meshStandardMaterial color="#6a9b3d" />
      </mesh>
    </RigidBody>
  )
}
