"use client"

import React from 'react'
import { useBuilding } from '@/lib/building-context'

const CraftingStation: React.FC = () => {
  const {
    availableResources,
    placeElement,
    getResourceAmount,
    calculateRequiredResources,
  } = useBuilding()

  const handleCraftWall = () => {
    const required = calculateRequiredResources({
      type: 'wall',
      material: 'wood',
      position: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Euler(0, 0, 0),
      scale: new THREE.Vector3(1, 1, 1),
    })

    let affordable = true
    required.forEach((amount, resource) => {
      if (getResourceAmount(resource) < amount) {
        affordable = false
      }
    })

    if (affordable) {
      required.forEach((amount, resource) => {
        availableResources.set(resource, availableResources.get(resource)! - amount)
      })

      // Place element as if crafted
      placeElement({
        type: 'wall',
        material: 'wood',
        position: new THREE.Vector3(0, 0, 0),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
      })

      alert('Crafted a wooden wall!')
    } else {
      alert('Not enough resources to craft a wall!')
    }
  }

  return (
    <div className="crafting-station">
      <h2>Crafting Station</h2>
      <p>Resources:</p>
      <ul>
        {Array.from(availableResources).map(([resource, amount]) => (
          <li key={resource}>{resource}: {amount}</li>
        ))}
      </ul>
      <button onClick={handleCraftWall}>Craft Wooden Wall</button>
    </div>
  )
}

export default CraftingStation

