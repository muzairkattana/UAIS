"use client"

import React, { useState, useCallback, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useSettings } from '@/lib/settings-context'

interface MinimapProps {
  playerPosition: THREE.Vector3
  playerRotation: number
  terrainSize: { width: number; depth: number }
  terrainHeightData?: number[][]
  villageHouses: Array<{
    id: string
    type: 'cabin' | 'hut' | 'stone' | 'tent'
    position: THREE.Vector3
    rotation: number
  }>
  enemies: Array<{
    id: string
    type: 'goblin' | 'crawler' | 'bandit' | 'golem'
    position: THREE.Vector3
    isAlive: boolean
  }>
  placedDoors: Array<{
    id: string
    position: [number, number, number]
    rotation?: number
    normal?: [number, number, number]
    isOpen?: boolean
  }>
  trees?: Array<{
    position: THREE.Vector3
    isChopped?: boolean
  }>
  stones?: Array<{
    position: THREE.Vector3
    isMined?: boolean
  }>
  placedItems?: Array<{
    position: THREE.Vector3
    type: string
  }>
  campfires?: Array<{
    id: string
    position: [number, number, number]
    isActive?: boolean
  }>
  storageBoxes?: Array<{
    id: string
    position: [number, number, number]
  }>
}

const AdvancedMinimap: React.FC<MinimapProps> = ({
  playerPosition,
  playerRotation,
  terrainSize,
  terrainHeightData = [],
  villageHouses,
  enemies,
  placedDoors,
  trees = [],
  stones = [],
  placedItems = [],
  campfires = [],
  storageBoxes = []
}) => {
  const [isZoomedOut, setIsZoomedOut] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Fallback for settings to prevent crashes
  let settings
  try {
    settings = useSettings().settings
  } catch (error) {
    console.warn('Settings context not available, using fallback')
    settings = {}
  }

  // Minimap dimensions
  const minimapSize = 180
  const minimapRadius = minimapSize / 2
  
  // Zoom levels
  const zoomClose = 50 // Close view shows 50x50 units around player
  const zoomWide = 200 // Wide view shows 200x200 units around player
  const currentZoom = isZoomedOut ? zoomWide : zoomClose

  // Toggle zoom function
  const toggleZoom = useCallback(() => {
    setIsZoomedOut(prev => !prev)
  }, [])

  // Convert world coordinates to minimap coordinates
  const worldToMinimap = useCallback((worldPos: THREE.Vector3) => {
    // Calculate relative position to player
    const relativeX = worldPos.x - playerPosition.x
    const relativeZ = worldPos.z - playerPosition.z
    
    // Scale to minimap coordinates
    const scale = minimapRadius / currentZoom
    const minimapX = relativeX * scale
    const minimapZ = relativeZ * scale
    
    // Rotate coordinates based on player rotation (so north is always up)
    const cos = Math.cos(-playerRotation)
    const sin = Math.sin(-playerRotation)
    const rotatedX = minimapX * cos - minimapZ * sin
    const rotatedZ = minimapX * sin + minimapZ * cos
    
    // Convert to screen coordinates (center of minimap is at minimapRadius, minimapRadius)
    const screenX = minimapRadius + rotatedX
    const screenY = minimapRadius + rotatedZ
    
    return { x: screenX, y: screenY }
  }, [playerPosition, playerRotation, currentZoom, minimapRadius])

  // Check if position is within minimap bounds
  const isInBounds = useCallback((screenPos: { x: number; y: number }) => {
    const dx = screenPos.x - minimapRadius
    const dy = screenPos.y - minimapRadius
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance <= minimapRadius - 5 // Small margin to keep items within circle
  }, [minimapRadius])

  // Canvas rendering effect
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Set canvas size
    canvas.width = minimapSize
    canvas.height = minimapSize
    
    // Clear canvas
    ctx.clearRect(0, 0, minimapSize, minimapSize)

    // Draw background circle with gradient
    ctx.save()
    ctx.beginPath()
    ctx.arc(minimapRadius, minimapRadius, minimapRadius - 4, 0, Math.PI * 2)
    
    // Create modern gradient background
    const bgGradient = ctx.createRadialGradient(
      minimapRadius, minimapRadius, 0,
      minimapRadius, minimapRadius, minimapRadius
    )
    bgGradient.addColorStop(0, "rgba(20, 25, 35, 0.95)")
    bgGradient.addColorStop(0.8, "rgba(15, 20, 30, 0.9)")
    bgGradient.addColorStop(1, "rgba(10, 15, 25, 0.85)")
    ctx.fillStyle = bgGradient
    ctx.fill()
    
    // Modern sleek border
    ctx.strokeStyle = "rgba(64, 224, 208, 0.6)"
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.restore()

    // Create clipping path for circular minimap
    ctx.save()
    ctx.beginPath()
    ctx.arc(minimapRadius, minimapRadius, minimapRadius - 6, 0, Math.PI * 2)
    ctx.clip()

    // Draw terrain if available
    if (terrainHeightData.length > 0) {
      const terrainImageData = ctx.createImageData(minimapSize, minimapSize)
      const data = terrainImageData.data

      for (let y = 0; y < minimapSize; y++) {
        for (let x = 0; x < minimapSize; x++) {
          // Convert minimap coordinates to terrain coordinates
          const terrainX = Math.floor((x / minimapSize) * terrainHeightData[0].length)
          const terrainY = Math.floor((y / minimapSize) * terrainHeightData.length)

          if (
            terrainX >= 0 && terrainX < terrainHeightData[0].length &&
            terrainY >= 0 && terrainY < terrainHeightData.length
          ) {
            const height = terrainHeightData[terrainY][terrainX]

            // Color based on height with better gradients
            let r, g, b
            if (height < -2) {
              // Deep water - dark blue
              r = 25; g = 50; b = 120
            } else if (height < 0) {
              // Shallow water - medium blue
              r = 45; g = 85; b = 160
            } else if (height < 2) {
              // Low ground - green
              r = 45; g = 90; b = 45
            } else if (height < 4) {
              // Medium ground - darker green
              r = 65; g = 110; b = 65
            } else {
              // High ground - brown/gray
              r = 90; g = 80; b = 70
            }

            const index = (y * minimapSize + x) * 4
            data[index] = r // Red
            data[index + 1] = g // Green
            data[index + 2] = b // Blue
            data[index + 3] = 255 // Alpha
          }
        }
      }

      ctx.putImageData(terrainImageData, 0, 0)
    }

    // Draw subtle grid overlay
    ctx.strokeStyle = "rgba(64, 224, 208, 0.12)"
    ctx.lineWidth = 0.3
    for (let i = 1; i < 6; i++) {
      const pos = (i / 6) * minimapSize
      ctx.beginPath()
      ctx.moveTo(pos, 0)
      ctx.lineTo(pos, minimapSize)
      ctx.stroke()
      
      ctx.beginPath()
      ctx.moveTo(0, pos)
      ctx.lineTo(minimapSize, pos)
      ctx.stroke()
    }

    // Draw trees
    trees.forEach((tree) => {
      if (tree.isChopped) return
      
      const pos = worldToMinimap(tree.position)
      if (pos.x >= 0 && pos.x <= minimapSize && pos.y >= 0 && pos.y <= minimapSize) {
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(34, 139, 34, 0.8)"
        ctx.fill()
      }
    })

    // Draw stone nodes
    stones.forEach((stone) => {
      if (stone.isMined) return
      
      const pos = worldToMinimap(stone.position)
      if (pos.x >= 0 && pos.x <= minimapSize && pos.y >= 0 && pos.y <= minimapSize) {
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 1, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(128, 128, 128, 0.8)"
        ctx.fill()
      }
    })

    // Draw placed items
    placedItems.forEach((item) => {
      const pos = worldToMinimap(item.position)
      if (pos.x >= 0 && pos.x <= minimapSize && pos.y >= 0 && pos.y <= minimapSize) {
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2)
        
        // Different colors for different item types
        switch (item.type) {
          case "campfire":
            ctx.fillStyle = "rgba(255, 100, 0, 0.9)"
            break
          case "storage_box":
            ctx.fillStyle = "rgba(139, 69, 19, 0.9)"
            break
          case "door":
            ctx.fillStyle = "rgba(160, 82, 45, 0.9)"
            break
          default:
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
        }
        
        ctx.fill()
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
        ctx.lineWidth = 1
        ctx.stroke()
      }
    })

    // Draw modern player indicator with glow
    ctx.shadowColor = "rgba(64, 224, 208, 0.9)"
    ctx.shadowBlur = 10
    ctx.beginPath()
    ctx.arc(minimapRadius, minimapRadius, 4, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(64, 224, 208, 1)"
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Draw modern direction indicator
    const directionLength = 12
    const directionX = Math.sin(playerRotation) * directionLength
    const directionY = -Math.cos(playerRotation) * directionLength
    
    ctx.shadowColor = "rgba(255, 215, 0, 0.8)"
    ctx.shadowBlur = 4
    ctx.beginPath()
    ctx.moveTo(minimapRadius, minimapRadius)
    ctx.lineTo(minimapRadius + directionX, minimapRadius + directionY)
    ctx.strokeStyle = "rgba(255, 215, 0, 1)"
    ctx.lineWidth = 2.5
    ctx.stroke()
    ctx.shadowBlur = 0

    // Draw compass directions
    ctx.restore()
    
    // Modern compass markers
    ctx.fillStyle = "rgba(64, 224, 208, 0.9)"
    ctx.font = "bold 10px 'Segoe UI', Arial, sans-serif"
    ctx.textAlign = "center"
    ctx.shadowColor = "rgba(0, 0, 0, 0.9)"
    ctx.shadowBlur = 3
    
    // North indicator
    ctx.fillText("N", minimapRadius, 16)
    
    // East indicator
    ctx.fillText("E", minimapSize - 16, minimapRadius + 4)
    
    // South indicator
    ctx.fillText("S", minimapRadius, minimapSize - 8)
    
    // West indicator
    ctx.fillText("W", 16, minimapRadius + 4)
    
    ctx.shadowBlur = 0

  }, [playerPosition, playerRotation, terrainHeightData, trees, stones, placedItems, terrainSize, worldToMinimap, minimapRadius, minimapSize])

  // House type colors
  const houseColors = {
    cabin: '#8B4513', // Saddle brown
    hut: '#DAA520', // Goldenrod
    stone: '#696969', // Dim gray
    tent: '#CD853F' // Peru
  }

  // Enemy type colors
  const enemyColors = {
    goblin: '#228B22', // Forest green
    crawler: '#8B4513', // Saddle brown
    bandit: '#4B0082', // Indigo
    golem: '#A0522D' // Sienna
  }

  // Debug minimap rendering
  console.log('AdvancedMinimap Debug:', {
    isVisible,
    playerPosition,
    terrainHeightDataLength: terrainHeightData?.length || 0,
    villageHousesLength: villageHouses?.length || 0,
    enemiesLength: enemies?.length || 0
  })

  if (!isVisible) {
    console.log('AdvancedMinimap: Not visible, returning null')
    return null
  }

  console.log('AdvancedMinimap: Rendering minimap')
  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Modern outer glow */}
      <div 
        className="absolute inset-0 rounded-full blur-xl opacity-40"
        style={{
          background: "radial-gradient(circle, rgba(64,224,208,0.3) 0%, rgba(20,25,35,0.1) 70%)",
          width: minimapSize + 16,
          height: minimapSize + 16,
          left: -8,
          top: -8,
        }}
      />
      
      <div 
        className="relative bg-slate-900/80 rounded-full p-1 backdrop-blur-md border border-teal-400/40"
        style={{
          width: minimapSize,
          height: minimapSize,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(64, 224, 208, 0.2)',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onClick={toggleZoom}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)'
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(64, 224, 208, 0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(64, 224, 208, 0.2)'
        }}
        title={`Click to ${isZoomedOut ? 'zoom in' : 'zoom out'}`}
      >
        {/* Canvas for terrain and basic elements */}
        <canvas
          ref={canvasRef}
          width={minimapSize}
          height={minimapSize}
          className="absolute inset-0 rounded-full"
          style={{ width: minimapSize, height: minimapSize }}
        />

        {/* SVG overlay for interactive elements */}
        <svg
          width={minimapSize}
          height={minimapSize}
          className="absolute inset-0 rounded-full"
        >
          <defs>
            <clipPath id="circleClip">
              <circle cx={minimapRadius} cy={minimapRadius} r={minimapRadius - 6} />
            </clipPath>
          </defs>
          
          {/* Campfires */}
          {campfires.map((campfire) => {
            const screenPos = worldToMinimap(new THREE.Vector3(campfire.position[0], campfire.position[1], campfire.position[2]))
            if (!isInBounds(screenPos)) return null
            
            return (
              <g key={campfire.id} clipPath="url(#circleClip)">
                <circle
                  cx={screenPos.x}
                  cy={screenPos.y}
                  r="3"
                  fill={campfire.isActive ? "#FF6600" : "#8B4513"}
                  stroke="#FFFFFF"
                  strokeWidth="1"
                />
                {campfire.isActive && (
                  <circle
                    cx={screenPos.x}
                    cy={screenPos.y}
                    r="2"
                    fill="#FFFF00"
                    opacity="0.8"
                  />
                )}
              </g>
            )
          })}
          
          {/* Storage boxes */}
          {storageBoxes.map((box) => {
            const screenPos = worldToMinimap(new THREE.Vector3(box.position[0], box.position[1], box.position[2]))
            if (!isInBounds(screenPos)) return null
            
            return (
              <rect
                key={box.id}
                x={screenPos.x - 2}
                y={screenPos.y - 2}
                width="4"
                height="4"
                fill="#8B4513"
                stroke="#FFFFFF"
                strokeWidth="0.5"
                clipPath="url(#circleClip)"
              />
            )
          })}
          
          {/* Doors */}
          {placedDoors.map((door) => {
            const screenPos = worldToMinimap(new THREE.Vector3(door.position[0], door.position[1], door.position[2]))
            if (!isInBounds(screenPos)) return null
            
            return (
              <rect
                key={door.id}
                x={screenPos.x - 1.5}
                y={screenPos.y - 3}
                width="3"
                height="6"
                fill={door.isOpen ? "#FFFF00" : "#8B4513"}
                stroke="#FFFFFF"
                strokeWidth="0.5"
                clipPath="url(#circleClip)"
              />
            )
          })}
          
          {/* Village houses */}
          {villageHouses.map((house) => {
            const screenPos = worldToMinimap(house.position)
            if (!isInBounds(screenPos)) return null
            
            return (
              <g key={house.id} clipPath="url(#circleClip)">
                <rect
                  x={screenPos.x - 4}
                  y={screenPos.y - 4}
                  width="8"
                  height="8"
                  fill={houseColors[house.type]}
                  stroke="#FFFFFF"
                  strokeWidth="1"
                />
                {/* House type indicator */}
                <text
                  x={screenPos.x}
                  y={screenPos.y + 2}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="6"
                  fontWeight="bold"
                >
                  {house.type.charAt(0).toUpperCase()}
                </text>
              </g>
            )
          })}
          
          {/* Enemies */}
          {enemies.filter(enemy => enemy.isAlive).map((enemy) => {
            const screenPos = worldToMinimap(enemy.position)
            if (!isInBounds(screenPos)) return null
            
            return (
              <g key={enemy.id} clipPath="url(#circleClip)">
                <circle
                  cx={screenPos.x}
                  cy={screenPos.y}
                  r="4"
                  fill={enemyColors[enemy.type]}
                  stroke="#FF0000"
                  strokeWidth="1"
                />
                {/* Enemy type indicator */}
                <text
                  x={screenPos.x}
                  y={screenPos.y + 2}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="6"
                  fontWeight="bold"
                >
                  {enemy.type.charAt(0).toUpperCase()}
                </text>
              </g>
            )
          })}
        </svg>
        
        {/* Modern toggle button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsVisible(!isVisible)
          }}
          className="absolute -top-1 -right-1 w-6 h-6 bg-slate-800/90 hover:bg-slate-700/90 rounded-full border border-teal-400/50 flex items-center justify-center text-teal-300 text-xs transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-teal-400/20"
          title={isVisible ? "Hide Minimap" : "Show Minimap"}
        >
          {isVisible ? "−" : "+"}
        </button>

        {/* Modern zoom indicator */}
        <div
          className="absolute top-1 right-1 bg-slate-800/90 text-teal-300 px-2 py-0.5 rounded-md text-xs font-semibold border border-teal-400/30 backdrop-blur-sm"
        >
          {isZoomedOut ? 'WIDE' : 'CLOSE'}
        </div>
        
        {/* Modern scale indicator */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-slate-800/90 backdrop-blur-md rounded-lg px-3 py-1 text-teal-300 text-xs border border-teal-400/30 font-medium">
            1:{currentZoom}m
          </div>
        </div>
      </div>
      
      {/* Modern compact legend */}
      <div
        className="absolute -bottom-14 left-0 right-0 bg-slate-800/95 text-teal-300 p-2 rounded-lg text-center border border-teal-400/30 backdrop-blur-md"
        style={{ fontSize: '10px' }}
      >
        <div className="flex justify-center space-x-3 font-medium">
          <span>🎯 You</span>
          <span>🏠 Houses</span>
          <span>👹 Enemies</span>
          <span>🔥 Camps</span>
        </div>
      </div>
    </div>
  )
}

export default AdvancedMinimap
