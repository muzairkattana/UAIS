"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface PlayerStatusContextType {
  health: number
  maxHealth: number
  food: number
  maxFood: number
  water: number
  maxWater: number
  // Aliases for consistency with other parts of the codebase
  hydration: number // Alias for water
  hunger: number // Derived from food (100 - food for hunger scale)
  setHealth: (value: number) => void
  setFood: (value: number) => void
  setWater: (value: number) => void
  damage: (amount: number) => void
  heal: (amount: number) => void
  consumeFood: (amount: number) => void
  consumeWater: (amount: number) => void
  updateStatus?: (status: { health?: number; hydration?: number; hunger?: number }) => void
}

const PlayerStatusContext = createContext<PlayerStatusContextType | null>(null)

export function PlayerStatusProvider({ children }: { children: ReactNode }) {
  const [health, setHealth] = useState(100)
  const [maxHealth, setMaxHealth] = useState(100)
  const [food, setFood] = useState(100)
  const [maxFood, setMaxFood] = useState(100)
  const [water, setWater] = useState(100)
  const [maxWater, setMaxWater] = useState(100)

  // Simulate hunger and thirst over time
  useEffect(() => {
    const interval = setInterval(() => {
      // Decrease food and water over time
      setFood((prev) => Math.max(0, prev - 0.1))
      setWater((prev) => Math.max(0, prev - 0.15))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Health decreases when food or water are critically low
  useEffect(() => {
    const interval = setInterval(() => {
      if (food < 10 || water < 10) {
        setHealth((prev) => Math.max(0, prev - 0.5))
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [food, water])

  // Apply damage to player
  const damage = (amount: number) => {
    setHealth((prev) => Math.max(0, prev - amount))
  }

  // Heal player
  const heal = (amount: number) => {
    setHealth((prev) => Math.min(maxHealth, prev + amount))
  }

  // Consume food
  const consumeFood = (amount: number) => {
    setFood((prev) => Math.min(maxFood, prev + amount))
  }

  // Consume water
  const consumeWater = (amount: number) => {
    setWater((prev) => Math.min(maxWater, prev + amount))
  }

  // Update status function for external updates
  const updateStatus = (status: { health?: number; hydration?: number; hunger?: number }) => {
    if (status.health !== undefined) {
      setHealth(status.health)
    }
    if (status.hydration !== undefined) {
      setWater(status.hydration)
    }
    if (status.hunger !== undefined) {
      // Convert hunger to food (inverse relationship)
      setFood(100 - status.hunger)
    }
  }

  return (
    <PlayerStatusContext.Provider
      value={{
        health,
        maxHealth,
        food,
        maxFood,
        water,
        maxWater,
        // Aliases for consistency
        hydration: water,
        hunger: Math.max(0, 100 - food), // Hunger is inverse of food
        setHealth,
        setFood,
        setWater,
        damage,
        heal,
        consumeFood,
        consumeWater,
        updateStatus,
      }}
    >
      {children}
    </PlayerStatusContext.Provider>
  )
}

export function usePlayerStatus() {
  const context = useContext(PlayerStatusContext)
  if (!context) {
    throw new Error("usePlayerStatus must be used within a PlayerStatusProvider")
  }
  return context
}
