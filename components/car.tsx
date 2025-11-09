"use client"

import { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { RigidBody, RapierRigidBody } from "@react-three/rapier"
import { useGameStore } from "@/lib/game-store"
import * as THREE from "three"

export function Car() {
  const carRef = useRef<RapierRigidBody>(null)
  const { isPlaying, updateSpeed, updateLapTime } = useGameStore()
  const keysPressed = useRef<{ [key: string]: boolean }>({})
  const startTime = useRef<number>(Date.now())

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  useFrame((state, delta) => {
    if (!carRef.current || !isPlaying) return

    const body = carRef.current
    const velocity = body.linvel()
    const position = body.translation()

    // Control parameters
    const acceleration = 25
    const maxSpeed = 20
    const turnSpeed = 2
    const brakeForce = 15
    const handbrakeForce = 25

    // Get current velocity for speed calculation
    const speed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2)
    updateSpeed(speed)

    // Update lap time
    const currentTime = (Date.now() - startTime.current) / 1000
    updateLapTime(currentTime)

    // Get car's forward direction
    const rotation = body.rotation()
    const quaternion = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w)
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(quaternion)
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(quaternion)

    // Apply forces based on input
    const keys = keysPressed.current
    let force = { x: 0, y: 0, z: 0 }
    let torque = { x: 0, y: 0, z: 0 }

    // Forward/Backward
    if (keys["w"] || keys["arrowup"]) {
      if (speed < maxSpeed) {
        force.x += forward.x * acceleration
        force.z += forward.z * acceleration
      }
    }
    if (keys["s"] || keys["arrowdown"]) {
      force.x -= forward.x * brakeForce
      force.z -= forward.z * brakeForce
    }

    // Turning (only when moving)
    if (speed > 0.5) {
      if (keys["a"] || keys["arrowleft"]) {
        torque.y += turnSpeed
      }
      if (keys["d"] || keys["arrowright"]) {
        torque.y -= turnSpeed
      }
    }

    // Handbrake
    if (keys[" "]) {
      force.x -= velocity.x * handbrakeForce * delta
      force.z -= velocity.z * handbrakeForce * delta
    }

    // Apply forces
    body.applyImpulse(force, true)
    body.applyTorqueImpulse(torque, true)

    // Apply drag
    const drag = 0.98
    body.setLinvel(
      {
        x: velocity.x * drag,
        y: velocity.y,
        z: velocity.z * drag,
      },
      true
    )

    // Update camera to follow car
    const cameraOffset = new THREE.Vector3(0, 5, 10)
    const rotatedOffset = cameraOffset.applyQuaternion(quaternion)
    const targetPosition = new THREE.Vector3(
      position.x + rotatedOffset.x,
      position.y + rotatedOffset.y,
      position.z + rotatedOffset.z
    )

    state.camera.position.lerp(targetPosition, 0.1)
    state.camera.lookAt(position.x, position.y + 1, position.z)

    // Reset if car falls off
    if (position.y < -10) {
      body.setTranslation({ x: 0, y: 2, z: 0 }, true)
      body.setLinvel({ x: 0, y: 0, z: 0 }, true)
      body.setAngvel({ x: 0, y: 0, z: 0 }, true)
      startTime.current = Date.now()
    }
  })

  return (
    <RigidBody
      ref={carRef}
      position={[0, 2, 0]}
      colliders="cuboid"
      mass={1}
      linearDamping={0.5}
      angularDamping={0.5}
    >
      <group>
        {/* Car Body */}
        <mesh castShadow position={[0, 0.3, 0]}>
          <boxGeometry args={[1.5, 0.6, 3]} />
          <meshStandardMaterial color="#ff0000" metalness={0.6} roughness={0.4} />
        </mesh>
        
        {/* Car Top */}
        <mesh castShadow position={[0, 0.8, -0.3]}>
          <boxGeometry args={[1.3, 0.6, 1.5]} />
          <meshStandardMaterial color="#990000" metalness={0.6} roughness={0.4} />
        </mesh>

        {/* Wheels */}
        <mesh castShadow position={[0.7, -0.2, 0.9]}>
          <cylinderGeometry args={[0.3, 0.3, 0.3, 16]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        <mesh castShadow position={[-0.7, -0.2, 0.9]}>
          <cylinderGeometry args={[0.3, 0.3, 0.3, 16]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        <mesh castShadow position={[0.7, -0.2, -0.9]}>
          <cylinderGeometry args={[0.3, 0.3, 0.3, 16]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        <mesh castShadow position={[-0.7, -0.2, -0.9]}>
          <cylinderGeometry args={[0.3, 0.3, 0.3, 16]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
      </group>
    </RigidBody>
  )
}
