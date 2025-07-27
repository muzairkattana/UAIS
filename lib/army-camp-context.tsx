"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type * as THREE from "three"
import type { CampType, CampSize } from "@/components/game/structures/Camp"
import type { ArmyType } from "@/components/game/armies/Army"

export interface CampData {
  id: string
  position: THREE.Vector3
  rotation: number
  type: CampType
  size: CampSize
  maxOccupants: number
  currentOccupants: number
  armyIds: string[]
}

export interface ArmyData {
  id: string
  position: THREE.Vector3
  type: ArmyType
  size: number
  campId: string
  isActive: boolean
  target?: string
}

interface ArmyCampState {
  camps: Map<string, CampData>
  armies: Map<string, ArmyData>
  addCamp: (camp: Omit<CampData, 'id'>) => string
  removeCamp: (campId: string) => void
  updateCamp: (campId: string, updates: Partial<CampData>) => void
  addArmy: (army: Omit<ArmyData, 'id'>) => string
  removeArmy: (armyId: string) => void
  updateArmy: (armyId: string, updates: Partial<ArmyData>) => void
  moveArmy: (armyId: string, newPosition: THREE.Vector3) => void
  assignArmyToCamp: (armyId: string, campId: string) => void
}

const ArmyCampContext = createContext<ArmyCampState | null>(null)

export function ArmyCampProvider({ children }: { children: ReactNode }) {
  const [camps, setCamps] = useState<Map<string, CampData>>(new Map())
  const [armies, setArmies] = useState<Map<string, ArmyData>>(new Map())

  const addCamp = useCallback((campData: Omit<CampData, 'id'>): string => {
    const id = `camp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newCamp: CampData = {
      ...campData,
      id,
      position: campData.position.clone()
    }
    
    setCamps(prev => new Map(prev.set(id, newCamp)))
    return id
  }, [])

  const removeCamp = useCallback((campId: string) => {
    setCamps(prev => {
      const newCamps = new Map(prev)
      newCamps.delete(campId)
      return newCamps
    })
    
    // Remove armies associated with this camp
    setArmies(prev => {
      const newArmies = new Map(prev)
      for (const [armyId, army] of newArmies) {
        if (army.campId === campId) {
          newArmies.delete(armyId)
        }
      }
      return newArmies
    })
  }, [])

  const updateCamp = useCallback((campId: string, updates: Partial<CampData>) => {
    setCamps(prev => {
      const camp = prev.get(campId)
      if (!camp) return prev
      
      const newCamps = new Map(prev)
      newCamps.set(campId, { ...camp, ...updates })
      return newCamps
    })
  }, [])

  const addArmy = useCallback((armyData: Omit<ArmyData, 'id'>): string => {
    const id = `army-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newArmy: ArmyData = {
      ...armyData,
      id,
      position: armyData.position.clone()
    }
    
    setArmies(prev => new Map(prev.set(id, newArmy)))
    
    // Update camp occupant count
    setCamps(prev => {
      const camp = prev.get(armyData.campId)
      if (!camp) return prev
      
      const newCamps = new Map(prev)
      newCamps.set(armyData.campId, {
        ...camp,
        currentOccupants: camp.currentOccupants + newArmy.size,
        armyIds: [...camp.armyIds, id]
      })
      return newCamps
    })
    
    return id
  }, [])

  const removeArmy = useCallback((armyId: string) => {
    const army = armies.get(armyId)
    
    setArmies(prev => {
      const newArmies = new Map(prev)
      newArmies.delete(armyId)
      return newArmies
    })
    
    // Update camp occupant count
    if (army) {
      setCamps(prev => {
        const camp = prev.get(army.campId)
        if (!camp) return prev
        
        const newCamps = new Map(prev)
        newCamps.set(army.campId, {
          ...camp,
          currentOccupants: Math.max(0, camp.currentOccupants - army.size),
          armyIds: camp.armyIds.filter(id => id !== armyId)
        })
        return newCamps
      })
    }
  }, [armies])

  const updateArmy = useCallback((armyId: string, updates: Partial<ArmyData>) => {
    setArmies(prev => {
      const army = prev.get(armyId)
      if (!army) return prev
      
      const newArmies = new Map(prev)
      newArmies.set(armyId, { ...army, ...updates })
      return newArmies
    })
  }, [])

  const moveArmy = useCallback((armyId: string, newPosition: THREE.Vector3) => {
    updateArmy(armyId, { position: newPosition })
  }, [updateArmy])

  const assignArmyToCamp = useCallback((armyId: string, campId: string) => {
    const army = armies.get(armyId)
    const newCamp = camps.get(campId)
    
    if (!army || !newCamp) return
    
    // Remove from old camp
    const oldCamp = camps.get(army.campId)
    if (oldCamp) {
      updateCamp(army.campId, {
        currentOccupants: Math.max(0, oldCamp.currentOccupants - army.size),
        armyIds: oldCamp.armyIds.filter(id => id !== armyId)
      })
    }
    
    // Add to new camp
    updateCamp(campId, {
      currentOccupants: newCamp.currentOccupants + army.size,
      armyIds: [...newCamp.armyIds, armyId]
    })
    
    // Update army
    updateArmy(armyId, { campId })
  }, [armies, camps, updateArmy, updateCamp])

  return (
    <ArmyCampContext.Provider
      value={{
        camps,
        armies,
        addCamp,
        removeCamp,
        updateCamp,
        addArmy,
        removeArmy,
        updateArmy,
        moveArmy,
        assignArmyToCamp,
      }}
    >
      {children}
    </ArmyCampContext.Provider>
  )
}

export function useArmyCamp() {
  const context = useContext(ArmyCampContext)
  if (!context) {
    throw new Error("useArmyCamp must be used within an ArmyCampProvider")
  }
  return context
}
