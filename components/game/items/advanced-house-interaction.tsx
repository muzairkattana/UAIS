"use client"

import { useRef, useState, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

interface AdvancedHouseInteractionProps {
  position: [number, number, number]
  onDoorToggle: () => void
  onFireplaceToggle: () => void
  onCabinetToggle: () => void
  onWardrobeToggle: () => void
  disabled?: boolean
  id: string
}

export default function AdvancedHouseInteraction({
  position,
  onDoorToggle,
  onFireplaceToggle,
  onCabinetToggle,
  onWardrobeToggle,
  disabled = false,
  id,
}: AdvancedHouseInteractionProps) {
  const { camera } = useThree()
  const interactionRef = useRef<THREE.Group>(null)
  const [nearestInteractable, setNearestInteractable] = useState<string | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [promptText, setPromptText] = useState("")

  // Define interactive elements with their positions and interaction ranges
  const interactables = [
    {
      id: "door",
      position: new THREE.Vector3(position[0], position[1], position[2] + 3.1),
      range: 3,
      action: onDoorToggle,
      prompt: "Press E to open/close door"
    },
    {
      id: "fireplace",
      position: new THREE.Vector3(position[0], position[1], position[2] - 2.8),
      range: 2.5,
      action: onFireplaceToggle,
      prompt: "Press E to light/extinguish fireplace"
    },
    {
      id: "kitchen-cabinet",
      position: new THREE.Vector3(position[0] + 3, position[1] + 1.8, position[2] - 1.5),
      range: 2,
      action: onCabinetToggle,
      prompt: "Press E to open/close cabinet"
    },
    {
      id: "wardrobe",
      position: new THREE.Vector3(position[0] - 3.5, position[1] + 1, position[2] + 1),
      range: 2,
      action: onWardrobeToggle,
      prompt: "Press E to open/close wardrobe"
    },
    {
      id: "bed",
      position: new THREE.Vector3(position[0] - 3, position[1], position[2] - 1.5),
      range: 2,
      action: () => console.log("Player rested in bed"),
      prompt: "Press E to rest"
    },
    {
      id: "chair",
      position: new THREE.Vector3(position[0] + 2.5, position[1], position[2] + 0.5),
      range: 1.5,
      action: () => console.log("Player sat on chair"),
      prompt: "Press E to sit"
    }
  ]

  useFrame(() => {
    if (!interactionRef.current || disabled) return

    const playerPosition = camera.position.clone()
    let closest: {
      id: string;
      distance: number;
      interactable: typeof interactables[0];
    } | null = null

    // Find the closest interactable within range
    for (const interactable of interactables) {
      const distance = playerPosition.distanceTo(interactable.position)
      
      if (distance <= interactable.range) {
        if (!closest || distance < closest.distance) {
          closest = {
            id: interactable.id,
            distance,
            interactable
          }
        }
      }
    }

    // Update nearest interactable
    const newNearest = closest?.id ?? null
    
    if (newNearest !== nearestInteractable) {
      setNearestInteractable(newNearest)
      setShowPrompt(!!newNearest)
      
      if (newNearest && closest) {
        setPromptText(closest.interactable.prompt)
      }
    }
  })

  // Handle key press for interactions
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (disabled || !nearestInteractable) return

      if (event.code === "KeyE" || event.code === "KeyF") {
        event.preventDefault()
        
        const interactable = interactables.find(i => i.id === nearestInteractable)
        if (interactable) {
          interactable.action()
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [nearestInteractable, disabled])

  return (
    <group ref={interactionRef}>
      {/* Interaction zones (invisible) */}
      {interactables.map((interactable) => (
        <mesh
          key={interactable.id}
          position={[
            interactable.position.x,
            interactable.position.y + 1,
            interactable.position.z
          ]}
          visible={false}
        >
          <sphereGeometry args={[interactable.range]} />
          <meshStandardMaterial transparent opacity={0} />
        </mesh>
      ))}

      {/* Interaction prompt */}
      {showPrompt && nearestInteractable && (
        <group position={[
          camera.position.x,
          camera.position.y + 1,
          camera.position.z - 2
        ]}>
          {/* Prompt background */}
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[3, 0.6]} />
            <meshStandardMaterial
              color="#000000"
              transparent
              opacity={0.8}
              depthTest={false}
            />
          </mesh>
          
          {/* Prompt text background */}
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[2.8, 0.4]} />
            <meshStandardMaterial
              color="#FFFFFF"
              transparent
              opacity={0.9}
              depthTest={false}
            />
          </mesh>

          {/* Add visual indicator based on interaction type */}
          {nearestInteractable === "door" && (
            <mesh position={[0, 0, 0.02]}>
              <boxGeometry args={[0.1, 0.2, 0.02]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
          )}
          
          {nearestInteractable === "fireplace" && (
            <mesh position={[0, 0, 0.02]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color="#FF4500" emissive="#FF2500" />
            </mesh>
          )}
        </group>
      )}

      {/* Additional visual feedback for bed interaction */}
      {nearestInteractable === "bed" && (
        <pointLight
          position={[position[0] - 3, position[1] + 1, position[2] - 1.5]}
          intensity={0.3}
          distance={2}
          color="#FFE4B5"
        />
      )}

      {/* Additional visual feedback for kitchen area */}
      {nearestInteractable === "kitchen-cabinet" && (
        <pointLight
          position={[position[0] + 3, position[1] + 2, position[2] - 1.5]}
          intensity={0.4}
          distance={3}
          color="#FFF8DC"
        />
      )}
    </group>
  )
}
