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
