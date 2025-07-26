import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Box, Sphere, Cylinder } from '@react-three/drei'
import * as THREE from 'three'

interface NPCProps {
  position: [number, number, number]
  name: string
  occupation: string
  dialogue: string[]
  idleAnimation: 'sitting' | 'standing' | 'reading' | 'cooking' | 'crafting'
  onInteract?: (npc: { name: string; occupation: string; dialogue: string[] }) => void
}

export default function NPC({
  position,
  name,
  occupation,
  dialogue,
  idleAnimation,
  onInteract
}: NPCProps) {
  const npcRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Mesh>(null)
  const armLeftRef = useRef<THREE.Group>(null)
  const armRightRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const [animationPhase, setAnimationPhase] = useState(0)

  // Idle animation logic
  useFrame((state) => {
    if (!npcRef.current || !headRef.current || !armLeftRef.current || !armRightRef.current) return

    const time = state.clock.elapsedTime

    switch (idleAnimation) {
      case 'sitting':
        // Gentle head bob while sitting
        headRef.current.rotation.x = Math.sin(time * 0.5) * 0.1
        break
      
      case 'standing':
        // Slight sway and occasional head turn
        npcRef.current.rotation.y = Math.sin(time * 0.3) * 0.2
        headRef.current.rotation.y = Math.sin(time * 0.4) * 0.3
        break
      
      case 'reading':
        // Arms positioned as if holding a book, slight head movement
        armLeftRef.current.rotation.x = -0.8
        armRightRef.current.rotation.x = -0.8
        headRef.current.rotation.x = -0.3 + Math.sin(time * 0.3) * 0.1
        break
      
      case 'cooking':
        // Stirring motion with right arm
        armRightRef.current.rotation.x = -0.5 + Math.sin(time * 2) * 0.3
        armLeftRef.current.rotation.x = -0.2
        break
      
      case 'crafting':
        // Hammering or working motion
        armRightRef.current.rotation.x = -0.8 + Math.sin(time * 3) * 0.4
        armLeftRef.current.rotation.x = -0.3
        break
    }
  })

  const handleInteraction = () => {
    if (onInteract) {
      onInteract({ name, occupation, dialogue })
    }
  }

  return (
    <group
      ref={npcRef}
      position={position}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onClick={handleInteraction}
    >
      {/* NPC Body - Simple low-poly character */}
      
      {/* Torso */}
      <Box
        position={[0, 1, 0]}
        args={[0.6, 1, 0.4]}
        castShadow
        receiveShadow
      >
        <meshLambertMaterial color="#4a5568" />
      </Box>

      {/* Head */}
      <Sphere
        ref={headRef}
        position={[0, 1.8, 0]}
        args={[0.25, 8, 6]}
        castShadow
        receiveShadow
      >
        <meshLambertMaterial color="#d69e2e" />
      </Sphere>

      {/* Left Arm */}
      <group ref={armLeftRef} position={[-0.4, 1.3, 0]}>
        <Cylinder
          args={[0.08, 0.08, 0.8]}
          rotation={[0, 0, Math.PI / 6]}
          castShadow
          receiveShadow
        >
          <meshLambertMaterial color="#4a5568" />
        </Cylinder>
      </group>

      {/* Right Arm */}
      <group ref={armRightRef} position={[0.4, 1.3, 0]}>
        <Cylinder
          args={[0.08, 0.08, 0.8]}
          rotation={[0, 0, -Math.PI / 6]}
          castShadow
          receiveShadow
        >
          <meshLambertMaterial color="#4a5568" />
        </Cylinder>
      </group>

      {/* Legs */}
      {idleAnimation !== 'sitting' && (
        <>
          <Cylinder
            position={[-0.15, 0.4, 0]}
            args={[0.08, 0.08, 0.8]}
            castShadow
            receiveShadow
          >
            <meshLambertMaterial color="#2d3748" />
          </Cylinder>
          <Cylinder
            position={[0.15, 0.4, 0]}
            args={[0.08, 0.08, 0.8]}
            castShadow
            receiveShadow
          >
            <meshLambertMaterial color="#2d3748" />
          </Cylinder>
        </>
      )}

      {/* Props based on animation */}
      {idleAnimation === 'reading' && (
        <Box
          position={[0, 1.2, 0.3]}
          args={[0.3, 0.4, 0.05]}
          castShadow
        >
          <meshLambertMaterial color="#8b4513" />
        </Box>
      )}

      {idleAnimation === 'cooking' && (
        <Cylinder
          position={[0.3, 1.2, 0.3]}
          args={[0.1, 0.1, 0.3]}
          castShadow
        >
          <meshLambertMaterial color="#718096" />
        </Cylinder>
      )}

      {idleAnimation === 'crafting' && (
        <Box
          position={[0, 0.8, 0.3]}
          args={[0.4, 0.1, 0.4]}
          castShadow
        >
          <meshLambertMaterial color="#8b4513" />
        </Box>
      )}

      {/* Nameplate */}
      <group position={[0, 2.5, 0]}>
        <Text
          position={[0, 0.1, 0]}
          fontSize={0.15}
          color={hovered ? "#ffd700" : "#ffffff"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {name}
        </Text>
        <Text
          position={[0, -0.1, 0]}
          fontSize={0.1}
          color={hovered ? "#ffed4e" : "#cccccc"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.005}
          outlineColor="#000000"
        >
          {occupation}
        </Text>
      </group>

      {/* Interaction prompt when hovered */}
      {hovered && (
        <Text
          position={[0, 2.8, 0]}
          fontSize={0.08}
          color="#00ff00"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.005}
          outlineColor="#000000"
        >
          [Click to talk]
        </Text>
      )}

      {/* Collision box */}
      <Box
        args={[1, 2.5, 1]}
        position={[0, 1.25, 0]}
        visible={false}
      />
    </group>
  )
}

// Preset NPC configurations for easy village population
export const NPCPresets = {
  baker: {
    name: "Emma",
    occupation: "Baker",
    dialogue: [
      "Welcome to our village! I bake fresh bread every morning.",
      "The secret to good bread is patience and love.",
      "Would you like to try some of my famous honey rolls?"
    ],
    idleAnimation: 'cooking' as const
  },
  
  blacksmith: {
    name: "Marcus",
    occupation: "Blacksmith", 
    dialogue: [
      "The forge has been in my family for generations.",
      "I can craft the finest tools and weapons in the region.",
      "The sound of hammer on anvil is music to my ears."
    ],
    idleAnimation: 'crafting' as const
  },
  
  librarian: {
    name: "Sage",
    occupation: "Librarian",
    dialogue: [
      "Knowledge is the greatest treasure one can possess.",
      "I've read every book in this collection twice!",
      "Have you come seeking wisdom or just browsing?"
    ],
    idleAnimation: 'reading' as const
  },
  
  elder: {
    name: "Aldwin",
    occupation: "Village Elder",
    dialogue: [
      "I've seen this village grow from just a few huts.",
      "The young ones today don't appreciate the old ways.",
      "Sit with me, let me tell you stories of times past."
    ],
    idleAnimation: 'sitting' as const
  },
  
  merchant: {
    name: "Carla",
    occupation: "Merchant",
    dialogue: [
      "I travel far and wide to bring goods to this village.",
      "Perhaps you're interested in some exotic wares?",
      "The roads have been safer lately, good for business!"
    ],
    idleAnimation: 'standing' as const
  },
  
  farmer: {
    name: "Ben",
    occupation: "Farmer",
    dialogue: [
      "The harvest this year has been bountiful, praise be!",
      "Working the land is honest work, hard but rewarding.",
      "These vegetables won't grow themselves, you know!"
    ],
    idleAnimation: 'standing' as const
  },
  
  healer: {
    name: "Luna",
    occupation: "Healer",
    dialogue: [
      "Nature provides all the medicine we need.",
      "I've been studying herbs since I was a child.",
      "Are you feeling well? You look a bit tired."
    ],
    idleAnimation: 'reading' as const
  },
  
  guard: {
    name: "Roland",
    occupation: "Village Guard",
    dialogue: [
      "All is peaceful in our village, as it should be.",
      "I keep watch so others can sleep soundly.",
      "Haven't seen any trouble around here for months."
    ],
    idleAnimation: 'standing' as const
  }
}
