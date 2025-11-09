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
  const { selectedBlockType, setSelectedBlockType, isPlaying } = useGameStore()

  if (!isPlaying) return null

  return (
    <>
      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="relative w-8 h-8">
          {/* Horizontal line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/80 shadow-[0_0_4px_rgba(0,0,0,0.8)]" />
          {/* Vertical line */}
          <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white/80 shadow-[0_0_4px_rgba(0,0,0,0.8)]" />
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white/80 rounded-full shadow-[0_0_4px_rgba(0,0,0,0.8)]" />
        </div>
      </div>

      {/* Block selection UI */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {BLOCK_TYPES.map((type, index) => (
          <button
            key={type}
            onClick={() => setSelectedBlockType(type)}
            className={cn(
              "w-16 h-16 rounded-lg border-4 transition-all hover:scale-110 relative",
              BLOCK_COLORS[type],
              selectedBlockType === type ? "border-white shadow-lg scale-110" : "border-black/30",
            )}
            title={`${BLOCK_NAMES[type]} (${index + 1})`}
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
