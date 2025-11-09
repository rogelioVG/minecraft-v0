"use client"

import { useEffect } from "react"
import { Block } from "./block"
import { Ground } from "./ground"
import { useGameStore } from "@/lib/game-store"

const WORLD_SIZE = 60
const WORLD_HEIGHT = 5

export function World() {
  const { blocks, initializeWorld } = useGameStore()

  useEffect(() => {
    initializeWorld(WORLD_SIZE, WORLD_HEIGHT)
  }, [initializeWorld])

  return (
    <>
      <Ground size={WORLD_SIZE} />
      {blocks.map((block) => (
        <Block key={block.id} id={block.id} position={block.position} type={block.type} />
      ))}
    </>
  )
}
