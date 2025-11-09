"use client"

import { useEffect } from "react"
import { Block } from "./block"
import { Ground } from "./ground"
import { Arrow } from "./arrow"
import { DekuTree } from "./deku-tree"
import { useGameStore } from "@/lib/game-store"

const WORLD_SIZE = 20
const WORLD_HEIGHT = 5

export function World() {
  const { blocks, arrows, removeArrow, initializeWorld } = useGameStore()

  useEffect(() => {
    initializeWorld(WORLD_SIZE, WORLD_HEIGHT)
  }, [initializeWorld])

  return (
    <>
      <Ground size={WORLD_SIZE} />
      <DekuTree />
      {blocks.map((block) => (
        <Block key={block.id} id={block.id} position={block.position} type={block.type} />
      ))}
      {arrows.map((arrow) => (
        <Arrow 
          key={arrow.id} 
          id={arrow.id} 
          position={arrow.position} 
          direction={arrow.direction}
          onHit={removeArrow}
        />
      ))}
    </>
  )
}
