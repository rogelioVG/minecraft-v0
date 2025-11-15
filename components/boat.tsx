"use client"

import { useEffect, useRef } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"
import { Quaternion, Vector3 } from "three"
import { useGameStore } from "@/lib/game-store"

interface BoatProps {
  position: [number, number, number]
  bounds: {
    minX: number
    maxX: number
    minZ: number
    maxZ: number
  }
  waterLevel?: number
}

const BOAT_ACCELERATION = 6
const BOAT_MAX_SPEED = 7
const BOAT_TURN_RATE = 1.6
const BOAT_DRAG = 2
const FISH_OPTIONS = ["lobina rayada", "bagre azul", "tilapia sonorense", "mojarra del Yaqui", "dorado juvenil"]
const UP_AXIS = new Vector3(0, 1, 0)

export function Boat({ position, bounds, waterLevel = position[1] }: BoatProps) {
  const rigidBodyRef = useRef<any>(null)
  const { camera } = useThree()
  const isPlaying = useGameStore((state) => state.isPlaying)
  const isOnBoat = useGameStore((state) => state.isOnBoat)
  const enterBoat = useGameStore((state) => state.enterBoat)
  const exitBoat = useGameStore((state) => state.exitBoat)
  const setLastCatch = useGameStore((state) => state.setLastCatch)
  const controls = useRef({ forward: false, backward: false, left: false, right: false })
  const headingRef = useRef(0)
  const speedRef = useRef(0)
  const fishingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cameraOffset = useRef(new Vector3(0, 2.2, 6))

  const canBoard = () => {
    if (!rigidBodyRef.current) return false
    const playerPos = useGameStore.getState().playerPosition
    const boatPos = rigidBodyRef.current.translation()
    const dx = playerPos[0] - boatPos.x
    const dy = playerPos[1] - boatPos.y
    const dz = playerPos[2] - boatPos.z
    return Math.sqrt(dx * dx + dy * dy + dz * dz) < 4
  }

  const startFishing = () => {
    if (fishingTimeout.current) return
    setLastCatch("Lanzaste la línea... aguardando.")
    fishingTimeout.current = setTimeout(() => {
      const catchName = FISH_OPTIONS[Math.floor(Math.random() * FISH_OPTIONS.length)]
      setLastCatch(`¡Pescaste una ${catchName}!`)
      fishingTimeout.current = null
    }, 1800 + Math.random() * 1500)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return

      if (e.code === "KeyB") {
        e.preventDefault()
        if (isOnBoat) {
          exitBoat()
        } else if (canBoard()) {
          enterBoat()
        }
        return
      }

      if (!isOnBoat) return

      if (e.code === "KeyF") {
        e.preventDefault()
        startFishing()
        return
      }

      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          controls.current.forward = true
          break
        case "KeyS":
        case "ArrowDown":
          controls.current.backward = true
          break
        case "KeyA":
        case "ArrowLeft":
          controls.current.left = true
          break
        case "KeyD":
        case "ArrowRight":
          controls.current.right = true
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!isOnBoat) return

      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          controls.current.forward = false
          break
        case "KeyS":
        case "ArrowDown":
          controls.current.backward = false
          break
        case "KeyA":
        case "ArrowLeft":
          controls.current.left = false
          break
        case "KeyD":
        case "ArrowRight":
          controls.current.right = false
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("keyup", handleKeyUp)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("keyup", handleKeyUp)
    }
  }, [isPlaying, isOnBoat, enterBoat, exitBoat, setLastCatch])

  useEffect(() => {
    if (!isPlaying && isOnBoat) {
      exitBoat()
    }
  }, [isPlaying, isOnBoat, exitBoat])

  useEffect(() => {
    if (!isOnBoat) {
      if (fishingTimeout.current) {
        clearTimeout(fishingTimeout.current)
        fishingTimeout.current = null
      }
      setLastCatch(null)
    }
  }, [isOnBoat, setLastCatch])

  useEffect(() => {
    return () => {
      if (fishingTimeout.current) {
        clearTimeout(fishingTimeout.current)
      }
    }
  }, [])

  useFrame((_, delta) => {
    const body = rigidBodyRef.current
    if (!body) return

    let speed = speedRef.current

    if (isOnBoat) {
      const throttle = (controls.current.forward ? 1 : 0) - (controls.current.backward ? 1 : 0)
      if (throttle !== 0) {
        speed += throttle * BOAT_ACCELERATION * delta
      } else {
        speed *= Math.max(0, 1 - BOAT_DRAG * delta)
      }

      const turnInput = (controls.current.left ? 1 : 0) - (controls.current.right ? 1 : 0)
      if (turnInput !== 0 && Math.abs(speed) > 0.1) {
        const directionSign = speed >= 0 ? 1 : -1
        headingRef.current += turnInput * BOAT_TURN_RATE * delta * directionSign
      }
    } else {
      speed *= Math.max(0, 1 - BOAT_DRAG * delta * 1.5)
      if (Math.abs(speed) < 0.05) speed = 0
    }

    speed = Math.min(BOAT_MAX_SPEED, Math.max(-BOAT_MAX_SPEED * 0.4, speed))
    speedRef.current = speed

    const forward = new Vector3(Math.sin(headingRef.current), 0, Math.cos(headingRef.current))
    body.setLinvel(
      {
        x: forward.x * speed,
        y: 0,
        z: forward.z * speed,
      },
      true,
    )
    const quat = new Quaternion().setFromAxisAngle(UP_AXIS, headingRef.current)
    body.setRotation(quat, true)

    // Clamp within reservoir
    const translation = body.translation()
    const clampedX = Math.min(bounds.maxX, Math.max(bounds.minX, translation.x))
    const clampedZ = Math.min(bounds.maxZ, Math.max(bounds.minZ, translation.z))
    body.setTranslation({ x: clampedX, y: waterLevel, z: clampedZ }, true)

    if (isOnBoat) {
      const target = new Vector3(clampedX, waterLevel + 0.5, clampedZ)
      const offset = cameraOffset.current.clone().applyAxisAngle(UP_AXIS, headingRef.current)
      camera.position.set(target.x - offset.x, target.y + offset.y, target.z - offset.z)
      camera.lookAt(target)
    }
  })

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="dynamic"
      position={position}
      colliders="cuboid"
      enabledRotations={[false, true, false]}
      linearDamping={1.5}
      angularDamping={2}
      friction={0.8}
    >
      <group>
        {/* Hull */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2, 0.5, 5]} />
          <meshStandardMaterial color="#5e5a4d" />
        </mesh>
        {/* Deck */}
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.2, 4.6]} />
          <meshStandardMaterial color="#c9b06f" />
        </mesh>
        {/* Bow rail */}
        <mesh position={[0, 0.8, 2.2]}>
          <boxGeometry args={[1.4, 0.1, 0.1]} />
          <meshStandardMaterial color="#dedede" />
        </mesh>
        {/* Mast */}
        <mesh position={[0, 1.2, -1]}>
          <cylinderGeometry args={[0.07, 0.07, 1.5, 8]} />
          <meshStandardMaterial color="#d1c6a5" />
        </mesh>
        {/* Shade */}
        <mesh position={[0, 1.4, -1]} castShadow>
          <boxGeometry args={[1.5, 0.05, 1.5]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        {/* Cooler */}
        <mesh position={[-0.5, 0.55, 0.8]} castShadow>
          <boxGeometry args={[0.6, 0.4, 0.5]} />
          <meshStandardMaterial color="#f1f5f9" />
        </mesh>
      </group>
    </RigidBody>
  )
}
