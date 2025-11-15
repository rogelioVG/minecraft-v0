"use client"

import { useEffect } from "react"
import { Block } from "./block"
import { Ground } from "./ground"
import { Bomb } from "./bomb"
import { Car } from "./car"
import { Stable } from "./stable"
import { Horse } from "./horse"
import { Cholla } from "./cholla"
import { Reservoir } from "./reservoir"
import { useGameStore, HORSE_IDS, type HorseId } from "@/lib/game-store"

const WORLD_SIZE = 60
const WORLD_HEIGHT = 5

const HORSE_CONFIG: Record<
  HorseId,
  { position: [number, number, number]; color: string; mane: string; anchor: [number, number, number] }
> = {
  colorado: { position: [-13, 1, 8], color: "#8b5a2b", mane: "#2d1b0f", anchor: [-14.5, 0.8, 8] },
  palomino: { position: [-11, 1, 10], color: "#f0d4a3", mane: "#d7a957", anchor: [-12.6, 0.8, 10] },
  azabache: { position: [-13, 1, 12], color: "#1b1b1b", mane: "#0f0f0f", anchor: [-14.5, 0.8, 12] },
  pinto: { position: [-11, 1, 14], color: "#c28f6b", mane: "#4d2f1b", anchor: [-12.6, 0.8, 14] },
}

const CHOLLA_POSITIONS: [number, number, number][] = [
  [-4, 0, 2],
  [2, 0, 8],
  [6, 0, -3],
  [14, 0, -6],
  [18, 0, 4],
  [-10, 0, -5],
  [-16, 0, 14],
  [8, 0, 16],
]

export function World() {
  const { blocks, bombs, removeBomb, initializeWorld } = useGameStore()

  useEffect(() => {
    initializeWorld(WORLD_SIZE, WORLD_HEIGHT)
  }, [initializeWorld])

  return (
    <>
      <Ground size={WORLD_SIZE} />
      <Stable position={[-15, 0, 12]} />
      {HORSE_IDS.map((horseId) => {
        const horse = HORSE_CONFIG[horseId]
        return (
          <Horse
            key={horseId}
            id={horseId}
            position={horse.position}
            color={horse.color}
            maneColor={horse.mane}
            anchorPosition={horse.anchor}
          />
        )
      })}
      {CHOLLA_POSITIONS.map((pos, index) => (
        <Cholla key={`cholla-${index}`} position={pos} />
      ))}
      <Reservoir origin={[24, 0, -8]} />
      <Car />
      {blocks.map((block) => (
        <Block key={block.id} id={block.id} position={block.position} type={block.type} />
      ))}
      {bombs.map((bomb) => (
        <Bomb
          key={bomb.id}
          id={bomb.id}
          position={bomb.position}
          direction={bomb.direction}
          onDetonate={removeBomb}
        />
      ))}
    </>
  )
}
