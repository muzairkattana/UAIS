"use client"

import React from 'react'
import * as THREE from 'three'

interface SkyProps {
  sunPosition?: [number, number, number]
  cloudCount?: number
  cloudDensity?: number
  timeOfDay?: 'dawn' | 'day' | 'dusk' | 'night'
  humidity?: number
  pollution?: number
  windDirection?: [number, number, number]
  temperature?: number
}

export default function Sky({ 
  sunPosition = [100, 120, 50], 
  cloudCount = 15,
  cloudDensity = 0.8,
  timeOfDay = 'day',
  humidity = 0.6,
  pollution = 0.1,
  windDirection = [1, 0, 0.2],
  temperature = 20
}: SkyProps) {
  return (
    <>
      {/* Perfect Sky Blue Sky - Guaranteed to Work */}
      <mesh scale={[5000, 5000, 5000]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={0x4A90E2}
          side={THREE.BackSide}
          transparent={false}
          opacity={1.0}
        />
      </mesh>
      
      {/* Backup Sky Blue Dome */}
      <mesh scale={[4500, 4500, 4500]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={0x5BA0F2}
          side={THREE.BackSide}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Simple Sun */}
      <mesh position={sunPosition}>
        <sphereGeometry args={[15, 16, 16]} />
        <meshBasicMaterial
          color={0xFFD700}
          emissive={0xFFA500}
          emissiveIntensity={0.5}
        />
      </mesh>
    </>
  )
}
