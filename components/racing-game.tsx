"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Sky } from "@react-three/drei"
import { Physics } from "@react-three/rapier"
import { Car } from "./car"
import { Track } from "./track"
import { RacingUI } from "./racing-ui"
import { useGameStore } from "@/lib/game-store"

export function RacingGame() {
  const { isPlaying, setIsPlaying } = useGameStore()

  return (
    <div className="w-full h-screen relative">
      <Canvas 
        shadows 
        camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 5, 10] }}
        onClick={() => !isPlaying && setIsPlaying(true)}
      >
        <Sky sunPosition={[100, 20, 100]} />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[50, 50, 25]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={200}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />

        <Physics gravity={[0, -20, 0]}>
          <Car />
          <Track />
        </Physics>

        <OrbitControls 
          makeDefault
          minDistance={5}
          maxDistance={30}
          maxPolarAngle={Math.PI / 2.5}
        />
      </Canvas>

      <RacingUI />

      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
          <div className="text-center pointer-events-auto">
            <h1 className="text-6xl font-bold text-white mb-4">Racing Game</h1>
            <p className="text-xl text-white/90 mb-8">Juego de carreras simple con Three.js</p>
            <div className="text-sm text-white/70 space-y-2">
              <p>W/↑ - Acelerar | S/↓ - Frenar</p>
              <p>A/← - Girar Izquierda | D/→ - Girar Derecha</p>
              <p>Espacio - Freno de mano</p>
              <p className="text-white mt-4">Haz clic para empezar</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
