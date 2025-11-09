"use client"

import { useGameStore, type BlockType } from "@/lib/game-store"
import { cn } from "@/lib/utils"

const BLOCK_TYPES: BlockType[] = ["grass", "dirt", "stone", "wood", "sand"]

const BLOCK_COLORS: Record<BlockType, string> = {
  grass: "bg-[#7cb342]",
  dirt: "bg-[#8d6e63]",
  stone: "bg-[#757575]",
  wood: "bg-[#a1887f]",
  sand: "bg-[#fdd835]",
}

const BLOCK_NAMES: Record<BlockType, string> = {
  grass: "Grass",
  dirt: "Dirt",
  stone: "Stone",
  wood: "Wood",
  sand: "Sand",
}

export function UI() {
  const { selectedBlockType, setSelectedBlockType, isPlaying, explosionMode, toggleExplosionMode, ghosts, debris, health, maxHealth } = useGameStore()

  if (!isPlaying) return null

  const skullCount = debris.filter(d => d.type === "skull").length
  const ghostCount = ghosts.length
  const healthPercentage = (health / maxHealth) * 100

  return (
    <>
      {/* Crosshair - Mira central */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        {/* Crosshair lines */}
        <div className="relative w-8 h-8">
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-[0_0_4px_rgba(0,0,0,0.8)]" />
          
          {/* Top line */}
          <div className="absolute left-1/2 bottom-[calc(50%+4px)] w-0.5 h-3 -translate-x-1/2 bg-white shadow-[0_0_4px_rgba(0,0,0,0.8)]" />
          
          {/* Bottom line */}
          <div className="absolute left-1/2 top-[calc(50%+4px)] w-0.5 h-3 -translate-x-1/2 bg-white shadow-[0_0_4px_rgba(0,0,0,0.8)]" />
          
          {/* Left line */}
          <div className="absolute top-1/2 right-[calc(50%+4px)] h-0.5 w-3 -translate-y-1/2 bg-white shadow-[0_0_4px_rgba(0,0,0,0.8)]" />
          
          {/* Right line */}
          <div className="absolute top-1/2 left-[calc(50%+4px)] h-0.5 w-3 -translate-y-1/2 bg-white shadow-[0_0_4px_rgba(0,0,0,0.8)]" />
        </div>

        {/* Block indicator - shows selected block type */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <div 
            className={cn(
              "w-8 h-8 rounded border-2 border-white shadow-lg",
              BLOCK_COLORS[selectedBlockType]
            )}
          />
          <span className="text-white text-xs font-semibold px-2 py-0.5 bg-black/60 rounded shadow-lg">
            {BLOCK_NAMES[selectedBlockType]}
          </span>
        </div>
      </div>

      {/* Health Bar - Top Left */}
      <div className="absolute top-8 left-8 flex flex-col gap-2">
        <div className="bg-black/80 px-6 py-3 rounded-lg border-2 border-red-500 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">❤️</span>
            <span className="text-white font-bold text-lg">
              {health} / {maxHealth}
            </span>
          </div>
          
          {/* Health bar */}
          <div className="w-48 h-6 bg-gray-700 rounded-full border-2 border-gray-600 overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-300 rounded-full",
                healthPercentage > 60 ? "bg-green-500" : 
                healthPercentage > 30 ? "bg-yellow-500" : 
                "bg-red-500 animate-pulse"
              )}
              style={{ width: `${healthPercentage}%` }}
            />
          </div>
          
          {health <= 30 && health > 0 && (
            <div className="mt-2 text-red-400 text-xs font-semibold animate-pulse">
              ⚠️ Salud crítica!
            </div>
          )}
          
          {health === 0 && (
            <div className="mt-2 text-red-500 text-sm font-bold animate-pulse">
              💀 Sin vida!
            </div>
          )}
        </div>
      </div>

      {/* Top right controls */}
      <div className="absolute top-8 right-8 flex flex-col gap-3">
        {/* Ghost counter */}
        {(ghostCount > 0 || skullCount > 0) && (
          <div className="bg-black/80 px-6 py-3 rounded-lg border-2 border-green-500 shadow-xl">
            <div className="flex items-center gap-3">
              {skullCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💀</span>
                  <span className="text-white font-bold text-lg">{skullCount}</span>
                </div>
              )}
              {ghostCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👻</span>
                  <span className="text-white font-bold text-lg">{ghostCount}</span>
                </div>
              )}
            </div>
            {skullCount > 0 && (
              <div className="mt-1 text-yellow-400 text-xs font-semibold animate-pulse">
                ⚠️ Se convierten en fantasmas en 3s
              </div>
            )}
            {ghostCount > 0 && (
              <div className="mt-1 text-blue-400 text-xs font-semibold">
                💧 Presiona Q para lanzar agua bendita
              </div>
            )}
          </div>
        )}
        
        {/* Explosion mode button */}
        <button
          onClick={toggleExplosionMode}
          className={cn(
            "px-6 py-3 rounded-lg border-4 transition-all hover:scale-105 font-bold text-lg shadow-xl",
            explosionMode
              ? "bg-red-600 border-orange-500 text-white animate-pulse"
              : "bg-gray-700 border-gray-500 text-white hover:bg-gray-600"
          )}
          title="Modo Explosión (E)"
        >
          {explosionMode ? "💥 EXPLOSIÓN ACTIVA" : "💣 Activar Explosión"}
        </button>
        {explosionMode && (
          <div className="text-center text-white text-sm bg-black/60 px-3 py-1 rounded">
            Click en un bloque para explotarlo
          </div>
        )}
      </div>

      {/* Block selection toolbar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {BLOCK_TYPES.map((type, index) => (
          <button
            key={type}
            onClick={() => setSelectedBlockType(type)}
            className={cn(
              "w-16 h-16 rounded-lg border-4 transition-all hover:scale-110 relative",
              BLOCK_COLORS[type],
              selectedBlockType === type ? "border-white shadow-lg scale-110" : "border-black/30",
              explosionMode && "opacity-50 cursor-not-allowed"
            )}
            title={`${BLOCK_NAMES[type]} (${index + 1})`}
            disabled={explosionMode}
          >
            {selectedBlockType === type && (
              <div className="absolute inset-0 bg-white/30 rounded-md pointer-events-none" />
            )}
            <span className="sr-only">{BLOCK_NAMES[type]}</span>
          </button>
        ))}
      </div>
    </>
  )
}
