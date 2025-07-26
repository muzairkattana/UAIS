"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type * as THREE from "three"
import type { TreeInstance } from "@/types/tree-instance"
import type { StoneInstance } from "@/types/stone-instance"

export interface BulletTrail {
  start: THREE.Vector3
  end: THREE.Vector3
  timestamp: number
  intensity?: number // Added intensity property
}

// TreeInstance and StoneInstance are now imported from common types files

export interface PlacedItem {
  id: string
  position: THREE.Vector3
  type: string
  data?: any
}

interface GameState {
  playerPosition: { x: number; y: number; z: number }
  setPlayerPosition: (position: { x: number; y: number; z: number }) => void
  playerRotation: number
  setPlayerRotation: (rotation: number) => void
  terrainHeightData: number[][]
  setTerrainHeightData: (data: number[][]) => void
  terrainSize: { width: number; depth: number }
  setTerrainSize: (size: { width: number; depth: number }) => void
  bulletTrails: BulletTrail[]
  addBulletTrail: (trail: BulletTrail) => void
  treeInstances: TreeInstance[]
  setTreeInstances: (trees: TreeInstance[] | ((prev: TreeInstance[]) => TreeInstance[])) => void
  stoneInstances: StoneInstance[]
  setStoneInstances: (stones: StoneInstance[] | ((prev: StoneInstance[]) => StoneInstance[])) => void
  placedItems: PlacedItem[]
  setPlacedItems: (items: PlacedItem[] | ((prev: PlacedItem[]) => PlacedItem[])) => void
  isPaused: boolean
  setIsPaused: (paused: boolean) => void
  togglePause: () => void
}

const GameContext = createContext<GameState | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 1.7, z: 0 })
  const [playerRotation, setPlayerRotation] = useState(0)
  const [terrainHeightData, setTerrainHeightData] = useState<number[][]>([])
  const [terrainSize, setTerrainSize] = useState({ width: 400, depth: 400 })
  const [bulletTrails, setBulletTrails] = useState<BulletTrail[]>([])
  const [treeInstances, setTreeInstances] = useState<TreeInstance[]>([])
  const [stoneInstances, setStoneInstances] = useState<StoneInstance[]>([])
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([])
  const [isPaused, setIsPaused] = useState(false)

  // Use useCallback to prevent unnecessary re-renders
  const addBulletTrail = useCallback((trail: BulletTrail) => {
    setBulletTrails((prev) => {
      // Limit the number of trails to prevent performance issues
      const newTrails = [trail, ...prev]
      if (newTrails.length > 10) {
        return newTrails.slice(0, 10)
      }
      return newTrails
    })
  }, [])

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev)
  }, [])

  return (
    <GameContext.Provider
      value={{
        playerPosition,
        setPlayerPosition,
        playerRotation,
        setPlayerRotation,
        terrainHeightData,
        setTerrainHeightData,
        terrainSize,
        setTerrainSize,
        bulletTrails,
        addBulletTrail,
        treeInstances,
        setTreeInstances,
        stoneInstances,
        setStoneInstances,
        placedItems,
        setPlacedItems,
        isPaused,
        setIsPaused,
        togglePause,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGameState() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error("useGameState must be used within a GameProvider")
  }
  return context
}

// Remove the additional context and hook that was causing the error
