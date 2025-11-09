"use client"

import { useGameStore } from "@/lib/game-store"

export function RacingUI() {
  const { speed, lapTime, isPlaying } = useGameStore()

  if (!isPlaying) return null

  return (
    <div className="absolute top-4 left-4 text-white font-mono">
      <div className="bg-black/50 backdrop-blur-sm p-4 rounded-lg space-y-2">
        <div className="text-2xl font-bold">
          Velocidad: {Math.round(speed * 10)} km/h
        </div>
        <div className="text-xl">
          Tiempo: {lapTime.toFixed(2)}s
        </div>
      </div>
      
      <div className="mt-4 bg-black/50 backdrop-blur-sm p-3 rounded-lg text-sm">
        <div>W/↑ - Acelerar</div>
        <div>S/↓ - Frenar</div>
        <div>A/← D/→ - Girar</div>
        <div>Espacio - Freno de mano</div>
      </div>
    </div>
  )
}
