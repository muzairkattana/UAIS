"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { useInventory } from "@/lib/inventory-context"
import { useNotifications } from "@/lib/notification-context"

export interface BuildingComponent {
  id: string
  type: 'foundation' | 'wall' | 'ceiling' | 'window' | 'door'
  position: [number, number, number]
  rotation: [number, number, number]
  material: 'wood' | 'stone'
  isPlaced: boolean
  connections: string[] // IDs of connected components
}

interface ConstructionManagerProps {
  isLocked: boolean
  terrainHeightData: number[][]
  selectedComponentType: string | null
  onComponentPlaced?: (component: BuildingComponent) => void
}

export default function ConstructionManager({
  isLocked,
  terrainHeightData,
  selectedComponentType,
  onComponentPlaced
}: ConstructionManagerProps) {
  const { camera, raycaster, scene } = useThree()
  const previewRef = useRef<THREE.Group>(null)
  const [previewPosition, setPreviewPosition] = useState<THREE.Vector3>(new THREE.Vector3())
  const [previewRotation, setPreviewRotation] = useState(0)
  const [canPlace, setCanPlace] = useState(false)
  const [snapPoints, setSnapPoints] = useState<THREE.Vector3[]>([])
  const [placedComponents, setPlacedComponents] = useState<BuildingComponent[]>([])
  const [constructionMode, setConstructionMode] = useState<'foundation' | 'wall' | 'ceiling' | 'finishing' | null>(null)

  const { removeItem, getItemCount } = useInventory()
  const { addNotification } = useNotifications()

  // Materials for different component types
  const materials = useMemo(() => ({
    wood: {
      valid: new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        transparent: true,
        opacity: 0.7,
      }),
      invalid: new THREE.MeshStandardMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.5,
      }),
      preview: new THREE.MeshStandardMaterial({
        color: 0x90EE90,
        transparent: true,
        opacity: 0.6,
        wireframe: false,
      })
    },
    stone: {
      valid: new THREE.MeshStandardMaterial({
        color: 0x696969,
        transparent: true,
        opacity: 0.7,
      }),
      invalid: new THREE.MeshStandardMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.5,
      }),
      preview: new THREE.MeshStandardMaterial({
        color: 0xA0A0A0,
        transparent: true,
        opacity: 0.6,
        wireframe: false,
      })
    }
  }), [])

  // Get terrain height at position
  const getTerrainHeight = (x: number, z: number): number => {
    if (!terrainHeightData || terrainHeightData.length === 0) return 0

    const terrainWidth = 400
    const terrainDepth = 400
    const gridWidth = terrainHeightData[0].length
    const gridDepth = terrainHeightData.length

    const gridX = Math.floor((x + terrainWidth / 2) * (gridWidth / terrainWidth))
    const gridZ = Math.floor((z + terrainDepth / 2) * (gridDepth / terrainDepth))

    const clampedX = Math.max(0, Math.min(gridWidth - 1, gridX))
    const clampedZ = Math.max(0, Math.min(gridDepth - 1, gridZ))

    return terrainHeightData[clampedZ][clampedX]
  }

  // Create component geometry based on type
  const createComponentGeometry = (type: string, material: 'wood' | 'stone' = 'wood') => {
    const group = new THREE.Group()
    
    switch (type) {
      case 'foundation':
        const foundationGeom = new THREE.BoxGeometry(4, 0.5, 4)
        const foundation = new THREE.Mesh(foundationGeom, materials[material].preview)
        foundation.position.y = 0.25
        group.add(foundation)
        
        // Add reinforcement beams for foundation
        for (let i = -1; i <= 1; i++) {
          const beam = new THREE.Mesh(
            new THREE.BoxGeometry(4, 0.2, 0.2),
            materials[material].preview
          )
          beam.position.set(0, 0.1, i * 1.5)
          group.add(beam)
        }
        break

      case 'wall':
        const wallGeom = new THREE.BoxGeometry(4, 3, 0.3)
        const wall = new THREE.Mesh(wallGeom, materials[material].preview)
        wall.position.y = 1.5
        group.add(wall)
        
        // Add wall frame details
        const frameTop = new THREE.Mesh(
          new THREE.BoxGeometry(4.2, 0.2, 0.4),
          materials[material].preview
        )
        frameTop.position.y = 2.9
        group.add(frameTop)
        
        const frameBottom = new THREE.Mesh(
          new THREE.BoxGeometry(4.2, 0.2, 0.4),
          materials[material].preview
        )
        frameBottom.position.y = 0.1
        group.add(frameBottom)
        break

      case 'ceiling':
        const ceilingGeom = new THREE.BoxGeometry(4, 0.3, 4)
        const ceiling = new THREE.Mesh(ceilingGeom, materials[material].preview)
        ceiling.position.y = 3.15
        group.add(ceiling)
        
        // Add ceiling beams
        for (let i = -1; i <= 1; i++) {
          const beam = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.3, 4),
            materials[material].preview
          )
          beam.position.set(i * 1.5, 3.15, 0)
          group.add(beam)
        }
        break

      case 'window':
        const windowFrame = new THREE.Mesh(
          new THREE.BoxGeometry(2, 1.5, 0.2),
          materials[material].preview
        )
        windowFrame.position.y = 1.5
        group.add(windowFrame)
        
        // Add glass
        const glass = new THREE.Mesh(
          new THREE.BoxGeometry(1.6, 1.1, 0.05),
          new THREE.MeshStandardMaterial({
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.3,
          })
        )
        glass.position.y = 1.5
        group.add(glass)
        break

      case 'door':
        const doorFrame = new THREE.Mesh(
          new THREE.BoxGeometry(1.2, 2.5, 0.2),
          materials[material].preview
        )
        doorFrame.position.y = 1.25
        group.add(doorFrame)
        
        // Add door panel
        const doorPanel = new THREE.Mesh(
          new THREE.BoxGeometry(1, 2.3, 0.1),
          materials[material].preview
        )
        doorPanel.position.set(-0.4, 1.25, 0.05)
        group.add(doorPanel)
        break
    }

    return group
  }

  // Check placement validity based on construction phase and requirements
  const checkPlacementValidity = (position: THREE.Vector3, type: string): boolean => {
    switch (type) {
      case 'foundation':
        // Foundation must be on relatively flat ground
        const heights = []
        for (let x = -2; x <= 2; x++) {
          for (let z = -2; z <= 2; z++) {
            heights.push(getTerrainHeight(position.x + x, position.z + z))
          }
        }
        const minHeight = Math.min(...heights)
        const maxHeight = Math.max(...heights)
        return (maxHeight - minHeight) <= 1.0 && minHeight > -1

      case 'wall':
        // Walls must be placed on or connected to foundations
        return placedComponents.some(comp => 
          comp.type === 'foundation' && 
          Math.abs(comp.position[0] - position.x) <= 4 &&
          Math.abs(comp.position[2] - position.z) <= 4
        )

      case 'ceiling':
        // Ceilings need walls to support them
        const nearbyWalls = placedComponents.filter(comp => 
          comp.type === 'wall' &&
          Math.abs(comp.position[0] - position.x) <= 4 &&
          Math.abs(comp.position[2] - position.z) <= 4
        )
        return nearbyWalls.length >= 2

      case 'window':
      case 'door':
        // Windows and doors must be placed in walls
        return placedComponents.some(comp => 
          comp.type === 'wall' &&
          Math.abs(comp.position[0] - position.x) <= 2 &&
          Math.abs(comp.position[1] - position.y) <= 1 &&
          Math.abs(comp.position[2] - position.z) <= 2
        )

      default:
        return true
    }
  }

  // Generate snap points for precise placement
  const generateSnapPoints = (type: string): THREE.Vector3[] => {
    const points: THREE.Vector3[] = []
    
    placedComponents.forEach(comp => {
      const [x, y, z] = comp.position
      
      switch (type) {
        case 'foundation':
          // Foundations can connect to other foundations
          if (comp.type === 'foundation') {
            points.push(new THREE.Vector3(x + 4, y, z))
            points.push(new THREE.Vector3(x - 4, y, z))
            points.push(new THREE.Vector3(x, y, z + 4))
            points.push(new THREE.Vector3(x, y, z - 4))
          }
          break
          
        case 'wall':
          // Walls snap to foundation edges
          if (comp.type === 'foundation') {
            points.push(new THREE.Vector3(x + 2, y + 0.5, z))
            points.push(new THREE.Vector3(x - 2, y + 0.5, z))
            points.push(new THREE.Vector3(x, y + 0.5, z + 2))
            points.push(new THREE.Vector3(x, y + 0.5, z - 2))
          }
          break
          
        case 'ceiling':
          // Ceilings snap above walls
          if (comp.type === 'wall') {
            points.push(new THREE.Vector3(x, y + 1.65, z))
          }
          break
      }
    })
    
    return points
  }

  // Find closest snap point
  const findClosestSnapPoint = (position: THREE.Vector3, snapPoints: THREE.Vector3[]): THREE.Vector3 | null => {
    if (snapPoints.length === 0) return null
    
    let closest = snapPoints[0]
    let minDistance = position.distanceTo(closest)
    
    snapPoints.forEach(point => {
      const distance = position.distanceTo(point)
      if (distance < minDistance && distance < 2) { // 2 unit snap radius
        closest = point
        minDistance = distance
      }
    })
    
    return minDistance < 2 ? closest : null
  }

  // Handle mouse/pointer movement for placement preview
  useFrame(() => {
    if (!isLocked || !selectedComponentType) return

    const mouse = new THREE.Vector2(0, 0)
    raycaster.setFromCamera(mouse, camera)

    const terrainMesh = scene.getObjectByName("terrain")
    if (!terrainMesh) return

    const intersects = raycaster.intersectObject(terrainMesh)
    if (intersects.length > 0) {
      const intersectionPoint = intersects[0].point
      let targetPosition = new THREE.Vector3(
        intersectionPoint.x,
        getTerrainHeight(intersectionPoint.x, intersectionPoint.z),
        intersectionPoint.z
      )

      // Generate snap points for current component type
      const currentSnapPoints = generateSnapPoints(selectedComponentType)
      setSnapPoints(currentSnapPoints)

      // Try to snap to nearest point
      const snapPoint = findClosestSnapPoint(targetPosition, currentSnapPoints)
      if (snapPoint) {
        targetPosition = snapPoint
      }

      setPreviewPosition(targetPosition)
      const isValid = checkPlacementValidity(targetPosition, selectedComponentType)
      setCanPlace(isValid)

      if (previewRef.current) {
        previewRef.current.position.copy(targetPosition)
        previewRef.current.rotation.y = previewRotation
        
        // Update material based on validity
        previewRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const material = isValid ? 'wood' : 'invalid' // Default to wood, can be extended
            child.material = materials.wood[material as keyof typeof materials.wood]
          }
        })
      }
    }
  })

  // Handle placement input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isLocked || !selectedComponentType) return

      switch (event.code) {
        case "Space":
        case "Enter":
          event.preventDefault()
          if (canPlace) {
            placeComponent()
          }
          break
          
        case "KeyR":
          event.preventDefault()
          setPreviewRotation(prev => prev + Math.PI / 2)
          break
          
        case "Escape":
          event.preventDefault()
          cancelPlacement()
          break
      }
    }

    const handleMouseClick = (event: MouseEvent) => {
      if (!isLocked || !selectedComponentType) return
      
      if (event.button === 0 && canPlace) {
        placeComponent()
      } else if (event.button === 2) {
        event.preventDefault()
        setPreviewRotation(prev => prev + Math.PI / 2)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("click", handleMouseClick)
    window.addEventListener("contextmenu", (e) => e.preventDefault())

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("click", handleMouseClick)
      window.removeEventListener("contextmenu", (e) => e.preventDefault())
    }
  }, [isLocked, selectedComponentType, canPlace, previewPosition, previewRotation])

  // Place component
  const placeComponent = () => {
    if (!canPlace || !selectedComponentType || !previewPosition) return

    const componentType = selectedComponentType.replace('item_wooden_', '') as BuildingComponent['type']
    
    // Check if player has required materials
    const requiredMaterials = getRequiredMaterials(componentType)
    let hasEnoughMaterials = true
    
    Object.entries(requiredMaterials).forEach(([material, amount]) => {
      if (getItemCount(material) < amount) {
        hasEnoughMaterials = false
      }
    })

    if (!hasEnoughMaterials) {
      addNotification({
        message: "Not enough materials to build this component!",
        type: "error",
        icon: "/construction.png"
      })
      return
    }

    // Create new component
    const newComponent: BuildingComponent = {
      id: `${componentType}_${Date.now()}`,
      type: componentType,
      position: [previewPosition.x, previewPosition.y, previewPosition.z],
      rotation: [0, previewRotation, 0],
      material: 'wood', // Can be extended for stone
      isPlaced: true,
      connections: []
    }

    // Add to placed components
    setPlacedComponents(prev => [...prev, newComponent])

    // Remove materials from inventory
    Object.entries(requiredMaterials).forEach(([material, amount]) => {
      for (let i = 0; i < amount; i++) {
        removeItem(material)
      }
    })

    // Call callback
    if (onComponentPlaced) {
      onComponentPlaced(newComponent)
    }

    addNotification({
      message: `${componentType.charAt(0).toUpperCase() + componentType.slice(1)} placed successfully!`,
      type: "success",
      icon: "/construction.png"
    })
  }

  // Get required materials for component
  const getRequiredMaterials = (type: string): { [key: string]: number } => {
    switch (type) {
      case 'foundation':
        return { 'item_wooden_foundation': 1 }
      case 'wall':
        return { 'item_wooden_wall': 1 }
      case 'ceiling':
        return { 'item_wooden_ceiling': 1 }
      case 'window':
        return { 'item_wooden_window': 1 }
      case 'door':
        return { 'item_wooden_door': 1 }
      default:
        return {}
    }
  }

  // Cancel placement
  const cancelPlacement = () => {
    // This would be handled by parent component
  }

  if (!selectedComponentType) return null

  const componentType = selectedComponentType.replace('item_wooden_', '')

  return (
    <>
      {/* Preview component */}
      <group ref={previewRef}>
        <primitive object={createComponentGeometry(componentType, 'wood')} />
      </group>

      {/* Snap point indicators */}
      {snapPoints.map((point, index) => (
        <mesh key={index} position={[point.x, point.y + 0.5, point.z]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color={0x00ff00} />
        </mesh>
      ))}

      {/* Render placed components */}
      {placedComponents.map((component) => (
        <group 
          key={component.id} 
          position={component.position}
          rotation={component.rotation}
        >
          <primitive object={createComponentGeometry(component.type, component.material)} />
        </group>
      ))}

      {/* Construction UI hints */}
      {selectedComponentType && (
        <group position={[previewPosition.x, previewPosition.y + 4, previewPosition.z]}>
          <mesh>
            <planeGeometry args={[8, 1]} />
            <meshBasicMaterial 
              color={canPlace ? 0x00ff00 : 0xff0000}
              transparent 
              opacity={0.7}
            />
          </mesh>
        </group>
      )}
    </>
  )
}
