import { create } from "zustand"

export type BlockType = "grass" | "dirt" | "stone" | "wood" | "sand"

interface Block {
  id: string
  position: [number, number, number]
  type: BlockType
}

interface Explosion {
  id: string
  position: [number, number, number]
  timestamp: number
}

interface Debris {
  id: string
  position: [number, number, number]
  type: "ash" | "skull"
  timestamp: number
}

interface Ghost {
  id: string
  position: [number, number, number]
  velocity: [number, number, number]
  timestamp: number
}

interface HolyWater {
  id: string
  position: [number, number, number]
  velocity: [number, number, number]
  timestamp: number
}

interface GameState {
  blocks: Block[]
  selectedBlockType: BlockType
  isPlaying: boolean
  isFirstPerson: boolean
  explosionMode: boolean
  explosions: Explosion[]
  debris: Debris[]
  ghosts: Ghost[]
  holyWater: HolyWater[]
  playerPosition: [number, number, number]
  setSelectedBlockType: (type: BlockType) => void
  addBlock: (position: [number, number, number], type: BlockType) => void
  removeBlock: (id: string) => void
  initializeWorld: (size: number, height: number) => void
  setIsPlaying: (playing: boolean) => void
  toggleViewMode: () => void
  toggleExplosionMode: () => void
  explodeBlock: (id: string, position: [number, number, number]) => void
  removeExplosion: (id: string) => void
  convertSkullsToGhosts: () => void
  updateGhosts: (delta: number) => void
  throwHolyWater: (position: [number, number, number], direction: [number, number, number]) => void
  updateHolyWater: (delta: number) => void
  setPlayerPosition: (position: [number, number, number]) => void
  removeDebris: (id: string) => void
  removeGhost: (id: string) => void
}

export const useGameStore = create<GameState>((set, get) => ({
  blocks: [],
  selectedBlockType: "grass",
  isPlaying: false,
  isFirstPerson: false,
  explosionMode: false,
  explosions: [],
  debris: [],
  ghosts: [],
  holyWater: [],
  playerPosition: [0, 10, 0],

  setSelectedBlockType: (type) => set({ selectedBlockType: type }),

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  toggleViewMode: () => set((state) => ({ isFirstPerson: !state.isFirstPerson })),

  toggleExplosionMode: () => set((state) => ({ explosionMode: !state.explosionMode })),

  explodeBlock: (id, position) =>
    set((state) => {
      const explosionId = `explosion-${Date.now()}-${Math.random()}`
      const ashId = `ash-${Date.now()}-${Math.random()}`
      const skullId = `skull-${Date.now()}-${Math.random()}`
      const now = Date.now()
      
      return {
        blocks: state.blocks.filter((block) => block.id !== id),
        explosions: [
          ...state.explosions,
          {
            id: explosionId,
            position,
            timestamp: now,
          },
        ],
        debris: [
          ...state.debris,
          {
            id: ashId,
            position: [position[0], position[1], position[2]],
            type: "ash",
            timestamp: now,
          },
          {
            id: skullId,
            position: [position[0], position[1] + 0.3, position[2]],
            type: "skull",
            timestamp: now,
          },
        ],
      }
    }),

  removeExplosion: (id) =>
    set((state) => ({
      explosions: state.explosions.filter((explosion) => explosion.id !== id),
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

  setPlayerPosition: (position) => set({ playerPosition: position }),

  removeDebris: (id) =>
    set((state) => ({
      debris: state.debris.filter((d) => d.id !== id),
    })),

  removeGhost: (id) =>
    set((state) => ({
      ghosts: state.ghosts.filter((g) => g.id !== id),
    })),

  convertSkullsToGhosts: () =>
    set((state) => {
      const now = Date.now()
      const newGhosts: Ghost[] = []
      const remainingDebris = state.debris.filter((debris) => {
        if (debris.type === "skull" && now - debris.timestamp >= 3000) {
          // Convert skull to ghost
          newGhosts.push({
            id: `ghost-${debris.id}`,
            position: debris.position,
            velocity: [0, 0, 0],
            timestamp: now,
          })
          return false
        }
        return true
      })

      return {
        debris: remainingDebris,
        ghosts: [...state.ghosts, ...newGhosts],
      }
    }),

  updateGhosts: (delta) =>
    set((state) => {
      const playerPos = state.playerPosition
      const GHOST_SPEED = 3

      const updatedGhosts = state.ghosts.map((ghost) => {
        // Calculate direction to player
        const dx = playerPos[0] - ghost.position[0]
        const dy = playerPos[1] - ghost.position[1]
        const dz = playerPos[2] - ghost.position[2]
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (distance > 0.5) {
          // Normalize and apply speed
          const nx = (dx / distance) * GHOST_SPEED
          const ny = (dy / distance) * GHOST_SPEED
          const nz = (dz / distance) * GHOST_SPEED

          return {
            ...ghost,
            position: [
              ghost.position[0] + nx * delta,
              ghost.position[1] + ny * delta,
              ghost.position[2] + nz * delta,
            ] as [number, number, number],
            velocity: [nx, ny, nz] as [number, number, number],
          }
        }
        return ghost
      })

      return { ghosts: updatedGhosts }
    }),

  throwHolyWater: (position, direction) =>
    set((state) => {
      const id = `holywater-${Date.now()}-${Math.random()}`
      const THROW_SPEED = 15

      return {
        holyWater: [
          ...state.holyWater,
          {
            id,
            position,
            velocity: [
              direction[0] * THROW_SPEED,
              direction[1] * THROW_SPEED,
              direction[2] * THROW_SPEED,
            ] as [number, number, number],
            timestamp: Date.now(),
          },
        ],
      }
    }),

  updateHolyWater: (delta) =>
    set((state) => {
      const now = Date.now()
      const GRAVITY = 9.8
      const MAX_AGE = 5000 // Remove after 5 seconds

      // Update holy water positions and check collisions
      const remainingHolyWater: HolyWater[] = []
      const remainingGhosts: Ghost[] = [...state.ghosts]

      state.holyWater.forEach((water) => {
        // Remove old projectiles
        if (now - water.timestamp > MAX_AGE) {
          return
        }

        // Apply gravity
        const newVelocity: [number, number, number] = [
          water.velocity[0],
          water.velocity[1] - GRAVITY * delta,
          water.velocity[2],
        ]

        const newPosition: [number, number, number] = [
          water.position[0] + newVelocity[0] * delta,
          water.position[1] + newVelocity[1] * delta,
          water.position[2] + newVelocity[2] * delta,
        ]

        // Check collision with ghosts
        let hitGhost = false
        for (let i = remainingGhosts.length - 1; i >= 0; i--) {
          const ghost = remainingGhosts[i]
          const dx = newPosition[0] - ghost.position[0]
          const dy = newPosition[1] - ghost.position[1]
          const dz = newPosition[2] - ghost.position[2]
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

          if (distance < 0.5) {
            // Hit!
            remainingGhosts.splice(i, 1)
            hitGhost = true
            break
          }
        }

        // Remove water that hit ground or ghost
        if (!hitGhost && newPosition[1] > -5) {
          remainingHolyWater.push({
            ...water,
            position: newPosition,
            velocity: newVelocity,
          })
        }
      })

      return {
        holyWater: remainingHolyWater,
        ghosts: remainingGhosts,
      }
    }),
}))
