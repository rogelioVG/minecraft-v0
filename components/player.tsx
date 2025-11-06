"use client"

import { useRef, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { RigidBody, CapsuleCollider } from "@react-three/rapier"
import { Vector3 } from "three"
import { useGameStore, type BlockType } from "@/lib/game-store"

const MOVE_SPEED = 5
const SPRINT_SPEED = 8
const JUMP_FORCE = 8

const BLOCK_TYPES: BlockType[] = ["grass", "dirt", "stone", "wood", "sand"]

export function Player() {
  const { camera } = useThree()
  const rigidBodyRef = useRef<any>(null)
  const isOnGround = useRef(false)
  const velocity = useRef(new Vector3())
  const { isPlaying, setSelectedBlockType } = useGameStore()

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
        case "Numpad1":
          setSelectedBlockType(BLOCK_TYPES[0])
          break
        case "Digit2":
        case "Numpad2":
          setSelectedBlockType(BLOCK_TYPES[1])
          break
        case "Digit3":
        case "Numpad3":
          setSelectedBlockType(BLOCK_TYPES[2])
          break
        case "Digit4":
        case "Numpad4":
          setSelectedBlockType(BLOCK_TYPES[3])
          break
        case "Digit5":
        case "Numpad5":
          setSelectedBlockType(BLOCK_TYPES[4])
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

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("keyup", handleKeyUp)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("keyup", handleKeyUp)
    }
  }, [isPlaying, setSelectedBlockType])

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

    if (direction.length() > 0) {
      direction.normalize()
      direction.applyEuler(camera.rotation)
      direction.y = 0
      direction.normalize()
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

    // Update camera position
    const pos = rb.translation()
    camera.position.set(pos.x, pos.y + 0.5, pos.z)
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
    </RigidBody>
  )
}
