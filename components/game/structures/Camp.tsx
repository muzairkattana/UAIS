"use client"

import React, { useMemo } from 'react'
import * as THREE from 'three'

export type CampType = 'player' | 'enemy' | 'neutral'
export type CampSize = 'small' | 'medium' | 'large'

export interface CampProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  type: CampType
  size: CampSize
  id: string
  maxOccupants?: number
  currentOccupants?: number
  onCampInteract?: (campId: string) => void
}

export default function Camp({
  position,
  rotation = [0, 0, 0],
  type,
  size,
  id,
  maxOccupants = 10,
  currentOccupants = 0,
  onCampInteract
}: CampProps) {
  const showBanner = true

  // Camp dimensions based on size
  const dimensions = useMemo(() => {
    switch (size) {
      case 'small': return { width: 15, depth: 15, wallHeight: 2 }
      case 'medium': return { width: 25, depth: 25, wallHeight: 2.5 }
      case 'large': return { width: 35, depth: 35, wallHeight: 3 }
    }
  }, [size])

  // Colors based on camp type
  const colors = useMemo(() => {
    switch (type) {
      case 'player': return { 
        wall: '#8B7355', 
        banner: '#4169E1', 
        ground: '#A0522D',
        accent: '#FFD700'
      }
      case 'enemy': return { 
        wall: '#696969', 
        banner: '#DC143C', 
        ground: '#8B4513',
        accent: '#FF4500'
      }
      case 'neutral': return { 
        wall: '#D2691E', 
        banner: '#32CD32', 
        ground: '#DEB887',
        accent: '#20B2AA'
      }
    }
  }, [type])

  // Materials
  const wallMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: colors.wall,
    roughness: 0.8,
    metalness: 0.1,
  }), [colors.wall])

  const groundMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: colors.ground,
    roughness: 0.9,
    metalness: 0.05,
  }), [colors.ground])

  const bannerMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: colors.banner,
    roughness: 0.6,
    metalness: 0.2,
  }), [colors.banner])

  const accentMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: colors.accent,
    roughness: 0.4,
    metalness: 0.8,
  }), [colors.accent])

  // Static camp - no animation for now

  // Generate tents/buildings based on current occupants
  const structures = useMemo(() => {
    const items = []
    const tentCount = Math.min(currentOccupants, maxOccupants)
    const spacing = dimensions.width / Math.max(3, Math.ceil(Math.sqrt(tentCount)))
    
    for (let i = 0; i < tentCount; i++) {
      const row = Math.floor(i / Math.ceil(Math.sqrt(tentCount)))
      const col = i % Math.ceil(Math.sqrt(tentCount))
      
      const x = (col - Math.ceil(Math.sqrt(tentCount)) / 2) * spacing
      const z = (row - Math.ceil(Math.sqrt(tentCount)) / 2) * spacing
      
      items.push({
        id: `tent-${i}`,
        position: [x, 0, z] as [number, number, number],
        type: 'tent'
      })
    }
    
    return items
  }, [currentOccupants, maxOccupants, dimensions.width])

  // Tent component
  const Tent = ({ position, tentId }: { position: [number, number, number], tentId: string }) => (
    <group position={position}>
      {/* Tent body */}
      <mesh position={[0, 1, 0]}>
        <coneGeometry args={[1.2, 2, 4]} />
        <primitive object={wallMaterial} />
      </mesh>
      
      {/* Tent entrance */}
      <mesh position={[0, 0.5, 1]}>
        <boxGeometry args={[0.8, 1, 0.1]} />
        <meshStandardMaterial color={colors.accent} />
      </mesh>
      
      {/* Tent stakes */}
      <mesh position={[-1, 0, -1]}>
        <cylinderGeometry args={[0.02, 0.02, 0.5]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[1, 0, -1]}>
        <cylinderGeometry args={[0.02, 0.02, 0.5]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
    </group>
  )

  // Watchtower component
  const Watchtower = () => (
    <group position={[dimensions.width / 2 - 3, 0, dimensions.depth / 2 - 3]}>
      {/* Tower base */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[2, 4, 2]} />
        <primitive object={wallMaterial} />
      </mesh>
      
      {/* Tower roof */}
      <mesh position={[0, 4.5, 0]}>
        <coneGeometry args={[1.5, 1, 4]} />
        <meshStandardMaterial color={colors.accent} />
      </mesh>
      
      {/* Ladder */}
      <mesh position={[1.2, 2, 0]}>
        <boxGeometry args={[0.1, 4, 0.2]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      
      {/* Ladder rungs */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[1.15, i * 0.5, 0]}>
          <boxGeometry args={[0.3, 0.05, 0.1]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
      ))}
    </group>
  )

  // Campfire component
  const Campfire = () => (
    <group position={[0, 0, 0]}>
      {/* Fire pit */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[1, 1.2, 0.2]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      
      {/* Logs */}
      <mesh position={[0.5, 0.3, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.1, 0.15, 1.5]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[-0.5, 0.3, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.1, 0.15, 1.5]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Fire effect (simplified) */}
      <mesh position={[0, 0.8, 0]}>
        <coneGeometry args={[0.3, 1, 3]} />
        <meshStandardMaterial 
          color="#FF4500" 
          emissive="#FF4500" 
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  )

  return (
    <group position={position} rotation={rotation}>
      {/* Ground/Foundation */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[dimensions.width + 2, 0.1, dimensions.depth + 2]} />
        <primitive object={groundMaterial} />
      </mesh>

      {/* Perimeter fence/walls */}
      {/* North wall */}
      <mesh position={[0, dimensions.wallHeight / 2, -dimensions.depth / 2]}>
        <boxGeometry args={[dimensions.width, dimensions.wallHeight, 0.2]} />
        <primitive object={wallMaterial} />
      </mesh>
      
      {/* South wall */}
      <mesh position={[0, dimensions.wallHeight / 2, dimensions.depth / 2]}>
        <boxGeometry args={[dimensions.width, dimensions.wallHeight, 0.2]} />
        <primitive object={wallMaterial} />
      </mesh>
      
      {/* East wall */}
      <mesh position={[dimensions.width / 2, dimensions.wallHeight / 2, 0]}>
        <boxGeometry args={[0.2, dimensions.wallHeight, dimensions.depth]} />
        <primitive object={wallMaterial} />
      </mesh>
      
      {/* West wall */}
      <mesh position={[-dimensions.width / 2, dimensions.wallHeight / 2, 0]}>
        <boxGeometry args={[0.2, dimensions.wallHeight, dimensions.depth]} />
        <primitive object={wallMaterial} />
      </mesh>

      {/* Gate opening (South wall) */}
      <mesh position={[0, dimensions.wallHeight / 2, dimensions.depth / 2]}>
        <boxGeometry args={[4, dimensions.wallHeight, 0.3]} />
        <primitive object={groundMaterial} />
      </mesh>

      {/* Camp banner/flag */}
      {showBanner && (
        <group name="banner" position={[0, 0, -dimensions.depth / 2 + 1]}>
          {/* Flag pole */}
          <mesh position={[0, 3, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 6]} />
            <meshStandardMaterial color="#654321" />
          </mesh>
          
          {/* Flag */}
          <mesh position={[1, 4.5, 0]}>
            <boxGeometry args={[2, 1, 0.05]} />
            <primitive object={bannerMaterial} />
          </mesh>
          
          {/* Flag rope */}
          <mesh position={[0.5, 4.5, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.1]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        </group>
      )}

      {/* Central campfire */}
      <Campfire />

      {/* Watchtower */}
      <Watchtower />

      {/* Tents/structures */}
      {structures.map((structure) => (
        <Tent 
          key={structure.id} 
          position={structure.position} 
          tentId={structure.id}
        />
      ))}

      {/* Supply crates */}
      <group position={[-dimensions.width / 2 + 2, 0, -dimensions.depth / 2 + 2]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1.5, 1, 1]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[2, 0.5, 0]}>
          <boxGeometry args={[1.5, 1, 1]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      </group>

      {/* Training area (for larger camps) */}
      {size !== 'small' && (
        <group position={[dimensions.width / 3, 0, 0]}>
          {/* Training dummy */}
          <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 2]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          <mesh position={[0, 2.2, 0]}>
            <sphereGeometry args={[0.4]} />
            <meshStandardMaterial color="#DEB887" />
          </mesh>
          
          {/* Training weapons rack */}
          <group position={[3, 0, 0]}>
            <mesh position={[0, 1, 0]}>
              <boxGeometry args={[2, 0.1, 0.1]} />
              <meshStandardMaterial color="#654321" />
            </mesh>
            <mesh position={[-0.8, 1, 0]} rotation={[0, 0, Math.PI / 4]}>
              <cylinderGeometry args={[0.03, 0.03, 1.5]} />
              <primitive object={accentMaterial} />
            </mesh>
            <mesh position={[0, 1, 0]} rotation={[0, 0, Math.PI / 6]}>
              <cylinderGeometry args={[0.03, 0.03, 1.5]} />
              <primitive object={accentMaterial} />
            </mesh>
            <mesh position={[0.8, 1, 0]} rotation={[0, 0, -Math.PI / 4]}>
              <cylinderGeometry args={[0.03, 0.03, 1.5]} />
              <primitive object={accentMaterial} />
            </mesh>
          </group>
        </group>
      )}

      {/* Camp info display */}
      <group position={[0, dimensions.wallHeight + 1, -dimensions.depth / 2 - 2]}>
        <mesh>
          <planeGeometry args={[6, 1]} />
          <meshStandardMaterial 
            color="#000000" 
            transparent 
            opacity={0.7}
          />
        </mesh>
        {/* Camp name/info would go here - could use Text component */}
      </group>
    </group>
  )
}
