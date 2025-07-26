import React, { useState } from 'react';
import { useBox } from '@react-three/cannon';
import { Text } from '@react-three/drei';

interface CabinHouseProps {
  position: [number, number, number];
}

export const CabinHouse: React.FC<CabinHouseProps> = ({ position }) => {
  const [cabinetOpen, setCabinetOpen] = useState(false);
  const [bedroomDoorOpen, setBedroomDoorOpen] = useState(false);
  const [fireplaceOn, setFireplaceOn] = useState(false);

  // Physics for house collision
  const [houseRef] = useBox(() => ({
    position,
    args: [8, 4, 6],
    type: 'Static',
  }));

  // Log cabin brown color scheme
  const logColor = '#8B4513';
  const darkLogColor = '#654321';
  const roofColor = '#2F4F2F';

  return (
    <group position={position}>
      {/* Foundation */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[8.2, 0.2, 6.2]} />
        <meshStandardMaterial color="#696969" />
      </mesh>

      {/* Log walls with horizontal log texture effect */}
      {/* Front wall */}
      <group position={[0, 2, 3]}>
        {[...Array(8)].map((_, i) => (
          <mesh key={i} position={[0, i * 0.5 - 1.75, 0]}>
            <boxGeometry args={[8, 0.4, 0.2]} />
            <meshStandardMaterial color={i % 2 === 0 ? logColor : darkLogColor} />
          </mesh>
        ))}
      </group>

      {/* Back wall */}
      <group position={[0, 2, -3]}>
        {[...Array(8)].map((_, i) => (
          <mesh key={i} position={[0, i * 0.5 - 1.75, 0]}>
            <boxGeometry args={[8, 0.4, 0.2]} />
            <meshStandardMaterial color={i % 2 === 0 ? logColor : darkLogColor} />
          </mesh>
        ))}
      </group>

      {/* Left wall */}
      <group position={[-4, 2, 0]}>
        {[...Array(8)].map((_, i) => (
          <mesh key={i} position={[0, i * 0.5 - 1.75, 0]}>
            <boxGeometry args={[0.2, 0.4, 6]} />
            <meshStandardMaterial color={i % 2 === 0 ? logColor : darkLogColor} />
          </mesh>
        ))}
      </group>

      {/* Right wall with window */}
      <group position={[4, 2, 0]}>
        {[...Array(8)].map((_, i) => (
          <mesh key={i} position={[0, i * 0.5 - 1.75, 0]}>
            <boxGeometry args={[0.2, 0.4, i >= 3 && i <= 5 ? 2 : 6]} />
            <meshStandardMaterial color={i % 2 === 0 ? logColor : darkLogColor} />
          </mesh>
        ))}
        {/* Window */}
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.1, 1.2, 2]} />
          <meshStandardMaterial color="#87CEEB" opacity={0.6} transparent />
        </mesh>
      </group>

      {/* Steep A-frame roof */}
      <mesh position={[0, 5, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[5, 2, 4]} />
        <meshStandardMaterial color={roofColor} />
      </mesh>

      {/* Chimney */}
      <mesh position={[-2, 5.5, 1]}>
        <boxGeometry args={[0.8, 2, 0.8]} />
        <meshStandardMaterial color="#8B0000" />
      </mesh>

      {/* Front door */}
      <mesh position={[1, 1, 3.1]}>
        <boxGeometry args={[1.2, 2.5, 0.1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Door handle */}
      <mesh position={[0.5, 1, 3.15]}>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>

      {/* Front porch */}
      <mesh position={[0, 0.2, 4]}>
        <boxGeometry args={[8, 0.3, 2]} />
        <meshStandardMaterial color={darkLogColor} />
      </mesh>

      {/* Porch posts */}
      {[-3, -1, 1, 3].map((x, i) => (
        <mesh key={i} position={[x, 1.5, 4]}>
          <boxGeometry args={[0.2, 3, 0.2]} />
          <meshStandardMaterial color={darkLogColor} />
        </mesh>
      ))}

      {/* Interior floor */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[7.8, 0.1, 5.8]} />
        <meshStandardMaterial color="#DEB887" />
      </mesh>

      {/* Room divider wall */}
      <mesh position={[0, 1.5, -1]}>
        <boxGeometry args={[7.8, 3, 0.2]} />
        <meshStandardMaterial color={logColor} />
      </mesh>

      {/* Bedroom door */}
      <mesh 
        position={[bedroomDoorOpen ? 1.5 : 0, 1, -1]} 
        rotation={[0, bedroomDoorOpen ? Math.PI/2 : 0, 0]}
        onClick={() => setBedroomDoorOpen(!bedroomDoorOpen)}
      >
        <boxGeometry args={[1.5, 2, 0.1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Living room furniture */}
      {/* Fireplace */}
      <group position={[-3, 1, 2]}>
        <mesh>
          <boxGeometry args={[2, 2, 1]} />
          <meshStandardMaterial color="#8B0000" />
        </mesh>
        {/* Fire effect */}
        {fireplaceOn && (
          <mesh position={[0, 0.5, 0.3]}>
            <boxGeometry args={[1, 1, 0.2]} />
            <meshStandardMaterial color="#FF4500" emissive="#FF4500" emissiveIntensity={0.5} />
          </mesh>
        )}
        <Text
          position={[0, -1.2, 0.6]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Click to toggle fireplace
        </Text>
      </group>

      {/* Fireplace click handler */}
      <mesh 
        position={[-3, 1, 2]}
        onClick={() => setFireplaceOn(!fireplaceOn)}
        visible={false}
      >
        <boxGeometry args={[2, 2, 1]} />
      </mesh>

      {/* Rustic table */}
      <mesh position={[2, 0.5, 1]}>
        <boxGeometry args={[2, 0.1, 1]} />
        <meshStandardMaterial color={darkLogColor} />
      </mesh>
      {/* Table legs */}
      {[[-0.8, -0.3, -0.4], [0.8, -0.3, -0.4], [-0.8, -0.3, 0.4], [0.8, -0.3, 0.4]].map((pos, i) => (
        <mesh key={i} position={[2 + pos[0], 0.5 + pos[1], 1 + pos[2]]}>
          <boxGeometry args={[0.1, 0.6, 0.1]} />
          <meshStandardMaterial color={darkLogColor} />
        </mesh>
      ))}

      {/* Wooden chairs */}
      {[[-1, 0.4, 1], [1, 0.4, 1]].map((chairPos, i) => (
        <group key={i} position={[2 + chairPos[0], chairPos[1], chairPos[2]]}>
          {/* Seat */}
          <mesh>
            <boxGeometry args={[0.5, 0.1, 0.5]} />
            <meshStandardMaterial color={logColor} />
          </mesh>
          {/* Backrest */}
          <mesh position={[0, 0.4, -0.2]}>
            <boxGeometry args={[0.5, 0.6, 0.1]} />
            <meshStandardMaterial color={logColor} />
          </mesh>
          {/* Legs */}
          {[[-0.2, -0.3, -0.2], [0.2, -0.3, -0.2], [-0.2, -0.3, 0.2], [0.2, -0.3, 0.2]].map((legPos, j) => (
            <mesh key={j} position={legPos}>
              <boxGeometry args={[0.05, 0.6, 0.05]} />
              <meshStandardMaterial color={darkLogColor} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Kitchen area */}
      {/* Cabinet */}
      <group position={[3, 1, -2]}>
        <mesh>
          <boxGeometry args={[1.5, 2, 0.8]} />
          <meshStandardMaterial color={logColor} />
        </mesh>
        {/* Cabinet door */}
        <mesh 
          position={[cabinetOpen ? 0.5 : 0, 0, 0.5]} 
          rotation={[0, cabinetOpen ? Math.PI/2 : 0, 0]}
          onClick={() => setCabinetOpen(!cabinetOpen)}
        >
          <boxGeometry args={[0.7, 1.8, 0.1]} />
          <meshStandardMaterial color={darkLogColor} />
        </mesh>
        <Text
          position={[0, -1.2, 0.9]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Click to open cabinet
        </Text>
      </group>

      {/* Bedroom furniture */}
      {/* Simple bed */}
      <group position={[-2, 0.5, -2]}>
        {/* Bed frame */}
        <mesh>
          <boxGeometry args={[2, 0.3, 1.5]} />
          <meshStandardMaterial color={darkLogColor} />
        </mesh>
        {/* Mattress */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[1.8, 0.2, 1.3]} />
          <meshStandardMaterial color="#F5F5DC" />
        </mesh>
      </group>

      {/* Interior lighting */}
      <pointLight position={[0, 3, 0]} intensity={0.8} color="#FFE4B5" />
      <pointLight position={[0, 2, -2]} intensity={0.6} color="#FFE4B5" />
    </group>
  );
};
