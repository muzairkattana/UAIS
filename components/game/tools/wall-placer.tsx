"use client"

import { useRef, useState, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { useInventory } from "@/lib/inventory-context"
import { useNotifications } from "@/lib/notification-context"

interface WallPlacerProps {
  isLocked: boolean
  terrainHeightData: number[][]
  onWallPlaced?: (position: [number, number, number]) => void
}

export default function WallPlacer({
  isLocked,
  terrainHeightData,
  onWallPlaced,
}: WallPlacerProps) {
  const { camera, raycaster, scene } = useThree()
  const wallRef = useRef<THREE.Group>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [canPlace, setCanPlace] = useState(false)
  const [previewPosition, setPreviewPosition] = useState<THREE.Vector3>(
    new THREE.Vector3()
  )

  const { removeItem } = useInventory()
  const { addNotification } = useNotifications()

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

  const getTerrainHeight = (x: number, z: number): number => {
    if (!terrainHeightData || terrainHeightData.length === 0) return 0

    const terrainWidth = 800
    const terrainDepth = 800
    const gridWidth = terrainHeightData[0].length
    const gridDepth = terrainHeightData.length

    const gridX = Math.floor(
      (x + terrainWidth / 2) * (gridWidth / terrainWidth)
    )
    const gridZ = Math.floor(
      (z + terrainDepth / 2) * (gridDepth / terrainDepth)
    )

    const clampedX = Math.max(0, Math.min(gridWidth - 1, gridX))
    const clampedZ = Math.max(0, Math.min(gridDepth - 1, gridZ))

    return terrainHeightData[clampedZ][clampedX]
  }

  const checkPlacementValidity = (position: THREE.Vector3): boolean => {
    const wallSize = 5
    const samples = 3

    const heights: number[] = []

    for (let i = -samples; i <= samples; i++) {
      for (let j = -samples; j <= samples; j++) {
        const sampleX = position.x + (i * wallSize) / (samples * 2)
        const sampleZ = position.z + (j * wallSize) / (samples * 2)
        heights.push(getTerrainHeight(sampleX, sampleZ))
      }
    }

    if (heights.length === 0) return false

    const minHeight = Math.min(...heights)
    const maxHeight = Math.max(...heights)
    const heightDifference = maxHeight - minHeight

    return heightDifference <= 1.5 && minHeight > -1
  }

  const createWallPreview = () => {
    const wallGroup = new THREE.Group()
    const wallGeometry = new THREE.BoxGeometry(5, 3, 0.5)
    const wall = new THREE.Mesh(wallGeometry, previewMaterials.valid)
    wallGroup.add(wall)
    return wallGroup
  }

  useFrame(() => {
    if (!isLocked || !showPreview) return

    const mouse = new THREE.Vector2(0, 0)
    raycaster.setFromCamera(mouse, camera)

    const terrainMesh = scene.getObjectByName("terrain")
    if (!terrainMesh) return

    const intersects = raycaster.intersectObject(terrainMesh)
    if (intersects.length > 0) {
      const intersectionPoint = intersects[0].point
      const height = getTerrainHeight(
        intersectionPoint.x,
        intersectionPoint.z
      )

      const newPosition = new THREE.Vector3(
        intersectionPoint.x,
        height,
        intersectionPoint.z
      )

      setPreviewPosition(newPosition)
      const isValid = checkPlacementValidity(newPosition)
      setCanPlace(isValid)

      if (wallRef.current) {
        wallRef.current.position.copy(newPosition)
        wallRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = isValid
              ? previewMaterials.valid
              : previewMaterials.invalid
          }
        })
      }
    }
  })

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isLocked || !showPreview) return

      if (event.code === "Space" || event.code === "Enter") {
        event.preventDefault()
        if (canPlace) {
          placeWall()
        }
      } else if (event.code === "Escape") {
        event.preventDefault()
        cancelPlacement()
      }
    }

    const handleMouseClick = (event: MouseEvent) => {
      if (!isLocked || !showPreview) return

      if (event.button === 0 && canPlace) {
        placeWall()
      } else if (event.button === 2) {
        event.preventDefault()
        cancelPlacement()
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
  }, [isLocked, showPreview, canPlace, previewPosition])

  const startPlacement = () => {
    setShowPreview(true)
  }

  const placeWall = () => {
    if (!canPlace || !previewPosition) return

    if (onWallPlaced) {
      onWallPlaced([previewPosition.x, previewPosition.y, previewPosition.z])
    }

    // Note: the actual item removal is handled by the parent component

    addNotification({
      message: "Stone wall placed!",
      type: "success",
      icon: "/wall.png",
    })

    setShowPreview(false)
    setCanPlace(false)
  }

  const cancelPlacement = () => {
    setShowPreview(false)
    setCanPlace(false)
  }

  useEffect(() => {
    if (isLocked) {
      startPlacement()
    }
  }, [isLocked])

  if (!showPreview) return null

  return (
    <group ref={wallRef}>
      <primitive object={createWallPreview()} />
    </group>
  )
}

