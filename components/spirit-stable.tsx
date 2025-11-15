"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Text } from "@react-three/drei"
import { RigidBody } from "@react-three/rapier"
import { Object3D } from "three"
import type { Group } from "three"

interface HorseProps {
  name: string
  coatColor: string
  maneColor: string
  accentColor: string
  position: [number, number, number]
  rotationY?: number
}

interface LanternProps {
  position: [number, number, number]
}

interface HayBaleProps {
  position: [number, number, number]
  rotation?: [number, number, number]
}

function HorseModel({ name, coatColor, maneColor, accentColor, position, rotationY = 0 }: HorseProps) {
  const idleRef = useRef<Group>(null)
  const headRef = useRef<Group>(null)
  const tailRef = useRef<Group>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    if (idleRef.current) {
      idleRef.current.position.y = Math.sin(t * 1.2) * 0.05
    }

    if (headRef.current) {
      headRef.current.rotation.x = -0.1 + Math.sin(t * 1.5) * 0.12
    }

    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(t * 3) * 0.25
    }
  })

  const legOffsets: Array<[number, number]> = [
    [-0.55, -0.2],
    [-0.55, 0.2],
    [0.55, -0.2],
    [0.55, 0.2],
  ]

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <group ref={idleRef}>
        {/* Body */}
        <mesh castShadow receiveShadow position={[0, 0.9, 0]}>
          <boxGeometry args={[1.8, 0.8, 0.55]} />
          <meshStandardMaterial color={coatColor} roughness={0.8} metalness={0.05} />
        </mesh>

        {/* Legs */}
        {legOffsets.map(([x, z], index) => (
          <mesh key={`${name}-leg-${index}`} castShadow position={[x, 0.35, z]}>
            <boxGeometry args={[0.18, 0.8, 0.18]} />
            <meshStandardMaterial color={coatColor} />
          </mesh>
        ))}

        {/* Hooves */}
        {legOffsets.map(([x, z], index) => (
          <mesh key={`${name}-hoof-${index}`} castShadow position={[x, -0.1, z]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial color={accentColor} metalness={0.2} roughness={0.6} />
          </mesh>
        ))}

        {/* Neck and head */}
        <group ref={headRef} position={[0.95, 1.2, 0]}>
          <mesh castShadow position={[0.15, 0.15, 0]}>
            <boxGeometry args={[0.7, 0.4, 0.5]} />
            <meshStandardMaterial color={coatColor} />
          </mesh>
          <mesh castShadow position={[0.5, 0, 0]}>
            <boxGeometry args={[0.3, 0.25, 0.35]} />
            <meshStandardMaterial color={accentColor} />
          </mesh>

          {/* Mane */}
          <mesh castShadow position={[0.1, 0.25, 0]}>
            <boxGeometry args={[0.6, 0.2, 0.4]} />
            <meshStandardMaterial color={maneColor} roughness={0.5} />
          </mesh>
        </group>

        {/* Back mane */}
        <mesh castShadow position={[-0.1, 1.3, 0]}>
          <boxGeometry args={[0.2, 0.5, 0.5]} />
          <meshStandardMaterial color={maneColor} />
        </mesh>

        {/* Tail */}
        <group ref={tailRef} position={[-0.95, 1.1, 0]}>
          <mesh castShadow>
            <coneGeometry args={[0.15, 0.8, 8]} />
            <meshStandardMaterial color={maneColor} />
          </mesh>
        </group>

        {/* Name plate */}
        <Text
          position={[0, 2.1, 0]}
          fontSize={0.35}
          color="#ffffff"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.02}
          outlineColor="black"
        >
          {name}
        </Text>

        {/* Gentle fill light so horses pop even under rain */}
        <pointLight color={accentColor} intensity={0.5} distance={4} decay={2} position={[0, 1.8, 0]} />
      </group>
    </group>
  )
}

function HayBale({ position, rotation = [0, 0, 0] as [number, number, number] }: HayBaleProps) {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <boxGeometry args={[0.9, 0.7, 0.7]} />
      <meshStandardMaterial color="#e3c46f" roughness={0.4} />
    </mesh>
  )
}

function Lantern({ position }: LanternProps) {
  return (
    <group position={position}>
      <mesh castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#5c3b1b" emissive="#ffd27f" emissiveIntensity={1.5} />
      </mesh>
      <pointLight color="#ffd27f" intensity={1.5} distance={9} decay={2} />
    </group>
  )
}

function StableStructure() {
  const floorSize: [number, number, number] = [12, 0.4, 8]

  return (
    <>
      {/* Floor */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, -0.3, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={floorSize} />
          <meshStandardMaterial color="#8c6239" />
        </mesh>
      </RigidBody>

      {/* Back wall */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 1.4, -3.9]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[12, 3, 0.4]} />
          <meshStandardMaterial color="#6f4b27" />
        </mesh>
      </RigidBody>

      {/* Side walls */}
      <RigidBody type="fixed" colliders="cuboid" position={[-6, 1.4, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.4, 3, 8]} />
          <meshStandardMaterial color="#70512d" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[6, 1.4, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.4, 3, 8]} />
          <meshStandardMaterial color="#70512d" />
        </mesh>
      </RigidBody>

      {/* Roof */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 3.1, 0]}>
        <mesh castShadow receiveShadow rotation={[0, 0, 0.05]}>
          <boxGeometry args={[12.5, 0.35, 8.5]} />
          <meshStandardMaterial color="#4b3825" metalness={0.05} roughness={0.7} />
        </mesh>
      </RigidBody>

      {/* Support posts */}
      {[-5.5, 0, 5.5].map((x) => (
        <RigidBody key={`post-${x}`} type="fixed" colliders="cuboid" position={[x, 1.5, 3.5]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.4, 3, 0.4]} />
            <meshStandardMaterial color="#6d4a2c" />
          </mesh>
        </RigidBody>
      ))}

      {/* Front railings */}
      {[-6, 6].map((x) => (
        <mesh key={`rail-${x}`} position={[0, 0.6 + (x === -6 ? 0 : 0.4), 3.5]} castShadow receiveShadow>
          <boxGeometry args={[11.5, 0.15, 0.25]} />
          <meshStandardMaterial color="#8b5a2b" />
        </mesh>
      ))}

      {/* Water trough */}
      <RigidBody type="fixed" colliders="cuboid" position={[3.5, 0.3, 2]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2, 0.5, 0.8]} />
          <meshStandardMaterial color="#4a3b2a" />
        </mesh>
        <mesh position={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[1.7, 0.2, 0.55]} />
          <meshStandardMaterial color="#3f9dd4" metalness={0.2} roughness={0.1} />
        </mesh>
      </RigidBody>
    </>
  )
}

export function SpiritStable() {
  const spotlightTarget = useMemo(() => {
    const target = new Object3D()
    target.position.set(0, 0, 0)
    return target
  }, [])

  return (
    <group position={[-18, 0, -18]}>
      <StableStructure />

      <HorseModel
        name="Spirit"
        coatColor="#c78b3e"
        maneColor="#2c1b0f"
        accentColor="#f8d184"
        position={[-2.5, 0, 0.5]}
        rotationY={Math.PI / 10}
      />

      <HorseModel
        name="Rain"
        coatColor="#fdf5e2"
        maneColor="#4f2f1b"
        accentColor="#a6c8ff"
        position={[2.5, 0, -0.8]}
        rotationY={-Math.PI / 12}
      />

      <HayBale position={[-4, 0.2, -2]} rotation={[0, Math.PI / 8, 0]} />
      <HayBale position={[-3.5, 0.7, -1.4]} rotation={[0, -Math.PI / 6, 0]} />
      <HayBale position={[0, 0.2, 2.6]} rotation={[0, Math.PI / 4, 0]} />

      <Lantern position={[-4.8, 2.6, 3.3]} />
      <Lantern position={[4.8, 2.6, 3.3]} />

      {/* Soft light that keeps the stable cozy even under stormy skies */}
      <primitive object={spotlightTarget} />
      <spotLight
        position={[0, 6, 0]}
        angle={Math.PI / 4}
        intensity={0.8}
        penumbra={0.5}
        color="#f0d7b1"
        target={spotlightTarget}
        castShadow
      />
    </group>
  )
}

