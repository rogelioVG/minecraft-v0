"use client"

import { useEffect, useMemo, useRef } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"
import { Quaternion, Vector3, Group, Mesh } from "three"
import { useGameStore, type HorseId } from "@/lib/game-store"

interface HorseProps {
  id: HorseId
  position: [number, number, number]
  color: string
  maneColor?: string
  anchorPosition: [number, number, number]
}

const HORSE_ACCELERATION = 12
const HORSE_MAX_SPEED = 10
const HORSE_DRAG = 3
const HORSE_TURN_RATE = 2.4
const UP_AXIS = new Vector3(0, 1, 0)

export function Horse({ id, position, color, maneColor = "#2d261c", anchorPosition }: HorseProps) {
  const rigidBodyRef = useRef<any>(null)
  const headRef = useRef<Group>(null)
  const ropeRef = useRef<Mesh>(null)
  const { camera } = useThree()
  const isPlaying = useGameStore((state) => state.isPlaying)
  const isRidingHorse = useGameStore((state) => state.isRidingHorse)
  const mountedHorseId = useGameStore((state) => state.mountedHorseId)
  const horseState = useGameStore((state) => state.horseStates[id])
  const enterHorse = useGameStore((state) => state.enterHorse)
  const exitHorse = useGameStore((state) => state.exitHorse)
  const toggleHorseLasso = useGameStore((state) => state.toggleHorseLasso)
  const isMounted = isRidingHorse && mountedHorseId === id
  const lassoed = horseState?.isLassoed ?? true
  const controls = useRef({ forward: false, backward: false, left: false, right: false })
  const headingRef = useRef(0)
  const speedRef = useRef(0)
  const bobRef = useRef(Math.random() * Math.PI * 2)
  const anchorVector = useMemo(() => new Vector3(...anchorPosition), [anchorPosition])
  const followOffset = useRef(new Vector3(0, 1.6, 5))
  const cameraTarget = useRef(new Vector3())

  const canInteract = () => {
    if (!rigidBodyRef.current) return false
    const playerPos = useGameStore.getState().playerPosition
    const horsePos = rigidBodyRef.current.translation()
    const dx = playerPos[0] - horsePos.x
    const dy = playerPos[1] - (horsePos.y + 1)
    const dz = playerPos[2] - horsePos.z
    return Math.sqrt(dx * dx + dy * dy + dz * dz) < 3
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyH") {
        if (isMounted) {
          e.preventDefault()
          exitHorse()
          return
        }
        if (isPlaying && canInteract()) {
          e.preventDefault()
          enterHorse(id)
        }
      }

      if (e.code === "KeyL" && isPlaying && canInteract()) {
        e.preventDefault()
        toggleHorseLasso(id)
      }

      if (!isMounted) return

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
      if (!isMounted) return

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
  }, [id, isMounted, isPlaying, enterHorse, exitHorse, toggleHorseLasso])

  useEffect(() => {
    if (!isPlaying && isMounted) {
      exitHorse()
    }
  }, [isPlaying, isMounted, exitHorse])

  useEffect(() => {
    if (!isMounted) {
      controls.current.forward = false
      controls.current.backward = false
      controls.current.left = false
      controls.current.right = false
    }
  }, [isMounted])

  useFrame((_, delta) => {
    const body = rigidBodyRef.current
    if (!body) return

    let speed = speedRef.current

    if (isMounted) {
      const throttle = (controls.current.forward ? 1 : 0) - (controls.current.backward ? 1 : 0)
      if (throttle !== 0) {
        speed += throttle * HORSE_ACCELERATION * delta
      } else {
        speed *= Math.max(0, 1 - HORSE_DRAG * delta)
      }

      const turnInput = (controls.current.left ? 1 : 0) - (controls.current.right ? 1 : 0)
      if (turnInput !== 0 && Math.abs(speed) > 0.2) {
        const directionSign = speed >= 0 ? 1 : -1
        headingRef.current += turnInput * HORSE_TURN_RATE * delta * directionSign
      }
    } else {
      speed *= Math.max(0, 1 - HORSE_DRAG * delta * 2)
      if (Math.abs(speed) < 0.05) speed = 0
    }

    const maxReverse = HORSE_MAX_SPEED * 0.4
    speed = Math.min(HORSE_MAX_SPEED, Math.max(-maxReverse, speed))
    speedRef.current = speed

    const forward = new Vector3(Math.sin(headingRef.current), 0, Math.cos(headingRef.current)).normalize()
    const linvel = body.linvel()
    body.setLinvel(
      {
        x: forward.x * speed,
        y: linvel.y,
        z: forward.z * speed,
      },
      true,
    )

    const horseQuaternion = new Quaternion().setFromAxisAngle(UP_AXIS, headingRef.current)
    body.setRotation(horseQuaternion, true)

    // bobbing animation
    bobRef.current += delta * (Math.abs(speed) > 0.1 ? 6 : 2)
    const bobOffset = Math.sin(bobRef.current) * (Math.abs(speed) > 0.1 ? 0.08 : 0.03)
    if (headRef.current) {
      headRef.current.position.y = 1.4 + bobOffset
      headRef.current.rotation.x = 0.1 + bobOffset * 0.5
    }

    // camera follow
    if (isMounted) {
      const translation = body.translation()
      cameraTarget.current.set(translation.x, translation.y + 1.4, translation.z)
      const offset = followOffset.current.clone().applyAxisAngle(UP_AXIS, headingRef.current)
      camera.position.set(
        cameraTarget.current.x - offset.x,
        cameraTarget.current.y + offset.y,
        cameraTarget.current.z - offset.z,
      )
      camera.lookAt(cameraTarget.current)
    }

    // Rope update
    if (ropeRef.current) {
      if (!lassoed || !body) {
        ropeRef.current.visible = false
      } else {
        const horsePos = body.translation()
        const end = new Vector3(horsePos.x, horsePos.y + 1, horsePos.z)
        const start = anchorVector
        const diff = new Vector3().subVectors(end, start)
        const length = diff.length()
        const midpoint = new Vector3().addVectors(start, end).multiplyScalar(0.5)
        ropeRef.current.visible = true
        ropeRef.current.position.copy(midpoint)

        const ropeQuaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), diff.normalize())
        ropeRef.current.setRotationFromQuaternion(ropeQuaternion)
        ropeRef.current.scale.set(1, length, 1)
      }
    }
  })

  return (
    <>
      {/* hitching post */}
      <mesh position={anchorPosition} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.1, 1.6, 12]} />
        <meshStandardMaterial color="#8b5a2b" />
      </mesh>

      <RigidBody
        ref={rigidBodyRef}
        type="dynamic"
        colliders="cuboid"
        mass={250}
        position={position}
        enabledRotations={[false, true, false]}
        linearDamping={1.2}
        angularDamping={2}
        friction={2}
      >
        <group>
          {/* Body */}
          <mesh position={[0, 1, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.5, 0.9, 0.6]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>

          {/* Neck and head */}
          <group ref={headRef} position={[0, 1.4, 0.4]}>
            <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.4, 0.5, 0.4]} />
              <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0, 0.65, 0.1]} castShadow receiveShadow>
              <boxGeometry args={[0.3, 0.3, 0.6]} />
              <meshStandardMaterial color={color} />
            </mesh>
            {/* mane */}
            <mesh position={[0, 0.65, -0.1]} castShadow>
              <boxGeometry args={[0.15, 0.4, 0.5]} />
              <meshStandardMaterial color={maneColor} />
            </mesh>
          </group>

          {/* Legs */}
          {[
            [-0.5, 0, -0.2],
            [0.5, 0, -0.2],
            [-0.5, 0, 0.2],
            [0.5, 0, 0.2],
          ].map(([x, y, z], index) => (
            <mesh key={`leg-${index}`} position={[x, 0.35, z]} castShadow receiveShadow>
              <boxGeometry args={[0.2, 0.7, 0.2]} />
              <meshStandardMaterial color={color} />
            </mesh>
          ))}

          {/* Tail */}
          <mesh position={[0, 1.2, -0.4]} castShadow>
            <boxGeometry args={[0.2, 0.7, 0.2]} />
            <meshStandardMaterial color={maneColor} />
          </mesh>

          {/* Saddle */}
          <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.9, 0.2, 0.7]} />
            <meshStandardMaterial color="#4f1f0f" />
          </mesh>

          {/* Rope visual */}
          <mesh ref={ropeRef} visible={false}>
            <cylinderGeometry args={[0.04, 0.04, 1, 8]} />
            <meshStandardMaterial color="#d8b26f" />
          </mesh>
        </group>
      </RigidBody>
    </>
  )
}
