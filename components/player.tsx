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
  const leftLegRef = useRef<Group>(null)
  const rightLegRef = useRef<Group>(null)
  const leftArmRef = useRef<Group>(null)
  const rightArmRef = useRef<Group>(null)
  const bodyRef = useRef<Group>(null)
  const isOnGround = useRef(false)
  const velocity = useRef(new Vector3())
  const { isPlaying, shootArrow } = useGameStore()
  const cameraRotation = useRef({ horizontal: 0, vertical: 0.3 })
  const characterRotation = useRef(0)
  const walkCycle = useRef(0)
  const isMoving = useRef(false)

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

    const handleClick = (e: MouseEvent) => {
      if (!isPlaying || !rigidBodyRef.current) return

      // Get player position
      const pos = rigidBodyRef.current.translation()
      
      // Calculate arrow spawn position (in front of player)
      const spawnDistance = 1.5
      const spawnHeight = 1.5 // Height at which arrow spawns
      const arrowPosition: [number, number, number] = [
        pos.x - Math.sin(cameraRotation.current.horizontal) * spawnDistance,
        pos.y + spawnHeight,
        pos.z - Math.cos(cameraRotation.current.horizontal) * spawnDistance
      ]

      // Calculate direction based on camera rotation
      const direction = new Vector3(
        -Math.sin(cameraRotation.current.horizontal),
        Math.tan(cameraRotation.current.vertical),
        -Math.cos(cameraRotation.current.horizontal)
      )
      direction.normalize()

      const arrowDirection: [number, number, number] = [direction.x, direction.y, direction.z]

      // Shoot the arrow
      shootArrow(arrowPosition, arrowDirection)
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("keyup", handleKeyUp)
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("click", handleClick)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("keyup", handleKeyUp)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("click", handleClick)
    }
  }, [isPlaying, shootArrow])

  useFrame((state, delta) => {
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

    const moving = direction.length() > 0
    isMoving.current = moving

    if (moving) {
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

    // Update walk cycle based on actual speed and delta time
    if (isMoving.current && isOnGround.current) {
      // Make walk cycle speed proportional to movement speed
      const cycleSpeed = speed / MOVE_SPEED // 1.0 for walking, 1.6 for sprinting
      walkCycle.current += delta * cycleSpeed * 8 // Multiply by 8 for good animation speed
    } else {
      // Reset walk cycle when not moving for smooth start
      walkCycle.current = 0
    }

    // Update character rotation
    if (characterRef.current) {
      characterRef.current.rotation.y = characterRotation.current
    }

    // Animate legs and arms
    if (isMoving.current && isOnGround.current) {
      const legSwing = Math.sin(walkCycle.current) * 0.6
      const armSwing = Math.sin(walkCycle.current) * 0.4
      const bodyBob = Math.abs(Math.sin(walkCycle.current * 2)) * 0.08

      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = -legSwing
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = legSwing
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = armSwing
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -armSwing
      }
      if (bodyRef.current) {
        bodyRef.current.position.y = bodyBob
      }
    } else {
      // Reset animations when not moving
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = 0
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = 0
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = 0
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = 0
      }
      if (bodyRef.current) {
        bodyRef.current.position.y = 0
      }
    }

    // Update camera position for 3rd person view
    const pos = rb.translation()
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

    // Look at character
    camera.lookAt(pos.x, pos.y + 1, pos.z)
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
        <LinkCharacter 
          leftLegRef={leftLegRef}
          rightLegRef={rightLegRef}
          leftArmRef={leftArmRef}
          rightArmRef={rightArmRef}
          bodyRef={bodyRef}
        />
      </group>
    </RigidBody>
  )
}
