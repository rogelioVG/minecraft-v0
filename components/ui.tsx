"use client"

import { useGameStore, type BlockType, type HorseId } from "@/lib/game-store"
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

const HORSE_LABELS: Record<HorseId, string> = {
  colorado: "Colorado",
  palomino: "Palomino",
  azabache: "Azabache",
  pinto: "Pinto",
}

export function UI() {
  const {
    selectedBlockType,
    setSelectedBlockType,
    isPlaying,
    isDrivingCar,
    isRidingHorse,
    mountedHorseId,
    isOnBoat,
    playerHealth,
    maxPlayerHealth,
    playerLives,
    lastCatch,
  } = useGameStore()

  if (!isPlaying) return null

  const healthPercent = Math.max(0, Math.min(100, (playerHealth / maxPlayerHealth) * 100))
  const livesArray = Array.from({ length: 3 }).map((_, index) => index < playerLives)

  return (
    <>
      {/* Vehicle & mount instructions */}
      <div className="absolute top-8 left-8 text-white text-sm space-y-2 max-w-sm pointer-events-none drop-shadow-[0_0_6px_rgba(0,0,0,0.6)]">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-white/70">Camioneta</p>
          <p>Acércate y presiona V para subirte o bajarte.</p>
          <p>W/S aceleran, A/D giran. {isDrivingCar && <span className="text-emerald-300 font-semibold">En manejo.</span>}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-white/70">Caballos</p>
          <p>H para montar/desmontar. L para lazar o soltar.</p>
          {isRidingHorse && mountedHorseId && (
            <p className="text-orange-200 font-semibold">Cabalgando al {HORSE_LABELS[mountedHorseId]}</p>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-white/70">Presa</p>
          <p>B para subirte al barco, F para pescar.</p>
          {isOnBoat && <p className="text-sky-200 font-semibold">Navegando la presa.</p>}
        </div>
      </div>

      {/* Health HUD */}
      <div className="absolute top-8 right-8 text-white text-sm pointer-events-none flex flex-col gap-2 items-end drop-shadow-[0_0_6px_rgba(0,0,0,0.6)]">
        <p className="text-xs uppercase tracking-[0.3em] text-white/70">Salud</p>
        <div className="w-52 h-4 bg-white/10 rounded-full overflow-hidden border border-white/20">
          <div
            className="h-full bg-emerald-400"
            style={{ width: `${healthPercent}%`, transition: "width 0.2s linear" }}
          />
        </div>
        <div className="flex gap-1 text-lg">
          {livesArray.map((alive, index) => (
            <span key={index} className={alive ? "text-rose-300" : "text-white/20"}>
              ♥
            </span>
          ))}
        </div>
      </div>

      {/* Hazard reminder */}
      <div className="absolute top-32 left-1/2 -translate-x-1/2 text-white text-xs bg-black/40 px-4 py-2 rounded-full pointer-events-none">
        Choyas = daño inmediato — busca rutas de arena limpia.
      </div>

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
      {/* Ranch tips */}
      <div className="absolute bottom-32 left-8 text-white/90 text-sm space-y-1 pointer-events-none max-w-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">Rancho</p>
        <p>Construye con bloques (selector abajo) para extender el corral.</p>
        <p>Los caballos lazados no se moverán del poste; suéltalos para galopar.</p>
        <p>Mantente atento al mensaje de pesca cuando lances la línea.</p>
        {lastCatch && <p className="text-amber-200 font-semibold">Pesca: {lastCatch}</p>}
      </div>
    </>
  )
}
