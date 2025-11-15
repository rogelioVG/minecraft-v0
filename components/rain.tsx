"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface RainEffectProps {
  area?: number
  height?: number
  count?: number
}

export function RainEffect({ area = 60, height = 35, count = 1500 }: RainEffectProps = {}) {
  const rainData = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const speeds = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const idx = i * 3
      positions[idx] = (Math.random() - 0.5) * area * 2
      positions[idx + 1] = Math.random() * height + 5
      positions[idx + 2] = (Math.random() - 0.5) * area * 2
      speeds[i] = 25 + Math.random() * 15
    }

    return { positions, speeds }
  }, [area, height, count])

  const pointsRef = useRef<THREE.Points>(null)

  useFrame((_, delta) => {
    if (!pointsRef.current) return

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < count; i++) {
      const idx = i * 3
      positions[idx + 1] -= rainData.speeds[i] * delta

      if (positions[idx + 1] < -1) {
        positions[idx] = (Math.random() - 0.5) * area * 2
        positions[idx + 1] = height + Math.random() * 5
        positions[idx + 2] = (Math.random() - 0.5) * area * 2
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={rainData.positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        color="#9fd1ff"
        size={0.06}
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

