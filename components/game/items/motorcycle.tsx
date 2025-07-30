"use client"

import * as THREE from 'three'
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboard } from '../player/useKeyboard'
import { useVehicle } from '@/lib/vehicle-context'

export default function Motorcycle({ 
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
  const bikeRef = useRef<THREE.Group>(null)
  const { forward, backward, left, right, brake, exit } = useKeyboard()
  const { updateVehicleTransform, exitVehicle } = useVehicle()
  const [speed, setSpeed] = useState(0)
  const [lean, setLean] = useState(0)
  const [wasExitPressed, setWasExitPressed] = useState(false)

  useFrame((state, delta) => {
    if (!active || !bikeRef.current) return

    // Handle exit key press
    if (exit && !wasExitPressed) {
      setWasExitPressed(true)
      exitVehicle()
      return
    }
    if (!exit && wasExitPressed) {
      setWasExitPressed(false)
    }

    const acceleration = 0.04
    const maxSpeed = 1.0
    const friction = 0.96
    const leanAmount = 0.4
    const turnSpeed = 4

    // Acceleration and braking
    if (forward) {
      setSpeed(Math.min(speed + acceleration, maxSpeed))
    } else if (backward) {
      setSpeed(Math.max(speed - acceleration, -maxSpeed / 3))
    } else if (brake) {
      setSpeed(speed * 0.8)
    } else {
      setSpeed(speed * friction)
    }

    // Leaning and steering for motorcycle
    const speedFactor = Math.abs(speed) > 0.02 ? Math.abs(speed) : 0
    if (left && speedFactor > 0) {
      setLean(Math.min(lean + 0.06, leanAmount))
      bikeRef.current.rotation.y += speedFactor * delta * turnSpeed
    } else if (right && speedFactor > 0) {
      setLean(Math.max(lean - 0.06, -leanAmount))
      bikeRef.current.rotation.y -= speedFactor * delta * turnSpeed
    } else {
      setLean(lean * 0.92)
    }

    // Update motorcycle position
    const moveSpeed = speed * delta * 35
    bikeRef.current.position.x += Math.sin(bikeRef.current.rotation.y) * moveSpeed
    bikeRef.current.position.z += Math.cos(bikeRef.current.rotation.y) * moveSpeed
    bikeRef.current.rotation.z = lean
    
    // Update vehicle context with new transform
    updateVehicleTransform(
      bikeRef.current.position.clone(),
      bikeRef.current.rotation.clone()
    )
  })

  return (
    <group ref={bikeRef} position={position} rotation={rotation} onClick={onClick}>
      {/* Main Body/Tank with more shape */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[0.4, 0.35, 1.2]} />
        <meshStandardMaterial color="#1A237E" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.8, -0.3]}>
        <boxGeometry args={[0.35, 0.2, 0.8]} />
        <meshStandardMaterial color="#616161" roughness={0.5} />
      </mesh>

      {/* Engine with more detail */}
      <group position={[0, 0.45, 0.2]}>
        <mesh>
          <boxGeometry args={[0.5, 0.5, 0.6]} />
          <meshStandardMaterial color="#424242" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.1, 0.1, 0.1, 16]} />
          <meshStandardMaterial color="#212121" metalness={0.9} />
        </mesh>
      </group>

      {/* Detailed Wheels */}
      <group position={[0, 0.4, 1.2]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.4, 0.08, 16, 32]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      </group>
      <group position={[0, 0.4, -1]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.4, 0.08, 16, 32]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      </group>

      {/* Front Fork and Handlebars */}
      <mesh position={[0, 0.7, 1.1]} rotation={[0.4, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.9, 16]} />
        <meshStandardMaterial color="#9E9E9E" metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[0, 1.1, 1.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.7, 16]} />
        <meshStandardMaterial color="#424242" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Headlight and Taillight */}
      <mesh position={[0, 0.8, 1.35]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#fff" emissive="#ffffee" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0, 0.7, -1.2]}>
        <boxGeometry args={[0.1, 0.08, 0.05]} />
        <meshStandardMaterial color="#990000" emissive="#ff0000" emissiveIntensity={0.5} />
      </mesh>

      {/* Double Exhaust Pipes */}
      <mesh position={[0.25, 0.3, -0.6]} rotation={[0, 0, Math.PI / 12]}>
        <cylinderGeometry args={[0.05, 0.06, 1.2, 16]} />
        <meshStandardMaterial color="#BDBDBD" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[-0.25, 0.3, -0.6]} rotation={[0, 0, -Math.PI / 12]}>
        <cylinderGeometry args={[0.05, 0.06, 1.2, 16]} />
        <meshStandardMaterial color="#BDBDBD" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}
