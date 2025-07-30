"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import * as THREE from 'three'

// Building Material Types
export type MaterialType = 'wood' | 'stone' | 'metal' | 'glass' | 'concrete' | 'brick'
export type StructureType = 'wall' | 'door' | 'window' | 'foundation' | 'roof' | 'stairs' | 'floor'
export type FurnitureType = 'bed' | 'chair' | 'table' | 'shelf' | 'couch' | 'desk' | 'cabinet' | 'lamp'
export type UtilityType = 'electrical_wire' | 'power_outlet' | 'light_switch' | 'water_pipe' | 'faucet' | 'toilet'

// Building Element Interface
export interface BuildingElement {
  id: string
  type: StructureType | FurnitureType | UtilityType
  material: MaterialType
  position: THREE.Vector3
  rotation: THREE.Euler
  scale: THREE.Vector3
  color?: string
  texture?: string
  properties?: Record<string, any>
  connections?: string[] // For utilities system
}

// Construction Mode Types
export type ConstructionMode = 'select' | 'place' | 'move' | 'rotate' | 'delete' | 'paint' | 'wire' | 'plumb'

// Building State
interface BuildingState {
  // Construction Mode
  constructionMode: ConstructionMode
  isConstructionMode: boolean
  selectedElementType: StructureType | FurnitureType | UtilityType | null
  selectedMaterial: MaterialType
  
  // Building Elements
  placedElements: Map<string, BuildingElement>
  selectedElement: string | null
  
  // Preview
  previewElement: BuildingElement | null
  showGrid: boolean
  gridSize: number
  snapToGrid: boolean
  
  // Player Building
  playerBuildings: Array<{
    id: string
    name: string
    position: THREE.Vector3
    elements: string[]
  }>
  
  // Utilities Systems
  electricalNetwork: Map<string, string[]> // element_id -> connected_elements
  plumbingNetwork: Map<string, string[]>
  
  // Painting/Texturing
  selectedColor: string
  selectedTexture: string
  
  // Resources
  availableResources: Map<string, number>
  requiredResources: Map<string, number>
}

interface BuildingContextType extends BuildingState {
  // Construction Mode
  setConstructionMode: (mode: ConstructionMode) => void
  toggleConstructionMode: () => void
  setSelectedElementType: (type: StructureType | FurnitureType | UtilityType | null) => void
  setSelectedMaterial: (material: MaterialType) => void
  
  // Element Management
  placeElement: (element: Omit<BuildingElement, 'id'>) => string
  removeElement: (id: string) => void
  updateElement: (id: string, updates: Partial<BuildingElement>) => void
  selectElement: (id: string | null) => void
  
  // Preview
  setPreviewElement: (element: BuildingElement | null) => void
  toggleGrid: () => void
  setGridSize: (size: number) => void
  toggleSnapToGrid: () => void
  
  // Building Management
  createBuilding: (name: string, position: THREE.Vector3) => string
  saveBuilding: (buildingId: string) => void
  loadBuilding: (buildingId: string) => void
  
  // Utilities
  connectElements: (elementId1: string, elementId2: string, networkType: 'electrical' | 'plumbing') => void
  disconnectElements: (elementId1: string, elementId2: string, networkType: 'electrical' | 'plumbing') => void
  
  // Customization
  paintElement: (elementId: string, color: string) => void
  textureElement: (elementId: string, texture: string) => void
  setSelectedColor: (color: string) => void
  setSelectedTexture: (texture: string) => void
  
  // Resources
  addResource: (resource: string, amount: number) => void
  removeResource: (resource: string, amount: number) => boolean
  getResourceAmount: (resource: string) => number
  calculateRequiredResources: (element: Omit<BuildingElement, 'id'>) => Map<string, number>
}

const BuildingContext = createContext<BuildingContextType | undefined>(undefined)

export function BuildingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BuildingState>({
    constructionMode: 'select',
    isConstructionMode: false,
    selectedElementType: null,
    selectedMaterial: 'wood',
    placedElements: new Map(),
    selectedElement: null,
    previewElement: null,
    showGrid: true,
    gridSize: 1,
    snapToGrid: true,
    playerBuildings: [],
    electricalNetwork: new Map(),
    plumbingNetwork: new Map(),
    selectedColor: '#FFFFFF',
    selectedTexture: 'default',
    availableResources: new Map([
      ['wood', 100],
      ['stone', 50],
      ['metal', 25],
      ['glass', 10],
      ['concrete', 30],
      ['brick', 40]
    ]),
    requiredResources: new Map()
  })

  const setConstructionMode = useCallback((mode: ConstructionMode) => {
    setState(prev => ({ ...prev, constructionMode: mode }))
  }, [])

  const toggleConstructionMode = useCallback(() => {
    setState(prev => ({ ...prev, isConstructionMode: !prev.isConstructionMode }))
  }, [])

  const setSelectedElementType = useCallback((type: StructureType | FurnitureType | UtilityType | null) => {
    setState(prev => ({ ...prev, selectedElementType: type }))
  }, [])

  const setSelectedMaterial = useCallback((material: MaterialType) => {
    setState(prev => ({ ...prev, selectedMaterial: material }))
  }, [])

  const placeElement = useCallback((element: Omit<BuildingElement, 'id'>) => {
    const id = `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newElement: BuildingElement = { ...element, id }
    
    setState(prev => {
      const newElements = new Map(prev.placedElements)
      newElements.set(id, newElement)
      return { ...prev, placedElements: newElements }
    })
    
    return id
  }, [])

  const removeElement = useCallback((id: string) => {
    setState(prev => {
      const newElements = new Map(prev.placedElements)
      newElements.delete(id)
      
      // Remove from networks
      const newElectricalNetwork = new Map(prev.electricalNetwork)
      const newPlumbingNetwork = new Map(prev.plumbingNetwork)
      
      newElectricalNetwork.delete(id)
      newPlumbingNetwork.delete(id)
      
      // Remove connections to this element
      newElectricalNetwork.forEach((connections, elementId) => {
        const filtered = connections.filter(connId => connId !== id)
        newElectricalNetwork.set(elementId, filtered)
      })
      
      newPlumbingNetwork.forEach((connections, elementId) => {
        const filtered = connections.filter(connId => connId !== id)
        newPlumbingNetwork.set(elementId, filtered)
      })
      
      return {
        ...prev,
        placedElements: newElements,
        electricalNetwork: newElectricalNetwork,
        plumbingNetwork: newPlumbingNetwork,
        selectedElement: prev.selectedElement === id ? null : prev.selectedElement
      }
    })
  }, [])

  const updateElement = useCallback((id: string, updates: Partial<BuildingElement>) => {
    setState(prev => {
      const newElements = new Map(prev.placedElements)
      const element = newElements.get(id)
      if (element) {
        newElements.set(id, { ...element, ...updates })
      }
      return { ...prev, placedElements: newElements }
    })
  }, [])

  const selectElement = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedElement: id }))
  }, [])

  const setPreviewElement = useCallback((element: BuildingElement | null) => {
    setState(prev => ({ ...prev, previewElement: element }))
  }, [])

  const toggleGrid = useCallback(() => {
    setState(prev => ({ ...prev, showGrid: !prev.showGrid }))
  }, [])

  const setGridSize = useCallback((size: number) => {
    setState(prev => ({ ...prev, gridSize: size }))
  }, [])

  const toggleSnapToGrid = useCallback(() => {
    setState(prev => ({ ...prev, snapToGrid: !prev.snapToGrid }))
  }, [])

  const createBuilding = useCallback((name: string, position: THREE.Vector3) => {
    const id = `building_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newBuilding = { id, name, position, elements: [] }
    
    setState(prev => ({
      ...prev,
      playerBuildings: [...prev.playerBuildings, newBuilding]
    }))
    
    return id
  }, [])

  const saveBuilding = useCallback((buildingId: string) => {
    // Implementation for saving building to persistent storage
    console.log(`Saving building ${buildingId}`)
  }, [])

  const loadBuilding = useCallback((buildingId: string) => {
    // Implementation for loading building from persistent storage
    console.log(`Loading building ${buildingId}`)
  }, [])

  const connectElements = useCallback((elementId1: string, elementId2: string, networkType: 'electrical' | 'plumbing') => {
    setState(prev => {
      const network = networkType === 'electrical' ? prev.electricalNetwork : prev.plumbingNetwork
      const newNetwork = new Map(network)
      
      // Add bidirectional connection
      const connections1 = newNetwork.get(elementId1) || []
      const connections2 = newNetwork.get(elementId2) || []
      
      if (!connections1.includes(elementId2)) {
        newNetwork.set(elementId1, [...connections1, elementId2])
      }
      
      if (!connections2.includes(elementId1)) {
        newNetwork.set(elementId2, [...connections2, elementId1])
      }
      
      return {
        ...prev,
        [networkType === 'electrical' ? 'electricalNetwork' : 'plumbingNetwork']: newNetwork
      }
    })
  }, [])

  const disconnectElements = useCallback((elementId1: string, elementId2: string, networkType: 'electrical' | 'plumbing') => {
    setState(prev => {
      const network = networkType === 'electrical' ? prev.electricalNetwork : prev.plumbingNetwork
      const newNetwork = new Map(network)
      
      // Remove bidirectional connection
      const connections1 = newNetwork.get(elementId1) || []
      const connections2 = newNetwork.get(elementId2) || []
      
      newNetwork.set(elementId1, connections1.filter(id => id !== elementId2))
      newNetwork.set(elementId2, connections2.filter(id => id !== elementId1))
      
      return {
        ...prev,
        [networkType === 'electrical' ? 'electricalNetwork' : 'plumbingNetwork']: newNetwork
      }
    })
  }, [])

  const paintElement = useCallback((elementId: string, color: string) => {
    updateElement(elementId, { color })
  }, [updateElement])

  const textureElement = useCallback((elementId: string, texture: string) => {
    updateElement(elementId, { texture })
  }, [updateElement])

  const setSelectedColor = useCallback((color: string) => {
    setState(prev => ({ ...prev, selectedColor: color }))
  }, [])

  const setSelectedTexture = useCallback((texture: string) => {
    setState(prev => ({ ...prev, selectedTexture: texture }))
  }, [])

  const addResource = useCallback((resource: string, amount: number) => {
    setState(prev => {
      const newResources = new Map(prev.availableResources)
      const current = newResources.get(resource) || 0
      newResources.set(resource, current + amount)
      return { ...prev, availableResources: newResources }
    })
  }, [])

  const removeResource = useCallback((resource: string, amount: number): boolean => {
    const current = state.availableResources.get(resource) || 0
    if (current >= amount) {
      setState(prev => {
        const newResources = new Map(prev.availableResources)
        newResources.set(resource, current - amount)
        return { ...prev, availableResources: newResources }
      })
      return true
    }
    return false
  }, [state.availableResources])

  const getResourceAmount = useCallback((resource: string): number => {
    return state.availableResources.get(resource) || 0
  }, [state.availableResources])

  const calculateRequiredResources = useCallback((element: Omit<BuildingElement, 'id'>): Map<string, number> => {
    const required = new Map<string, number>()
    
    // Base material requirement
    required.set(element.material, 1)
    
    // Additional requirements based on type
    switch (element.type) {
      case 'wall':
        required.set(element.material, 2)
        break
      case 'door':
        required.set(element.material, 3)
        required.set('metal', 1) // hinges
        break
      case 'window':
        required.set(element.material, 2)
        required.set('glass', 1)
        break
      case 'foundation':
        required.set('concrete', 3)
        required.set('stone', 2)
        break
      case 'roof':
        required.set(element.material, 4)
        break
      default:
        break
    }
    
    return required
  }, [])

  const value: BuildingContextType = {
    ...state,
    setConstructionMode,
    toggleConstructionMode,
    setSelectedElementType,
    setSelectedMaterial,
    placeElement,
    removeElement,
    updateElement,
    selectElement,
    setPreviewElement,
    toggleGrid,
    setGridSize,
    toggleSnapToGrid,
    createBuilding,
    saveBuilding,
    loadBuilding,
    connectElements,
    disconnectElements,
    paintElement,
    textureElement,
    setSelectedColor,
    setSelectedTexture,
    addResource,
    removeResource,
    getResourceAmount,
    calculateRequiredResources
  }

  return (
    <BuildingContext.Provider value={value}>
      {children}
    </BuildingContext.Provider>
  )
}

export function useBuilding() {
  const context = useContext(BuildingContext)
  if (context === undefined) {
    throw new Error('useBuilding must be used within a BuildingProvider')
  }
  return context
}
