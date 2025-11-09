"use client"

import { useRef, useEffect, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useGameStore } from "@/lib/game-store"

interface ExplosionEffectProps {
  id: string
  position: [number, number, number]
  onComplete: () => void
}

export function ExplosionEffect({ id, position, onComplete }: ExplosionEffectProps) {
  const particlesRef = useRef<THREE.Points>(null)
  const smokeRef = useRef<THREE.Points>(null)
  const startTime = useRef(Date.now())
  const DURATION = 2000 // 2 seconds

  // Create explosion particles
  const explosionParticles = useMemo(() => {
    const count = 50
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      // Random direction
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const speed = 2 + Math.random() * 3

      positions[i * 3] = position[0]
      positions[i * 3 + 1] = position[1]
      positions[i * 3 + 2] = position[2]

      velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed
      velocities[i * 3 + 1] = Math.cos(phi) * speed
      velocities[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed

      // Fire colors: orange to red
      const colorChoice = Math.random()
      if (colorChoice < 0.3) {
        // Red
        colors[i * 3] = 1
        colors[i * 3 + 1] = 0.2
        colors[i * 3 + 2] = 0
      } else if (colorChoice < 0.6) {
        // Orange
        colors[i * 3] = 1
        colors[i * 3 + 1] = 0.5
        colors[i * 3 + 2] = 0
      } else {
        // Yellow
        colors[i * 3] = 1
        colors[i * 3 + 1] = 1
        colors[i * 3 + 2] = 0
      }
    }

    return { positions, velocities, colors, count }
  }, [position])

  // Create smoke particles
  const smokeParticles = useMemo(() => {
    const count = 30
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = position[0] + (Math.random() - 0.5) * 0.5
      positions[i * 3 + 1] = position[1] + (Math.random() - 0.5) * 0.5
      positions[i * 3 + 2] = position[2] + (Math.random() - 0.5) * 0.5

      velocities[i * 3] = (Math.random() - 0.5) * 0.5
      velocities[i * 3 + 1] = 0.5 + Math.random() * 1.0
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5

      sizes[i] = 0.1 + Math.random() * 0.2
    }

    return { positions, velocities, sizes, count }
  }, [position])

  useFrame((state, delta) => {
    const elapsed = Date.now() - startTime.current
    const progress = elapsed / DURATION

    if (progress >= 1) {
      onComplete()
      return
    }

    // Update explosion particles
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
      const opacityProgress = Math.min(progress * 2, 1)

      for (let i = 0; i < explosionParticles.count; i++) {
        positions[i * 3] += explosionParticles.velocities[i * 3] * delta
        positions[i * 3 + 1] += explosionParticles.velocities[i * 3 + 1] * delta - 9.8 * delta * delta
        positions[i * 3 + 2] += explosionParticles.velocities[i * 3 + 2] * delta

        // Slow down particles
        explosionParticles.velocities[i * 3] *= 0.95
        explosionParticles.velocities[i * 3 + 1] *= 0.95
        explosionParticles.velocities[i * 3 + 2] *= 0.95
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true
      
      if (particlesRef.current.material instanceof THREE.PointsMaterial) {
        particlesRef.current.material.opacity = 1 - opacityProgress
      }
    }

    // Update smoke particles
    if (smokeRef.current) {
      const positions = smokeRef.current.geometry.attributes.position.array as Float32Array
      const sizes = smokeRef.current.geometry.attributes.size.array as Float32Array

      for (let i = 0; i < smokeParticles.count; i++) {
        positions[i * 3] += smokeParticles.velocities[i * 3] * delta
        positions[i * 3 + 1] += smokeParticles.velocities[i * 3 + 1] * delta
        positions[i * 3 + 2] += smokeParticles.velocities[i * 3 + 2] * delta

        // Grow smoke particles
        sizes[i] = smokeParticles.sizes[i] * (1 + progress * 2)
      }

      smokeRef.current.geometry.attributes.position.needsUpdate = true
      smokeRef.current.geometry.attributes.size.needsUpdate = true
      
      if (smokeRef.current.material instanceof THREE.PointsMaterial) {
        smokeRef.current.material.opacity = 0.8 * (1 - progress)
      }
    }
  })

  return (
    <>
      {/* Explosion particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={explosionParticles.count}
            array={explosionParticles.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={explosionParticles.count}
            array={explosionParticles.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          vertexColors
          transparent
          opacity={1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Smoke particles */}
      <points ref={smokeRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={smokeParticles.count}
            array={smokeParticles.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={smokeParticles.count}
            array={smokeParticles.sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.3}
          color="#333333"
          transparent
          opacity={0.8}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </>
  )
}

// Manager component to handle all active explosions
export function ExplosionManager() {
  const { explosions, removeExplosion } = useGameStore()

  return (
    <>
      {explosions.map((explosion) => (
        <ExplosionEffect
          key={explosion.id}
          id={explosion.id}
          position={explosion.position}
          onComplete={() => removeExplosion(explosion.id)}
        />
      ))}
    </>
  )
}
