import { create } from "zustand"

export type BlockType = "grass" | "dirt" | "stone" | "wood" | "sand"

interface Block {
  id: string
  position: [number, number, number]
  type: BlockType
}

interface GameState {
  blocks: Block[]
  selectedBlockType: BlockType
  isPlaying: boolean
  setSelectedBlockType: (type: BlockType) => void
  addBlock: (position: [number, number, number], type: BlockType) => void
  removeBlock: (id: string) => void
  initializeWorld: (size: number, height: number) => void
  setIsPlaying: (playing: boolean) => void
}

export const useGameStore = create<GameState>((set) => ({
  blocks: [],
  selectedBlockType: "grass",
  isPlaying: false,

  setSelectedBlockType: (type) => set({ selectedBlockType: type }),

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  addBlock: (position, type) =>
    set((state) => ({
      blocks: [
        ...state.blocks,
        {
          id: `${position[0]}-${position[1]}-${position[2]}`,
          position,
          type,
        },
      ],
    })),

  removeBlock: (id) =>
    set((state) => ({
      blocks: state.blocks.filter((block) => block.id !== id),
    })),

  initializeWorld: (size, height) => {
    const blocks: Block[] = []
    const halfSize = Math.floor(size / 2)

    // Generate random terrain
    for (let x = -halfSize; x < halfSize; x++) {
      for (let z = -halfSize; z < halfSize; z++) {
        // Simple height variation
        const noise = Math.sin(x * 0.3) * Math.cos(z * 0.3)
        const blockHeight = Math.floor(noise * 2) + 1

        for (let y = 0; y < Math.min(blockHeight, height); y++) {
          let type: BlockType = "stone"

          if (y === blockHeight - 1) {
            type = "grass"
          } else if (y === blockHeight - 2) {
            type = "dirt"
          }

          blocks.push({
            id: `${x}-${y}-${z}`,
            position: [x, y, z],
            type,
          })
        }
      }
    }

    set({ blocks })
  },
}))
