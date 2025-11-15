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
const CAMERA_HEIGHT_OFFSET = 0.5 // Height above player capsule center for first-person view

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
  const isPlaying = useGameStore((state) => state.isPlaying)
  const throwBomb = useGameStore((state) => state.throwBomb)
  const explosionForces = useGameStore((state) => state.explosionForces)
  const isDrivingCar = useGameStore((state) => state.isDrivingCar)
  const cameraRotation = useRef({ horizontal: 0, vertical: 0.3 })
  const characterRotation = useRef(0)
  const walkCycle = useRef(0)
  const isMoving = useRef(false)
  const hasProcessedExplosions = useRef(new Set<string>())
  const storedPosition = useRef<[number, number, number] | null>(null)

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
      if (!isPlaying || isDrivingCar) return

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
      if (isDrivingCar) return

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
      if (!isPlaying || isDrivingCar) return

      const sensitivity = 0.002
      cameraRotation.current.horizontal -= e.movementX * sensitivity
      cameraRotation.current.vertical -= e.movementY * sensitivity

      // Clamp vertical rotation
      cameraRotation.current.vertical = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, cameraRotation.current.vertical))
    }

    const handleClick = () => {
      if (!isPlaying) return

      // Get the direction the camera is currently facing (screen center)
      const direction = new Vector3()
      camera.getWorldDirection(direction)
      direction.normalize()

      // Spawn bombs from the middle of the camera view so they travel straight ahead
      const spawnDistance = 1.5
      const bombPosition: [number, number, number] = [
        camera.position.x + direction.x * spawnDistance,
        camera.position.y + direction.y * spawnDistance,
        camera.position.z + direction.z * spawnDistance,
      ]

      const bombDirection: [number, number, number] = [direction.x, direction.y, direction.z]

      // Throw the bomb
      throwBomb(bombPosition, bombDirection)
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
  }, [isPlaying, isDrivingCar, throwBomb, camera])

  // Temporarily park the player body when they hop into the car
  useEffect(() => {
    if (!rigidBodyRef.current) return

    if (isDrivingCar) {
      const current = rigidBodyRef.current.translation()
      storedPosition.current = [current.x, current.y, current.z]
      rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
      rigidBodyRef.current.setBodyType("kinematicPosition", true)

      movement.current.forward = false
      movement.current.backward = false
      movement.current.left = false
      movement.current.right = false
      movement.current.jump = false
      movement.current.sprint = false
    } else {
      rigidBodyRef.current.setBodyType("dynamic", true)

      if (storedPosition.current) {
        rigidBodyRef.current.setTranslation(
          {
            x: storedPosition.current[0],
            y: storedPosition.current[1],
            z: storedPosition.current[2],
          },
          true,
        )
      }
    }
  }, [isDrivingCar])

  useFrame((_, delta) => {
    if (!rigidBodyRef.current || !isPlaying) return
    if (isDrivingCar) return

    const rb = rigidBodyRef.current
    const vel = rb.linvel()
    velocity.current.set(vel.x, vel.y, vel.z)

    // Check if on ground
    isOnGround.current = Math.abs(vel.y) < 0.1

    // Check for explosions and apply knockback
    if (explosionForces.length > 0) {
      const playerPos = rb.translation()
      
      explosionForces.forEach((explosion) => {
        // Create unique ID for this explosion
        const explosionId = `${explosion.position[0]}-${explosion.position[1]}-${explosion.position[2]}`
        
        // Only process each explosion once
        if (!hasProcessedExplosions.current.has(explosionId)) {
          const distance = Math.sqrt(
            Math.pow(playerPos.x - explosion.position[0], 2) +
            Math.pow(playerPos.y - explosion.position[1], 2) +
            Math.pow(playerPos.z - explosion.position[2], 2)
          )
          
          if (distance < explosion.radius) {
            // Apply impulse away from explosion
            const direction = new Vector3(
              playerPos.x - explosion.position[0],
              playerPos.y - explosion.position[1],
              playerPos.z - explosion.position[2]
            ).normalize()
            
            // Force decreases with distance
            const forceMagnitude = explosion.force * (1 - distance / explosion.radius) * 1.5 // Increased multiplier
            
            rb.applyImpulse({
              x: direction.x * forceMagnitude,
              y: direction.y * forceMagnitude + 12, // Increased upward boost for more dramatic effect
              z: direction.z * forceMagnitude,
            }, true)
          }
          
          hasProcessedExplosions.current.add(explosionId)
        }
      })
    }

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

    // Update camera position for first-person view
    const pos = rb.translation()
    
    // Position camera at player's head height
    camera.position.set(
      pos.x,
      pos.y + CAMERA_HEIGHT_OFFSET,
      pos.z
    )

    // Set camera rotation based on mouse movement
    camera.rotation.order = 'YXZ'
    camera.rotation.y = cameraRotation.current.horizontal
    camera.rotation.x = cameraRotation.current.vertical
  })

  // Clear processed explosions when new ones come in
  useEffect(() => {
    if (explosionForces.length === 0) {
      hasProcessedExplosions.current.clear()
    }
  }, [explosionForces])

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
      {/* Hide character in first-person mode */}
      <group ref={characterRef} position={[0, -0.5, 0]} visible={false}>
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
