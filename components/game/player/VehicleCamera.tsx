"use client"

import { useRef, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useVehicle } from "@/lib/vehicle-context"
import * as THREE from "three"

interface VehicleCameraProps {
  isLocked: boolean
  mouseSensitivity?: number
  invertY?: boolean
}

export default function VehicleCamera({
  isLocked,
  mouseSensitivity = 1.0,
  invertY = false
}: VehicleCameraProps) {
  const { camera } = useThree()
  const { vehicleState, getVehicleOffset } = useVehicle()
  const yaw = useRef(0)
  const pitch = useRef(0)

  // Handle mouse movement for camera controls
  useEffect(() => {
    if (!isLocked || !vehicleState.isInVehicle) return

    const handleMouseMove = (event: MouseEvent) => {
      if (!event.movementX && !event.movementY) return

      const sensitivity = mouseSensitivity * 0.002

      yaw.current -= event.movementX * sensitivity
      pitch.current -= event.movementY * sensitivity * (invertY ? -1 : 1)

      // Clamp pitch to prevent camera flipping
      pitch.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch.current))
    }

    document.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isLocked, vehicleState.isInVehicle, mouseSensitivity, invertY])

  useFrame(() => {
    if (!vehicleState.isInVehicle || !vehicleState.activeVehicle) return

    // Get vehicle position and rotation
    const vehiclePos = vehicleState.vehiclePosition
    const vehicleRot = vehicleState.vehicleRotation
    const offset = getVehicleOffset(vehicleState.activeVehicle)

    // Calculate camera position relative to vehicle
    const cameraOffset = new THREE.Vector3(0, 2, -5) // Third-person camera behind vehicle
    
    // Apply vehicle rotation to camera offset
    cameraOffset.applyEuler(vehicleRot)
    
    // Position camera
    const targetPosition = vehiclePos.clone().add(offset).add(cameraOffset)
    camera.position.copy(targetPosition)

    // Look at vehicle
    const lookAtTarget = vehiclePos.clone().add(offset)
    camera.lookAt(lookAtTarget)

    // Apply mouse look rotation if locked
    if (isLocked) {
      const euler = new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ')
      camera.setRotationFromEuler(euler)
    }
  })

  return null
}
