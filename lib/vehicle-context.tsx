"use client"

import React, { createContext, useContext, useState, useRef, useEffect } from "react"
import * as THREE from "three"

export type VehicleType = "car" | "motorcycle" | "bicycle" | null

interface VehicleState {
  activeVehicle: VehicleType
  isInVehicle: boolean
  vehiclePosition: THREE.Vector3
  vehicleRotation: THREE.Euler
  playerPositionBeforeVehicle: THREE.Vector3 | null
}

interface VehicleContextType {
  vehicleState: VehicleState
  setActiveVehicle: (vehicle: VehicleType) => void
  exitVehicle: () => void
  updateVehicleTransform: (position: THREE.Vector3, rotation: THREE.Euler) => void
  getVehicleOffset: (vehicleType: VehicleType) => THREE.Vector3
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined)

export function VehicleProvider({ children }: { children: React.ReactNode }) {
  const [vehicleState, setVehicleState] = useState<VehicleState>({
    activeVehicle: null,
    isInVehicle: false,
    vehiclePosition: new THREE.Vector3(),
    vehicleRotation: new THREE.Euler(),
    playerPositionBeforeVehicle: null,
  })

  const setActiveVehicle = (vehicle: VehicleType) => {
    setVehicleState(prev => ({
      ...prev,
      activeVehicle: vehicle,
      isInVehicle: vehicle !== null,
      playerPositionBeforeVehicle: vehicle !== null && !prev.isInVehicle 
        ? prev.vehiclePosition.clone() 
        : prev.playerPositionBeforeVehicle,
    }))
  }

  const exitVehicle = () => {
    setVehicleState(prev => ({
      ...prev,
      activeVehicle: null,
      isInVehicle: false,
      // Keep the current vehicle position as the exit position
    }))
  }

  const updateVehicleTransform = (position: THREE.Vector3, rotation: THREE.Euler) => {
    setVehicleState(prev => ({
      ...prev,
      vehiclePosition: position.clone(),
      vehicleRotation: rotation.clone(),
    }))
  }

  const getVehicleOffset = (vehicleType: VehicleType): THREE.Vector3 => {
    switch (vehicleType) {
      case "car":
        return new THREE.Vector3(0, 1.2, 0) // Inside the car
      case "motorcycle":
        return new THREE.Vector3(0, 1.5, 0) // On top of the motorcycle
      case "bicycle":
        return new THREE.Vector3(0, 1.8, 0) // On top of the bicycle
      default:
        return new THREE.Vector3(0, 0, 0)
    }
  }

  return (
    <VehicleContext.Provider value={{
      vehicleState,
      setActiveVehicle,
      exitVehicle,
      updateVehicleTransform,
      getVehicleOffset,
    }}>
      {children}
    </VehicleContext.Provider>
  )
}

export function useVehicle() {
  const context = useContext(VehicleContext)
  if (context === undefined) {
    throw new Error("useVehicle must be used within a VehicleProvider")
  }
  return context
}
