"use client"

import { RigidBody } from "@react-three/rapier"
import { Text } from "@react-three/drei"

interface StableProps {
  position?: [number, number, number]
}

export function Stable({ position = [-15, 0, 12] }: StableProps) {
  return (
    <group position={position}>
      {/* packed-earth base */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[12, 0.4, 18]} />
          <meshStandardMaterial color="#c08a4d" />
        </mesh>
      </RigidBody>

      {/* wooden frame */}
      <RigidBody type="fixed" colliders="cuboid">
        {[[-5, 1.5, -8], [5, 1.5, -8], [-5, 1.5, 8], [5, 1.5, 8], [-5, 1.5, 0], [5, 1.5, 0]].map(
          ([x, y, z], index) => (
            <mesh key={`post-${index}`} position={[x, y, z]} castShadow receiveShadow>
              <boxGeometry args={[0.6, 3, 0.6]} />
              <meshStandardMaterial color="#6b3f19" />
            </mesh>
          ),
        )}

        {/* cross beams */}
        {[-8, 0, 8].map((z) => (
          <mesh key={`beam-${z}`} position={[0, 3, z]} castShadow receiveShadow>
            <boxGeometry args={[11, 0.4, 0.6]} />
            <meshStandardMaterial color="#6b3f19" />
          </mesh>
        ))}
      </RigidBody>

      {/* roof */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 3.6, 0]} rotation={[Math.PI / 16, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[12.5, 0.5, 19]} />
          <meshStandardMaterial color="#783d26" roughness={0.5} metalness={0.1} />
        </mesh>
      </RigidBody>

      {/* stalls dividers */}
      <RigidBody type="fixed" colliders="cuboid">
        {[-3, 0, 3].map((x) => (
          <mesh key={`divider-${x}`} position={[x, 1, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.3, 2, 18]} />
            <meshStandardMaterial color="#8b5a2b" />
          </mesh>
        ))}
      </RigidBody>

      {/* hay bales */}
      {[
        [-4, 0.4, -6],
        [-3, 0.8, -6],
        [4, 0.4, -5],
        [3, 0.8, -5],
      ].map(([x, y, z], index) => (
        <mesh key={`hay-${index}`} position={[x, y, z]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.8, 1]} />
          <meshStandardMaterial color="#d8c26a" />
        </mesh>
      ))}

      {/* ranch sign */}
      <group position={[0, 4.5, -9.5]}>
        <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.5, 1.2, 0.2]} />
          <meshStandardMaterial color="#4f2c12" />
        </mesh>
        <Text position={[0, -0.5, 0.15]} rotation={[0, Math.PI, 0]} fontSize={0.7} color="#fef6dc">
          Rancho Sonora
        </Text>
      </group>
    </group>
  )
}
