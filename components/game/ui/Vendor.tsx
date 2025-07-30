"use client"

import React from 'react'
import { useBuilding } from '@/lib/building-context'

const Vendor: React.FC = () => {
  const {
    addResource,
    getResourceAmount,
  } = useBuilding()

  const handleBuyWood = () => {
    addResource('wood', 10)
    alert('Purchased 10 wood!')
  }

  const handleBuyBlueprint = () => {
    // Assume blueprints are special items
    alert('Purchased a blueprint!')
  }

  return (
    <div className="vendor">
      <h2>Vendor</h2>
      <button onClick={handleBuyWood}>Buy 10 Wood</button>
      <button onClick={handleBuyBlueprint}>Buy Blueprint</button>
      <p>Current Wood: {getResourceAmount('wood')}</p>
    </div>
  )
}

export default Vendor

