import React, { useState } from 'react';
import { useBox } from '@react-three/cannon';
import { Text } from '@react-three/drei';

interface HutHouseProps {
  position: [number, number, number];
}

export const HutHouse: React.FC<HutHouseProps> = ({ position }) => {
  const [doorOpen, setDoorOpen] = useState(false);
  const [cabinetOpen, setCabinetOpen] = useState(false);
  const [fireplaceOn, setFireplaceOn] = useState(false);

  // Physics for house collision
  const [houseRef] = useBox(() => ({
    position,
    args: [5, 3, 5],
    type: 'Static',
  }));

  // Natural earth tone colors
  const wallColor = '#8B7355';
  const darkWallColor = '#6B5345';
  const thatchColor = '#DAA520';
  const darkThatchColor = '#B8860B';

  return (
    <group position={position}>
      {/* Foundation */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[3, 3, 0.2, 8]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Rounded walls */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 3, 8]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      {/* Wall texture bands */}
      {[0.5, 1, 1.5, 2, 2.5].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[2.52, 2.52, 0.1, 8]} />
          <meshStandardMaterial color={i % 2 === 0 ? wallColor : darkWallColor} />
        </mesh>
      ))}

      {/* Thatched roof */}
      <mesh position={[0, 3.5, 0]}>
        <coneGeometry args={[3.5, 2, 8]} />
        <meshStandardMaterial color={thatchColor} />
      </mesh>

      {/* Roof thatch layers */}
      {[0.3, 0.6, 0.9, 1.2].map((offset, i) => (
        <mesh key={i} position={[0, 3.5 + offset, 0]}>
          <coneGeometry args={[3.5 - offset * 0.8, 0.2, 8]} />
          <meshStandardMaterial color={i % 2 === 0 ? thatchColor : darkThatchColor} />
        </mesh>
      ))}

      {/* Door opening */}
      <mesh position={[0, 1, 2.3]}>
        <boxGeometry args={[1.2, 2.2, 0.3]} />
        <meshStandardMaterial color="#2F4F2F" transparent opacity={0} />
      </mesh>

      {/* Wooden door */}
      <mesh 
        position={[doorOpen ? -0.8 : 0, 1, 2.4]} 
        rotation={[0, doorOpen ? -Math.PI/2 : 0, 0]}
        onClick={() => setDoorOpen(!doorOpen)}
      >
        <boxGeometry args={[1.2, 2, 0.1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Door handle */}
      <mesh position={[doorOpen ? -0.3 : 0.5, 1, doorOpen ? 1.6 : 2.45]}>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial color="#CD853F" />
      </mesh>

      {/* Window */}
      <mesh position={[2.2, 1.5, 0]} rotation={[0, Math.PI/2, 0]}>
        <boxGeometry args={[0.1, 1, 1]} />
        <meshStandardMaterial color="#87CEEB" opacity={0.7} transparent />
      </mesh>

      {/* Window frame */}
      <mesh position={[2.3, 1.5, 0]} rotation={[0, Math.PI/2, 0]}>
        <boxGeometry args={[0.05, 1.1, 1.1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Interior floor */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[2.4, 2.4, 0.1, 8]} />
        <meshStandardMaterial color="#DEB887" />
      </mesh>

      {/* Central fire pit */}
      <group position={[0, 0.2, 0]}>
        <mesh>
          <cylinderGeometry args={[0.8, 1, 0.3, 8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        {/* Stones around fire pit */}
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const x = Math.cos(angle) * 1.2;
          const z = Math.sin(angle) * 1.2;
          return (
            <mesh key={i} position={[x, 0.1, z]}>
              <boxGeometry args={[0.3, 0.2, 0.2]} />
              <meshStandardMaterial color="#696969" />
            </mesh>
          );
        })}
        
        {/* Fire effect */}
        {fireplaceOn && (
          <mesh position={[0, 0.3, 0]}>
            <coneGeometry args={[0.6, 0.8, 6]} />
            <meshStandardMaterial 
              color="#FF4500" 
              emissive="#FF6347" 
              emissiveIntensity={0.8}
              transparent 
              opacity={0.8} 
            />
          </mesh>
        )}
        
        <Text
          position={[0, -0.5, 1.5]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Click to toggle fire
        </Text>
      </group>

      {/* Fire pit click handler */}
      <mesh 
        position={[0, 0.2, 0]}
        onClick={() => setFireplaceOn(!fireplaceOn)}
        visible={false}
      >
        <cylinderGeometry args={[1, 1, 0.5, 8]} />
      </mesh>

      {/* Simple furniture around the walls */}
      {/* Bed */}
      <group position={[-1.5, 0.3, -1.5]}>
        <mesh>
          <boxGeometry args={[1.5, 0.2, 1]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        {/* Bedding */}
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[1.4, 0.1, 0.9]} />
          <meshStandardMaterial color="#F5DEB3" />
        </mesh>
      </group>

      {/* Storage baskets */}
      {[
        [1.8, 0.3, -1],
        [1.5, 0.3, 1.5],
        [-1.8, 0.3, 1]
      ].map((basketPos, i) => (
        <group key={i} position={basketPos as [number, number, number]}>
          <mesh>
            <cylinderGeometry args={[0.4, 0.3, 0.6, 8]} />
            <meshStandardMaterial color="#D2691E" />
          </mesh>
          {/* Basket weave texture */}
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.41, 0.31, 0.5, 8]} />
            <meshStandardMaterial color="#CD853F" />
          </mesh>
        </group>
      ))}

      {/* Hanging herbs and tools */}
      <group position={[0, 2.8, 0]}>
        {Array.from({ length: 6 }, (_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          const x = Math.cos(angle) * 1.8;
          const z = Math.sin(angle) * 1.8;
          return (
            <group key={i} position={[x, 0, z]}>
              {/* Hanging rope */}
              <mesh position={[0, -0.5, 0]}>
                <boxGeometry args={[0.02, 1, 0.02]} />
                <meshStandardMaterial color="#8B4513" />
              </mesh>
              {/* Hanging item */}
              <mesh position={[0, -1, 0]}>
                <boxGeometry args={[0.2, 0.3, 0.1]} />
                <meshStandardMaterial color={i % 2 === 0 ? "#228B22" : "#8B4513"} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Small table */}
      <group position={[1.2, 0.5, 0.8]}>
        <mesh>
          <cylinderGeometry args={[0.4, 0.4, 0.1, 8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        {/* Table leg */}
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
        {/* Items on table */}
        <mesh position={[0.1, 0.15, 0.1]}>
          <boxGeometry args={[0.15, 0.1, 0.1]} />
          <meshStandardMaterial color="#8B0000" />
        </mesh>
        <mesh position={[-0.1, 0.15, -0.1]}>
          <cylinderGeometry args={[0.08, 0.08, 0.2, 8]} />
          <meshStandardMaterial color="#DAA520" />
        </mesh>
      </group>

      {/* Storage shelf */}
      <group position={[-2, 1.5, 0]}>
        <mesh>
          <boxGeometry args={[0.3, 1.5, 1]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        {/* Shelf items */}
        {[0.4, 0, -0.4].map((y, i) => (
          <mesh key={i} position={[0.2, y, 0]}>
            <boxGeometry args={[0.1, 0.2, 0.8]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#CD853F" : "#8B4513"} />
          </mesh>
        ))}
      </group>

      {/* Entrance mat */}
      <mesh position={[0, 0.01, 1.8]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[1.5, 0.8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Interior lighting */}
      <pointLight position={[0, 2.5, 0]} intensity={0.6} color="#FFE4B5" />
      {fireplaceOn && (
        <pointLight position={[0, 1, 0]} intensity={1.2} color="#FF6347" />
      )}
    </group>
  );
};
