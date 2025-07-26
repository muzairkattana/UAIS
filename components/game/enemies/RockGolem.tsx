import React, { useRef, useMemo } from 'react';
import { Group } from 'three';
import BaseEnemy from './BaseEnemy';

interface RockGolemProps {
  position: [number, number, number];
  onDeath?: () => void;
}

const RockGolem: React.FC<RockGolemProps> = ({ position, onDeath }) => {
  const meshRef = useRef<Group>(null);

  // Rock Golem stats - very high health, very high damage, but slow
  const stats = useMemo(() => ({
    maxHealth: 150,
    damage: 50,
    speed: 1.5,
    detectionRadius: 12,
    attackRadius: 3.0,
    attackCooldown: 3000,
    maxChaseDistance: 20
  }), []);

  return (
    <BaseEnemy
      position={position}
      stats={stats}
      onDeath={onDeath}
    >
      <group ref={meshRef}>
        {/* Main body - large and rocky */}
        <mesh position={[0, 1.8, 0]}>
          <boxGeometry args={[1.2, 2.0, 0.8]} />
          <meshStandardMaterial 
            color="#4a4a4a" 
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
        
        {/* Rock texture details on body */}
        <mesh position={[-0.3, 2.2, 0.35]}>
          <boxGeometry args={[0.2, 0.3, 0.15]} />
          <meshStandardMaterial 
            color="#3a3a3a" 
            roughness={0.95}
          />
        </mesh>
        <mesh position={[0.4, 1.5, 0.35]}>
          <boxGeometry args={[0.25, 0.4, 0.2]} />
          <meshStandardMaterial 
            color="#5a5a5a" 
            roughness={0.95}
          />
        </mesh>
        <mesh position={[0.2, 2.5, 0.35]}>
          <boxGeometry args={[0.15, 0.2, 0.1]} />
          <meshStandardMaterial 
            color="#3a3a3a" 
            roughness={0.95}
          />
        </mesh>
        
        {/* Head - blocky and intimidating */}
        <mesh position={[0, 3.2, 0]}>
          <boxGeometry args={[0.8, 0.7, 0.6]} />
          <meshStandardMaterial 
            color="#404040" 
            roughness={0.9}
          />
        </mesh>
        
        {/* Glowing orange eyes - like molten rock */}
        <mesh position={[-0.2, 3.25, 0.25]}>
          <sphereGeometry args={[0.12]} />
          <meshStandardMaterial 
            color="#ff4400" 
            emissive="#ff2200"
            emissiveIntensity={1.2}
          />
        </mesh>
        <mesh position={[0.2, 3.25, 0.25]}>
          <sphereGeometry args={[0.12]} />
          <meshStandardMaterial 
            color="#ff4400" 
            emissive="#ff2200"
            emissiveIntensity={1.2}
          />
        </mesh>
        
        {/* Massive arms */}
        <mesh position={[-0.9, 2.0, 0]} rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.25, 0.35, 1.5]} />
          <meshStandardMaterial 
            color="#454545" 
            roughness={0.9}
          />
        </mesh>
        <mesh position={[0.9, 2.0, 0]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.25, 0.35, 1.5]} />
          <meshStandardMaterial 
            color="#454545" 
            roughness={0.9}
          />
        </mesh>
        
        {/* Huge fists */}
        <mesh position={[-1.3, 1.2, 0]}>
          <sphereGeometry args={[0.4]} />
          <meshStandardMaterial 
            color="#3a3a3a" 
            roughness={0.95}
          />
        </mesh>
        <mesh position={[1.3, 1.2, 0]}>
          <sphereGeometry args={[0.4]} />
          <meshStandardMaterial 
            color="#3a3a3a" 
            roughness={0.95}
          />
        </mesh>
        
        {/* Spikes on fists */}
        <mesh position={[-1.5, 1.3, 0]} rotation={[0, 0, -0.5]}>
          <coneGeometry args={[0.08, 0.3]} />
          <meshStandardMaterial 
            color="#2a2a2a" 
            roughness={0.8}
          />
        </mesh>
        <mesh position={[1.5, 1.3, 0]} rotation={[0, 0, 0.5]}>
          <coneGeometry args={[0.08, 0.3]} />
          <meshStandardMaterial 
            color="#2a2a2a" 
            roughness={0.8}
          />
        </mesh>
        
        {/* Thick legs */}
        <mesh position={[-0.3, 0.6, 0]}>
          <cylinderGeometry args={[0.3, 0.4, 1.2]} />
          <meshStandardMaterial 
            color="#404040" 
            roughness={0.9}
          />
        </mesh>
        <mesh position={[0.3, 0.6, 0]}>
          <cylinderGeometry args={[0.3, 0.4, 1.2]} />
          <meshStandardMaterial 
            color="#404040" 
            roughness={0.9}
          />
        </mesh>
        
        {/* Rock feet */}
        <mesh position={[-0.3, 0.1, 0.2]}>
          <boxGeometry args={[0.5, 0.2, 0.7]} />
          <meshStandardMaterial 
            color="#3a3a3a" 
            roughness={0.95}
          />
        </mesh>
        <mesh position={[0.3, 0.1, 0.2]}>
          <boxGeometry args={[0.5, 0.2, 0.7]} />
          <meshStandardMaterial 
            color="#3a3a3a" 
            roughness={0.95}
          />
        </mesh>
        
        {/* Shoulder armor/spikes */}
        <mesh position={[-0.7, 2.9, 0]} rotation={[0, 0, -0.4]}>
          <coneGeometry args={[0.15, 0.6]} />
          <meshStandardMaterial 
            color="#2a2a2a" 
            roughness={0.8}
          />
        </mesh>
        <mesh position={[0.7, 2.9, 0]} rotation={[0, 0, 0.4]}>
          <coneGeometry args={[0.15, 0.6]} />
          <meshStandardMaterial 
            color="#2a2a2a" 
            roughness={0.8}
          />
        </mesh>
        
        {/* Moss/vegetation growing on the golem */}
        <mesh position={[-0.2, 1.4, 0.4]}>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial 
            color="#2d5016" 
            roughness={0.9}
          />
        </mesh>
        <mesh position={[0.3, 2.8, 0.35]}>
          <sphereGeometry args={[0.08]} />
          <meshStandardMaterial 
            color="#2d5016" 
            roughness={0.9}
          />
        </mesh>
        <mesh position={[-0.4, 0.8, 0.4]}>
          <sphereGeometry args={[0.12]} />
          <meshStandardMaterial 
            color="#2d5016" 
            roughness={0.9}
          />
        </mesh>
        
        {/* Cracked lines with glowing magma */}
        <mesh position={[0, 1.8, 0.41]}>
          <planeGeometry args={[0.8, 0.05]} />
          <meshStandardMaterial 
            color="#ff4400" 
            emissive="#ff2200"
            emissiveIntensity={0.6}
            transparent
            opacity={0.8}
          />
        </mesh>
        <mesh position={[0, 2.3, 0.41]} rotation={[0, 0, 0.3]}>
          <planeGeometry args={[0.6, 0.04]} />
          <meshStandardMaterial 
            color="#ff4400" 
            emissive="#ff2200"
            emissiveIntensity={0.6}
            transparent
            opacity={0.8}
          />
        </mesh>
        
        {/* Floating rock debris around the golem */}
        <group>
          {Array.from({ length: 8 }, (_, i) => (
            <mesh 
              key={i}
              position={[
                Math.cos(i * Math.PI / 4) * 1.5,
                1.5 + Math.sin(Date.now() * 0.002 + i) * 0.4,
                Math.sin(i * Math.PI / 4) * 1.5
              ]}
              rotation={[
                Math.sin(Date.now() * 0.003 + i) * 0.5,
                Date.now() * 0.002 + i,
                Math.cos(Date.now() * 0.003 + i) * 0.5
              ]}
            >
              <boxGeometry args={[0.1, 0.1, 0.1]} />
              <meshStandardMaterial 
                color="#4a4a4a" 
                roughness={0.9}
              />
            </mesh>
          ))}
        </group>
        
        {/* Ground impact effect */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.0, 1.5]} />
          <meshStandardMaterial 
            color="#3a3a3a" 
            transparent
            opacity={0.4}
            roughness={0.9}
          />
        </mesh>
        
        {/* Crystal formations on back */}
        <mesh position={[0, 2.5, -0.45]} rotation={[0.2, 0, 0]}>
          <coneGeometry args={[0.1, 0.5]} />
          <meshStandardMaterial 
            color="#4d79a4" 
            metalness={0.3}
            roughness={0.4}
            emissive="#1a2b3d"
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[-0.2, 2.2, -0.45]} rotation={[0.3, -0.3, 0]}>
          <coneGeometry args={[0.08, 0.4]} />
          <meshStandardMaterial 
            color="#4d79a4" 
            metalness={0.3}
            roughness={0.4}
            emissive="#1a2b3d"
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[0.2, 2.7, -0.45]} rotation={[0.1, 0.3, 0]}>
          <coneGeometry args={[0.06, 0.3]} />
          <meshStandardMaterial 
            color="#4d79a4" 
            metalness={0.3}
            roughness={0.4}
            emissive="#1a2b3d"
            emissiveIntensity={0.2}
          />
        </mesh>
      </group>
    </BaseEnemy>
  );
};

export default RockGolem;
