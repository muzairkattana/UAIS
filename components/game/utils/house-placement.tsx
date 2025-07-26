"use client"

import * as THREE from "three"

interface TerrainData {
  heightData: number[][]
  width: number
  depth: number
}

interface PlacementOptions {
  minFlatness: number // Maximum height difference allowed in house area
  minWaterDistance: number // Minimum distance from water
  waterLevel: number
  preferredDistance: number // Preferred distance from spawn point
}

export function findBestHouseLocation(
  terrainData: TerrainData,
  spawnPoint: THREE.Vector3,
  options: PlacementOptions = {
    minFlatness: 1.5,
    minWaterDistance: 10,
    waterLevel: 0,
    preferredDistance: 20
  }
): { position: THREE.Vector3; rotation: number } | null {
  
  const { heightData, width, depth } = terrainData
  
  if (!heightData || heightData.length === 0) {
    console.warn("No terrain height data available for house placement")
    return null
  }

  // House footprint (8x6 units)
  const houseWidth = 8
  const houseDepth = 6
  
  // Convert to grid coordinates
  const gridWidth = heightData[0].length
  const gridDepth = heightData.length
  
  const gridHouseWidth = Math.ceil(houseWidth * gridWidth / width)
  const gridHouseDepth = Math.ceil(houseDepth * gridDepth / depth)
  
  console.log(`Searching for house placement. Grid size: ${gridWidth}x${gridDepth}, House grid size: ${gridHouseWidth}x${gridHouseDepth}`)
  
  let bestLocation: { x: number; z: number; score: number } | null = null
  
  // Search grid, leaving margin for house size
  const margin = Math.max(gridHouseWidth, gridHouseDepth) / 2 + 5
  
  for (let gridX = margin; gridX < gridWidth - margin; gridX += 2) {
    for (let gridZ = margin; gridZ < gridDepth - margin; gridZ += 2) {
      
      // Check if this area is suitable for house placement
      const suitability = evaluateLocation(
        heightData,
        gridX,
        gridZ,
        gridHouseWidth,
        gridHouseDepth,
        spawnPoint,
        options,
        width,
        depth
      )
      
      if (suitability.suitable && 
          (!bestLocation || suitability.score > bestLocation.score)) {
        bestLocation = {
          x: gridX,
          z: gridZ,
          score: suitability.score
        }
      }
    }
  }
  
  if (!bestLocation) {
    console.warn("Could not find suitable location for house placement")
    return null
  }
  
  // Convert back to world coordinates
  const worldX = (bestLocation.x - gridWidth / 2) * (width / gridWidth)
  const worldZ = (bestLocation.z - gridDepth / 2) * (depth / gridDepth)
  const worldY = heightData[bestLocation.z][bestLocation.x]
  
  // Calculate optimal rotation (face toward spawn point or good view)
  const housePosition = new THREE.Vector3(worldX, worldY, worldZ)
  const directionToSpawn = new THREE.Vector3()
    .subVectors(spawnPoint, housePosition)
    .normalize()
  
  // Face the house toward spawn point (approximately)
  let rotation = Math.atan2(directionToSpawn.x, directionToSpawn.z)
  
  // Snap to 45-degree increments for better aesthetics
  rotation = Math.round(rotation / (Math.PI / 4)) * (Math.PI / 4)
  
  console.log(`House placed at world coordinates: (${worldX.toFixed(2)}, ${worldY.toFixed(2)}, ${worldZ.toFixed(2)}) with rotation ${(rotation * 180 / Math.PI).toFixed(1)}°`)
  
  return {
    position: new THREE.Vector3(worldX, worldY, worldZ),
    rotation
  }
}

function evaluateLocation(
  heightData: number[][],
  gridX: number,
  gridZ: number,
  houseWidth: number,
  houseDepth: number,
  spawnPoint: THREE.Vector3,
  options: PlacementOptions,
  terrainWidth: number,
  terrainDepth: number
): { suitable: boolean; score: number } {
  
  const gridWidth = heightData[0].length
  const gridDepth = heightData.length
  
  // Sample heights in house area
  const heights: number[] = []
  const sampleStep = Math.max(1, Math.floor(Math.min(houseWidth, houseDepth) / 4))
  
  for (let dx = -houseWidth/2; dx <= houseWidth/2; dx += sampleStep) {
    for (let dz = -houseDepth/2; dz <= houseDepth/2; dz += sampleStep) {
      const sampleX = Math.round(gridX + dx)
      const sampleZ = Math.round(gridZ + dz)
      
      if (sampleX >= 0 && sampleX < gridWidth && 
          sampleZ >= 0 && sampleZ < gridDepth) {
        heights.push(heightData[sampleZ][sampleX])
      }
    }
  }
  
  if (heights.length === 0) {
    return { suitable: false, score: 0 }
  }
  
  // Check flatness
  const minHeight = Math.min(...heights)
  const maxHeight = Math.max(...heights)
  const heightDifference = maxHeight - minHeight
  
  if (heightDifference > options.minFlatness) {
    return { suitable: false, score: 0 }
  }
  
  // Check water distance
  const avgHeight = heights.reduce((sum, h) => sum + h, 0) / heights.length
  if (avgHeight <= options.waterLevel + 0.5) {
    return { suitable: false, score: 0 }
  }
  
  // Convert to world coordinates for distance calculation
  const worldX = (gridX - gridWidth / 2) * (terrainWidth / gridWidth)
  const worldZ = (gridZ - gridDepth / 2) * (terrainDepth / gridDepth)
  const worldPos = new THREE.Vector3(worldX, avgHeight, worldZ)
  
  // Calculate score based on various factors
  let score = 100 // Base score
  
  // Prefer flatter areas
  score -= heightDifference * 20
  
  // Prefer areas at preferred distance from spawn
  const distanceToSpawn = worldPos.distanceTo(spawnPoint)
  const distanceScore = Math.abs(distanceToSpawn - options.preferredDistance)
  score -= distanceScore * 2
  
  // Prefer slightly elevated areas (better drainage, view)
  score += Math.max(0, avgHeight - options.waterLevel) * 5
  
  // Prefer areas not too close to terrain edges
  const edgeDistance = Math.min(
    gridX, gridWidth - gridX,
    gridZ, gridDepth - gridZ
  )
  score += edgeDistance * 0.5
  
  return { suitable: true, score }
}

export function getHouseCollisionBoxes(position: THREE.Vector3, rotation: number): THREE.Box3[] {
  // Define collision boxes for the house structure
  const boxes: THREE.Box3[] = []
  
  // Main house collision box
  const houseBox = new THREE.Box3(
    new THREE.Vector3(-4, 0, -3),
    new THREE.Vector3(4, 3, 3)
  )
  
  // Apply rotation and translation
  const matrix = new THREE.Matrix4()
    .makeRotationY(rotation)
    .setPosition(position)
  
  houseBox.applyMatrix4(matrix)
  boxes.push(houseBox)
  
  return boxes
}
