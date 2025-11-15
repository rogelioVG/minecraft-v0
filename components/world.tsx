"use client"

import { useEffect } from "react"
import { Block } from "./block"
import { Ground } from "./ground"
import { Bomb } from "./bomb"
import { Car } from "./car"
import { DekuTree } from "./deku-tree"
import { useGameStore } from "@/lib/game-store"

const WORLD_SIZE = 20
const WORLD_HEIGHT = 5

export function World() {
  const { blocks, bombs, removeBomb, initializeWorld } = useGameStore()

  useEffect(() => {
    initializeWorld(WORLD_SIZE, WORLD_HEIGHT)
  }, [initializeWorld])

  return (
    <>
      <Ground size={WORLD_SIZE} />
      <DekuTree />
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
