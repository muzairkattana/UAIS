"use client"

import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import BaseEnemy, { EnemyStats } from './BaseEnemy'
import * as THREE from 'three'

const goblinStats: EnemyStats = {
  maxHealth: 40,
  damage: 15,
  speed: 6,
  detectionRadius: 12,
  attackRadius: 2.5,
  maxChaseDistance: 25,
  attackCooldown: 1500
}

interface ForestGoblinProps {
  position: [number, number, number]
  patrolPoints?: THREE.Vector3[]
  onDeath?: (position: THREE.Vector3) => void
  onAttackPlayer?: (damage: number) => void
  playerPosition?: THREE.Vector3
  isPlayerBlocking?: boolean
}

export default function ForestGoblin(props: ForestGoblinProps) {
  const weaponRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Group>(null)
  
  // Animation state
  const animationTimeRef = useRef(0)
  const lastAttackAnimationRef = useRef(0)

  useFrame((state, delta) => {
    animationTimeRef.current += delta
    
    // Idle breathing animation
    if (bodyRef.current) {
      bodyRef.current.scale.y = 1 + Math.sin(animationTimeRef.current * 3) * 0.05
    }
    
    // Weapon swinging animation during attacks
    if (weaponRef.current && Date.now() - lastAttackAnimationRef.current < 500) {
      const attackProgress = (Date.now() - lastAttackAnimationRef.current) / 500
      weaponRef.current.rotation.z = Math.sin(attackProgress * Math.PI * 2) * 0.8
    } else if (weaponRef.current) {
      weaponRef.current.rotation.z = 0
    }
  })

  const handleAttackPlayer = (damage: number) => {
    lastAttackAnimationRef.current = Date.now()
    if (props.onAttackPlayer) {
      props.onAttackPlayer(damage)
    }
  }

  const GoblinModel = () => (
    <group ref={bodyRef}>
      {/* Body */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.8, 1.2, 0.6]} />
        <meshPhongMaterial color="#4a7c59" />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[0.7, 0.6, 0.6]} />
        <meshPhongMaterial color="#5a8c69" />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.15, 1.9, 0.25]}>
        <sphereGeometry args={[0.08]} />
        <meshPhongMaterial color="#ff4444" emissive="#ff0000" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.15, 1.9, 0.25]}>
        <sphereGeometry args={[0.08]} />
        <meshPhongMaterial color="#ff4444" emissive="#ff0000" emissiveIntensity={0.3} />
      </mesh>
      
      {/* Ears */}
      <mesh position={[-0.4, 1.9, 0]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.1, 0.4]} />
        <meshPhongMaterial color="#5a8c69" />
      </mesh>
      <mesh position={[0.4, 1.9, 0]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.1, 0.4]} />
        <meshPhongMaterial color="#5a8c69" />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-0.6, 1.2, 0]}>
        <boxGeometry args={[0.3, 0.8, 0.3]} />
        <meshPhongMaterial color="#4a7c59" />
      </mesh>
      <mesh position={[0.6, 1.2, 0]}>
        <boxGeometry args={[0.3, 0.8, 0.3]} />
        <meshPhongMaterial color="#4a7c59" />
      </mesh>
      
      {/* Legs */}
      <mesh position={[-0.25, 0.1, 0]}>
        <boxGeometry args={[0.25, 0.6, 0.3]} />
        <meshPhongMaterial color="#4a7c59" />
      </mesh>
      <mesh position={[0.25, 0.1, 0]}>
        <boxGeometry args={[0.25, 0.6, 0.3]} />
        <meshPhongMaterial color="#4a7c59" />
      </mesh>
      
      {/* Crude weapon - wooden club */}
      <group ref={weaponRef} position={[0.8, 1.2, 0]}>
        {/* Handle */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 1.2]} />
          <meshPhongMaterial color="#8B4513" />
        </mesh>
        {/* Club head */}
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[0.3, 0.4, 0.3]} />
          <meshPhongMaterial color="#654321" />
        </mesh>
        {/* Spikes */}
        <mesh position={[-0.1, 0.9, 0.1]}>
          <coneGeometry args={[0.05, 0.2]} />
          <meshPhongMaterial color="#444444" />
        </mesh>
        <mesh position={[0.1, 0.9, -0.1]}>
          <coneGeometry args={[0.05, 0.2]} />
          <meshPhongMaterial color="#444444" />
        </mesh>
      </group>
      
      {/* Loincloth */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.6, 0.4, 0.1]} />
        <meshPhongMaterial color="#8B4513" />
      </mesh>
    </group>
  )

  return (
    <BaseEnemy
      {...props}
      stats={goblinStats}
      onAttackPlayer={handleAttackPlayer}
    >
      <GoblinModel />
    </BaseEnemy>
  )
}
