"use client"

import React, { useState } from 'react'
import { useBuilding, type MaterialType, type StructureType, type FurnitureType, type UtilityType } from '@/lib/building-context'
import * as THREE from 'three'

const BuildingHUD: React.FC = () => {
  const {
    availableResources,
    getResourceAmount,
    addResource,
    removeResource,
    calculateRequiredResources,
    placeElement,
    isConstructionMode,
    selectedElementType,
    selectedMaterial,
    setSelectedElementType,
    setSelectedMaterial,
    selectedColor,
    setSelectedColor
  } = useBuilding()

  const [activeTab, setActiveTab] = useState<'crafting' | 'vendor' | 'resources'>('crafting')

  // Crafting recipes
  const craftingRecipes = [
    {
      id: 'wooden_wall',
      name: 'Wooden Wall',
      type: 'wall' as StructureType,
      material: 'wood' as MaterialType,
      description: 'Basic wooden wall for construction',
      icon: '🧱'
    },
    {
      id: 'stone_wall',
      name: 'Stone Wall',
      type: 'wall' as StructureType,
      material: 'stone' as MaterialType,
      description: 'Durable stone wall',
      icon: '🏗️'
    },
    {
      id: 'wooden_door',
      name: 'Wooden Door',
      type: 'door' as StructureType,
      material: 'wood' as MaterialType,
      description: 'Basic wooden door',
      icon: '🚪'
    },
    {
      id: 'glass_window',
      name: 'Glass Window',
      type: 'window' as StructureType,
      material: 'glass' as MaterialType,
      description: 'Clear glass window',
      icon: '🪟'
    },
    {
      id: 'concrete_foundation',
      name: 'Concrete Foundation',
      type: 'foundation' as StructureType,
      material: 'concrete' as MaterialType,
      description: 'Strong concrete foundation',
      icon: '🏗️'
    },
    {
      id: 'wooden_bed',
      name: 'Wooden Bed',
      type: 'bed' as FurnitureType,
      material: 'wood' as MaterialType,
      description: 'Comfortable wooden bed',
      icon: '🛏️'
    },
    {
      id: 'wooden_table',
      name: 'Wooden Table',
      type: 'table' as FurnitureType,
      material: 'wood' as MaterialType,
      description: 'Sturdy wooden table',
      icon: '🪑'
    },
    {
      id: 'power_outlet',
      name: 'Power Outlet',
      type: 'power_outlet' as UtilityType,
      material: 'metal' as MaterialType,
      description: 'Electrical power outlet',
      icon: '🔌'
    },
    {
      id: 'water_faucet',
      name: 'Water Faucet',
      type: 'faucet' as UtilityType,
      material: 'metal' as MaterialType,
      description: 'Water faucet for plumbing',
      icon: '🚿'
    }
  ]

  // Vendor items
  const vendorItems = [
    { id: 'wood', name: 'Wood', price: 10, amount: 10, icon: '🪵' },
    { id: 'stone', name: 'Stone', price: 15, amount: 5, icon: '🪨' },
    { id: 'metal', name: 'Metal', price: 25, amount: 3, icon: '⚙️' },
    { id: 'glass', name: 'Glass', price: 30, amount: 2, icon: '🪟' },
    { id: 'concrete', name: 'Concrete', price: 20, amount: 5, icon: '🧱' },
    { id: 'brick', name: 'Brick', price: 18, amount: 8, icon: '🧱' }
  ]

  // Color palette
  const colorPalette = [
    '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#00FF7F', '#DC143C'
  ]

  const handleCraft = (recipe: typeof craftingRecipes[0]) => {
    const required = calculateRequiredResources({
      type: recipe.type,
      material: recipe.material,
      position: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Euler(0, 0, 0),
      scale: new THREE.Vector3(1, 1, 1)
    })

    let canCraft = true
    const missingResources: string[] = []

    required.forEach((amount, resource) => {
      if (getResourceAmount(resource) < amount) {
        canCraft = false
        missingResources.push(`${resource}: ${amount - getResourceAmount(resource)}`)
      }
    })

    if (canCraft) {
      // Deduct resources
      required.forEach((amount, resource) => {
        removeResource(resource, amount)
      })

      // Set the crafted item as selected for placement
      setSelectedElementType(recipe.type)
      setSelectedMaterial(recipe.material)

      alert(`Crafted ${recipe.name}! Select it for placement in construction mode.`)
    } else {
      alert(`Cannot craft ${recipe.name}. Missing: ${missingResources.join(', ')}`)
    }
  }

  const handlePurchase = (item: typeof vendorItems[0]) => {
    // For now, assume the player has unlimited currency
    addResource(item.id, item.amount)
    alert(`Purchased ${item.amount} ${item.name} for ${item.price} coins!`)
  }

  const canCraftItem = (recipe: typeof craftingRecipes[0]) => {
    const required = calculateRequiredResources({
      type: recipe.type,
      material: recipe.material,
      position: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Euler(0, 0, 0),
      scale: new THREE.Vector3(1, 1, 1)
    })

    let canCraft = true
    required.forEach((amount, resource) => {
      if (getResourceAmount(resource) < amount) {
        canCraft = false
      }
    })

    return canCraft
  }

  const getRequiredResourcesText = (recipe: typeof craftingRecipes[0]) => {
    const required = calculateRequiredResources({
      type: recipe.type,
      material: recipe.material,
      position: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Euler(0, 0, 0),
      scale: new THREE.Vector3(1, 1, 1)
    })

    return Array.from(required.entries())
      .map(([resource, amount]) => `${resource}: ${amount}`)
      .join(', ')
  }

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800/95 backdrop-blur-md rounded-lg border border-teal-400/30 text-white w-96 max-h-[70vh] overflow-hidden">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4 text-teal-300">Building System</h2>
        
        {/* Tab Navigation */}
        <div className="flex mb-4 bg-slate-700/50 rounded-lg p-1">
          {(['crafting', 'vendor', 'resources'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-teal-500 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
              }`}
            >
              {tab === 'crafting' && '🔨 Craft'}
              {tab === 'vendor' && '🛒 Buy'}
              {tab === 'resources' && '📦 Resources'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto max-h-[400px]">
          {activeTab === 'crafting' && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-teal-300 mb-3">Crafting Recipes</h3>
              {craftingRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    canCraftItem(recipe)
                      ? 'bg-slate-700/50 border-teal-400/30 hover:bg-slate-600/50'
                      : 'bg-slate-700/30 border-red-400/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{recipe.icon}</span>
                      <span className="font-medium">{recipe.name}</span>
                    </div>
                    <button
                      onClick={() => handleCraft(recipe)}
                      disabled={!canCraftItem(recipe)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        canCraftItem(recipe)
                          ? 'bg-teal-500 hover:bg-teal-600 text-white'
                          : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      Craft
                    </button>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{recipe.description}</p>
                  <p className="text-xs text-slate-500">
                    Requires: {getRequiredResourcesText(recipe)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'vendor' && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-teal-300 mb-3">Vendor Shop</h3>
              {vendorItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-700/50 rounded-lg border border-teal-400/30 hover:bg-slate-600/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-slate-400">x{item.amount}</span>
                    </div>
                    <button
                      onClick={() => handlePurchase(item)}
                      className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium transition-colors"
                    >
                      {item.price} 💰
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-teal-300 mb-3">Resource Inventory</h3>
              
              {/* Resource List */}
              <div className="space-y-2">
                {Array.from(availableResources.entries()).map(([resource, amount]) => (
                  <div
                    key={resource}
                    className="flex items-center justify-between p-2 bg-slate-700/50 rounded border border-slate-600"
                  >
                    <span className="font-medium capitalize">{resource}</span>
                    <span className="text-teal-300 font-semibold">{amount}</span>
                  </div>
                ))}
              </div>

              {/* Color Palette */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-teal-300 mb-2">Color Palette</h4>
                <div className="grid grid-cols-5 gap-2">
                  {colorPalette.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded border-2 transition-all ${
                        selectedColor === color
                          ? 'border-teal-400 scale-110'
                          : 'border-slate-600 hover:border-slate-400'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Selected Color: {selectedColor}
                </p>
              </div>

              {/* Current Selection */}
              {isConstructionMode && (
                <div className="mt-4 p-3 bg-slate-700/30 rounded border border-teal-400/30">
                  <h4 className="text-sm font-semibold text-teal-300 mb-2">Current Selection</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-slate-400">Type:</span> {selectedElementType || 'None'}</p>
                    <p><span className="text-slate-400">Material:</span> {selectedMaterial}</p>
                    <p><span className="text-slate-400">Color:</span> 
                      <span 
                        className="inline-block w-4 h-4 ml-2 rounded border border-slate-400" 
                        style={{ backgroundColor: selectedColor }}
                      />
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BuildingHUD
