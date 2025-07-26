"use client"

import React, { useState, useMemo, useCallback } from 'react'
import * as THREE from 'three'

interface MinimapProps {
  playerPosition: THREE.Vector3
  playerRotation: number
  terrainSize: { width: number; depth: number }
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
    rotation?: [number, number, number]
    isOpen?: boolean
  }>
  trees?: Array<{
    position: THREE.Vector3
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

const Minimap: React.FC<MinimapProps> = ({
  playerPosition,
  playerRotation,
  terrainSize,
  villageHouses,
  enemies,
  placedDoors,
  trees = [],
  campfires = [],
  storageBoxes = []
}) => {
  const [isZoomedOut, setIsZoomedOut] = useState(false)
  
  // Minimap dimensions
  const minimapSize = 200
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
    return distance <= minimapRadius - 5 // Small margin to keep icons within circle
  }, [minimapRadius])
  
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
  
  return (
    <div 
      className="fixed bottom-4 left-4 z-50"
      style={{
        width: minimapSize,
        height: minimapSize,
        borderRadius: '50%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        border: '3px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.8)',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer'
      }}
      onClick={toggleZoom}
      title={`Click to ${isZoomedOut ? 'zoom in' : 'zoom out'}`}
    >
      {/* Background grid */}
      <svg
        width={minimapSize}
        height={minimapSize}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
          </pattern>
          <clipPath id="circleClip">
            <circle cx={minimapRadius} cy={minimapRadius} r={minimapRadius - 3} />
          </clipPath>
        </defs>
        
        {/* Grid background */}
        <rect width="100%" height="100%" fill="url(#grid)" clipPath="url(#circleClip)" />
        
        {/* North indicator */}
        <g clipPath="url(#circleClip)">
          <polygon
            points={`${minimapRadius},15 ${minimapRadius - 8},30 ${minimapRadius + 8},30`}
            fill="#FF4444"
            stroke="#FFFFFF"
            strokeWidth="1"
          />
          <text
            x={minimapRadius}
            y={12}
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="10"
            fontWeight="bold"
          >
            N
          </text>
        </g>
        
        {/* Trees (small green dots) */}
        {trees.slice(0, 100).map((tree, index) => { // Limit to 100 trees for performance
          const screenPos = worldToMinimap(tree.position)
          if (!isInBounds(screenPos)) return null
          
          return (
            <circle
              key={`tree-${index}`}
              cx={screenPos.x}
              cy={screenPos.y}
              r="1"
              fill="#228B22"
              opacity="0.6"
              clipPath="url(#circleClip)"
            />
          )
        })}
        
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
        
        {/* Player (always in center) */}
        <g clipPath="url(#circleClip)">
          <circle
            cx={minimapRadius}
            cy={minimapRadius}
            r="5"
            fill="#00BFFF"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
          {/* Player direction indicator */}
          <line
            x1={minimapRadius}
            y1={minimapRadius}
            x2={minimapRadius + Math.sin(playerRotation) * 8}
            y2={minimapRadius - Math.cos(playerRotation) * 8}
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      </svg>
      
      {/* Zoom indicator */}
      <div
        style={{
          position: 'absolute',
          top: '5px',
          right: '5px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '10px',
          fontSize: '10px',
          fontWeight: 'bold'
        }}
      >
        {isZoomedOut ? 'WIDE' : 'CLOSE'}
      </div>
      
      {/* Legend */}
      <div
        style={{
          position: 'absolute',
          bottom: '-50px',
          left: '0',
          right: '0',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '5px',
          borderRadius: '5px',
          fontSize: '8px',
          textAlign: 'center'
        }}
      >
        <div>🔵 Player | 🏠 Houses | 👹 Enemies</div>
        <div>🔥 Campfires | 📦 Storage | 🚪 Doors</div>
      </div>
    </div>
  )
}

export default Minimap
