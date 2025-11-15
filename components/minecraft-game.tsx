"use client"

import { Canvas } from "@react-three/fiber"
import { Sky, PointerLockControls } from "@react-three/drei"
import { Physics } from "@react-three/rapier"
import { World } from "./world"
import { Player } from "./player"
import { UI } from "./ui"
import { useGameStore } from "@/lib/game-store"

export function MinecraftGame() {
  const { isPlaying, setIsPlaying } = useGameStore()

  return (
    <div className="w-full h-screen relative">
      <Canvas shadows camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 10, 0] }}>
        <Sky sunPosition={[100, 20, 100]} />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[50, 50, 25]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={100}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />

        <Physics gravity={[0, -20, 0]}>
          <Player />
          <World />
        </Physics>

        <PointerLockControls onLock={() => setIsPlaying(true)} onUnlock={() => setIsPlaying(false)} />
      </Canvas>

        <UI />

        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
            <div className="text-center pointer-events-auto">
              <h1 className="text-6xl font-bold text-white mb-4">Rancho Sonora</h1>
              <p className="text-xl text-white/90 mb-8">Explora el rancho y domina el desierto.</p>
              <div className="text-sm text-white/70 space-y-2">
                <p>WASD - Moverte | Space - Saltar | Shift - Correr</p>
                <p>Click - Lanzar bombas | Mouse - Mirar</p>
                <p>H - Montar/Desmontar caballo | L - Lazo</p>
                <p>B - Subirte al barco | F - Pescar</p>
                <p>Evita las choyas, quitan vidas. ESC - Pausa.</p>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
