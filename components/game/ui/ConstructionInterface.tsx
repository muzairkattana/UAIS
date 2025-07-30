"use client"

import React, { useState, useRef, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useBuilding, type StructureType, type FurnitureType, type UtilityType, type MaterialType, type ConstructionMode } from '@/lib/building-context'
import * as THREE from 'three'

interface ConstructionInterfaceProps {
  isActive: boolean
}

// 3D Components that go inside R3F scene
export const Construction3D: React.FC<ConstructionInterfaceProps> = ({ isActive }) => {
  const {
    constructionMode,
    isConstructionMode,
    selectedElementType,
    selectedMaterial,
    selectedColor,
    snapToGrid,
    gridSize,
    showGrid,
    previewElement,
    setConstructionMode,
    toggleConstructionMode,
    setSelectedElementType,
    setSelectedMaterial,
    placeElement,
    removeElement,
    updateElement,
    selectElement,
    setPreviewElement,
    placedElements,
    selectedElement,
    toggleGrid,
    toggleSnapToGrid,
    setGridSize
  } = useBuilding()

  const { camera, raycaster, scene } = useThree()
  const [mousePosition, setMousePosition] = useState<THREE.Vector3>(new THREE.Vector3())
  const gridHelperRef = useRef<THREE.GridHelper>()

  // Material colors for preview
  const materialColors = {
    wood: '#8B4513',
    stone: '#708090',
    metal: '#C0C0C0',
    glass: '#87CEEB',
    concrete: '#696969',
    brick: '#CD853F'
  }

  // Handle mouse movement for preview positioning
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isConstructionMode || !selectedElementType) return

    const rect = (event.target as HTMLCanvasElement).getBoundingClientRect()
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    )

    raycaster.setFromCamera(mouse, camera)
    
    // Create a ground plane for raycasting
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const intersection = new THREE.Vector3()
    raycaster.ray.intersectPlane(groundPlane, intersection)

    if (intersection) {
      // Snap to grid if enabled
      if (snapToGrid) {
        intersection.x = Math.round(intersection.x / gridSize) * gridSize
        intersection.z = Math.round(intersection.z / gridSize) * gridSize
      }

      setMousePosition(intersection)
      
      // Update preview element
      if (selectedElementType) {
        const preview = {
          id: 'preview',
          type: selectedElementType,
          material: selectedMaterial,
          position: intersection,
          rotation: new THREE.Euler(0, 0, 0),
          scale: new THREE.Vector3(1, 1, 1),
          color: selectedColor
        }
        setPreviewElement(preview)
      }
    }
  }, [isConstructionMode, selectedElementType, selectedMaterial, selectedColor, snapToGrid, gridSize, camera, raycaster, setPreviewElement])

  // Handle click for placing/selecting elements
  const handleClick = useCallback((event: MouseEvent) => {
    if (!isConstructionMode) return

    switch (constructionMode) {
      case 'place':
        if (selectedElementType && previewElement) {
          placeElement({
            type: selectedElementType,
            material: selectedMaterial,
            position: previewElement.position,
            rotation: previewElement.rotation,
            scale: previewElement.scale,
            color: selectedColor
          })
        }
        break
      
      case 'select':
        // Ray casting to select elements would be implemented here
        break
      
      case 'delete':
        // Ray casting to delete elements would be implemented here
        break
    }
  }, [constructionMode, selectedElementType, selectedMaterial, selectedColor, previewElement, placeElement])

  // Set up event listeners
  React.useEffect(() => {
    if (isActive && isConstructionMode) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('click', handleClick)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('click', handleClick)
      }
    }
  }, [isActive, isConstructionMode, handleMouseMove, handleClick])

  // Render construction UI
  if (!isActive) return null

  return (
    <>
      {/* Grid Helper */}
      {showGrid && isConstructionMode && (
        <gridHelper
          ref={gridHelperRef}
          args={[100, 100, '#40E0D0', '#40E0D0']}
          position={[0, 0.01, 0]}
        />
      )}

      {/* Preview Element */}
      {previewElement && isConstructionMode && constructionMode === 'place' && (
        <mesh position={[previewElement.position.x, previewElement.position.y, previewElement.position.z]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial 
            color={materialColors[previewElement.material] || '#FFFFFF'} 
            transparent 
            opacity={0.6}
          />
        </mesh>
      )}

      {/* Placed Elements */}
      {Array.from(placedElements.values()).map((element) => (
        <mesh 
          key={element.id}
          position={[element.position.x, element.position.y, element.position.z]}
          rotation={[element.rotation.x, element.rotation.y, element.rotation.z]}
          scale={[element.scale.x, element.scale.y, element.scale.z]}
          onClick={() => selectElement(element.id)}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial 
            color={element.color || materialColors[element.material]} 
          />
          {selectedElement === element.id && (
            <lineSegments>
              <edgesGeometry args={[new THREE.BoxGeometry(1.1, 1.1, 1.1)]} />
              <lineBasicMaterial color="#FFD700" linewidth={3} />
            </lineSegments>
          )}
        </mesh>
      ))}

    </>
  )
}

// HTML UI Component that goes outside R3F scene
export const ConstructionUI: React.FC<ConstructionInterfaceProps> = ({ isActive }) => {
  const {
    constructionMode,
    isConstructionMode,
    selectedElementType,
    selectedMaterial,
    selectedColor,
    snapToGrid,
    gridSize,
    showGrid,
    setConstructionMode,
    toggleConstructionMode,
    setSelectedElementType,
    setSelectedMaterial,
    toggleGrid,
    toggleSnapToGrid,
    setGridSize
  } = useBuilding()

  if (!isActive) return null

  return (
    <div className="fixed top-4 right-4 bg-slate-800/90 backdrop-blur-md p-4 rounded-lg border border-teal-400/30 text-white">
      <h3 className="text-lg font-bold mb-4 text-teal-300">Construction Mode</h3>
      
      {/* Construction Mode Toggle */}
      <button
        onClick={toggleConstructionMode}
        className={`w-full mb-4 px-4 py-2 rounded-lg font-semibold transition-colors ${
          isConstructionMode 
            ? 'bg-teal-500 hover:bg-teal-600 text-white' 
            : 'bg-slate-600 hover:bg-slate-500 text-slate-300'
        }`}
      >
        {isConstructionMode ? 'Exit Construction' : 'Enter Construction'}
      </button>

      {isConstructionMode && (
        <>
          {/* Construction Modes */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Mode:</label>
            <div className="grid grid-cols-2 gap-2">
              {(['select', 'place', 'move', 'rotate', 'delete', 'paint'] as ConstructionMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setConstructionMode(mode)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    constructionMode === mode
                      ? 'bg-teal-500 text-white'
                      : 'bg-slate-600 hover:bg-slate-550 text-slate-300'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Element Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Element Type:</label>
            <select
              value={selectedElementType || ''}
              onChange={(e) => setSelectedElementType(e.target.value as StructureType | FurnitureType | UtilityType || null)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              <option value="">Select Type</option>
              <optgroup label="Structure">
                <option value="wall">Wall</option>
                <option value="door">Door</option>
                <option value="window">Window</option>
                <option value="foundation">Foundation</option>
                <option value="roof">Roof</option>
                <option value="stairs">Stairs</option>
                <option value="floor">Floor</option>
              </optgroup>
              <optgroup label="Furniture">
                <option value="bed">Bed</option>
                <option value="chair">Chair</option>
                <option value="table">Table</option>
                <option value="shelf">Shelf</option>
                <option value="couch">Couch</option>
                <option value="desk">Desk</option>
                <option value="cabinet">Cabinet</option>
                <option value="lamp">Lamp</option>
              </optgroup>
              <optgroup label="Utilities">
                <option value="electrical_wire">Electrical Wire</option>
                <option value="power_outlet">Power Outlet</option>
                <option value="light_switch">Light Switch</option>
                <option value="water_pipe">Water Pipe</option>
                <option value="faucet">Faucet</option>
                <option value="toilet">Toilet</option>
              </optgroup>
            </select>
          </div>

          {/* Material Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Material:</label>
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value as MaterialType)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              <option value="wood">Wood</option>
              <option value="stone">Stone</option>
              <option value="metal">Metal</option>
              <option value="glass">Glass</option>
              <option value="concrete">Concrete</option>
              <option value="brick">Brick</option>
            </select>
          </div>

          {/* Grid Controls */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Grid Settings:</label>
            </div>
            <div className="space-y-2">
              <button
                onClick={toggleGrid}
                className={`w-full px-3 py-1 rounded text-sm transition-colors ${
                  showGrid
                    ? 'bg-teal-500 text-white'
                    : 'bg-slate-600 hover:bg-slate-500 text-slate-300'
                }`}
              >
                {showGrid ? 'Hide Grid' : 'Show Grid'}
              </button>
              <button
                onClick={toggleSnapToGrid}
                  className={`w-full px-3 py-1 rounded text-sm transition-colors ${
                    snapToGrid
                      ? 'bg-teal-500 text-white'
                      : 'bg-slate-600 hover:bg-slate-500 text-slate-300'
                  }`}
                >
                  {snapToGrid ? 'Snap: ON' : 'Snap: OFF'}
                </button>
                <div className="flex items-center space-x-2">
                  <label className="text-sm">Size:</label>
                  <input
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.5"
                    value={gridSize}
                    onChange={(e) => setGridSize(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm w-8">{gridSize}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

// For backward compatibility, export the UI component as default
const ConstructionInterface = ConstructionUI
export default ConstructionInterface
