"use client"

import { useRef, useEffect } from "react"
import { RigidBody } from "@react-three/rapier"
import { Vector3 } from "three"
import { useFrame } from "@react-three/fiber"

interface ArrowProps {
  id: string
  position: [number, number, number]
  direction: [number, number, number]
  onHit?: (id: string) => void
}

export function Arrow({ id, position, direction, onHit }: ArrowProps) {
  const rigidBodyRef = useRef<any>(null)
  const lifetime = useRef(0)
  const MAX_LIFETIME = 5 // 5 seconds before arrow disappears

  useEffect(() => {
    if (rigidBodyRef.current) {
      // Set initial velocity
      const velocity = new Vector3(...direction).multiplyScalar(25) // Arrow speed
      rigidBodyRef.current.setLinvel(velocity, true)
    }
  }, [direction])

  useFrame((state, delta) => {
    lifetime.current += delta
    
    // Remove arrow after lifetime expires
    if (lifetime.current > MAX_LIFETIME && onHit) {
      onHit(id)
    }

    // Rotate arrow to face direction of travel
    if (rigidBodyRef.current) {
      const vel = rigidBodyRef.current.linvel()
      const velocity = new Vector3(vel.x, vel.y, vel.z)
      
      if (velocity.length() > 0.1) {
        const rb = rigidBodyRef.current
        const angle = Math.atan2(velocity.x, velocity.z)
        const pitch = Math.atan2(velocity.y, Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z))
        
        rb.setRotation({ x: -pitch, y: angle, z: 0, w: 1 }, true)
      }
    }
  })

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      colliders="cuboid"
      type="dynamic"
      mass={0.1}
      gravityScale={0.5}
      onCollisionEnter={() => {
        if (onHit) {
          onHit(id)
        }
      }}
    >
      {/* Arrow shaft */}
      <mesh castShadow>
        <boxGeometry args={[0.1, 0.1, 0.8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Arrow tip */}
      <mesh position={[0, 0, -0.45]} castShadow>
        <coneGeometry args={[0.1, 0.2, 4]} />
        <meshStandardMaterial color="#808080" />
      </mesh>
      
      {/* Fletching */}
      <mesh position={[0, 0, 0.4]} castShadow>
        <boxGeometry args={[0.01, 0.15, 0.15]} />
        <meshStandardMaterial color="#FF0000" />
      </mesh>
      <mesh position={[0, 0, 0.4]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <boxGeometry args={[0.01, 0.15, 0.15]} />
        <meshStandardMaterial color="#FF0000" />
      </mesh>
    </RigidBody>
  )
}
