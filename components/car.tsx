"use client"

import { useEffect, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"
import { Quaternion, Vector3 } from "three"
import { useGameStore } from "@/lib/game-store"

const CAR_ACCELERATION = 28
const CAR_MAX_SPEED = 18
const CAR_DRAG = 4
const CAR_TURN_RATE = 1.8
const UP_AXIS = new Vector3(0, 1, 0)

export function Car() {
  const rigidBodyRef = useRef<any>(null)
  const { camera } = useThree()
  const isPlaying = useGameStore((state) => state.isPlaying)
  const isDrivingCar = useGameStore((state) => state.isDrivingCar)
  const enterCar = useGameStore((state) => state.enterCar)
  const exitCar = useGameStore((state) => state.exitCar)

  const controls = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  })
  const headingRef = useRef(0)
  const speedRef = useRef(0)
  const quaternion = useRef(new Quaternion())
  const forwardVector = useRef(new Vector3(0, 0, 1))
  const offsetVector = useRef(new Vector3())
  const targetVector = useRef(new Vector3())
  const cameraFollowOffset = useRef(new Vector3(0, 2.5, 6))

  const canEnterCar = () => {
    if (!rigidBodyRef.current) return false

    const carPos = rigidBodyRef.current.translation()
    const dx = camera.position.x - carPos.x
    const dy = camera.position.y - (carPos.y + 0.5)
    const dz = camera.position.z - carPos.z
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

    return distance < 4
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return

      if (e.code === "KeyV") {
        e.preventDefault()
        if (isDrivingCar) {
          exitCar()
        } else if (canEnterCar()) {
          enterCar()
        }
        return
      }

      if (!isDrivingCar) return

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
      if (!isDrivingCar) return

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
  }, [isPlaying, isDrivingCar, enterCar, exitCar, camera])

  useEffect(() => {
    if (!isDrivingCar) {
      controls.current.forward = false
      controls.current.backward = false
      controls.current.left = false
      controls.current.right = false
    }
  }, [isDrivingCar])

  useEffect(() => {
    if (!isPlaying && isDrivingCar) {
      exitCar()
    }
  }, [isPlaying, isDrivingCar, exitCar])

  useFrame((_, delta) => {
    const body = rigidBodyRef.current
    if (!body) return

    const linvel = body.linvel()
    let speed = speedRef.current

    if (isDrivingCar) {
      const throttle = (controls.current.forward ? 1 : 0) - (controls.current.backward ? 1 : 0)

      if (throttle !== 0) {
        const accel = throttle > 0 ? CAR_ACCELERATION : CAR_ACCELERATION * 0.6
        speed += throttle * accel * delta
      } else {
        const dragFactor = Math.max(0, 1 - CAR_DRAG * delta)
        speed *= dragFactor
        if (Math.abs(speed) < 0.1) speed = 0
      }

      const maxReverse = CAR_MAX_SPEED * 0.5
      speed = Math.min(CAR_MAX_SPEED, Math.max(-maxReverse, speed))

      const turnInput = (controls.current.left ? 1 : 0) - (controls.current.right ? 1 : 0)
      if (turnInput !== 0 && Math.abs(speed) > 0.25) {
        const speedFactor = Math.min(1, Math.abs(speed) / CAR_MAX_SPEED)
        const directionSign = speed >= 0 ? 1 : -1
        headingRef.current += turnInput * CAR_TURN_RATE * delta * speedFactor * directionSign
      }
    } else {
      const passiveDrag = Math.max(0, 1 - CAR_DRAG * delta * 0.5)
      speed *= passiveDrag
      if (Math.abs(speed) < 0.05) speed = 0
    }

    speedRef.current = speed

    forwardVector.current.set(Math.sin(headingRef.current), 0, Math.cos(headingRef.current)).normalize()

    body.setLinvel(
      {
        x: forwardVector.current.x * speedRef.current,
        y: linvel.y,
        z: forwardVector.current.z * speedRef.current,
      },
      true,
    )

    quaternion.current.setFromAxisAngle(UP_AXIS, headingRef.current)
    body.setRotation(quaternion.current, true)

    const translation = body.translation()

    if (isDrivingCar) {
      targetVector.current.set(translation.x, translation.y + 0.8, translation.z)
      offsetVector.current.copy(cameraFollowOffset.current).applyAxisAngle(UP_AXIS, headingRef.current)

      camera.position.set(
        targetVector.current.x - offsetVector.current.x,
        targetVector.current.y + offsetVector.current.y,
        targetVector.current.z - offsetVector.current.z,
      )

      camera.lookAt(targetVector.current)
    }
  })

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={[2, 1, -6]}
      colliders="cuboid"
      type="dynamic"
      mass={12}
      enabledRotations={[false, true, false]}
      linearDamping={0.4}
      angularDamping={2}
      friction={2}
    >
      <group>
        {/* Main chassis */}
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.5, 3.2]} />
          <meshStandardMaterial color="#1f2937" metalness={0.1} roughness={0.8} />
        </mesh>

        {/* Cabin */}
        <mesh position={[0, 1.1, -0.1]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.6, 1.8]} />
          <meshStandardMaterial color="#3b82f6" metalness={0.2} roughness={0.4} />
        </mesh>

        {/* Hood accent */}
        <mesh position={[0, 0.85, 1]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.2, 1]} />
          <meshStandardMaterial color="#2563eb" metalness={0.2} roughness={0.3} />
        </mesh>

        {/* Wheels */}
        {[
          [-0.9, 0.3, 1.2],
          [0.9, 0.3, 1.2],
          [-0.9, 0.3, -1.2],
          [0.9, 0.3, -1.2],
        ].map(([x, y, z], index) => (
          <mesh key={index} position={[x, y, z]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
            <cylinderGeometry args={[0.35, 0.35, 0.25, 16]} />
            <meshStandardMaterial color="#111827" roughness={0.9} />
          </mesh>
        ))}

        {/* Headlights */}
        {[[-0.4, 0.7, 1.7], [0.4, 0.7, 1.7]].map((pos, index) => (
          <mesh key={`light-${index}`} position={pos as [number, number, number]}>
            <boxGeometry args={[0.2, 0.15, 0.1]} />
            <meshStandardMaterial color="#fde68a" emissive="#fef3c7" emissiveIntensity={1.5} />
          </mesh>
        ))}
      </group>
    </RigidBody>
  )
}
