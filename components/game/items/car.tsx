"use client"

import * as THREE from 'three'
import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboard } from '../player/useKeyboard'
import { useVehicle } from '@/lib/vehicle-context'

export default function Car({ 
  position, 
  rotation, 
  active, 
  onClick 
}: { 
  position: [number, number, number], 
  rotation: [number, number, number], 
  active: boolean, 
  onClick: () => void 
}) {
  const carRef = useRef<THREE.Group>(null)
  const { forward, backward, left, right, brake, exit } = useKeyboard()
  const { updateVehicleTransform, exitVehicle } = useVehicle()
  const [speed, setSpeed] = useState(0)
  const [steering, setSteering] = useState(0)
  const [wasExitPressed, setWasExitPressed] = useState(false)

  useFrame((state, delta) => {
    if (!active || !carRef.current) return

    // Handle exit key press
    if (exit && !wasExitPressed) {
      setWasExitPressed(true)
      exitVehicle()
      return
    }
    if (!exit && wasExitPressed) {
      setWasExitPressed(false)
    }

    const acceleration = 0.03
    const maxSpeed = 0.8
    const friction = 0.95
    const steeringSpeed = 0.04
    const maxSteering = 0.6

    // Acceleration and braking
    if (forward) {
      setSpeed(Math.min(speed + acceleration, maxSpeed))
    } else if (backward) {
      setSpeed(Math.max(speed - acceleration, -maxSpeed / 2))
    } else if (brake) {
      // Quick braking
      setSpeed(speed * 0.85)
    } else {
      // Natural friction
      setSpeed(speed * friction)
    }

    // Steering - only works when moving
    const speedFactor = Math.abs(speed) > 0.01 ? Math.abs(speed) : 0
    if (left && speedFactor > 0) {
      setSteering(Math.min(steering + steeringSpeed, maxSteering))
    } else if (right && speedFactor > 0) {
      setSteering(Math.max(steering - steeringSpeed, -maxSteering))
    } else {
      setSteering(steering * friction)
    }

    // Update car position and rotation with improved physics
    const moveSpeed = speed * delta * 30
    const turnAmount = steering * speedFactor * delta * 8
    
    // Move forward/backward in the direction the car is facing
    carRef.current.position.x += Math.sin(carRef.current.rotation.y) * moveSpeed
    carRef.current.position.z += Math.cos(carRef.current.rotation.y) * moveSpeed
    
    // Rotate the car based on steering and speed
    carRef.current.rotation.y += turnAmount
    
    // Update vehicle context with new transform
    updateVehicleTransform(
      carRef.current.position.clone(),
      carRef.current.rotation.clone()
    )
  })

  return (
    <group ref={carRef} position={position} rotation={rotation} onClick={onClick}>
      {/* Car Body with smoother edges */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.8, 0.6, 4]} />
        <meshStandardMaterial color="#c93232" metalness={0.85} roughness={0.15} />
      </mesh>
      <mesh position={[0, 0.7, -1.8]}>
        <boxGeometry args={[1.8, 0.4, 0.5]} />
        <meshStandardMaterial color="#c93232" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Car Roof with curvature */}
      <mesh position={[0, 1, -0.5]}>
        <boxGeometry args={[1.6, 0.5, 2.5]} />
        <meshStandardMaterial color="#c93232" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Windows with tint */}
      <mesh position={[0.81, 1, -0.5]}>
        <boxGeometry args={[0.02, 0.4, 2.4]} />
        <meshStandardMaterial color="#222" emissive="#fff" emissiveIntensity={0.05} transparent opacity={0.4} />
      </mesh>
      <mesh position={[-0.81, 1, -0.5]}>
        <boxGeometry args={[0.02, 0.4, 2.4]} />
        <meshStandardMaterial color="#222" emissive="#fff" emissiveIntensity={0.05} transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, 1, 0.76]}>
        <boxGeometry args={[1.6, 0.4, 0.02]} />
        <meshStandardMaterial color="#222" emissive="#fff" emissiveIntensity={0.05} transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, 1, -1.76]}>
        <boxGeometry args={[1.6, 0.4, 0.02]} />
        <meshStandardMaterial color="#222" emissive="#fff" emissiveIntensity={0.05} transparent opacity={0.4} />
      </mesh>

      {/* Detailed Wheels with Rims */}
      <group position={[0.9, 0.35, 1.5]}>
        <mesh>
          <cylinderGeometry args={[0.35, 0.35, 0.25, 32]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <cylinderGeometry args={[0.2, 0.2, 0.05, 32]} />
          <meshStandardMaterial color="#777" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
      <group position={[-0.9, 0.35, 1.5]}>
        <mesh>
          <cylinderGeometry args={[0.35, 0.35, 0.25, 32]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <cylinderGeometry args={[0.2, 0.2, 0.05, 32]} />
          <meshStandardMaterial color="#777" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
      <group position={[0.9, 0.35, -1.5]}>
        <mesh>
          <cylinderGeometry args={[0.35, 0.35, 0.25, 32]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <cylinderGeometry args={[0.2, 0.2, 0.05, 32]} />
          <meshStandardMaterial color="#777" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
      <group position={[-0.9, 0.35, -1.5]}>
        <mesh>
          <cylinderGeometry args={[0.35, 0.35, 0.25, 32]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <cylinderGeometry args={[0.2, 0.2, 0.05, 32]} />
          <meshStandardMaterial color="#777" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* Headlights and Taillights */}
      <mesh position={[0.7, 0.5, 2]}>
        <boxGeometry args={[0.3, 0.15, 0.05]} />
        <meshStandardMaterial color="#fff" emissive="#ffffee" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-0.7, 0.5, 2]}>
        <boxGeometry args={[0.3, 0.15, 0.05]} />
        <meshStandardMaterial color="#fff" emissive="#ffffee" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.7, 0.5, -2]}>
        <boxGeometry args={[0.3, 0.15, 0.05]} />
        <meshStandardMaterial color="#990000" emissive="#ff0000" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[-0.7, 0.5, -2]}>
        <boxGeometry args={[0.3, 0.15, 0.05]} />
        <meshStandardMaterial color="#990000" emissive="#ff0000" emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}

