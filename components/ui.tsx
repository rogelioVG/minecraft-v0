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
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
      {BLOCK_TYPES.map((type, index) => (
        <button
          key={type}
          onClick={() => setSelectedBlockType(type)}
          className={cn(
            "w-16 h-16 rounded-lg border-4 transition-all hover:scale-110",
            BLOCK_COLORS[type],
            selectedBlockType === type ? "border-white shadow-lg scale-110" : "border-black/30",
          )}
          title={`${BLOCK_NAMES[type]} (${index + 1})`}
        >
          <span className="sr-only">{BLOCK_NAMES[type]}</span>
        </button>
      ))}
    </div>
  )
}
