"use client"

import { useRef, useState, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

interface HouseInteractionProps {
  position: [number, number, number]
  onDoorToggle: () => void
  disabled?: boolean
  id: string
}

export default function HouseInteraction({
  position,
  onDoorToggle,
  disabled = false,
  id,
}: HouseInteractionProps) {
  const { camera } = useThree()
  const interactionRef = useRef<THREE.Group>(null)
  const [isNearDoor, setIsNearDoor] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  useFrame(() => {
    if (!interactionRef.current || disabled) return

    // Calculate distance from camera (player) to door
    const doorPosition = new THREE.Vector3(position[0], position[1], position[2] + 3.1) // Door is at front
    const playerPosition = camera.position.clone()
    const distance = playerPosition.distanceTo(doorPosition)

    // Show interaction prompt when player is close to door
    const wasNear = isNearDoor
    const isNear = distance < 3 // 3 units interaction range

    setIsNearDoor(isNear)
    setShowPrompt(isNear && !disabled)

    // Handle automatic interaction detection
    if (isNear && !wasNear) {
      // Player approached door
      console.log(`Player approached house door: ${id}`)
    } else if (!isNear && wasNear) {
      // Player left door area
      console.log(`Player left house door: ${id}`)
    }
  })

  // Handle key press for door interaction
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (disabled || !isNearDoor) return

      if (event.code === "KeyE" || event.code === "KeyF") {
        event.preventDefault()
        onDoorToggle()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isNearDoor, disabled, onDoorToggle])

  return (
    <group ref={interactionRef}>
      {/* Interaction zone (invisible) */}
      <mesh position={[position[0], position[1] + 1, position[2] + 3.1]} visible={false}>
        <sphereGeometry args={[3]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* Interaction prompt */}
      {showPrompt && (
        <group position={[position[0], position[1] + 3.5, position[2] + 3.1]}>
          {/* Prompt background */}
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[2, 0.5]} />
            <meshStandardMaterial
              color="#000000"
              transparent
              opacity={0.7}
              depthTest={false}
            />
          </mesh>
          
          {/* Prompt text would go here - in a real implementation you'd use 
              a text rendering library like troika-three-text */}
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[1.8, 0.3]} />
            <meshStandardMaterial
              color="#FFFFFF"
              transparent
              opacity={0.9}
              depthTest={false}
            />
          </mesh>
        </group>
      )}
    </group>
  )
}
