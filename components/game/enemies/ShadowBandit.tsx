import React, { useRef, useMemo } from 'react';
import { Group } from 'three';
import BaseEnemy from './BaseEnemy';

interface ShadowBanditProps {
  position: [number, number, number];
  onDeath?: () => void;
}

const ShadowBandit: React.FC<ShadowBanditProps> = ({ position, onDeath }) => {
  const meshRef = useRef<Group>(null);

  // Shadow Bandit stats - high speed, moderate health, high damage
  const stats = useMemo(() => ({
    maxHealth: 70,
    damage: 35,
    speed: 3.5,
    detectionRadius: 15,
    attackRadius: 2.0,
    attackCooldown: 1500,
    maxChaseDistance: 25
  }), []);

  return (
    <BaseEnemy
      position={position}
      stats={stats}
      onDeath={onDeath}
    >
      <group ref={meshRef}>
        {/* Main body - lean and agile */}
        <mesh position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.3, 0.35, 1.6]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
        
        {/* Head with hood */}
        <mesh position={[0, 1.9, 0]}>
          <sphereGeometry args={[0.4]} />
          <meshStandardMaterial 
            color="#0d0d0d" 
            roughness={0.9}
          />
        </mesh>
        
        {/* Hood peak */}
        <mesh position={[0, 2.2, -0.1]} rotation={[0.2, 0, 0]}>
          <coneGeometry args={[0.3, 0.4]} />
          <meshStandardMaterial 
            color="#0a0a0a" 
            roughness={0.9}
          />
        </mesh>
        
        {/* Glowing red eyes */}
        <mesh position={[-0.15, 1.95, 0.3]}>
          <sphereGeometry args={[0.08]} />
          <meshStandardMaterial 
            color="#ff0000" 
            emissive="#cc0000"
            emissiveIntensity={0.8}
          />
        </mesh>
        <mesh position={[0.15, 1.95, 0.3]}>
          <sphereGeometry args={[0.08]} />
          <meshStandardMaterial 
            color="#ff0000" 
            emissive="#cc0000"
            emissiveIntensity={0.8}
          />
        </mesh>
        
        {/* Arms with dark wrappings */}
        <mesh position={[-0.5, 1.4, 0]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.12, 0.15, 0.8]} />
          <meshStandardMaterial 
            color="#2a2a2a" 
            roughness={0.8}
          />
        </mesh>
        <mesh position={[0.5, 1.4, 0]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.12, 0.15, 0.8]} />
          <meshStandardMaterial 
            color="#2a2a2a" 
            roughness={0.8}
          />
        </mesh>
        
        {/* Legs */}
        <mesh position={[-0.2, 0.4, 0]}>
          <cylinderGeometry args={[0.15, 0.18, 0.8]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            roughness={0.8}
          />
        </mesh>
        <mesh position={[0.2, 0.4, 0]}>
          <cylinderGeometry args={[0.15, 0.18, 0.8]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            roughness={0.8}
          />
        </mesh>
        
        {/* Curved daggers/weapons */}
        <mesh position={[-0.7, 1.2, 0]} rotation={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.03, 0.05, 0.6]} />
          <meshStandardMaterial 
            color="#333333" 
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0.7, 1.2, 0]} rotation={[0, 0, 0.5]}>
          <cylinderGeometry args={[0.03, 0.05, 0.6]} />
          <meshStandardMaterial 
            color="#333333" 
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        
        {/* Dark cloak/cape behind */}
        <mesh position={[0, 1.2, -0.4]} rotation={[0.1, 0, 0]}>
          <planeGeometry args={[1.0, 1.5]} />
          <meshStandardMaterial 
            color="#0a0a0a" 
            transparent
            opacity={0.8}
            side={2}
            roughness={0.9}
          />
        </mesh>
        
        {/* Shadow aura effect */}
        <group>
          {Array.from({ length: 6 }, (_, i) => (
            <mesh 
              key={i}
              position={[
                Math.cos(i * Math.PI / 3) * 0.8,
                0.5 + Math.sin(Date.now() * 0.004 + i) * 0.3,
                Math.sin(i * Math.PI / 3) * 0.8
              ]}
            >
              <sphereGeometry args={[0.06]} />
              <meshStandardMaterial 
                color="#330033" 
                transparent
                opacity={0.3}
                emissive="#110011"
                emissiveIntensity={0.4}
              />
            </mesh>
          ))}
        </group>
        
        {/* Belt with pouches */}
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.1]} />
          <meshStandardMaterial 
            color="#2d1810" 
            roughness={0.9}
          />
        </mesh>
        
        {/* Small poison vials on belt */}
        <mesh position={[-0.3, 0.9, 0.35]}>
          <cylinderGeometry args={[0.04, 0.04, 0.15]} />
          <meshStandardMaterial 
            color="#001100" 
            transparent
            opacity={0.7}
            emissive="#003300"
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[0.3, 0.9, 0.35]}>
          <cylinderGeometry args={[0.04, 0.04, 0.15]} />
          <meshStandardMaterial 
            color="#110000" 
            transparent
            opacity={0.7}
            emissive="#330000"
            emissiveIntensity={0.2}
          />
        </mesh>
      </group>
    </BaseEnemy>
  );
};

export default ShadowBandit;
