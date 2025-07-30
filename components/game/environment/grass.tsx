"use client"

import { useMemo } from "react"
import * as THREE from "three"

interface GrassProps {
  terrainHeightData: number[][]
  terrainSize: { width: number; depth: number }
  waterLevel: number
  maxRenderDistance: number
}

export default function Grass({
  terrainHeightData,
  terrainSize,
  waterLevel
}: GrassProps) {
  // Generate grass positions
  const grassBlades = useMemo(() => {
    if (!terrainHeightData || terrainHeightData.length === 0) {
      console.log("No terrain data for grass")
      return []
    }
    
    const grassPositions: Array<{
      position: [number, number, number]
      rotation: [number, number, number]
      scale: number
    }> = []
    
    const grassCount = 100 // Further reduced count to prevent glitches
    const gridWidth = terrainHeightData[0].length
    const gridDepth = terrainHeightData.length
    
    for (let i = 0; i < grassCount; i++) {
      // Random position in grid
      const gridX = Math.floor(Math.random() * gridWidth)
      const gridZ = Math.floor(Math.random() * gridDepth)
      
      // Get terrain height
      const terrainHeight = terrainHeightData[gridZ][gridX]
      
      // Only place grass above water level
      if (terrainHeight > waterLevel + 0.2) {
        // Convert grid coordinates to world coordinates
        const worldX = (gridX / gridWidth) * terrainSize.width - terrainSize.width / 2
        const worldZ = (gridZ / gridDepth) * terrainSize.depth - terrainSize.depth / 2
        const worldY = terrainHeight + 0.05 // Slightly above ground
        
        grassPositions.push({
          position: [worldX, worldY, worldZ],
          rotation: [0, Math.random() * Math.PI * 2, 0],
          scale: 0.5 + Math.random() * 0.5
        })
      }
    }
    
    console.log(`Generated ${grassPositions.length} grass blades`)
    return grassPositions
  }, [terrainHeightData, terrainSize, waterLevel])
  
  if (grassBlades.length === 0) {
    console.log("No grass to render")
    return null
  }
  
  return (
    <>
      {grassBlades.map((grass, index) => (
        <group key={`grass-${index}`} position={grass.position} rotation={grass.rotation} scale={grass.scale}>
          {/* Grass blade */}
          <mesh position={[0, 0.1, 0]}>
            <planeGeometry args={[0.05, 0.2]} />
            <meshStandardMaterial 
              color="#4a7c59" 
              side={THREE.DoubleSide}
              transparent
              opacity={0.9}
            />
          </mesh>
        </group>
      ))}
    </>
  )
}
