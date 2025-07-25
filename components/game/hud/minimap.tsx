"use client"

import { useRef, useEffect, useState } from "react"
import * as THREE from "three"
import { useGameState } from "@/lib/game-context"
import { useSettings } from "@/lib/settings-context"

interface MinimapProps {
  terrainHeightData?: number[][]
  terrainSize?: { width: number; depth: number }
  playerPosition: THREE.Vector3
  playerRotation: number
  trees?: Array<{ position: THREE.Vector3; isChopped?: boolean }>
  stones?: Array<{ position: THREE.Vector3; isMined?: boolean }>
  placedItems?: Array<{ position: THREE.Vector3; type: string }>
}

export default function Minimap({
  terrainHeightData = [],
  terrainSize = { width: 400, depth: 400 },
  playerPosition,
  playerRotation,
  trees = [],
  stones = [],
  placedItems = [],
}: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { settings } = useSettings()
  const [isVisible, setIsVisible] = useState(true)

  // Minimap configuration
  const MINIMAP_SIZE = 200 // Size in pixels
  const MINIMAP_SCALE = 2 // How much of the world to show (higher = more zoomed out)
  const TERRAIN_SCALE = terrainSize.width / MINIMAP_SIZE

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = MINIMAP_SIZE
    canvas.height = MINIMAP_SIZE

    // Clear canvas
    ctx.clearRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE)

    // Draw background circle
    ctx.save()
    ctx.beginPath()
    ctx.arc(MINIMAP_SIZE / 2, MINIMAP_SIZE / 2, MINIMAP_SIZE / 2 - 2, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(0, 20, 40, 0.9)"
    ctx.fill()
    ctx.strokeStyle = "rgba(100, 150, 200, 0.8)"
    ctx.lineWidth = 3
    ctx.stroke()
    
    // Add inner glow
    const gradient = ctx.createRadialGradient(
      MINIMAP_SIZE / 2, MINIMAP_SIZE / 2, 0,
      MINIMAP_SIZE / 2, MINIMAP_SIZE / 2, MINIMAP_SIZE / 2
    )
    gradient.addColorStop(0, "rgba(50, 100, 150, 0.3)")
    gradient.addColorStop(1, "rgba(0, 20, 40, 0.1)")
    ctx.fillStyle = gradient
    ctx.fill()
    ctx.restore()

    // Create clipping path for circular minimap
    ctx.save()
    ctx.beginPath()
    ctx.arc(MINIMAP_SIZE / 2, MINIMAP_SIZE / 2, MINIMAP_SIZE / 2 - 4, 0, Math.PI * 2)
    ctx.clip()

    // Draw terrain if available
    if (terrainHeightData.length > 0) {
      const terrainImageData = ctx.createImageData(MINIMAP_SIZE, MINIMAP_SIZE)
      const data = terrainImageData.data

      for (let y = 0; y < MINIMAP_SIZE; y++) {
        for (let x = 0; x < MINIMAP_SIZE; x++) {
          // Convert minimap coordinates to terrain coordinates
          const terrainX = Math.floor((x / MINIMAP_SIZE) * terrainHeightData[0].length)
          const terrainY = Math.floor((y / MINIMAP_SIZE) * terrainHeightData.length)
          
          if (terrainX >= 0 && terrainX < terrainHeightData[0].length && 
              terrainY >= 0 && terrainY < terrainHeightData.length) {
            const height = terrainHeightData[terrainY][terrainX]
            
            // Color based on height
            let r, g, b
            if (height < -2) {
              // Water - deep blue
              r = 20; g = 50; b = 100
            } else if (height < 0) {
              // Shallow water - lighter blue
              r = 40; g = 80; b = 140
            } else if (height < 2) {
              // Low ground - green
              r = 40; g = 80; b = 40
            } else if (height < 4) {
              // Medium ground - darker green
              r = 60; g = 100; b = 60
            } else {
              // High ground - brown/gray
              r = 80; g = 70; b = 60
            }
            
            const index = (y * MINIMAP_SIZE + x) * 4
            data[index] = r     // Red
            data[index + 1] = g // Green
            data[index + 2] = b // Blue
            data[index + 3] = 255 // Alpha
          }
        }
      }
      
      ctx.putImageData(terrainImageData, 0, 0)
    }

    // Helper function to convert world position to minimap coordinates
    const worldToMinimap = (worldPos: THREE.Vector3) => {
      const relativeX = (worldPos.x - playerPosition.x) / MINIMAP_SCALE
      const relativeZ = (worldPos.z - playerPosition.z) / MINIMAP_SCALE
      
      return {
        x: MINIMAP_SIZE / 2 + relativeX,
        y: MINIMAP_SIZE / 2 + relativeZ
      }
    }

    // Draw trees
    trees.forEach((tree) => {
      if (tree.isChopped) return
      
      const pos = worldToMinimap(tree.position)
      if (pos.x >= 0 && pos.x <= MINIMAP_SIZE && pos.y >= 0 && pos.y <= MINIMAP_SIZE) {
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(34, 139, 34, 0.8)"
        ctx.fill()
      }
    })

    // Draw stone nodes
    stones.forEach((stone) => {
      if (stone.isMined) return
      
      const pos = worldToMinimap(stone.position)
      if (pos.x >= 0 && pos.x <= MINIMAP_SIZE && pos.y >= 0 && pos.y <= MINIMAP_SIZE) {
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(128, 128, 128, 0.8)"
        ctx.fill()
      }
    })

    // Draw placed items
    placedItems.forEach((item) => {
      const pos = worldToMinimap(item.position)
      if (pos.x >= 0 && pos.x <= MINIMAP_SIZE && pos.y >= 0 && pos.y <= MINIMAP_SIZE) {
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

    // Draw player indicator (center)
    ctx.beginPath()
    ctx.arc(MINIMAP_SIZE / 2, MINIMAP_SIZE / 2, 4, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(255, 255, 100, 0.9)"
    ctx.fill()
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw player direction indicator
    const directionLength = 12
    const directionX = Math.sin(playerRotation) * directionLength
    const directionY = -Math.cos(playerRotation) * directionLength
    
    ctx.beginPath()
    ctx.moveTo(MINIMAP_SIZE / 2, MINIMAP_SIZE / 2)
    ctx.lineTo(MINIMAP_SIZE / 2 + directionX, MINIMAP_SIZE / 2 + directionY)
    ctx.strokeStyle = "rgba(255, 255, 100, 0.9)"
    ctx.lineWidth = 3
    ctx.stroke()

    // Draw compass directions
    ctx.restore()
    
    // Compass markers styling
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
    ctx.font = "bold 12px Arial"
    ctx.textAlign = "center"
    
    // North indicator
    ctx.fillText("N", MINIMAP_SIZE / 2, 15)
    
    // East indicator
    ctx.fillText("E", MINIMAP_SIZE - 15, MINIMAP_SIZE / 2 + 4)
    
    // South indicator
    ctx.fillText("S", MINIMAP_SIZE / 2, MINIMAP_SIZE - 8)
    
    // West indicator
    ctx.fillText("W", 15, MINIMAP_SIZE / 2 + 4)
    
    // Draw grid lines for better navigation
    ctx.save()
    ctx.beginPath()
    ctx.arc(MINIMAP_SIZE / 2, MINIMAP_SIZE / 2, MINIMAP_SIZE / 2 - 4, 0, Math.PI * 2)
    ctx.clip()
    
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    ctx.lineWidth = 1
    
    // Vertical and horizontal lines
    for (let i = 1; i < 4; i++) {
      const pos = (i / 4) * MINIMAP_SIZE
      ctx.beginPath()
      ctx.moveTo(pos, 0)
      ctx.lineTo(pos, MINIMAP_SIZE)
      ctx.stroke()
      
      ctx.beginPath()
      ctx.moveTo(0, pos)
      ctx.lineTo(MINIMAP_SIZE, pos)
      ctx.stroke()
    }
    
    ctx.restore()

  }, [playerPosition, playerRotation, terrainHeightData, trees, stones, placedItems, terrainSize])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <div className="relative">
        {/* Outer glow effect */}
        <div 
          className="absolute inset-0 rounded-full blur-md opacity-50"
          style={{
            background: "radial-gradient(circle, rgba(100,150,200,0.3) 0%, rgba(0,20,40,0.1) 70%)",
            width: MINIMAP_SIZE + 8,
            height: MINIMAP_SIZE + 8,
            left: -4,
            top: -4,
          }}
        />
        
        {/* Main minimap */}
        <div className="relative bg-black/20 rounded-full p-1 backdrop-blur-sm border border-white/20">
          <canvas
            ref={canvasRef}
            width={MINIMAP_SIZE}
            height={MINIMAP_SIZE}
            className="rounded-full"
            style={{ width: MINIMAP_SIZE, height: MINIMAP_SIZE }}
          />
          
          {/* Toggle button */}
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="absolute -top-1 -right-1 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full border border-white/30 flex items-center justify-center text-white text-xs transition-colors"
            title={isVisible ? "Hide Minimap" : "Show Minimap"}
          >
            {isVisible ? "−" : "+"}
          </button>
        </div>
        
        {/* Scale indicator */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-black/50 backdrop-blur-sm rounded px-2 py-1 text-white text-xs border border-white/20">
            Scale: 1:{MINIMAP_SCALE}
          </div>
        </div>
      </div>
    </div>
  )
}
