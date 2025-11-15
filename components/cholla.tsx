"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"
import { useGameStore } from "@/lib/game-store"

interface ChollaProps {
  position: [number, number, number]
  height?: number
  damagePerTick?: number
}

export function Cholla({ position, height = 2.4, damagePerTick = 12 }: ChollaProps) {
  const timer = useRef(0)
  const damagePlayer = useGameStore((state) => state.damagePlayer)

  useFrame((_, delta) => {
    const { playerPosition } = useGameStore.getState()
    const dx = playerPosition[0] - position[0]
    const dz = playerPosition[2] - position[2]
    const distance = Math.sqrt(dx * dx + dz * dz)

    if (distance < 1.3) {
      timer.current += delta
      if (timer.current >= 0.4) {
        damagePlayer(damagePerTick, "cholla")
        timer.current = 0
      }
    } else {
      timer.current = Math.max(0, timer.current - delta)
    }
  })

  return (
    <RigidBody type="fixed" colliders="cuboid" position={[position[0], position[1] + height / 2, position[2]]}>
      <group>
        {/* central trunk */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.6, height, 0.6]} />
          <meshStandardMaterial color="#4f7c44" roughness={0.9} />
        </mesh>

        {/* arms */}
        {[
          [0.6, height * 0.2, 0, height * 0.5],
          [-0.6, height * 0.4, 0, height * 0.5],
          [0, height * 0.35, 0.6, height * 0.4],
          [0, height * 0.55, -0.6, height * 0.4],
        ].map(([x, y, z, armLength], index) => (
          <mesh key={`arm-${index}`} position={[x as number, y as number, z as number]} castShadow receiveShadow>
            <boxGeometry args={[0.4, armLength as number, 0.4]} />
            <meshStandardMaterial color="#5f8f52" />
          </mesh>
        ))}

        {/* spines */}
        {Array.from({ length: 20 }).map((_, index) => {
          const angle = (index / 20) * Math.PI * 2
          const radius = 0.4 + (index % 3) * 0.05
          const y = (index / 20) * height - height / 2
          return (
            <mesh key={`spine-${index}`} position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]}>
              <coneGeometry args={[0.06, 0.25, 6]} />
              <meshStandardMaterial color="#f4f1d0" emissive="#ffefc1" emissiveIntensity={0.4} />
            </mesh>
          )
        })}

        <pointLight position={[0, height / 2, 0]} intensity={0.8} distance={4} color="#f4e3a1" />
      </group>
    </RigidBody>
  )
}
