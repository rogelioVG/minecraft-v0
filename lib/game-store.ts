import { create } from "zustand"

export type BlockType = "grass" | "dirt" | "stone" | "wood" | "sand"

export const HORSE_IDS = ["colorado", "palomino", "azabache", "pinto"] as const
export type HorseId = (typeof HORSE_IDS)[number]

type HorseStatus = {
  isMounted: boolean
  isLassoed: boolean
}

interface Block {
  id: string
  position: [number, number, number]
  type: BlockType
  isDynamic?: boolean
}

interface Bomb {
  id: string
  position: [number, number, number]
  direction: [number, number, number]
}

interface ExplosionForce {
  position: [number, number, number]
  force: number
  radius: number
}

interface GameState {
  blocks: Block[]
  bombs: Bomb[]
  selectedBlockType: BlockType
  isPlaying: boolean
  isDrivingCar: boolean
  isRidingHorse: boolean
  mountedHorseId?: HorseId
  horseStates: Record<HorseId, HorseStatus>
  isOnBoat: boolean
  explosionForces: ExplosionForce[]
  playerPosition: [number, number, number]
  maxPlayerHealth: number
  playerHealth: number
  playerLives: number
  respawnSignal: number
  lastCatch: string | null
  setSelectedBlockType: (type: BlockType) => void
  addBlock: (position: [number, number, number], type: BlockType) => void
  removeBlock: (id: string) => void
  makeBlockDynamic: (id: string) => void
  initializeWorld: (size: number, height: number) => void
  setIsPlaying: (playing: boolean) => void
  enterCar: () => void
  exitCar: () => void
  toggleDrivingCar: () => void
  enterHorse: (horseId: HorseId) => void
  exitHorse: () => void
  toggleHorseLasso: (horseId: HorseId) => void
  enterBoat: () => void
  exitBoat: () => void
  throwBomb: (position: [number, number, number], direction: [number, number, number]) => void
  removeBomb: (id: string) => void
  triggerExplosion: (position: [number, number, number], force: number, radius: number) => void
  clearExplosionForces: () => void
  setPlayerPosition: (position: [number, number, number]) => void
  damagePlayer: (amount: number, source?: string) => void
  healPlayer: (amount: number) => void
  setLastCatch: (info: string | null) => void
}

const createInitialHorseStates = (): Record<HorseId, HorseStatus> => {
  return HORSE_IDS.reduce((acc, id) => {
    acc[id] = {
      isMounted: false,
      isLassoed: true,
    }
    return acc
  }, {} as Record<HorseId, HorseStatus>)
}

export const useGameStore = create<GameState>((set, get) => ({
  blocks: [],
  bombs: [],
  selectedBlockType: "grass",
  isPlaying: false,
  isDrivingCar: false,
  isRidingHorse: false,
  horseStates: createInitialHorseStates(),
  isOnBoat: false,
  explosionForces: [],
  playerPosition: [0, 5, 0],
  maxPlayerHealth: 100,
  playerHealth: 100,
  playerLives: 3,
  respawnSignal: 0,
  lastCatch: null,

  setSelectedBlockType: (type) => set({ selectedBlockType: type }),

  setPlayerPosition: (position) => set({ playerPosition: position }),

  damagePlayer: (amount) =>
    set((state) => {
      const newHealth = Math.max(0, state.playerHealth - amount)

      if (newHealth > 0) {
        return { playerHealth: newHealth }
      }

      const horseStates = { ...state.horseStates }
      if (state.mountedHorseId) {
        horseStates[state.mountedHorseId] = {
          ...horseStates[state.mountedHorseId],
          isMounted: false,
        }
      }

      const livesRemaining = state.playerLives > 0 ? state.playerLives - 1 : 0

      return {
        playerHealth: state.maxPlayerHealth,
        playerLives: livesRemaining,
        respawnSignal: state.respawnSignal + 1,
        isDrivingCar: false,
        isRidingHorse: false,
        mountedHorseId: undefined,
        horseStates,
        isOnBoat: false,
      }
    }),

  healPlayer: (amount) =>
    set((state) => ({
      playerHealth: Math.min(state.maxPlayerHealth, state.playerHealth + amount),
    })),

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  enterCar: () =>
    set((state) => {
      if (state.isRidingHorse || state.isOnBoat) {
        return state
      }
      return { isDrivingCar: true }
    }),
  exitCar: () => set({ isDrivingCar: false }),
  toggleDrivingCar: () =>
    set((state) => ({
      isDrivingCar: !state.isDrivingCar,
    })),

  enterHorse: (horseId) =>
    set((state) => {
      if (state.isDrivingCar || state.isOnBoat || state.isRidingHorse) {
        return state
      }
      const horseStates = { ...state.horseStates }
      if (!horseStates[horseId]) {
        return state
      }

      horseStates[horseId] = {
        ...horseStates[horseId],
        isMounted: true,
      }

      return {
        isRidingHorse: true,
        mountedHorseId: horseId,
        horseStates,
      }
    }),

  exitHorse: () =>
    set((state) => {
      if (!state.isRidingHorse || !state.mountedHorseId) {
        return state
      }

      const horseStates = { ...state.horseStates }
      horseStates[state.mountedHorseId] = {
        ...horseStates[state.mountedHorseId],
        isMounted: false,
      }

      return {
        isRidingHorse: false,
        mountedHorseId: undefined,
        horseStates,
      }
    }),

  toggleHorseLasso: (horseId) =>
    set((state) => {
      const horseStates = { ...state.horseStates }
      if (!horseStates[horseId]) {
        return state
      }

      horseStates[horseId] = {
        ...horseStates[horseId],
        isLassoed: !horseStates[horseId].isLassoed,
      }

      return { horseStates }
    }),

  enterBoat: () =>
    set((state) => {
      if (state.isDrivingCar || state.isRidingHorse || state.isOnBoat) {
        return state
      }
      return { isOnBoat: true }
    }),

  exitBoat: () => set({ isOnBoat: false }),

  setLastCatch: (info) => set({ lastCatch: info }),

  throwBomb: (position, direction) =>
    set((state) => ({
      bombs: [
        ...state.bombs,
        {
          id: `bomb-${Date.now()}-${Math.random()}`,
          position,
          direction,
        },
      ],
    })),

  removeBomb: (id) =>
    set((state) => ({
      bombs: state.bombs.filter((bomb) => bomb.id !== id),
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

  makeBlockDynamic: (id) =>
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id ? { ...block, isDynamic: true } : block
      ),
    })),

  triggerExplosion: (position, force, radius) =>
    set((state) => ({
      explosionForces: [
        ...state.explosionForces,
        { position, force, radius },
      ],
    })),

    clearExplosionForces: () =>
      set({ explosionForces: [] }),

    initializeWorld: (_size, _height) => {
      const blockMap = new Map<string, Block>()

      const addBlock = (x: number, y: number, z: number, type: BlockType) => {
        const id = `${x}-${y}-${z}`
        if (blockMap.has(id)) {
          return
        }

        blockMap.set(id, {
          id,
          position: [x, y, z],
          type,
        })
      }

      const fillRectangle = (
        xStart: number,
        xEnd: number,
        zStart: number,
        zEnd: number,
        y: number,
        type: BlockType,
      ) => {
        for (let x = xStart; x <= xEnd; x++) {
          for (let z = zStart; z <= zEnd; z++) {
            addBlock(x, y, z, type)
          }
        }
      }

      const addLowDune = (centerX: number, centerZ: number, radius: number, height: number) => {
        for (let x = centerX - radius; x <= centerX + radius; x++) {
          for (let z = centerZ - radius; z <= centerZ + radius; z++) {
            const dx = x - centerX
            const dz = z - centerZ
            const distanceSq = dx * dx + dz * dz
            if (distanceSq > radius * radius) continue

            const falloff = 1 - Math.sqrt(distanceSq) / radius
            const maxHeight = Math.max(1, Math.round(falloff * height))

            for (let y = 1; y <= maxHeight; y++) {
              addBlock(x, y, z, "sand")
            }
          }
        }
      }

      // Compact layout: small plaza, corrals and a short walkway to the reservoir.
      fillRectangle(-6, 6, -3, 5, 0, "dirt") // ranch plaza
      fillRectangle(-16, -8, 6, 14, 0, "wood") // stable pad
      fillRectangle(-4, 10, 8, 14, 0, "wood") // corrals
      fillRectangle(6, 16, -8, -4, 0, "stone") // walkway toward the dam
      fillRectangle(10, 12, -6, -2, 1, "wood") // small fishing pier

      // A few scattered dunes to break the flatness without thousands of cubes.
      addLowDune(-12, -6, 3, 2)
      addLowDune(4, -10, 4, 2)
      addLowDune(12, 6, 3, 2)
      addLowDune(-8, 10, 4, 3)

      // Accent stones / details.
      const accentPads: Array<{ x: number; z: number; size: 2 | 3; type: BlockType }> = [
        { x: -2, z: 2, size: 3, type: "stone" },
        { x: 8, z: 0, size: 2, type: "stone" },
        { x: -10, z: -2, size: 2, type: "wood" },
      ]

      accentPads.forEach(({ x, z, size, type }) => {
        fillRectangle(x, x + size - 1, z, z + size - 1, 0, type)
      })

      set({ blocks: Array.from(blockMap.values()) })
    },

}))
