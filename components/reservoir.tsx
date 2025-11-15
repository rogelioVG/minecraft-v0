"use client"

import { useMemo } from "react"
import { RigidBody } from "@react-three/rapier"
import { Boat } from "./boat"

interface ReservoirProps {
  origin?: [number, number, number]
}

export function Reservoir({ origin = [22, 0, -8] }: ReservoirProps) {
  const [x, y, z] = origin
  const waterLevel = y + 0.3
  const fishPositions = useMemo(
    () =>
      Array.from({ length: 4 }).map((_, index) => ({
        position: [x - 6 + index * 4, waterLevel - 0.2, z - 3 + (index % 2)] as [number, number, number],
        rotation: Math.PI * 0.25 * (index % 4),
      })),
    [x, z, waterLevel],
  )

  return (
    <group>
      {/* water */}
      <mesh position={[x, waterLevel, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 16]} />
        <meshStandardMaterial color="#2f6d82" transparent opacity={0.85} roughness={0.2} />
      </mesh>

      {/* dam walls */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[x, y - 1, z - 10]} castShadow receiveShadow>
          <boxGeometry args={[24, 6, 1]} />
          <meshStandardMaterial color="#7b6f63" />
        </mesh>

        <mesh position={[x, y - 1, z + 8]} castShadow receiveShadow>
          <boxGeometry args={[24, 6, 1]} />
          <meshStandardMaterial color="#7b6f63" />
        </mesh>

        <mesh position={[x - 12, y - 1, z]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[16, 6, 1]} />
          <meshStandardMaterial color="#7b6f63" />
        </mesh>
      </RigidBody>

      {/* dock */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[x - 4, waterLevel, z + 7]} castShadow receiveShadow>
          <boxGeometry args={[8, 0.3, 3]} />
          <meshStandardMaterial color="#8b5a2b" />
        </mesh>
        <mesh position={[x - 7.5, waterLevel, z + 5]} castShadow receiveShadow>
          <boxGeometry args={[3, 0.3, 8]} />
          <meshStandardMaterial color="#8b5a2b" />
        </mesh>
      </RigidBody>

      {/* shoreline rocks */}
      {[
        [x + 10, y - 0.1, z + 5],
        [x + 8, y - 0.2, z - 8],
        [x - 8, y - 0.1, z + 6],
      ].map(([rx, ry, rz], index) => (
        <mesh key={`rock-${index}`} position={[rx, ry, rz]} castShadow receiveShadow>
          <boxGeometry args={[3, 1, 2]} />
          <meshStandardMaterial color="#9a9188" />
        </mesh>
      ))}

      {/* fish silhouettes */}
      {fishPositions.map((fish, index) => (
        <mesh key={`fish-${index}`} position={fish.position} rotation={[0, fish.rotation, 0]}>
          <boxGeometry args={[0.8, 0.2, 0.3]} />
          <meshStandardMaterial color="#f0c27b" transparent opacity={0.7} />
        </mesh>
      ))}

      <Boat
        position={[x - 2, waterLevel + 0.2, z + 2]}
        bounds={{ minX: x - 10, maxX: x + 10, minZ: z - 8, maxZ: z + 6 }}
        waterLevel={waterLevel}
      />
    </group>
  )
}
