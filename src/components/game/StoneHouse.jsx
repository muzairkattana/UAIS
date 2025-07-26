import React, { useState, useMemo } from 'react';
import { useBox } from '@react-three/cannon';
import * as THREE from 'three';

const StoneHouse = ({ position = [15, 0, -10] }) => {
  const [doorOpen, setDoorOpen] = useState(false);
  const [chestOpen, setChestOpen] = useState(false);
  const [torchLit, setTorchLit] = useState(true);

  // Create stone texture
  const stoneTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Base stone color
    ctx.fillStyle = '#6B6B6B';
    ctx.fillRect(0, 0, 256, 256);
    
    // Add stone pattern with darker mortar lines
    ctx.strokeStyle = '#4A4A4A';
    ctx.lineWidth = 2;
    
    // Horizontal mortar lines
    for (let y = 0; y < 256; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }
    
    // Vertical mortar lines (staggered)
    for (let x = 0; x < 256; x += 64) {
      for (let y = 0; y < 256; y += 64) {
        const offset = (y / 32) % 2 === 0 ? 0 : 32;
        ctx.beginPath();
        ctx.moveTo(x + offset, y);
        ctx.lineTo(x + offset, y + 32);
        ctx.stroke();
      }
    }
    
    // Add texture variation
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const size = Math.random() * 3 + 1;
      ctx.fillStyle = `rgba(${80 + Math.random() * 40}, ${80 + Math.random() * 40}, ${80 + Math.random() * 40}, 0.3)`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    return new THREE.CanvasTexture(canvas);
  }, []);

  // Physics boxes for collision
  const [wallsRef] = useBox(() => ({
    position: [position[0], position[1] + 2, position[2]],
    args: [8, 4, 8],
    type: 'Static'
  }));

  const [roofRef] = useBox(() => ({
    position: [position[0], position[1] + 5, position[2]],
    args: [9, 1, 9],
    type: 'Static'
  }));

  return (
    <group position={position}>
      {/* Main structure physics */}
      <mesh ref={wallsRef} visible={false}>
        <boxGeometry args={[8, 4, 8]} />
      </mesh>
      <mesh ref={roofRef} visible={false}>
        <boxGeometry args={[9, 1, 9]} />
      </mesh>

      {/* Stone walls */}
      <group>
        {/* Front wall with arched doorway */}
        <mesh position={[0, 2, 4]}>
          <boxGeometry args={[8, 4, 0.5]} />
          <meshLambertMaterial map={stoneTexture} />
        </mesh>
        
        {/* Arched doorway cutout effect */}
        <mesh position={[0, 1, 4.1]}>
          <boxGeometry args={[1.5, 2.5, 0.3]} />
          <meshLambertMaterial color="#2C2C2C" transparent opacity={0} />
        </mesh>

        {/* Side walls */}
        <mesh position={[-4, 2, 0]}>
          <boxGeometry args={[0.5, 4, 8]} />
          <meshLambertMaterial map={stoneTexture} />
        </mesh>
        <mesh position={[4, 2, 0]}>
          <boxGeometry args={[0.5, 4, 8]} />
          <meshLambertMaterial map={stoneTexture} />
        </mesh>

        {/* Back wall */}
        <mesh position={[0, 2, -4]}>
          <boxGeometry args={[8, 4, 0.5]} />
          <meshLambertMaterial map={stoneTexture} />
        </mesh>

        {/* Windows in side walls */}
        <mesh position={[-4.1, 2.5, 2]}>
          <boxGeometry args={[0.2, 1, 1.5]} />
          <meshLambertMaterial color="#1A1A2E" transparent opacity={0.3} />
        </mesh>
        <mesh position={[4.1, 2.5, -2]}>
          <boxGeometry args={[0.2, 1, 1.5]} />
          <meshLambertMaterial color="#1A1A2E" transparent opacity={0.3} />
        </mesh>
      </group>

      {/* Roof */}
      <group>
        {/* Main roof */}
        <mesh position={[0, 5, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[9, 0.3, 9]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>
        
        {/* Roof edges */}
        <mesh position={[0, 5.2, 4.5]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[9, 0.2, 0.5]} />
          <meshLambertMaterial color="#654321" />
        </mesh>
        <mesh position={[0, 5.2, -4.5]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[9, 0.2, 0.5]} />
          <meshLambertMaterial color="#654321" />
        </mesh>
      </group>

      {/* Chimney */}
      <mesh position={[-2, 6, -2]}>
        <boxGeometry args={[1, 2, 1]} />
        <meshLambertMaterial map={stoneTexture} />
      </mesh>

      {/* Door */}
      <mesh 
        position={doorOpen ? [-0.7, 1, 4.2] : [0, 1, 4.2]} 
        rotation={doorOpen ? [0, -Math.PI/2, 0] : [0, 0, 0]}
        onClick={() => setDoorOpen(!doorOpen)}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
      >
        <boxGeometry args={[1.4, 2.4, 0.1]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>

      {/* Door handle */}
      <mesh position={doorOpen ? [-1.2, 1, 3.8] : [-0.6, 1, 4.25]}>
        <sphereGeometry args={[0.05]} />
        <meshLambertMaterial color="#FFD700" />
      </mesh>

      {/* Interior floor */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[7.8, 0.2, 7.8]} />
        <meshLambertMaterial color="#8B7355" />
      </mesh>

      {/* Interior furnishings */}
      <group>
        {/* Fireplace */}
        <mesh position={[-3, 1, -3.5]}>
          <boxGeometry args={[2, 2, 0.5]} />
          <meshLambertMaterial map={stoneTexture} />
        </mesh>
        
        {/* Fire in fireplace */}
        {torchLit && (
          <mesh position={[-3, 1.2, -3.2]}>
            <sphereGeometry args={[0.3, 8, 6]} />
            <meshLambertMaterial color="#FF4500" emissive="#FF2200" emissiveIntensity={0.5} />
          </mesh>
        )}

        {/* Wooden table */}
        <mesh position={[0, 0.8, 1]}>
          <boxGeometry args={[2, 0.1, 1]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>
        {/* Table legs */}
        {[-0.8, 0.8].map((x, i) => 
          [-0.4, 0.4].map((z, j) => (
            <mesh key={`leg-${i}-${j}`} position={[x, 0.4, 1 + z]}>
              <boxGeometry args={[0.1, 0.8, 0.1]} />
              <meshLambertMaterial color="#654321" />
            </mesh>
          ))
        )}

        {/* Storage chest */}
        <mesh 
          position={[3, 0.5, -2]}
          onClick={() => setChestOpen(!chestOpen)}
          onPointerOver={() => document.body.style.cursor = 'pointer'}
          onPointerOut={() => document.body.style.cursor = 'auto'}
        >
          <boxGeometry args={[1.5, 1, 0.8]} />
          <meshLambertMaterial color="#654321" />
        </mesh>
        
        {/* Chest lid */}
        <mesh 
          position={[3, chestOpen ? 1.2 : 1, -2]}
          rotation={chestOpen ? [-Math.PI/3, 0, 0] : [0, 0, 0]}
        >
          <boxGeometry args={[1.5, 0.1, 0.8]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>

        {/* Bed */}
        <mesh position={[2.5, 0.4, 2.5]}>
          <boxGeometry args={[2.5, 0.3, 1.5]} />
          <meshLambertMaterial color="#8B0000" />
        </mesh>
        {/* Pillow */}
        <mesh position={[3.5, 0.6, 2.5]}>
          <boxGeometry args={[0.5, 0.2, 0.8]} />
          <meshLambertMaterial color="#F5F5DC" />
        </mesh>

        {/* Wall torch */}
        <mesh position={[3.5, 3, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>
        
        {/* Torch flame */}
        {torchLit && (
          <mesh 
            position={[3.5, 3.5, 0]}
            onClick={() => setTorchLit(!torchLit)}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
          >
            <sphereGeometry args={[0.15, 8, 6]} />
            <meshLambertMaterial color="#FF4500" emissive="#FF2200" emissiveIntensity={0.8} />
          </mesh>
        )}

        {/* Stone shelves */}
        <mesh position={[-3.5, 2, 2]}>
          <boxGeometry args={[0.3, 0.1, 2]} />
          <meshLambertMaterial map={stoneTexture} />
        </mesh>
        <mesh position={[-3.5, 2.8, 2]}>
          <boxGeometry args={[0.3, 0.1, 2]} />
          <meshLambertMaterial map={stoneTexture} />
        </mesh>

        {/* Pottery on shelves */}
        <mesh position={[-3.4, 2.2, 1.5]}>
          <cylinderGeometry args={[0.15, 0.2, 0.3]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>
        <mesh position={[-3.4, 3, 2.5]}>
          <cylinderGeometry args={[0.12, 0.15, 0.25]} />
          <meshLambertMaterial color="#CD853F" />
        </mesh>
      </group>

      {/* Lighting */}
      <pointLight
        position={[0, 3, 0]}
        intensity={0.8}
        distance={12}
        color="#FFE4B5"
        castShadow
      />
      
      {/* Fireplace light */}
      {torchLit && (
        <pointLight
          position={[-3, 1.5, -3]}
          intensity={1.2}
          distance={8}
          color="#FF6347"
          castShadow
        />
      )}
      
      {/* Torch light */}
      {torchLit && (
        <pointLight
          position={[3.5, 3.5, 0]}
          intensity={0.6}
          distance={6}
          color="#FF4500"
        />
      )}
    </group>
  );
};

export default StoneHouse;
