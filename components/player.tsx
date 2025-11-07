"use client"

import { useRef, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { RigidBody, CapsuleCollider } from "@react-three/rapier"
import { Vector3, Euler, Group } from "three"
import { useGameStore } from "@/lib/game-store"
import { LinkCharacter } from "./link-character"

const MOVE_SPEED = 5
const SPRINT_SPEED = 8
const JUMP_FORCE = 8
const CAMERA_DISTANCE = 6
const CAMERA_HEIGHT = 2.5
const CAMERA_MIN_HEIGHT = 1.5
const CAMERA_SMOOTHING = 0.1

export function Player() {
  const { camera } = useThree()
  const rigidBodyRef = useRef<any>(null)
  const characterRef = useRef<Group>(null)
  const isOnGround = useRef(false)
  const velocity = useRef(new Vector3())
  const { isPlaying } = useGameStore()
  const cameraRotation = useRef({ horizontal: 0, vertical: 0.3 })
  const characterRotation = useRef(0)
  const targetCameraPosition = useRef(new Vector3())
  const currentCameraPosition = useRef(new Vector3())

  const movement = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
  })

  // Initialize camera position
  useEffect(() => {
    if (rigidBodyRef.current) {
      const pos = rigidBodyRef.current.translation()
      const initialOffset = new Vector3(
        Math.sin(cameraRotation.current.horizontal) * CAMERA_DISTANCE,
        CAMERA_HEIGHT,
        Math.cos(cameraRotation.current.horizontal) * CAMERA_DISTANCE
      )
      const initialPos = new Vector3(
        pos.x + initialOffset.x,
        pos.y + initialOffset.y,
        pos.z + initialOffset.z
      )
      targetCameraPosition.current.copy(initialPos)
      currentCameraPosition.current.copy(initialPos)
      camera.position.copy(initialPos)
    }
  }, [camera])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return

      switch (e.code) {
        case "KeyW":
          movement.current.forward = true
          break
        case "KeyS":
          movement.current.backward = true
          break
        case "KeyA":
          movement.current.left = true
          break
        case "KeyD":
          movement.current.right = true
          break
        case "Space":
          movement.current.jump = true
          e.preventDefault()
          break
        case "ShiftLeft":
          movement.current.sprint = true
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
          movement.current.forward = false
          break
        case "KeyS":
          movement.current.backward = false
          break
        case "KeyA":
          movement.current.left = false
          break
        case "KeyD":
          movement.current.right = false
          break
        case "Space":
          movement.current.jump = false
          break
        case "ShiftLeft":
          movement.current.sprint = false
          break
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPlaying || document.pointerLockElement === null) return

      const sensitivity = 0.002
      cameraRotation.current.horizontal -= e.movementX * sensitivity
      cameraRotation.current.vertical -= e.movementY * sensitivity

      // Clamp vertical rotation
      cameraRotation.current.vertical = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, cameraRotation.current.vertical))
    }

    const handlePointerLockChange = () => {
      if (document.pointerLockElement === null) {
        // Pointer lock was released (e.g., ESC pressed)
        // We'll let the game state handle this
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("keyup", handleKeyUp)
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("pointerlockchange", handlePointerLockChange)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("keyup", handleKeyUp)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("pointerlockchange", handlePointerLockChange)
    }
  }, [isPlaying])

  useFrame(() => {
    if (!rigidBodyRef.current || !isPlaying) return

    const rb = rigidBodyRef.current
    const vel = rb.linvel()
    velocity.current.set(vel.x, vel.y, vel.z)

    // Check if on ground
    isOnGround.current = Math.abs(vel.y) < 0.1

    // Movement
    const speed = movement.current.sprint ? SPRINT_SPEED : MOVE_SPEED
    const direction = new Vector3()

    if (movement.current.forward) direction.z -= 1
    if (movement.current.backward) direction.z += 1
    if (movement.current.left) direction.x -= 1
    if (movement.current.right) direction.x += 1

    const isMoving = direction.length() > 0

    if (isMoving) {
      direction.normalize()

      // Apply camera rotation to movement
      const euler = new Euler(0, cameraRotation.current.horizontal, 0, 'YXZ')
      direction.applyEuler(euler)
      direction.y = 0
      direction.normalize()

      // Update character rotation to face movement direction
      characterRotation.current = Math.atan2(direction.x, direction.z)
    }

    rb.setLinvel(
      {
        x: direction.x * speed,
        y: vel.y,
        z: direction.z * speed,
      },
      true,
    )

    // Jump
    if (movement.current.jump && isOnGround.current) {
      rb.setLinvel(
        {
          x: vel.x,
          y: JUMP_FORCE,
          z: vel.z,
        },
        true,
      )
    }

    // Update character rotation
    if (characterRef.current) {
      characterRef.current.rotation.y = characterRotation.current
    }

    // Update camera position for 3rd person view
    const pos = rb.translation()
    
    // Calculate camera offset based on rotation
    const horizontalDistance = Math.cos(cameraRotation.current.vertical) * CAMERA_DISTANCE
    const cameraOffset = new Vector3(
      Math.sin(cameraRotation.current.horizontal) * horizontalDistance,
      CAMERA_HEIGHT + Math.sin(cameraRotation.current.vertical) * CAMERA_DISTANCE,
      Math.cos(cameraRotation.current.horizontal) * horizontalDistance
    )

    // Calculate target camera position
    let targetY = pos.y + cameraOffset.y
    targetY = Math.max(targetY, CAMERA_MIN_HEIGHT)

    targetCameraPosition.current.set(
      pos.x + cameraOffset.x,
      targetY,
      pos.z + cameraOffset.z
    )

    // Smooth camera movement (lerp)
    currentCameraPosition.current.lerp(targetCameraPosition.current, CAMERA_SMOOTHING)
    
    camera.position.copy(currentCameraPosition.current)

    // Look at character (aim point slightly above center)
    camera.lookAt(pos.x, pos.y + 1.2, pos.z)
  })

  return (
    <RigidBody
      ref={rigidBodyRef}
      colliders={false}
      mass={1}
      type="dynamic"
      position={[0, 10, 0]}
      enabledRotations={[false, false, false]}
      linearDamping={0.5}
    >
      <CapsuleCollider args={[0.5, 0.5]} />
      <group ref={characterRef} position={[0, -0.5, 0]}>
        <LinkCharacter />
      </group>
    </RigidBody>
  )
}
