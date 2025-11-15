"use client"

import { useRef, useEffect, useState } from "react"
import { RigidBody } from "@react-three/rapier"
import { Vector3 } from "three"
import { useFrame } from "@react-three/fiber"
import { useGameStore } from "@/lib/game-store"

interface BombProps {
  id: string
  position: [number, number, number]
  direction: [number, number, number]
  onDetonate?: (id: string) => void
}

export function Bomb({ id, position, direction, onDetonate }: BombProps) {
  const rigidBodyRef = useRef<any>(null)
  const lifetime = useRef(0)
  const DETONATION_TIME = 2 // 2 seconds before bomb detonates
  const [isExploding, setIsExploding] = useState(false)
  const explosionTimer = useRef(0)
  const hasTriggeredExplosion = useRef(false)
  const { triggerExplosion } = useGameStore()

  useEffect(() => {
    if (rigidBodyRef.current) {
      // Set initial velocity - bombs are thrown in an arc
      const velocity = new Vector3(...direction).multiplyScalar(15) // Throw speed
      rigidBodyRef.current.setLinvel(velocity, true)
    }
  }, [direction])

  useFrame((state, delta) => {
    lifetime.current += delta
    
    // Detonate after 2 seconds
    if (lifetime.current >= DETONATION_TIME && !isExploding) {
      setIsExploding(true)
      explosionTimer.current = 0
      
      // Trigger explosion physics
      if (!hasTriggeredExplosion.current && rigidBodyRef.current) {
        const pos = rigidBodyRef.current.translation()
        const explosionPos: [number, number, number] = [pos.x, pos.y, pos.z]
        // Trigger explosion with force 20 and radius 8
        triggerExplosion(explosionPos, 20, 8)
        hasTriggeredExplosion.current = true
      }
    }

    // Handle explosion animation
    if (isExploding) {
      explosionTimer.current += delta
      
      // Remove bomb after explosion animation (0.5 seconds)
      if (explosionTimer.current > 0.5 && onDetonate) {
        onDetonate(id)
      }
    }

    // Make bomb blink faster as it approaches detonation
    const blinkSpeed = lifetime.current / DETONATION_TIME * 10
  })

  // Calculate blink effect
  const shouldBlink = Math.sin(lifetime.current * 10) > 0

  // Calculate explosion scale
  const explosionScale = isExploding ? Math.min(explosionTimer.current * 10, 3) : 1

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      colliders="ball"
      type="dynamic"
      mass={0.5}
      gravityScale={1.5}
      restitution={0.3} // Some bounce
    >
      {!isExploding ? (
        <group>
            {/* Main bomb body - blue sphere */}
          <mesh castShadow>
            <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial color={shouldBlink ? "#6ec1ff" : "#1a3d7c"} />
          </mesh>
          
          {/* Fuse - small cylinder on top */}
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          
            {/* Fuse spark - glowing tip that blinks */}
          <mesh position={[0, 0.38, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial 
                color="#66ccff" 
                emissive="#1e90ff"
              emissiveIntensity={shouldBlink ? 2 : 0.5}
            />
          </mesh>
          
          {/* Point light for spark glow */}
          <pointLight 
            position={[0, 0.38, 0]} 
            intensity={shouldBlink ? 2 : 0.5} 
            distance={2} 
              color="#66ccff"
          />
        </group>
      ) : (
        <group>
            {/* Explosion effect - expanding spheres */}
          <mesh scale={explosionScale}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial 
                color="#66ccff" 
                emissive="#1e90ff"
              emissiveIntensity={3 - explosionTimer.current * 5}
              transparent
              opacity={Math.max(0, 1 - explosionTimer.current * 2)}
            />
          </mesh>
          
          {/* Outer explosion ring */}
          <mesh scale={explosionScale * 1.3}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial 
                color="#a0e5ff" 
                emissive="#66ccff"
              emissiveIntensity={2 - explosionTimer.current * 4}
              transparent
              opacity={Math.max(0, 0.5 - explosionTimer.current)}
            />
          </mesh>
          
          {/* Explosion light */}
          <pointLight 
            intensity={10 * (1 - explosionTimer.current * 2)} 
            distance={10} 
              color="#66ccff"
          />
        </group>
      )}
    </RigidBody>
  )
}
