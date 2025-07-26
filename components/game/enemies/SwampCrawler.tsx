import React, { useRef, useMemo } from 'react';
import { Mesh } from 'three';
import BaseEnemy from './BaseEnemy';

interface SwampCrawlerProps {
  position: [number, number, number];
  onDeath?: () => void;
}

const SwampCrawler: React.FC<SwampCrawlerProps> = ({ position, onDeath }) => {
  const meshRef = useRef<Mesh>(null);

  // Swamp Crawler stats
  const stats = useMemo(() => ({
    maxHealth: 80,
    damage: 25,
    speed: 1.8,
    detectionRange: 12,
    attackRange: 2.5,
    attackCooldown: 2000,
    returnDistance: 20
  }), []);

  return (
    <BaseEnemy
      position={position}
      stats={stats}
      onDeath={onDeath}
      name="Swamp Crawler"
    >
      <group ref={meshRef}>
        {/* Main body - slimy, elongated form */}
        <mesh position={[0, 0.5, 0]}>
          <capsuleGeometry args={[0.4, 1.2]} />
          <meshStandardMaterial 
            color="#2d4a2d" 
            roughness={0.1}
            metalness={0.1}
          />
        </mesh>
        
        {/* Head - larger, bulbous */}
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.6]} />
          <meshStandardMaterial 
            color="#1a3d1a" 
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
        
        {/* Eyes - glowing green */}
        <mesh position={[-0.2, 1.6, 0.4]}>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial 
            color="#00ff00" 
            emissive="#004400"
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh position={[0.2, 1.6, 0.4]}>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial 
            color="#00ff00" 
            emissive="#004400"
            emissiveIntensity={0.5}
          />
        </mesh>
        
        {/* Tentacle-like appendages */}
        <mesh position={[-0.5, 0.8, 0]} rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.1, 0.15, 1]} />
          <meshStandardMaterial 
            color="#2d4a2d" 
            roughness={0.1}
          />
        </mesh>
        <mesh position={[0.5, 0.8, 0]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.1, 0.15, 1]} />
          <meshStandardMaterial 
            color="#2d4a2d" 
            roughness={0.1}
          />
        </mesh>
        
        {/* Poison sacs on back */}
        <mesh position={[-0.2, 1.0, -0.3]}>
          <sphereGeometry args={[0.2]} />
          <meshStandardMaterial 
            color="#66cc66" 
            transparent
            opacity={0.7}
            emissive="#003300"
            emissiveIntensity={0.3}
          />
        </mesh>
        <mesh position={[0.2, 1.0, -0.3]}>
          <sphereGeometry args={[0.2]} />
          <meshStandardMaterial 
            color="#66cc66" 
            transparent
            opacity={0.7}
            emissive="#003300"
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Dripping slime effect */}
        <mesh position={[0, 0.1, 0.4]}>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial 
            color="#99ff99" 
            transparent
            opacity={0.6}
            roughness={0.0}
          />
        </mesh>
        
        {/* Poisonous aura particles */}
        <group>
          {Array.from({ length: 8 }, (_, i) => (
            <mesh 
              key={i}
              position={[
                Math.cos(i * Math.PI / 4) * 1.2,
                0.8 + Math.sin(Date.now() * 0.003 + i) * 0.2,
                Math.sin(i * Math.PI / 4) * 1.2
              ]}
            >
              <sphereGeometry args={[0.05]} />
              <meshStandardMaterial 
                color="#66ff66" 
                transparent
                opacity={0.4}
                emissive="#004400"
                emissiveIntensity={0.2}
              />
            </mesh>
          ))}
        </group>
      </group>
    </BaseEnemy>
  );
};

export default SwampCrawler;
