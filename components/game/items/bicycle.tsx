"use client"

import * as THREE from 'three'
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboard } from '../player/useKeyboard'
import { useVehicle } from '@/lib/vehicle-context'

export default function Bicycle({ 
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
  const cycleRef = useRef<THREE.Group>(null)
  const { forward, backward, left, right, brake, exit } = useKeyboard()
  const { updateVehicleTransform, exitVehicle } = useVehicle()
  const [speed, setSpeed] = useState(0)
  const [pedalRotation, setPedalRotation] = useState(0)
  const [wheelRotation, setWheelRotation] = useState(0)
  const [wasExitPressed, setWasExitPressed] = useState(false)

  useFrame((state, delta) => {
    if (!active || !cycleRef.current) return

    // Handle exit key press
    if (exit && !wasExitPressed) {
      setWasExitPressed(true)
      exitVehicle()
      return
    }
    if (!exit && wasExitPressed) {
      setWasExitPressed(false)
    }

    const acceleration = 0.02
    const maxSpeed = 0.4
    const friction = 0.96

    // Pedaling mechanics
    if (forward) {
      setSpeed(Math.min(speed + acceleration, maxSpeed))
      setPedalRotation(pedalRotation + speed * delta * 15)
      setWheelRotation(wheelRotation + speed * delta * 10)
    } else if (backward) {
      setSpeed(Math.max(speed - acceleration, -maxSpeed / 4))
      setPedalRotation(pedalRotation - speed * delta * 15)
      setWheelRotation(wheelRotation - speed * delta * 10)
    } else if (brake) {
      setSpeed(speed * 0.9);
    } else {
      setSpeed(speed * friction)
      if (Math.abs(speed) > 0.01) {
        setWheelRotation(wheelRotation + speed * delta * 10)
      }
    }

    // Steering
    if (left && speed > 0.05) {
      cycleRef.current.rotation.y += speed * delta * 2
    } else if (right && speed > 0.05) {
      cycleRef.current.rotation.y -= speed * delta * 2
    }

    // Update bicycle position
    cycleRef.current.position.x += Math.sin(cycleRef.current.rotation.y) * speed * delta * 20
    cycleRef.current.position.z += Math.cos(cycleRef.current.rotation.y) * speed * delta * 20
    
    // Update vehicle context with new transform
    updateVehicleTransform(
      cycleRef.current.position.clone(),
      cycleRef.current.rotation.clone()
    );
  })

  return (
    <group ref={cycleRef} position={position} rotation={rotation} onClick={onClick}>
      {/* Main Frame */}
      <mesh position={[0, 0.6, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 1.1, 16]} />
        <meshStandardMaterial color="#2E7D32" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.8, 0.3]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.8, 16]} />
        <meshStandardMaterial color="#2E7D32" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.45, -0.4]} rotation={[-0.3, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.8, 16]} />
        <meshStandardMaterial color="#2E7D32" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Detailed Wheels with Spokes */}
      <group position={[0, 0.4, 0.65]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.45, 0.05, 16, 64]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Spokes */}
        {Array.from({ length: 12 }, (_, i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, (i * Math.PI) / 6]}>
            <cylinderGeometry args={[0.005, 0.005, 0.9, 8]} />
            <meshStandardMaterial color="#666" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
      </group>
      <group position={[0, 0.4, -0.65]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.45, 0.05, 16, 64]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Spokes */}
        {Array.from({ length: 12 }, (_, i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, (i * Math.PI) / 6]}>
            <cylinderGeometry args={[0.005, 0.005, 0.9, 8]} />
            <meshStandardMaterial color="#666" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* Seat */}
      <mesh position={[0, 0.8, -0.7]}>
        <boxGeometry args={[0.15, 0.05, 0.25]} />
        <meshStandardMaterial color="#2C2C2C" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.75, -0.8]} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.3, 16]} />
        <meshStandardMaterial color="#333" metalness={0.5} />
      </mesh>

      {/* Handlebars */}
      <mesh position={[0, 0.9, 0.65]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 0.6, 16]} />
        <meshStandardMaterial color="#555" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.28, 0.9, 0.65]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#666" roughness={0.7} />
      </mesh>
      <mesh position={[-0.28, 0.9, 0.65]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#666" roughness={0.7} />
      </mesh>

      {/* Pedals and Crank */}
      <group position={[0, 0.5, -0.1]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.05, 16]} />
          <meshStandardMaterial color="#444" metalness={0.8} />
        </mesh>
        <mesh position={[0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.25, 16]} />
          <meshStandardMaterial color="#666" metalness={0.7} />
        </mesh>
        <mesh position={[-0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.25, 16]} />
          <meshStandardMaterial color="#666" metalness={0.7} />
        </mesh>
        <mesh position={[0.18, 0, 0]}>
          <boxGeometry args={[0.08, 0.03, 0.12]} />
          <meshStandardMaterial color="#333" roughness={0.8} />
        </mesh>
        <mesh position={[-0.18, 0, 0]}>
          <boxGeometry args={[0.08, 0.03, 0.12]} />
          <meshStandardMaterial color="#333" roughness={0.8} />
        </mesh>
      </group>

      {/* Chain Guard */}
      <mesh position={[0.08, 0.5, -0.3]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.02, 0.15, 0.5]} />
        <meshStandardMaterial color="#555" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

