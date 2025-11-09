"use client"

import { RigidBody } from "@react-three/rapier"
import * as THREE from "three"

export function Track() {
  return (
    <>
      {/* Ground */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.5, 0]}>
          <boxGeometry args={[100, 1, 100]} />
          <meshStandardMaterial color="#2a5a2a" />
        </mesh>
      </RigidBody>

      {/* Track - Main straight */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[10, 0.1, 50]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </RigidBody>

      {/* Track lines */}
      <mesh receiveShadow position={[0, 0.11, 0]}>
        <boxGeometry args={[0.2, 0.01, 50]} />
        <meshStandardMaterial color="#ffff00" />
      </mesh>

      {/* Turn 1 - Right turn */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[15, 0, -20]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[10, 0.1, 15]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </RigidBody>

      {/* Straight 2 */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[25, 0, -10]}>
          <boxGeometry args={[10, 0.1, 30]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </RigidBody>

      {/* Turn 2 - Left turn back */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[15, 0, 15]} rotation={[0, -Math.PI / 4, 0]}>
          <boxGeometry args={[10, 0.1, 15]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </RigidBody>

      {/* Obstacles - Cones */}
      {/* Left side markers */}
      <Cone position={[-5, 0, -20]} />
      <Cone position={[-5, 0, -10]} />
      <Cone position={[-5, 0, 0]} />
      <Cone position={[-5, 0, 10]} />
      <Cone position={[-5, 0, 20]} />

      {/* Right side markers */}
      <Cone position={[5, 0, -20]} />
      <Cone position={[5, 0, -10]} />
      <Cone position={[5, 0, 0]} />
      <Cone position={[5, 0, 10]} />
      <Cone position={[5, 0, 20]} />

      {/* Corner markers */}
      <Cone position={[10, 0, -25]} color="#ff0000" />
      <Cone position={[20, 0, -25]} color="#ff0000" />
      <Cone position={[30, 0, -15]} color="#ff0000" />
      <Cone position={[30, 0, 5]} color="#ff0000" />
      <Cone position={[20, 0, 20]} color="#ff0000" />
      <Cone position={[10, 0, 20]} color="#ff0000" />

      {/* Start/Finish line */}
      <mesh receiveShadow position={[0, 0.11, 23]}>
        <boxGeometry args={[10, 0.01, 2]} />
        <meshStandardMaterial color="#ffffff">
          <primitive
            attach="map"
            object={(() => {
              const canvas = document.createElement("canvas")
              canvas.width = 256
              canvas.height = 256
              const ctx = canvas.getContext("2d")
              if (ctx) {
                // Create checkered pattern
                const squareSize = 32
                for (let i = 0; i < 8; i++) {
                  for (let j = 0; j < 8; j++) {
                    ctx.fillStyle = (i + j) % 2 === 0 ? "#ffffff" : "#000000"
                    ctx.fillRect(i * squareSize, j * squareSize, squareSize, squareSize)
                  }
                }
              }
              const texture = new THREE.CanvasTexture(canvas)
              texture.wrapS = THREE.RepeatWrapping
              texture.wrapT = THREE.RepeatWrapping
              return texture
            })()}
          />
        </meshStandardMaterial>
      </mesh>
    </>
  )
}

function Cone({ position, color = "#ff6600" }: { position: [number, number, number]; color?: string }) {
  return (
    <RigidBody type="fixed" colliders="hull">
      <mesh castShadow position={position}>
        <coneGeometry args={[0.3, 0.8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  )
}
