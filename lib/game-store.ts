import { create } from "zustand"

export type BlockType = "grass" | "dirt" | "stone" | "wood" | "sand"

interface Block {
  id: string
  position: [number, number, number]
  type: BlockType
}

interface Arrow {
  id: string
  position: [number, number, number]
  direction: [number, number, number]
}

interface GameState {
  blocks: Block[]
  arrows: Arrow[]
  selectedBlockType: BlockType
  isPlaying: boolean
  setSelectedBlockType: (type: BlockType) => void
  addBlock: (position: [number, number, number], type: BlockType) => void
  removeBlock: (id: string) => void
  initializeWorld: (size: number, height: number) => void
  setIsPlaying: (playing: boolean) => void
  shootArrow: (position: [number, number, number], direction: [number, number, number]) => void
  removeArrow: (id: string) => void
}

export const useGameStore = create<GameState>((set) => ({
  blocks: [],
  arrows: [],
  selectedBlockType: "grass",
  isPlaying: false,

  setSelectedBlockType: (type) => set({ selectedBlockType: type }),

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  shootArrow: (position, direction) =>
    set((state) => ({
      arrows: [
        ...state.arrows,
        {
          id: `arrow-${Date.now()}-${Math.random()}`,
          position,
          direction,
        },
      ],
    })),

  removeArrow: (id) =>
    set((state) => ({
      arrows: state.arrows.filter((arrow) => arrow.id !== id),
    })),

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

    // Helper function to add a block
    const addBlock = (x: number, y: number, z: number, type: BlockType) => {
      blocks.push({
        id: `${x}-${y}-${z}`,
        position: [x, y, z],
        type,
      })
    }

    // Helper function to create a platform
    const createPlatform = (x: number, y: number, z: number, width: number, depth: number, type: BlockType = "grass") => {
      for (let i = 0; i < width; i++) {
        for (let j = 0; j < depth; j++) {
          addBlock(x + i, y, z + j, type)
        }
      }
    }

    // Helper function to create a tree
    const createTree = (x: number, y: number, z: number, trunkHeight: number = 4) => {
      // Trunk
      for (let i = 0; i <= trunkHeight; i++) {
        addBlock(x, y + i, z, "wood")
      }
      // Leaves - platform on top
      const leafY = y + trunkHeight + 1
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          addBlock(x + i, leafY, z + j, "grass")
        }
      }
    }

    // Helper function to create a pillar
    const createPillar = (x: number, y: number, z: number, pillarHeight: number, topSize: number = 1) => {
      for (let i = 0; i < pillarHeight; i++) {
        addBlock(x, y + i, z, "stone")
      }
      // Top platform
      for (let i = 0; i < topSize; i++) {
        for (let j = 0; j < topSize; j++) {
          addBlock(x + i - Math.floor(topSize / 2), y + pillarHeight, z + j - Math.floor(topSize / 2), "grass")
        }
      }
    }

    // Starting platform (0, 0)
    createPlatform(-3, 0, -3, 6, 6, "grass")

    // Path 1: Small platforms leading forward
    createPlatform(4, 0, -1, 2, 2, "stone")
    createPlatform(7, 1, -1, 2, 2, "stone")
    createPlatform(10, 2, -1, 2, 2, "stone")

    // Tree jump section
    createTree(13, 2, 0, 3)
    createTree(16, 3, 3, 4)
    createTree(19, 4, 0, 5)

    // Platform after trees
    createPlatform(22, 5, -2, 4, 4, "wood")

    // Pillar jumping section
    createPillar(27, 5, -1, 3, 1)
    createPillar(29, 6, 2, 4, 1)
    createPillar(31, 7, -2, 5, 1)
    createPillar(33, 8, 1, 6, 1)

    // Large platform rest area
    createPlatform(36, 9, -2, 5, 5, "grass")

    // Staircase section
    for (let i = 0; i < 8; i++) {
      createPlatform(41 + i, 9 + i, -1, 2, 2, "stone")
    }

    // High platform with tree
    createPlatform(49, 17, -3, 6, 6, "grass")
    createTree(51, 17, 0, 3)

    // Descending platforms
    createPlatform(56, 16, -1, 2, 2, "sand")
    createPlatform(59, 14, 1, 2, 2, "sand")
    createPlatform(62, 12, -1, 2, 2, "sand")
    createPlatform(65, 10, 0, 3, 3, "sand")

    // Final tree climb
    createTree(68, 10, 1, 6)
    createTree(71, 12, -2, 8)

    // Victory platform
    createPlatform(74, 13, -4, 7, 7, "wood")

    // Add some decorative trees on victory platform
    createTree(75, 13, -3, 2)
    createTree(79, 13, -2, 2)

    // Side platforms for exploration
    createPlatform(-8, 2, 5, 3, 3, "stone")
    createPlatform(-5, 4, 9, 2, 2, "stone")
    createTree(-4, 4, 10, 3)

    // Additional challenge platforms
    createPlatform(15, 8, 8, 2, 2, "dirt")
    createPlatform(18, 10, 11, 2, 2, "dirt")
    createPlatform(40, 15, 8, 3, 3, "wood")

    set({ blocks })
  },
}))
