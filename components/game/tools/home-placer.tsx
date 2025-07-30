"use client"

import { useRef, useState, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { useInventory } from "@/lib/inventory-context"
import { useNotifications } from "@/lib/notification-context"

interface HomePlacerProps {
  isLocked: boolean
  terrainHeightData: number[][]
  onHomePlaced?: (position: [number, number, number]) => void
}

export default function HomePlacer({ 
  isLocked, 
  terrainHeightData,
  onHomePlaced 
}: HomePlacerProps) {
  const { camera, raycaster, scene } = useThree()
  const homeRef = useRef<THREE.Group>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [canPlace, setCanPlace] = useState(false)
  const [previewPosition, setPreviewPosition] = useState<THREE.Vector3>(new THREE.Vector3())
  
  const { removeItem } = useInventory()
  const { addNotification } = useNotifications()

  // Create home preview materials
  const previewMaterials = {
    valid: new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.6,
      wireframe: true,
    }),
    invalid: new THREE.MeshStandardMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.6,
      wireframe: true,
    }),
  }

  // Get terrain height at position
  const getTerrainHeight = (x: number, z: number): number => {
    if (!terrainHeightData || terrainHeightData.length === 0) return 0

    const terrainWidth = 800
    const terrainDepth = 800
    const gridWidth = terrainHeightData[0].length
    const gridDepth = terrainHeightData.length

    // Convert world coordinates to grid coordinates
    const gridX = Math.floor((x + terrainWidth / 2) * (gridWidth / terrainWidth))
    const gridZ = Math.floor((z + terrainDepth / 2) * (gridDepth / terrainDepth))

    // Clamp to grid bounds
    const clampedX = Math.max(0, Math.min(gridWidth - 1, gridX))
    const clampedZ = Math.max(0, Math.min(gridDepth - 1, gridZ))

    return terrainHeightData[clampedZ][clampedX]
  }

  // Check if area is suitable for home placement
  const checkPlacementValidity = (position: THREE.Vector3): boolean => {
    const homeSize = 8 // Size of the home footprint
    const samples = 5 // Number of samples to check in each direction

    const heights: number[] = []
    
    // Sample heights in a grid around the position
    for (let i = -samples; i <= samples; i++) {
      for (let j = -samples; j <= samples; j++) {
        const sampleX = position.x + (i * homeSize) / (samples * 2)
        const sampleZ = position.z + (j * homeSize) / (samples * 2)
        heights.push(getTerrainHeight(sampleX, sampleZ))
      }
    }

    if (heights.length === 0) return false

    // Check if terrain is relatively flat
    const minHeight = Math.min(...heights)
    const maxHeight = Math.max(...heights)
    const heightDifference = maxHeight - minHeight

    // Allow maximum 1.5 units of height difference
    return heightDifference <= 1.5 && minHeight > -1 // Above water level
  }

  // Create home preview geometry
  const createHomePreview = () => {
    const homeGroup = new THREE.Group()

    // Foundation
    const foundationGeometry = new THREE.BoxGeometry(8.5, 0.3, 6.5)
    const foundation = new THREE.Mesh(foundationGeometry, previewMaterials.valid)
    foundation.position.y = -0.1
    homeGroup.add(foundation)

    // Main walls
    const wallGeometry = new THREE.BoxGeometry(8, 3, 0.2)
    
    // Front wall
    const frontWall = new THREE.Mesh(wallGeometry, previewMaterials.valid)
    frontWall.position.set(0, 1.5, 3)
    homeGroup.add(frontWall)

    // Back wall
    const backWall = new THREE.Mesh(wallGeometry, previewMaterials.valid)
    backWall.position.set(0, 1.5, -3)
    homeGroup.add(backWall)

    // Side walls
    const sideWallGeometry = new THREE.BoxGeometry(0.2, 3, 6)
    
    const leftWall = new THREE.Mesh(sideWallGeometry, previewMaterials.valid)
    leftWall.position.set(-4, 1.5, 0)
    homeGroup.add(leftWall)

    const rightWall = new THREE.Mesh(sideWallGeometry, previewMaterials.valid)
    rightWall.position.set(4, 1.5, 0)
    homeGroup.add(rightWall)

    // Roof
    const roofGeometry = new THREE.ConeGeometry(6, 2, 4)
    const roof = new THREE.Mesh(roofGeometry, previewMaterials.valid)
    roof.position.y = 4
    roof.rotation.y = Math.PI / 4
    homeGroup.add(roof)

    return homeGroup
  }

  // Handle mouse/pointer movement for placement preview
  useFrame(() => {
    if (!isLocked || !showPreview) return

    // Create a ray from camera through mouse position (center of screen)
    const mouse = new THREE.Vector2(0, 0) // Center of screen
    raycaster.setFromCamera(mouse, camera)

    // Find intersection with terrain
    const terrainMesh = scene.getObjectByName("terrain")
    if (!terrainMesh) return

    const intersects = raycaster.intersectObject(terrainMesh)
    if (intersects.length > 0) {
      const intersectionPoint = intersects[0].point
      const height = getTerrainHeight(intersectionPoint.x, intersectionPoint.z)
      
      const newPosition = new THREE.Vector3(
        intersectionPoint.x,
        height,
        intersectionPoint.z
      )

      setPreviewPosition(newPosition)
      const isValid = checkPlacementValidity(newPosition)
      setCanPlace(isValid)

      if (homeRef.current) {
        homeRef.current.position.copy(newPosition)
        
        // Update materials based on validity
        homeRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = isValid ? previewMaterials.valid : previewMaterials.invalid
          }
        })
      }
    }
  })

  // Handle placement input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isLocked || !showPreview) return

      if (event.code === "Space" || event.code === "Enter") {
        event.preventDefault()
        if (canPlace) {
          // Place the home
          placeHome()
        }
      } else if (event.code === "Escape") {
        event.preventDefault()
        cancelPlacement()
      }
    }

    const handleMouseClick = (event: MouseEvent) => {
      if (!isLocked || !showPreview) return
      
      if (event.button === 0 && canPlace) { // Left click
        placeHome()
      } else if (event.button === 2) { // Right click
        event.preventDefault()
        cancelPlacement()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("click", handleMouseClick)
    window.addEventListener("contextmenu", (e) => e.preventDefault()) // Prevent context menu

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("click", handleMouseClick)
      window.removeEventListener("contextmenu", (e) => e.preventDefault())
    }
  }, [isLocked, showPreview, canPlace, previewPosition])

  // Start placement mode
  const startPlacement = () => {
    setShowPreview(true)
  }

  // Place the home
  const placeHome = () => {
    if (!canPlace || !previewPosition) return

    // Call the callback to place home in game scene
    if (onHomePlaced) {
      onHomePlaced([previewPosition.x, previewPosition.y, previewPosition.z])
    }

    // Show success notification
    addNotification({
      message: "House constructed successfully!",
      type: "success",
      icon: "/house.png",
    })

    // End placement mode
    setShowPreview(false)
    setCanPlace(false)
  }

  // Cancel placement
  const cancelPlacement = () => {
    setShowPreview(false)
    setCanPlace(false)
  }

  // Auto-start placement when component mounts
  useEffect(() => {
    if (isLocked) {
      startPlacement()
    }
  }, [isLocked])

  if (!showPreview) return null

  return (
    <group ref={homeRef}>
      <primitive object={createHomePreview()} />
      
      {/* Placement instructions */}
      {showPreview && (
        <group position={[0, 5, 0]}>
          <mesh>
            <planeGeometry args={[6, 1]} />
            <meshBasicMaterial 
              color={canPlace ? 0x00ff00 : 0xff0000} 
              transparent 
              opacity={0.8} 
            />
          </mesh>
        </group>
      )}
    </group>
  )
}
