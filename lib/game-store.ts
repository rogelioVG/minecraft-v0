import { create } from "zustand"

interface GameState {
  isPlaying: boolean
  speed: number
  lapTime: number
  setIsPlaying: (playing: boolean) => void
  updateSpeed: (speed: number) => void
  updateLapTime: (time: number) => void
}

export const useGameStore = create<GameState>((set) => ({
  isPlaying: false,
  speed: 0,
  lapTime: 0,

  setIsPlaying: (playing) => set({ isPlaying: playing }),
  updateSpeed: (speed) => set({ speed }),
  updateLapTime: (time) => set({ lapTime: time }),
}))
