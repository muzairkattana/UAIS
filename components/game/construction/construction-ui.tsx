"use client"

import { useState, useEffect } from "react"
import { useInventory } from "@/lib/inventory-context"
import { BuildingComponent } from "./construction-manager"

interface ConstructionUIProps {
  visible: boolean
  placedComponents: BuildingComponent[]
  selectedComponentType: string | null
  onComponentSelect: (componentType: string) => void
  onToggleConstructionMode: () => void
}

const constructionPhases = [
  {
    id: 'foundation',
    name: 'Foundation Phase',
    description: 'Start by placing foundations on flat ground',
    components: ['item_wooden_foundation'],
    icon: '/foundation-wood.png',
    color: '#8B4513'
  },
  {
    id: 'walls',
    name: 'Wall Construction',
    description: 'Build walls on top of foundations',
    components: ['item_wooden_wall'],
    icon: '/wall-wood.png',
    color: '#A0522D'
  },
  {
    id: 'openings',
    name: 'Doors & Windows',
    description: 'Add doors and windows to walls',
    components: ['item_wooden_door', 'item_wooden_window'],
    icon: '/window-wood.png',
    color: '#DEB887'
  },
  {
    id: 'roofing',
    name: 'Roof & Ceiling',
    description: 'Complete with ceiling/roof structures',
    components: ['item_wooden_ceiling'],
    icon: '/ceiling-wood.png',
    color: '#654321'
  }
]

export default function ConstructionUI({
  visible,
  placedComponents,
  selectedComponentType,
  onComponentSelect,
  onToggleConstructionMode
}: ConstructionUIProps) {
  const { getItemCount } = useInventory()
  const [currentPhase, setCurrentPhase] = useState(0)
  const [buildingProgress, setBuildingProgress] = useState(0)

  // Calculate building progress based on placed components
  useEffect(() => {
    const totalComponents = placedComponents.length
    const foundations = placedComponents.filter(c => c.type === 'foundation').length
    const walls = placedComponents.filter(c => c.type === 'wall').length
    const openings = placedComponents.filter(c => c.type === 'door' || c.type === 'window').length
    const ceilings = placedComponents.filter(c => c.type === 'ceiling').length

    // Determine current phase based on what's built
    if (ceilings > 0) {
      setCurrentPhase(3)
    } else if (openings > 0) {
      setCurrentPhase(2)
    } else if (walls > 0) {
      setCurrentPhase(1)
    } else {
      setCurrentPhase(0)
    }

    // Calculate overall progress (0-100%)
    const progress = Math.min(100, (totalComponents / 8) * 100) // Assuming 8 components for a basic house
    setBuildingProgress(progress)
  }, [placedComponents])

  // Get component display name
  const getComponentDisplayName = (componentId: string): string => {
    return componentId
      .replace('item_wooden_', '')
      .replace('_', ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Check if component can be built (has materials)
  const canBuildComponent = (componentId: string): boolean => {
    return getItemCount(componentId) > 0
  }

  // Get construction tips based on current phase
  const getConstructionTips = (): string[] => {
    switch (currentPhase) {
      case 0:
        return [
          "Start by crafting wooden foundations using wood and stone",
          "Place foundations on flat, stable ground",
          "Foundations will snap together for larger structures",
          "Press R to rotate components before placing"
        ]
      case 1:
        return [
          "Walls must be placed on or near foundations",
          "Create room layouts by connecting walls",
          "Leave spaces for doors and windows",
          "Use snap points (green spheres) for precise placement"
        ]
      case 2:
        return [
          "Doors and windows must be placed within walls",
          "Doors provide access between rooms",
          "Windows offer light and visibility",
          "Consider the layout and functionality"
        ]
      case 3:
        return [
          "Ceilings complete the structure",
          "Ceilings need wall support to be placed",
          "This protects your interior from weather",
          "Your home construction is nearly complete!"
        ]
      default:
        return ["Start by gathering wood and stone materials"]
    }
  }

  if (!visible) return null

  return (
    <div className="fixed top-4 right-4 w-80 bg-black/80 backdrop-blur-sm rounded-lg border border-gray-600/50 p-4 text-white z-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-yellow-400">Construction Panel</h2>
        <button 
          onClick={onToggleConstructionMode}
          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
        >
          Exit
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm">Building Progress</span>
          <span className="text-sm text-green-400">{Math.round(buildingProgress)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${buildingProgress}%` }}
          />
        </div>
      </div>

      {/* Current Phase */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <div 
            className="w-4 h-4 rounded-full mr-2"
            style={{ backgroundColor: constructionPhases[currentPhase]?.color }}
          />
          <h3 className="font-semibold">{constructionPhases[currentPhase]?.name}</h3>
        </div>
        <p className="text-sm text-gray-300 mb-3">
          {constructionPhases[currentPhase]?.description}
        </p>
      </div>

      {/* Component Selection */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Available Components:</h4>
        <div className="space-y-2">
          {constructionPhases[currentPhase]?.components.map((componentId) => {
            const canBuild = canBuildComponent(componentId)
            const isSelected = selectedComponentType === componentId
            const count = getItemCount(componentId)
            
            return (
              <button
                key={componentId}
                onClick={() => onComponentSelect(componentId)}
                disabled={!canBuild}
                className={`w-full flex items-center justify-between p-2 rounded border transition-all ${
                  isSelected 
                    ? 'bg-blue-600 border-blue-400' 
                    : canBuild 
                      ? 'bg-gray-700 hover:bg-gray-600 border-gray-500' 
                      : 'bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center">
                  <img 
                    src={constructionPhases.find(p => p.components.includes(componentId))?.icon || '/placeholder.svg'} 
                    alt={getComponentDisplayName(componentId)}
                    className="w-6 h-6 mr-2"
                  />
                  <span className="text-sm">
                    {getComponentDisplayName(componentId)}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className={`text-xs ${canBuild ? 'text-green-400' : 'text-red-400'}`}>
                    {count}
                  </span>
                  {isSelected && (
                    <span className="ml-2 text-xs bg-blue-500 px-1 rounded">
                      SELECTED
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Construction Tips */}
      <div className="mb-4">
        <h4 className="font-medium mb-2 text-yellow-300">Construction Tips:</h4>
        <div className="space-y-1">
          {getConstructionTips().map((tip, index) => (
            <div key={index} className="text-xs text-gray-300 flex items-start">
              <span className="text-yellow-400 mr-1">•</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="border-t border-gray-600 pt-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center">
            <kbd className="bg-gray-700 px-1 py-0.5 rounded mr-1">Space</kbd>
            <span>Place</span>
          </div>
          <div className="flex items-center">
            <kbd className="bg-gray-700 px-1 py-0.5 rounded mr-1">R</kbd>
            <span>Rotate</span>
          </div>
          <div className="flex items-center">
            <kbd className="bg-gray-700 px-1 py-0.5 rounded mr-1">LMB</kbd>
            <span>Place</span>
          </div>
          <div className="flex items-center">
            <kbd className="bg-gray-700 px-1 py-0.5 rounded mr-1">RMB</kbd>
            <span>Rotate</span>
          </div>
        </div>
      </div>

      {/* Phase Navigation */}
      <div className="mt-4 border-t border-gray-600 pt-3">
        <h4 className="font-medium mb-2 text-sm">Construction Phases:</h4>
        <div className="flex justify-between">
          {constructionPhases.map((phase, index) => (
            <div 
              key={phase.id}
              className={`w-2 h-2 rounded-full transition-all ${
                index <= currentPhase ? 'bg-green-500' : 'bg-gray-600'
              }`}
              title={phase.name}
            />
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-4 border-t border-gray-600 pt-3 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-gray-400">Foundations:</span>
            <span className="ml-1 text-white">
              {placedComponents.filter(c => c.type === 'foundation').length}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Walls:</span>
            <span className="ml-1 text-white">
              {placedComponents.filter(c => c.type === 'wall').length}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Openings:</span>
            <span className="ml-1 text-white">
              {placedComponents.filter(c => c.type === 'door' || c.type === 'window').length}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Ceilings:</span>
            <span className="ml-1 text-white">
              {placedComponents.filter(c => c.type === 'ceiling').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
