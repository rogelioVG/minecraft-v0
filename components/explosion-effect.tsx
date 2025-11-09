"use client"

import { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { Vector3 } from "three"
import * as THREE from "three"

interface ExplosionEffectProps {
  position: [number, number, number]
  onComplete: () => void
}

export function ExplosionEffect({ position, onComplete }: ExplosionEffectProps) {
  const particlesRef = useRef<THREE.Points>(null)
  const smokeRef = useRef<THREE.Group>(null)
  const startTime = useRef(Date.now())
  const DURATION = 1500 // 1.5 seconds

  // Create particles
  const particleCount = 50
  const particles = useRef<{
    position: Vector3
    velocity: Vector3
    color: THREE.Color
  }[]>([])

  useEffect(() => {
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount
      const elevation = Math.random() * Math.PI - Math.PI / 2
      const speed = 2 + Math.random() * 3

      particles.current.push({
        position: new Vector3(position[0], position[1], position[2]),
        velocity: new Vector3(
          Math.cos(angle) * Math.cos(elevation) * speed,
          Math.sin(elevation) * speed + 1,
          Math.sin(angle) * Math.cos(elevation) * speed
        ),
        color: new THREE.Color(
          Math.random() > 0.5 ? 0xff4500 : Math.random() > 0.5 ? 0xff8c00 : 0xff6600
        ),
      })
    }
  }, [])

  useFrame(() => {
    const elapsed = Date.now() - startTime.current
    const progress = elapsed / DURATION

    if (progress >= 1) {
      onComplete()
      return
    }

    // Update particles
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
      const colors = particlesRef.current.geometry.attributes.color.array as Float32Array

      particles.current.forEach((particle, i) => {
        // Apply gravity
        particle.velocity.y -= 0.1
        particle.position.add(particle.velocity.clone().multiplyScalar(0.016))

        positions[i * 3] = particle.position.x
        positions[i * 3 + 1] = particle.position.y
        positions[i * 3 + 2] = particle.position.z

        // Fade out
        const alpha = 1 - progress
        colors[i * 3] = particle.color.r * alpha
        colors[i * 3 + 1] = particle.color.g * alpha
        colors[i * 3 + 2] = particle.color.b * alpha
      })

      particlesRef.current.geometry.attributes.position.needsUpdate = true
      particlesRef.current.geometry.attributes.color.needsUpdate = true
    }

    // Update smoke
    if (smokeRef.current) {
      smokeRef.current.children.forEach((smoke, i) => {
        const smokeMesh = smoke as THREE.Mesh
        const material = smokeMesh.material as THREE.MeshBasicMaterial
        
        // Rise up and expand
        smokeMesh.position.y += 0.02
        smokeMesh.scale.multiplyScalar(1.02)
        
        // Fade out
        material.opacity = Math.max(0, 0.6 - progress * 0.8)
      })
    }
  })

  return (
    <group position={position}>
      {/* Explosion flash */}
      <mesh>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.8} />
      </mesh>

      {/* Explosion particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={new Float32Array(particleCount * 3)}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particleCount}
            array={new Float32Array(particleCount * 3)}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.15} vertexColors transparent />
      </points>

      {/* Smoke clouds */}
      <group ref={smokeRef}>
        {[...Array(8)].map((_, i) => {
          const angle = (Math.PI * 2 * i) / 8
          const radius = 0.3
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * radius,
                Math.random() * 0.2,
                Math.sin(angle) * radius,
              ]}
            >
              <sphereGeometry args={[0.3, 8, 8]} />
              <meshBasicMaterial color="#333333" transparent opacity={0.6} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}
