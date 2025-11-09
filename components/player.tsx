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
const CAMERA_DISTANCE = 5
const CAMERA_HEIGHT = 2
const CAMERA_MIN_HEIGHT = 1.5

export function Player() {
  const { camera } = useThree()
  const rigidBodyRef = useRef<any>(null)
  const characterRef = useRef<Group>(null)
  const isOnGround = useRef(false)
  const velocity = useRef(new Vector3())
  const { isPlaying, isFirstPerson } = useGameStore()
  const cameraRotation = useRef({ horizontal: 0, vertical: 0.3 })
  const characterRotation = useRef(0)

  const movement = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
  })

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
        case "Digit1":
          useGameStore.getState().setSelectedBlockType("grass")
          break
        case "Digit2":
          useGameStore.getState().setSelectedBlockType("dirt")
          break
        case "Digit3":
          useGameStore.getState().setSelectedBlockType("stone")
          break
        case "Digit4":
          useGameStore.getState().setSelectedBlockType("wood")
          break
        case "Digit5":
          useGameStore.getState().setSelectedBlockType("sand")
          break
        case "KeyX":
          useGameStore.getState().toggleViewMode()
          break
        case "KeyE":
          // Trigger explosion at distance
          const pos = rigidBodyRef.current?.translation()
          if (pos) {
            const explosionDistance = 10
            const explosionRadius = 4
            
            // Calculate direction player is facing based on camera rotation
            const targetPos: [number, number, number] = [
              pos.x - Math.sin(cameraRotation.current.horizontal) * explosionDistance,
              pos.y,
              pos.z - Math.cos(cameraRotation.current.horizontal) * explosionDistance,
            ]
            
            useGameStore.getState().explodeBlocks(targetPos, explosionRadius)
          }
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
      if (!isPlaying) return

      const sensitivity = 0.002
      cameraRotation.current.horizontal -= e.movementX * sensitivity
      cameraRotation.current.vertical -= e.movementY * sensitivity

      // Clamp vertical rotation
      cameraRotation.current.vertical = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, cameraRotation.current.vertical))
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("keyup", handleKeyUp)
    document.addEventListener("mousemove", handleMouseMove)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("keyup", handleKeyUp)
      document.removeEventListener("mousemove", handleMouseMove)
    }
  }, [isPlaying])

  useFrame(() => {
    if (!rigidBodyRef.current || !isPlaying) return

    const rb = rigidBodyRef.current
    const vel = rb.linvel()
    velocity.current.set(vel.x, vel.y, vel.z)

    // Update player position in store
    const pos = rb.translation()
    useGameStore.getState().setPlayerPosition([pos.x, pos.y, pos.z])

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

    // Update camera position based on view mode
    const pos = rb.translation()

    if (isFirstPerson) {
      // First-person view: camera at player's eye level
      camera.position.set(
        pos.x,
        pos.y + 1.6, // Eye level height
        pos.z
      )

      // Look in the direction based on camera rotation
      const lookAtPoint = new Vector3(
        pos.x - Math.sin(cameraRotation.current.horizontal) * 10,
        pos.y + 1.6 - Math.sin(cameraRotation.current.vertical) * 10,
        pos.z - Math.cos(cameraRotation.current.horizontal) * 10
      )
      camera.lookAt(lookAtPoint)
    } else {
      // Third-person view
      const cameraOffset = new Vector3(
        Math.sin(cameraRotation.current.horizontal) * CAMERA_DISTANCE,
        CAMERA_HEIGHT + Math.sin(cameraRotation.current.vertical) * CAMERA_DISTANCE,
        Math.cos(cameraRotation.current.horizontal) * CAMERA_DISTANCE
      )

      // Calculate desired camera position
      let cameraY = pos.y + cameraOffset.y

      // Prevent camera from going below minimum height (floor collision)
      cameraY = Math.max(cameraY, CAMERA_MIN_HEIGHT)

      camera.position.set(
        pos.x + cameraOffset.x,
        cameraY,
        pos.z + cameraOffset.z
      )

      // Over-the-shoulder view: offset lookAt point to the left so character appears on the right
      const shoulderOffset = 1.2 // Adjust this value to move character more/less to the right
      const lookAtOffset = new Vector3(
        -Math.cos(cameraRotation.current.horizontal) * shoulderOffset,
        0,
        Math.sin(cameraRotation.current.horizontal) * shoulderOffset
      )
      
      camera.lookAt(
        pos.x + lookAtOffset.x,
        pos.y + 1,
        pos.z + lookAtOffset.z
      )
    }
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
      {!isFirstPerson && (
        <group ref={characterRef} position={[0, -0.5, 0]}>
          <LinkCharacter />
        </group>
      )}
    </RigidBody>
  )
}
