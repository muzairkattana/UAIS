"use client"

import { useRef, useMemo, useState } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { Text } from "@react-three/drei"
import Door from "./door"

interface HouseProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  id?: string
}

export default function House({
  position,
  rotation = [0, 0, 0],
  scale = 1,
  id = "house",
}: HouseProps) {
  const houseRef = useRef<THREE.Group>(null)
  const [isDoorOpen, setIsDoorOpen] = useState(false)
  const [windowLights, setWindowLights] = useState(true)
  const [kitchenCabinetOpen, setKitchenCabinetOpen] = useState(false)
  const [bedroomDoorOpen, setBedroomDoorOpen] = useState(false)
  const [fireplaceActive, setFireplaceActive] = useState(false)

  // Randomize house structure
  const houseWidth = useMemo(() => 8 + (Math.random() - 0.5) * 2, [])
  const houseDepth = useMemo(() => 6 + (Math.random() - 0.5) * 2, [])
  const houseHeight = useMemo(() => 3 + (Math.random() - 0.5) * 1, [])
  const roofStyle = useMemo(() => Math.floor(Math.random() * 3), []) // 0: pyramid, 1: gabled, 2: flat
  const wallColorVariant = useMemo(() => Math.floor(Math.random() * 4), []) // Different wall colors

  // Materials with color variations
  const wallColors = ["#8B7355", "#CD853F", "#D2B48C", "#F4A460"]
  const wallMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: wallColors[wallColorVariant],
    roughness: 0.8,
    metalness: 0.1,
  }), [wallColorVariant])

  const roofMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#654321", // Dark brown roof
    roughness: 0.9,
    metalness: 0.05,
  }), [])

  const floorMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#A0522D", // Wooden floor
    roughness: 0.7,
    metalness: 0.1,
  }), [])

  const windowMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#87CEEB", // Light blue glass
    transparent: true,
    opacity: 0.6,
    roughness: 0.1,
    metalness: 0.9,
  }), [])

  const bedMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#8B4513", // Brown bed frame
    roughness: 0.8,
  }), [])

  const mattressMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#FFF8DC", // Cream mattress
    roughness: 0.9,
  }), [])

  const tableMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#654321", // Dark wood table
    roughness: 0.8,
  }), [])

  // Handle door interaction
  const handleDoorClick = () => {
    setIsDoorOpen(!isDoorOpen)
  }

  // Animate window lights
  useFrame((state) => {
    if (!houseRef.current) return
    
    // Subtle light flickering effect
    const time = state.clock.getElapsedTime()
    const flicker = 0.9 + Math.sin(time * 2) * 0.1
    
    // Update window light intensity
    if (windowLights) {
      // This would be used if we had actual light components
    }
  })

  return (
    <group ref={houseRef} position={position} rotation={rotation} scale={scale}>
      {/* Foundation - slightly larger than house */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[8.5, 0.2, 6.5]} />
        <meshStandardMaterial color="#696969" roughness={0.9} />
      </mesh>

      {/* Main House Structure */}
      <group>
        {/* Floor */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[8, 0.1, 6]} />
          <primitive object={floorMaterial} />
        </mesh>

        {/* Walls */}
        {/* Front wall (with door opening) */}
        <group>
          {/* Left part of front wall */}
          <mesh position={[-2.5, 1.5, 3]}>
            <boxGeometry args={[3, 3, 0.2]} />
            <primitive object={wallMaterial} />
          </mesh>
          {/* Right part of front wall */}
          <mesh position={[2.5, 1.5, 3]}>
            <boxGeometry args={[3, 3, 0.2]} />
            <primitive object={wallMaterial} />
          </mesh>
          {/* Top part above door */}
          <mesh position={[0, 2.75, 3]}>
            <boxGeometry args={[2, 0.5, 0.2]} />
            <primitive object={wallMaterial} />
          </mesh>
        </group>

        {/* Back wall */}
        <mesh position={[0, 1.5, -3]}>
          <boxGeometry args={[8, 3, 0.2]} />
          <primitive object={wallMaterial} />
        </mesh>

        {/* Left wall with window */}
        <group>
          {/* Left wall parts around window */}
          <mesh position={[-4, 1.5, -1]}>
            <boxGeometry args={[0.2, 3, 2]} />
            <primitive object={wallMaterial} />
          </mesh>
          <mesh position={[-4, 1.5, 1]}>
            <boxGeometry args={[0.2, 3, 2]} />
            <primitive object={wallMaterial} />
          </mesh>
          <mesh position={[-4, 0.5, 0]}>
            <boxGeometry args={[0.2, 1, 2]} />
            <primitive object={wallMaterial} />
          </mesh>
          <mesh position={[-4, 2.5, 0]}>
            <boxGeometry args={[0.2, 1, 2]} />
            <primitive object={wallMaterial} />
          </mesh>
          
          {/* Window */}
          <mesh position={[-3.95, 1.5, 0]}>
            <boxGeometry args={[0.1, 1.5, 1.5]} />
            <primitive object={windowMaterial} />
          </mesh>
        </group>

        {/* Right wall with window */}
        <group>
          {/* Right wall parts around window */}
          <mesh position={[4, 1.5, -1]}>
            <boxGeometry args={[0.2, 3, 2]} />
            <primitive object={wallMaterial} />
          </mesh>
          <mesh position={[4, 1.5, 1]}>
            <boxGeometry args={[0.2, 3, 2]} />
            <primitive object={wallMaterial} />
          </mesh>
          <mesh position={[4, 0.5, 0]}>
            <boxGeometry args={[0.2, 1, 2]} />
            <primitive object={wallMaterial} />
          </mesh>
          <mesh position={[4, 2.5, 0]}>
            <boxGeometry args={[0.2, 1, 2]} />
            <primitive object={wallMaterial} />
          </mesh>
          
          {/* Window */}
          <mesh position={[3.95, 1.5, 0]}>
            <boxGeometry args={[0.1, 1.5, 1.5]} />
            <primitive object={windowMaterial} />
          </mesh>
        </group>

        {/* Dynamic Roof */}
        <group position={[0, houseHeight + 0.5, 0]}>
          {roofStyle === 0 && ( // Pyramid roof
            <mesh position={[0, 0.5, 0]}>
              <coneGeometry args={[Math.max(houseWidth, houseDepth) * 0.6, 2, 4]} />
              <primitive object={roofMaterial} />
            </mesh>
          )}
          {roofStyle === 1 && ( // Gabled roof
            <>
              <mesh position={[0, 0.5, -houseDepth * 0.15]} rotation={[Math.PI / 6, 0, 0]}>
                <boxGeometry args={[houseWidth + 0.5, 0.2, houseDepth * 0.4]} />
                <primitive object={roofMaterial} />
              </mesh>
              <mesh position={[0, 0.5, houseDepth * 0.15]} rotation={[-Math.PI / 6, 0, 0]}>
                <boxGeometry args={[houseWidth + 0.5, 0.2, houseDepth * 0.4]} />
                <primitive object={roofMaterial} />
              </mesh>
              <mesh position={[0, 1, 0]}>
                <boxGeometry args={[houseWidth + 0.5, 0.2, 0.3]} />
                <primitive object={roofMaterial} />
              </mesh>
            </>
          )}
          {roofStyle === 2 && ( // Flat roof
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[houseWidth + 0.5, 0.3, houseDepth + 0.5]} />
              <primitive object={roofMaterial} />
            </mesh>
          )}
        </group>

        {/* Porch/Balcony */}
        <group position={[0, 0, 4.5]}>
          {/* Porch floor */}
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[4, 0.1, 1.5]} />
            <primitive object={floorMaterial} />
          </mesh>
          
          {/* Porch railings */}
          <mesh position={[-1.8, 0.6, 0.7]}>
            <boxGeometry args={[0.1, 1.2, 0.1]} />
            <primitive object={wallMaterial} />
          </mesh>
          <mesh position={[1.8, 0.6, 0.7]}>
            <boxGeometry args={[0.1, 1.2, 0.1]} />
            <primitive object={wallMaterial} />
          </mesh>
          <mesh position={[0, 0.6, 0.7]}>
            <boxGeometry args={[3.6, 0.1, 0.1]} />
            <primitive object={wallMaterial} />
          </mesh>
        </group>

        {/* Door */}
        <Door
          position={[0, 0, houseDepth / 2 + 0.1]}
          isOpen={isDoorOpen}
          scale={1.2}
          id={`${id}-door`}
        />

        {/* Sign */}
        <group position={[0, houseHeight - 0.5, houseDepth / 2 + 0.2]}>
          <mesh>
            <boxGeometry args={[2.2, 0.7, 0.1]} />
            <meshStandardMaterial color="#SaddleBrown" />
          </mesh>
          <Text
            position={[0, 0, 0.06]}
            fontSize={0.2}
            color="#FFFFFF"
            anchorX="center"
            anchorY="middle"
            maxWidth={2}
            textAlign="center"
          >
            Uzair AI Studio Construction
          </Text>
        </group>

        {/* Interior Room Dividers */}
        {/* Bedroom wall divider */}
        <mesh position={[-2, 1.5, 0]}>
          <boxGeometry args={[0.15, 3, 6]} />
          <primitive object={wallMaterial} />
        </mesh>
        
        {/* Kitchen divider */}
        <mesh position={[2, 1.5, 1.5]}>
          <boxGeometry args={[4, 3, 0.15]} />
          <primitive object={wallMaterial} />
        </mesh>

        {/* BEDROOM (Left side) */}
        <group>
          {/* Master Bed */}
          <group position={[-3, 0.5, -1.5]}>
            {/* Bed frame */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.5, 0.6, 2]} />
              <primitive object={bedMaterial} />
            </mesh>
            {/* Mattress */}
            <mesh position={[0, 0.35, 0]}>
              <boxGeometry args={[1.3, 0.15, 1.8]} />
              <primitive object={mattressMaterial} />
            </mesh>
            {/* Pillows */}
            <mesh position={[-0.3, 0.5, -0.7]}>
              <boxGeometry args={[0.4, 0.1, 0.2]} />
              <meshStandardMaterial color="#FFF8DC" roughness={0.8} />
            </mesh>
            <mesh position={[0.3, 0.5, -0.7]}>
              <boxGeometry args={[0.4, 0.1, 0.2]} />
              <meshStandardMaterial color="#FFE4E1" roughness={0.8} />
            </mesh>
            {/* Blanket */}
            <mesh position={[0, 0.45, 0.3]}>
              <boxGeometry args={[1.2, 0.05, 1.2]} />
              <meshStandardMaterial color="#8FBC8F" roughness={0.9} />
            </mesh>
          </group>

          {/* Nightstand */}
          <group position={[-3.5, 0.3, -2.5]}>
            <mesh position={[0, 0.3, 0]}>
              <boxGeometry args={[0.5, 0.6, 0.4]} />
              <primitive object={tableMaterial} />
            </mesh>
            {/* Drawer */}
            <mesh position={[0.22, 0.4, 0]}>
              <boxGeometry args={[0.08, 0.15, 0.3]} />
              <meshStandardMaterial color="#654321" roughness={0.8} />
            </mesh>
            {/* Drawer handle */}
            <mesh position={[0.27, 0.4, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.05, 8]} />
              <meshStandardMaterial color="#C0C0C0" metalness={0.8} />
            </mesh>
          </group>

          {/* Wardrobe */}
          <group position={[-3.5, 1, 1]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.6, 2, 1.2]} />
              <primitive object={tableMaterial} />
            </mesh>
            {/* Wardrobe doors */}
            <mesh position={[0.32, 0, -0.3]}>
              <boxGeometry args={[0.05, 1.8, 0.5]} />
              <meshStandardMaterial color="#8B4513" roughness={0.8} />
            </mesh>
            <mesh position={[0.32, 0, 0.3]}>
              <boxGeometry args={[0.05, 1.8, 0.5]} />
              <meshStandardMaterial color="#8B4513" roughness={0.8} />
            </mesh>
            {/* Handles */}
            <mesh position={[0.37, 0, -0.15]}>
              <cylinderGeometry args={[0.015, 0.015, 0.08, 8]} />
              <meshStandardMaterial color="#C0C0C0" metalness={0.8} />
            </mesh>
            <mesh position={[0.37, 0, 0.15]}>
              <cylinderGeometry args={[0.015, 0.015, 0.08, 8]} />
              <meshStandardMaterial color="#C0C0C0" metalness={0.8} />
            </mesh>
          </group>
        </group>

        {/* LIVING ROOM (Center) */}
        <group>
          {/* Sofa */}
          <group position={[0, 0.4, 0.5]}>
            {/* Sofa base */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[2.5, 0.5, 0.8]} />
              <meshStandardMaterial color="#8B4513" roughness={0.8} />
            </mesh>
            {/* Sofa cushions */}
            <mesh position={[-0.8, 0.3, 0]}>
              <boxGeometry args={[0.7, 0.15, 0.6]} />
              <meshStandardMaterial color="#DEB887" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.3, 0]}>
              <boxGeometry args={[0.7, 0.15, 0.6]} />
              <meshStandardMaterial color="#DEB887" roughness={0.9} />
            </mesh>
            <mesh position={[0.8, 0.3, 0]}>
              <boxGeometry args={[0.7, 0.15, 0.6]} />
              <meshStandardMaterial color="#DEB887" roughness={0.9} />
            </mesh>
            {/* Sofa backrest */}
            <mesh position={[0, 0.6, -0.3]}>
              <boxGeometry args={[2.5, 0.6, 0.2]} />
              <meshStandardMaterial color="#8B4513" roughness={0.8} />
            </mesh>
            {/* Armrests */}
            <mesh position={[-1.15, 0.6, 0]}>
              <boxGeometry args={[0.2, 0.6, 0.8]} />
              <meshStandardMaterial color="#8B4513" roughness={0.8} />
            </mesh>
            <mesh position={[1.15, 0.6, 0]}>
              <boxGeometry args={[0.2, 0.6, 0.8]} />
              <meshStandardMaterial color="#8B4513" roughness={0.8} />
            </mesh>
          </group>

          {/* Coffee Table */}
          <group position={[0, 0.25, -0.8]}>
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[1.2, 0.08, 0.6]} />
              <primitive object={tableMaterial} />
            </mesh>
            {/* Table legs */}
            <mesh position={[-0.5, 0.1, -0.25]}>
              <boxGeometry args={[0.08, 0.2, 0.08]} />
              <primitive object={tableMaterial} />
            </mesh>
            <mesh position={[0.5, 0.1, -0.25]}>
              <boxGeometry args={[0.08, 0.2, 0.08]} />
              <primitive object={tableMaterial} />
            </mesh>
            <mesh position={[-0.5, 0.1, 0.25]}>
              <boxGeometry args={[0.08, 0.2, 0.08]} />
              <primitive object={tableMaterial} />
            </mesh>
            <mesh position={[0.5, 0.1, 0.25]}>
              <boxGeometry args={[0.08, 0.2, 0.08]} />
              <primitive object={tableMaterial} />
            </mesh>
          </group>

          {/* Fireplace */}
          <group position={[0, 0.8, -2.8]}>
            {/* Fireplace base */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.5, 1.6, 0.3]} />
              <meshStandardMaterial color="#696969" roughness={0.9} />
            </mesh>
            {/* Fireplace opening */}
            <mesh position={[0, -0.2, 0.12]}>
              <boxGeometry args={[1.1, 0.8, 0.15]} />
              <meshStandardMaterial color="#2F4F4F" roughness={0.9} />
            </mesh>
            {/* Mantle */}
            <mesh position={[0, 0.5, 0.2]}>
              <boxGeometry args={[1.7, 0.15, 0.3]} />
              <primitive object={tableMaterial} />
            </mesh>
            {/* Fire effect (when active) */}
            {fireplaceActive && (
              <>
                <pointLight
                  position={[0, -0.2, 0.15]}
                  intensity={1.5}
                  distance={6}
                  color="#FF4500"
                  castShadow
                />
                <mesh position={[0, -0.2, 0.15]}>
                  <sphereGeometry args={[0.1, 8, 8]} />
                  <meshStandardMaterial
                    color="#FF6347"
                    emissive="#FF4500"
                    emissiveIntensity={0.5}
                  />
                </mesh>
              </>
            )}
          </group>
        </group>

        {/* KITCHEN (Right side) */}
        <group>
          {/* Kitchen Counter */}
          <group position={[3, 0.5, -1.5]}>
            <mesh position={[0, 0.4, 0]}>
              <boxGeometry args={[1.5, 0.8, 0.6]} />
              <meshStandardMaterial color="#F5DEB3" roughness={0.7} />
            </mesh>
            {/* Counter top */}
            <mesh position={[0, 0.82, 0]}>
              <boxGeometry args={[1.6, 0.05, 0.7]} />
              <meshStandardMaterial color="#8B4513" roughness={0.6} />
            </mesh>
          </group>

          {/* Kitchen Cabinets */}
          <group position={[3, 1.8, -1.5]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.5, 0.8, 0.4]} />
              <meshStandardMaterial color="#8B4513" roughness={0.8} />
            </mesh>
            {/* Cabinet doors */}
            <mesh position={[0, 0, 0.22]}>
              <boxGeometry args={[0.7, 0.7, 0.05]} />
              <meshStandardMaterial color="#A0522D" roughness={0.8} />
            </mesh>
            <mesh position={[0.8, 0, 0.22]}>
              <boxGeometry args={[0.7, 0.7, 0.05]} />
              <meshStandardMaterial color="#A0522D" roughness={0.8} />
            </mesh>
          </group>

          {/* Stove */}
          <group position={[2.2, 0.85, -1.5]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.6, 0.1, 0.6]} />
              <meshStandardMaterial color="#2F4F4F" roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Burners */}
            <mesh position={[-0.15, 0.06, -0.15]}>
              <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
              <meshStandardMaterial color="#000000" roughness={0.9} />
            </mesh>
            <mesh position={[0.15, 0.06, -0.15]}>
              <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
              <meshStandardMaterial color="#000000" roughness={0.9} />
            </mesh>
            <mesh position={[-0.15, 0.06, 0.15]}>
              <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
              <meshStandardMaterial color="#000000" roughness={0.9} />
            </mesh>
            <mesh position={[0.15, 0.06, 0.15]}>
              <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
              <meshStandardMaterial color="#000000" roughness={0.9} />
            </mesh>
          </group>

          {/* Refrigerator */}
          <group position={[3.7, 1, -2.5]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.8, 2, 0.7]} />
              <meshStandardMaterial color="#F5F5F5" roughness={0.3} metalness={0.1} />
            </mesh>
            {/* Fridge doors */}
            <mesh position={[0.42, 0.5, 0]}>
              <boxGeometry args={[0.05, 1, 0.6]} />
              <meshStandardMaterial color="#DCDCDC" roughness={0.3} />
            </mesh>
            <mesh position={[0.42, -0.5, 0]}>
              <boxGeometry args={[0.05, 1, 0.6]} />
              <meshStandardMaterial color="#DCDCDC" roughness={0.3} />
            </mesh>
            {/* Handles */}
            <mesh position={[0.45, 0.5, 0.2]}>
              <boxGeometry args={[0.02, 0.15, 0.03]} />
              <meshStandardMaterial color="#C0C0C0" metalness={0.8} />
            </mesh>
            <mesh position={[0.45, -0.5, 0.2]}>
              <boxGeometry args={[0.02, 0.15, 0.03]} />
              <meshStandardMaterial color="#C0C0C0" metalness={0.8} />
            </mesh>
          </group>

          {/* Kitchen Table */}
          <group position={[2.5, 0.4, 0.5]}>
            <mesh position={[0, 0.35, 0]}>
              <boxGeometry args={[1.2, 0.08, 0.8]} />
              <primitive object={tableMaterial} />
            </mesh>
            {/* Table legs */}
            <mesh position={[-0.5, 0.17, -0.3]}>
              <boxGeometry args={[0.08, 0.35, 0.08]} />
              <primitive object={tableMaterial} />
            </mesh>
            <mesh position={[0.5, 0.17, -0.3]}>
              <boxGeometry args={[0.08, 0.35, 0.08]} />
              <primitive object={tableMaterial} />
            </mesh>
            <mesh position={[-0.5, 0.17, 0.3]}>
              <boxGeometry args={[0.08, 0.35, 0.08]} />
              <primitive object={tableMaterial} />
            </mesh>
            <mesh position={[0.5, 0.17, 0.3]}>
              <boxGeometry args={[0.08, 0.35, 0.08]} />
              <primitive object={tableMaterial} />
            </mesh>
          </group>

          {/* Kitchen Chairs */}
          <group position={[2, 0.25, 0.5]}>
            <mesh position={[0, 0.22, 0]}>
              <boxGeometry args={[0.4, 0.05, 0.4]} />
              <primitive object={tableMaterial} />
            </mesh>
            <mesh position={[0, 0.5, -0.17]}>
              <boxGeometry args={[0.4, 0.6, 0.05]} />
              <primitive object={tableMaterial} />
            </mesh>
            {/* Chair legs */}
            <mesh position={[-0.15, 0.11, -0.15]}>
              <boxGeometry args={[0.04, 0.22, 0.04]} />
              <primitive object={tableMaterial} />
            </mesh>
            <mesh position={[0.15, 0.11, -0.15]}>
              <boxGeometry args={[0.04, 0.22, 0.04]} />
              <primitive object={tableMaterial} />
            </mesh>
            <mesh position={[-0.15, 0.11, 0.15]}>
              <boxGeometry args={[0.04, 0.22, 0.04]} />
              <primitive object={tableMaterial} />
            </mesh>
            <mesh position={[0.15, 0.11, 0.15]}>
              <boxGeometry args={[0.04, 0.22, 0.04]} />
              <primitive object={tableMaterial} />
            </mesh>
          </group>

          <group position={[3, 0.25, 0.5]}>
            <mesh position={[0, 0.22, 0]}>
              <boxGeometry args={[0.4, 0.05, 0.4]} />
              <primitive object={tableMaterial} />
            </mesh>
            <mesh position={[0, 0.5, -0.17]}>
              <boxGeometry args={[0.4, 0.6, 0.05]} />
              <primitive object={tableMaterial} />
            </mesh>
            {/* Chair legs */}
            <mesh position={[-0.15, 0.11, -0.15]}>
              <boxGeometry args={[0.04, 0.22, 0.04]} />
              <primitive object={tableMaterial} />
            </mesh>
            <mesh position={[0.15, 0.11, -0.15]}>
              <boxGeometry args={[0.04, 0.22, 0.04]} />
              <primitive object={tableMaterial} />
            </mesh>
            <mesh position={[-0.15, 0.11, 0.15]}>
              <boxGeometry args={[0.04, 0.22, 0.04]} />
              <primitive object={tableMaterial} />
            </mesh>
            <mesh position={[0.15, 0.11, 0.15]}>
              <boxGeometry args={[0.04, 0.22, 0.04]} />
              <primitive object={tableMaterial} />
            </mesh>
          </group>
        </group>

        {/* DECORATIVE ITEMS */}
        <group>
          {/* Bookshelf */}
          <group position={[-3.8, 1, 2]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.3, 2, 1]} />
              <primitive object={tableMaterial} />
            </mesh>
            {/* Shelves */}
            <mesh position={[0.1, -0.6, 0]}>
              <boxGeometry args={[0.1, 0.05, 0.9]} />
              <primitive object={tableMaterial} />
            </mesh>
            <mesh position={[0.1, -0.2, 0]}>
              <boxGeometry args={[0.1, 0.05, 0.9]} />
              <primitive object={tableMaterial} />
            </mesh>
            <mesh position={[0.1, 0.2, 0]}>
              <boxGeometry args={[0.1, 0.05, 0.9]} />
              <primitive object={tableMaterial} />
            </mesh>
            <mesh position={[0.1, 0.6, 0]}>
              <boxGeometry args={[0.1, 0.05, 0.9]} />
              <primitive object={tableMaterial} />
            </mesh>
            {/* Books */}
            <mesh position={[0.12, -0.5, -0.2]}>
              <boxGeometry args={[0.05, 0.2, 0.15]} />
              <meshStandardMaterial color="#8B0000" roughness={0.8} />
            </mesh>
            <mesh position={[0.12, -0.5, 0]}>
              <boxGeometry args={[0.05, 0.25, 0.15]} />
              <meshStandardMaterial color="#006400" roughness={0.8} />
            </mesh>
            <mesh position={[0.12, -0.5, 0.2]}>
              <boxGeometry args={[0.05, 0.18, 0.15]} />
              <meshStandardMaterial color="#4B0082" roughness={0.8} />
            </mesh>
          </group>

          {/* Floor Lamp */}
          <group position={[1, 0, 1.5]}>
            {/* Lamp base */}
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
              <meshStandardMaterial color="#8B4513" roughness={0.8} />
            </mesh>
            {/* Lamp pole */}
            <mesh position={[0, 0.8, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 1.5, 8]} />
              <meshStandardMaterial color="#DAA520" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Lamp shade */}
            <mesh position={[0, 1.4, 0]}>
              <cylinderGeometry args={[0.25, 0.2, 0.3, 16]} />
              <meshStandardMaterial color="#F5DEB3" roughness={0.9} />
            </mesh>
            {/* Light */}
            <pointLight
              position={[0, 1.3, 0]}
              intensity={0.8}
              distance={5}
              color="#FFF8DC"
              castShadow
            />
          </group>

          {/* Wall Clock */}
          <group position={[0, 2.2, 2.95]}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
              <meshStandardMaterial color="#8B4513" roughness={0.8} />
            </mesh>
            {/* Clock face */}
            <mesh position={[0, 0, 0.03]}>
              <cylinderGeometry args={[0.18, 0.18, 0.01, 16]} />
              <meshStandardMaterial color="#FFFACD" roughness={0.9} />
            </mesh>
            {/* Clock hands */}
            <mesh position={[0, 0.05, 0.035]}>
              <boxGeometry args={[0.02, 0.1, 0.005]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
            <mesh position={[0.07, 0, 0.035]}>
              <boxGeometry args={[0.12, 0.02, 0.005]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
          </group>

          {/* Potted Plants */}
          <group position={[-3.5, 0.15, 0.5]}>
            {/* Pot */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.15, 0.12, 0.3, 16]} />
              <meshStandardMaterial color="#8B4513" roughness={0.9} />
            </mesh>
            {/* Plant stem */}
            <mesh position={[0, 0.25, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
              <meshStandardMaterial color="#228B22" roughness={0.8} />
            </mesh>
            {/* Leaves */}
            <mesh position={[-0.08, 0.35, 0]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color="#32CD32" roughness={0.8} />
            </mesh>
            <mesh position={[0.08, 0.35, 0]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color="#32CD32" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.4, 0]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="#228B22" roughness={0.8} />
            </mesh>
          </group>

          <group position={[3.5, 0.15, 1.5]}>
            {/* Pot */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.12, 0.1, 0.25, 16]} />
              <meshStandardMaterial color="#CD853F" roughness={0.9} />
            </mesh>
            {/* Cactus */}
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.06, 0.08, 0.3, 8]} />
              <meshStandardMaterial color="#228B22" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.32, 0]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color="#32CD32" roughness={0.8} />
            </mesh>
          </group>
        </group>

      </group>

      {/* Interior Lighting */}
      {windowLights && (
        <>
          <pointLight
            position={[-3.5, 1.5, 0]}
            intensity={0.5}
            distance={8}
            color="#FFE4B5"
            castShadow
          />
          <pointLight
            position={[3.5, 1.5, 0]}
            intensity={0.5}
            distance={8}
            color="#FFE4B5"
            castShadow
          />
          <pointLight
            position={[0, 2, 0]}
            intensity={0.8}
            distance={10}
            color="#FFF8DC"
            castShadow
          />
        </>
      )}

      {/* Wooden Path to Door */}
      <group>
        <mesh position={[0, 0.02, 5.5]}>
          <boxGeometry args={[1.5, 0.05, 1]} />
          <primitive object={floorMaterial} />
        </mesh>
        <mesh position={[0, 0.02, 7]}>
          <boxGeometry args={[1.5, 0.05, 2]} />
          <primitive object={floorMaterial} />
        </mesh>
      </group>

      {/* Wooden Gate (Optional entrance feature) */}
      <group position={[0, 0.8, 8.5]}>
        {/* Gate posts */}
        <mesh position={[-1, 0.5, 0]}>
          <boxGeometry args={[0.2, 1.6, 0.2]} />
          <primitive object={wallMaterial} />
        </mesh>
        <mesh position={[1, 0.5, 0]}>
          <boxGeometry args={[0.2, 1.6, 0.2]} />
          <primitive object={wallMaterial} />
        </mesh>
        
        {/* Gate (simple design) */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[1.6, 0.8, 0.1]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>
        
        {/* Gate handle */}
        <mesh position={[0.6, 0.4, 0.1]}>
          <cylinderGeometry args={[0.03, 0.03, 0.1, 8]} />
          <meshStandardMaterial color="#A9A9A9" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Simple collision box for house walls (invisible) */}
      <mesh position={[0, 1.5, 0]} visible={false}>
        <boxGeometry args={[8.2, 3, 6.2]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}
