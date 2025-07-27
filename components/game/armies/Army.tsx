"use client"

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export type ArmyType = 'infantry' | 'archer' | 'cavalry' | 'siege'

interface ArmyProps {
  position: [number, number, number]
  type: ArmyType
  size: number
  id: string
  campId: string
  onArmyMove?: (armyId: string, newPosition: THREE.Vector3) => void
  onArmyAttack?: (armyId: string, targetId: string) => void
}

export default function Army({
  position,
  type,
  size,
  id,
  campId,
  onArmyMove,
  onArmyAttack
}: ArmyProps) {
  const armyRef = useRef<THREE.Group>(null)

  const colors = useMemo(() => {
    switch (type) {
      case 'infantry': return '#2e8b57'
      case 'archer': return '#8b4513'
      case 'cavalry': return '#4682b4'
      case 'siege': return '#d2691e'
    }
  }, [type])

  const formation = useMemo(() => {
    const spacing = 1.5
    const formationArray = []
    const sideCount = Math.ceil(Math.sqrt(size))

    for (let row = 0; row < sideCount; row++) {
      for (let col = 0; col < sideCount; col++) {
        if (formationArray.length >= size) break
        formationArray.push([col * spacing - sideCount * spacing / 2, 0, row * spacing - sideCount * spacing / 2])
      }
    }

    return formationArray
  }, [size])

  const Soldier = ({ position }: { position: [number, number, number] }) => (
    <mesh position={position}>
      <boxGeometry args={[0.5, 1, 0.5]} />
      <meshStandardMaterial color={colors} />
    </mesh>
  )

  useFrame(() => {
    // Placeholder for movement/attack logic
    if (armyRef.current && onArmyMove) {
      const time = Date.now() / 1000
      const newPosition = new THREE.Vector3(
        position[0] + Math.sin(time) * 5,
        position[1],
        position[2] + Math.cos(time) * 5
      )
      onArmyMove(id, newPosition)
    }
  })

  return (
    <group ref={armyRef} position={position}>
      {formation.map((pos, index) => (
        <Soldier key={`${id}-soldier-${index}`} position={pos as [number, number, number]} />
      ))}
    </group>
  )
}
