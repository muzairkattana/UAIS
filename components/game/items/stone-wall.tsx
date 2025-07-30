"use client"

import * as THREE from "three"

interface StoneWallProps {
  id: string
  position: [number, number, number]
  rotation?: [number, number, number]
}

export default function StoneWall({ id, position, rotation = [0, 0, 0] }: StoneWallProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Stone wall structure */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[5, 3, 0.5]} />
        <meshStandardMaterial
          color={0x708090}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Some decorative stones on the wall */}
      <mesh position={[-1.5, 0.5, 0.26]} castShadow>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial
          color={0x606060}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>
      
      <mesh position={[1.2, -0.8, 0.26]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial
          color={0x505050}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>
      
      <mesh position={[0.3, 1.1, 0.26]} castShadow>
        <boxGeometry args={[0.25, 0.25, 0.25]} />
        <meshStandardMaterial
          color={0x808080}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>
    </group>
  )
}
