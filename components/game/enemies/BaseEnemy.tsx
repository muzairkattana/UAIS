"use client"

import React, { useRef, useState, useCallback, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useBox } from '@react-three/cannon'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

export type EnemyState = 'patrol' | 'chase' | 'combat' | 'return' | 'dead'

export interface EnemyStats {
  maxHealth: number
  damage: number
  speed: number
  detectionRadius: number
  attackRadius: number
  maxChaseDistance: number
  attackCooldown: number
}

export interface BaseEnemyProps {
  position: [number, number, number]
  patrolPoints?: THREE.Vector3[]
  stats: EnemyStats
  onDeath?: (position: THREE.Vector3) => void
  onAttackPlayer?: (damage: number) => void
  playerPosition?: THREE.Vector3
  isPlayerBlocking?: boolean
  children: React.ReactNode
}

export default function BaseEnemy({
  position,
  patrolPoints = [],
  stats,
  onDeath,
  onAttackPlayer,
  playerPosition,
  isPlayerBlocking = false,
  children
}: BaseEnemyProps) {
  const [ref, api] = useBox(() => ({
    mass: 1,
    position,
    args: [1, 2, 1],
    fixedRotation: true,
    material: {
      friction: 0.3,
      restitution: 0.1
    }
  }))

  const { camera } = useThree()
  
  // Enemy state
  const [health, setHealth] = useState(stats.maxHealth)
  const [state, setState] = useState<EnemyState>('patrol')
  const [currentPatrolIndex, setCurrentPatrolIndex] = useState(0)
  const [lastAttackTime, setLastAttackTime] = useState(0)
  const [homePosition] = useState(new THREE.Vector3(...position))
  
  // Refs for continuous values
  const velocityRef = useRef([0, 0, 0])
  const positionRef = useRef(new THREE.Vector3(...position))
  const targetPositionRef = useRef(new THREE.Vector3())
  const lastPlayerPositionRef = useRef(new THREE.Vector3())
  
  // Health bar visibility
  const [showHealthBar, setShowHealthBar] = useState(false)
  const healthBarTimeoutRef = useRef<NodeJS.Timeout>()

  // Subscribe to physics updates
  useEffect(() => {
    const unsubscribeVelocity = api.velocity.subscribe((v) => {
      velocityRef.current = v
    })
    
    const unsubscribePosition = api.position.subscribe((p) => {
      positionRef.current.set(p[0], p[1], p[2])
    })

    return () => {
      unsubscribeVelocity()
      unsubscribePosition()
    }
  }, [api])

  // Show health bar when damaged
  const showHealthBarTemporarily = useCallback(() => {
    setShowHealthBar(true)
    if (healthBarTimeoutRef.current) {
      clearTimeout(healthBarTimeoutRef.current)
    }
    healthBarTimeoutRef.current = setTimeout(() => {
      setShowHealthBar(false)
    }, 3000)
  }, [])

  // Take damage function
  const takeDamage = useCallback((damage: number) => {
    if (health <= 0) return
    
    const newHealth = Math.max(0, health - damage)
    setHealth(newHealth)
    showHealthBarTemporarily()
    
    if (newHealth <= 0) {
      setState('dead')
      api.velocity.set(0, 0, 0)
      if (onDeath) {
        onDeath(positionRef.current.clone())
      }
    } else {
      // Switch to chase state when damaged
      if (state === 'patrol') {
        setState('chase')
      }
    }
  }, [health, state, api, onDeath, showHealthBarTemporarily])

  // AI pathfinding - simple direct movement
  const moveTowards = useCallback((targetPos: THREE.Vector3, speed: number) => {
    const direction = targetPos.clone().sub(positionRef.current).normalize()
    direction.y = 0 // Keep movement on horizontal plane
    
    api.velocity.set(
      direction.x * speed,
      velocityRef.current[1], // Preserve Y velocity for gravity
      direction.z * speed
    )
  }, [api])

  // Attack player
  const attackPlayer = useCallback(() => {
    const now = Date.now()
    if (now - lastAttackTime < stats.attackCooldown) return
    
    setLastAttackTime(now)
    if (onAttackPlayer) {
      const actualDamage = isPlayerBlocking ? Math.max(1, Math.floor(stats.damage * 0.3)) : stats.damage
      onAttackPlayer(actualDamage)
    }
  }, [lastAttackTime, stats.attackCooldown, stats.damage, isPlayerBlocking, onAttackPlayer])

  // Main AI update loop
  useFrame((_, delta) => {
    if (state === 'dead') return
    if (!playerPosition) return

    const distanceToPlayer = positionRef.current.distanceTo(playerPosition)
    const distanceToHome = positionRef.current.distanceTo(homePosition)
    
    switch (state) {
      case 'patrol':
        // Check for player detection
        if (distanceToPlayer <= stats.detectionRadius) {
          setState('chase')
          lastPlayerPositionRef.current.copy(playerPosition)
          break
        }
        
        // Patrol behavior
        if (patrolPoints.length > 0) {
          const currentTarget = patrolPoints[currentPatrolIndex]
          const distanceToTarget = positionRef.current.distanceTo(currentTarget)
          
          if (distanceToTarget < 2) {
            setCurrentPatrolIndex((currentPatrolIndex + 1) % patrolPoints.length)
          } else {
            moveTowards(currentTarget, stats.speed * 0.5)
          }
        } else {
          // Random patrol around home position
          if (Math.random() < 0.01) { // 1% chance per frame to change direction
            const randomAngle = Math.random() * Math.PI * 2
            const randomDistance = 5 + Math.random() * 10
            targetPositionRef.current.set(
              homePosition.x + Math.cos(randomAngle) * randomDistance,
              homePosition.y,
              homePosition.z + Math.sin(randomAngle) * randomDistance
            )
          }
          
          if (positionRef.current.distanceTo(targetPositionRef.current) > 1) {
            moveTowards(targetPositionRef.current, stats.speed * 0.3)
          }
        }
        break

      case 'chase':
        // Check if player is too far away
        if (distanceToHome > stats.maxChaseDistance) {
          setState('return')
          break
        }
        
        // Check if close enough to attack
        if (distanceToPlayer <= stats.attackRadius) {
          setState('combat')
          break
        }
        
        // Chase player
        lastPlayerPositionRef.current.copy(playerPosition)
        moveTowards(playerPosition, stats.speed)
        break

      case 'combat':
        // Check if player moved away
        if (distanceToPlayer > stats.attackRadius * 1.5) {
          setState('chase')
          break
        }
        
        // Stop moving and attack
        api.velocity.set(0, velocityRef.current[1], 0)
        attackPlayer()
        break

      case 'return':
        // Return to home position
        if (distanceToHome < 2) {
          setState('patrol')
          api.velocity.set(0, velocityRef.current[1], 0)
        } else {
          moveTowards(homePosition, stats.speed * 0.7)
        }
        
        // Re-detect player if they come close
        if (distanceToPlayer <= stats.detectionRadius * 0.5) {
          setState('chase')
        }
        break
    }
  })

  // Health bar component
  const HealthBar = () => {
    if (!showHealthBar || health <= 0) return null
    
    const healthPercentage = health / stats.maxHealth
    const barWidth = 2
    const barHeight = 0.2
    
    return (
      <group position={[0, 3, 0]}>
        {/* Background */}
        <mesh>
          <planeGeometry args={[barWidth, barHeight]} />
          <meshBasicMaterial color="#ff0000" transparent opacity={0.7} />
        </mesh>
        {/* Health bar */}
        <mesh position={[-(barWidth * (1 - healthPercentage)) / 2, 0, 0.01]}>
          <planeGeometry args={[barWidth * healthPercentage, barHeight]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.9} />
        </mesh>
        {/* Health text */}
        <Text
          position={[0, -0.5, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {`${health}/${stats.maxHealth}`}
        </Text>
      </group>
    )
  }

  // Debug state display
  const StateDisplay = () => {
    const distanceToPlayer = playerPosition ? positionRef.current.distanceTo(playerPosition) : 0
    
    return (
      <Text
        position={[0, 4, 0]}
        fontSize={0.2}
        color="yellow"
        anchorX="center"
        anchorY="middle"
      >
        {`${state.toUpperCase()}\nHP: ${health}/${stats.maxHealth}\nDist: ${distanceToPlayer.toFixed(1)}`}
      </Text>
    )
  }

  // Expose takeDamage function to parent components
  useEffect(() => {
    if (ref.current) {
      (ref.current as any).takeDamage = takeDamage
    }
  }, [takeDamage])

  return (
    <group ref={ref}>
      {children}
      <HealthBar />
      <StateDisplay />
    </group>
  )
}

// Export the takeDamage function type for parent components
export type EnemyRef = {
  takeDamage: (damage: number) => void
}
