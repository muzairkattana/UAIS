import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import * as THREE from 'three';

const TentHouse = ({ position = [20, 0, 5] as [number, number, number] }) => {
  const [tentFlap, setTentFlap] = useState(false);
  const [lanternOn, setLanternOn] = useState(true);
  const [chestOpen, setChestOpen] = useState(false);

  const lanternRef = useRef<THREE.PointLight | null>(null);
  const fireRef = useRef<THREE.Mesh | null>(null);

  // Physics collision box for the tent
  const [tentPhysics] = useBox(() => ({
    position: [position[0], position[1] + 1.5, position[2]],
    args: [4, 3, 4],
    type: 'Static',
  }));

  useFrame((state) => {
    if (lanternRef.current && lanternOn) {
      lanternRef.current.intensity = 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
    if (fireRef.current) {
      fireRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  // Canvas material for tent walls
  const canvasMaterial = new THREE.MeshLambertMaterial({
    color: '#8B7355',
    side: THREE.DoubleSide
  });

  // Rope material
  const ropeMaterial = new THREE.MeshLambertMaterial({ color: '#654321' });

  // Wood material for furniture
  const woodMaterial = new THREE.MeshLambertMaterial({ color: '#8B4513' });

  // Metal material for lantern
  const metalMaterial = new THREE.MeshLambertMaterial({ color: '#696969' });

  return (
    <group position={position}>
      {/* Main tent structure - conical shape */}
      <mesh position={[0, 1.5, 0]} material={canvasMaterial}>
        <coneGeometry args={[2.5, 3, 8]} />
      </mesh>

      {/* Tent entrance flap */}
      <mesh 
        position={[0, 1, 2.3]} 
        rotation={tentFlap ? [-Math.PI/3, 0, 0] : [0, 0, 0]}
        material={canvasMaterial}
        onClick={() => setTentFlap(!tentFlap)}
      >
        <planeGeometry args={[1.2, 2]} />
      </mesh>

      {/* Tent ropes and stakes */}
      {[0, Math.PI/2, Math.PI, -Math.PI/2].map((angle, i) => (
        <group key={i} rotation={[0, angle, 0]}>
          {/* Rope from tent to ground */}
          <mesh position={[0, 1.5, 3]} rotation={[Math.PI/6, 0, 0]} material={ropeMaterial}>
            <cylinderGeometry args={[0.02, 0.02, 2]} />
          </mesh>
          {/* Ground stake */}
          <mesh position={[0, 0.1, 4]} material={woodMaterial}>
            <cylinderGeometry args={[0.05, 0.05, 0.6]} />
          </mesh>
        </group>
      ))}

      {/* Interior elements */}
      <group>
        {/* Sleeping area - bedroll */}
        <mesh position={[-1, 0.1, -0.5]} rotation={[-Math.PI/2, 0, 0]} material={canvasMaterial}>
          <cylinderGeometry args={[0.4, 0.4, 1.8]} />
        </mesh>
        
        {/* Pillow */}
        <mesh position={[-1, 0.2, -1]} material={canvasMaterial}>
          <boxGeometry args={[0.4, 0.2, 0.3]} />
        </mesh>

        {/* Camp fire pit */}
        <mesh position={[0.5, 0.05, 0.5]} material={new THREE.MeshLambertMaterial({ color: '#333' })}>
          <cylinderGeometry args={[0.4, 0.4, 0.1]} />
        </mesh>

        {/* Fire logs */}
        <mesh position={[0.5, 0.15, 0.5]} rotation={[0, 0, Math.PI/4]} material={woodMaterial}>
          <cylinderGeometry args={[0.05, 0.05, 0.6]} />
        </mesh>
        <mesh position={[0.5, 0.15, 0.5]} rotation={[0, Math.PI/2, Math.PI/4]} material={woodMaterial}>
          <cylinderGeometry args={[0.05, 0.05, 0.6]} />
        </mesh>

        {/* Fire effect */}
        <mesh ref={fireRef} position={[0.5, 0.3, 0.5]}>
          <coneGeometry args={[0.2, 0.4, 4]} />
          <meshBasicMaterial color="#FF4500" transparent opacity={0.7} />
        </mesh>

        {/* Camp table - low wooden table */}
        <mesh position={[1, 0.3, -0.8]} material={woodMaterial}>
          <boxGeometry args={[0.8, 0.05, 0.6]} />
        </mesh>
        {/* Table legs */}
        {[[-0.3, -0.15, -0.2], [0.3, -0.15, -0.2], [-0.3, -0.15, 0.2], [0.3, -0.15, 0.2]].map((pos, i) => (
          <mesh key={i} position={[1 + pos[0], 0.3 + pos[1], -0.8 + pos[2]]} material={woodMaterial}>
            <cylinderGeometry args={[0.03, 0.03, 0.3]} />
          </mesh>
        ))}

        {/* Storage chest */}
        <mesh position={[-0.8, 0.15, 1]} material={woodMaterial}>
          <boxGeometry args={[0.6, 0.3, 0.4]} />
        </mesh>
        
        {/* Chest lid */}
        <mesh 
          position={[-0.8, 0.3, chestOpen ? 0.8 : 1]} 
          rotation={chestOpen ? [-Math.PI/2, 0, 0] : [0, 0, 0]}
          material={woodMaterial}
          onClick={() => setChestOpen(!chestOpen)}
        >
          <boxGeometry args={[0.6, 0.05, 0.4]} />
        </mesh>

        {/* Hanging lantern */}
        <mesh position={[0, 2.5, 0]} material={metalMaterial}>
          <cylinderGeometry args={[0.15, 0.15, 0.3]} />
        </mesh>
        
        {/* Lantern chain */}
        <mesh position={[0, 2.7, 0]} material={metalMaterial}>
          <cylinderGeometry args={[0.01, 0.01, 0.4]} />
        </mesh>

        {/* Water barrel */}
        <mesh position={[1.2, 0.25, 0.8]} material={woodMaterial}>
          <cylinderGeometry args={[0.2, 0.2, 0.5]} />
        </mesh>

        {/* Barrel hoops */}
        <mesh position={[1.2, 0.35, 0.8]} material={metalMaterial}>
          <torusGeometry args={[0.21, 0.02]} />
        </mesh>
        <mesh position={[1.2, 0.15, 0.8]} material={metalMaterial}>
          <torusGeometry args={[0.21, 0.02]} />
        </mesh>

        {/* Camp stool */}
        <mesh position={[0.8, 0.2, -0.3]} material={woodMaterial}>
          <cylinderGeometry args={[0.15, 0.15, 0.05]} />
        </mesh>
        {/* Stool legs */}
        {[0, Math.PI*2/3, Math.PI*4/3].map((angle, i) => (
          <mesh 
            key={i} 
            position={[0.8 + Math.cos(angle) * 0.12, 0.1, -0.3 + Math.sin(angle) * 0.12]} 
            material={woodMaterial}
          >
            <cylinderGeometry args={[0.02, 0.02, 0.2]} />
          </mesh>
        ))}

        {/* Weapon rack - spear */}
        <mesh position={[-1.5, 0.8, 0]} rotation={[0, 0, Math.PI/6]} material={woodMaterial}>
          <cylinderGeometry args={[0.02, 0.02, 1.8]} />
        </mesh>
        {/* Spear tip */}
        <mesh position={[-1.5 + Math.cos(Math.PI/6) * 0.9, 0.8 + Math.sin(Math.PI/6) * 0.9, 0]} rotation={[0, 0, Math.PI/6]} material={metalMaterial}>
          <coneGeometry args={[0.05, 0.2]} />
        </mesh>

        {/* Food supplies - sacks */}
        <mesh position={[-1.2, 0.1, -1.2]} material={canvasMaterial}>
          <sphereGeometry args={[0.15]} />
        </mesh>
        <mesh position={[-1, 0.1, -1.3]} material={canvasMaterial}>
          <sphereGeometry args={[0.12]} />
        </mesh>
      </group>

      {/* Lighting */}
      {lanternOn && (
        <pointLight
          ref={lanternRef}
          position={[0, 2.5, 0]}
          intensity={0.8}
          color="#FFA500"
          distance={6}
          decay={2}
        />
      )}

      {/* Fire light */}
      <pointLight
        position={[0.5, 0.5, 0.5]}
        intensity={0.6}
        color="#FF4500"
        distance={4}
        decay={2}
      />

      {/* Ambient interior light */}
      <pointLight
        position={[0, 1, 0]}
        intensity={0.3}
        color="#FFDDAA"
        distance={5}
        decay={1}
      />

      {/* Physics collision reference */}
      <mesh ref={tentPhysics} visible={false}>
        <boxGeometry args={[4, 3, 4]} />
      </mesh>
    </group>
  );
};

export default TentHouse;
