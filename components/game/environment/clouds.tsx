"use client"

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface CloudsProps {
  count?: number
  spread?: number
  height?: number
  density?: number
  windStrength?: number
  storminess?: number
}

interface CloudParticle {
  position: THREE.Vector3
  scale: THREE.Vector3
  rotation: THREE.Euler
  velocity: THREE.Vector3
  turbulence: number
  density: number
  age: number
  type: 'cumulus' | 'stratus' | 'cirrus' | 'cumulonimbus'
}

interface CloudData {
  position: THREE.Vector3
  scale: THREE.Vector3
  rotation: THREE.Euler
  speed: number
  opacity: number
  type: 'cumulus' | 'stratus' | 'cirrus' | 'cumulonimbus'
  particles: Array<{
    position: THREE.Vector3
    scale: number
    turbulence: number
  }>
}

interface CloudCluster {
  id: string
  position: THREE.Vector3
  scale: THREE.Vector3
  rotation: THREE.Euler
  particles: CloudParticle[]
  windResistance: number
  precipitation: number
  electricalActivity: number
}

export default function Clouds({ 
  count = 12, 
  spread = 500, 
  height = 100, 
  density = 0.8,
  windStrength = 0.3,
  storminess = 0.1
}: CloudsProps) {
  const cloudsRef = useRef<THREE.Group>(null)
  const cloudMeshes = useRef<THREE.Mesh[]>([])
  const lightningRefs = useRef<THREE.Mesh[]>([])

  // Create cloud shader material for volumetric look
  const cloudMaterial = useMemo(() => {
    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vUv = uv;
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `

    const fragmentShader = `
      uniform float time;
      uniform float opacity;
      uniform vec3 cloudColor;
      uniform vec3 shadowColor;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      
      // Simple noise function
      float noise(vec3 p) {
        return sin(p.x * 0.1 + time * 0.1) * sin(p.y * 0.1) * sin(p.z * 0.1 + time * 0.05);
      }
      
      void main() {
        // Calculate fresnel for soft edges
        vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
        float fresnel = 1.0 - abs(dot(viewDirection, vNormal));
        fresnel = pow(fresnel, 1.5);
        
        // Add some noise for cloud texture
        float n = noise(vWorldPosition * 0.02) * 0.3 + 0.7;
        
        // Create gradient from top to bottom of cloud
        float gradient = smoothstep(-0.5, 0.5, vNormal.y);
        
        // Mix colors based on lighting
        vec3 finalColor = mix(shadowColor, cloudColor, gradient * n);
        
        // Soft transparency
        float alpha = fresnel * opacity * n;
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `

    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        opacity: { value: density },
        cloudColor: { value: new THREE.Color(0xffffff) },
        shadowColor: { value: new THREE.Color(0xe0e0e0) }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide
    })
  }, [density])

  // Advanced Volumetric Cloud Material with 3D noise
  const volumetricCloudMaterial = useMemo(() => {
    const cloudTypes = ['cumulus', 'stratus', 'cirrus', 'cumulonimbus']
    
    return cloudTypes.map((type, index) => {
      const vertexShader = `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying vec2 vUv;
        varying vec3 vViewPosition;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `

      const fragmentShader = `
        uniform float time;
        uniform float opacity;
        uniform float turbulence;
        uniform vec3 cloudColor;
        uniform vec3 shadowColor;
        uniform vec3 sunDirection;
        uniform float cloudType;
        
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying vec2 vUv;
        varying vec3 vViewPosition;
        
        // Advanced 3D noise functions
        vec3 mod289(vec3 x) {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }
        
        vec4 mod289(vec4 x) {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }
        
        vec4 permute(vec4 x) {
          return mod289(((x*34.0)+1.0)*x);
        }
        
        vec4 taylorInvSqrt(vec4 r) {
          return 1.79284291400159 - 0.85373472095314 * r;
        }
        
        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          
          vec3 i = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          
          i = mod289(i);
          vec4 p = permute(permute(permute(
                   i.z + vec4(0.0, i1.z, i2.z, 1.0))
                 + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                 + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }
        
        float fbm(vec3 p) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 1.0;
          
          for(int i = 0; i < 6; i++) {
            value += amplitude * snoise(p * frequency);
            frequency *= 2.0;
            amplitude *= 0.5;
          }
          return value;
        }
        
        void main() {
          vec3 viewDir = normalize(vViewPosition);
          vec3 normal = normalize(vNormal);
          
          // Create 3D cloud density
          vec3 samplePos = vWorldPosition * 0.01 + time * 0.02;
          float noise1 = fbm(samplePos);
          float noise2 = fbm(samplePos * 2.1 + vec3(100.0));
          float noise3 = fbm(samplePos * 4.3 + vec3(200.0));
          
          // Combine noises for realistic cloud structure
          float cloudDensity = noise1 * 0.6 + noise2 * 0.3 + noise3 * 0.1;
          cloudDensity = smoothstep(-0.2, 0.8, cloudDensity);
          
          // Different cloud type characteristics
          float typeModifier = 1.0;
          if (cloudType < 1.0) { // Cumulus
            typeModifier = 1.2;
            cloudDensity = pow(cloudDensity, 0.8);
          } else if (cloudType < 2.0) { // Stratus
            typeModifier = 0.6;
            cloudDensity = smoothstep(0.1, 0.9, cloudDensity);
          } else if (cloudType < 3.0) { // Cirrus
            typeModifier = 0.4;
            cloudDensity = pow(cloudDensity, 1.5);
          } else { // Cumulonimbus
            typeModifier = 1.5;
            cloudDensity = pow(cloudDensity, 0.6);
          }
          
          // Calculate lighting
          vec3 lightDir = normalize(sunDirection);
          float NdotL = dot(normal, lightDir);
          float lightInfluence = max(0.0, NdotL) * 0.7 + 0.3;
          
          // Fresnel effect for volume scattering
          float fresnel = pow(1.0 - abs(dot(viewDir, normal)), 2.0);
          
          // Final cloud color
          vec3 finalColor = mix(shadowColor, cloudColor, lightInfluence);
          
          // Calculate final alpha
          float alpha = cloudDensity * opacity * typeModifier * (fresnel * 0.3 + 0.7);
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `
      
      return new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          opacity: { value: density * (1 + index * 0.1) },
          turbulence: { value: 1.0 },
          cloudColor: { value: new THREE.Color(0xffffff) },
          shadowColor: { value: new THREE.Color(0xd0d0d0) },
          sunDirection: { value: new THREE.Vector3(1, 1, 0.5).normalize() },
          cloudType: { value: index }
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        side: THREE.DoubleSide
      })
    })
  }, [density])

  // Generate ultra-realistic cloud data
  const cloudData = useMemo<CloudData[]>(() => {
    const cloudTypes: Array<'cumulus' | 'stratus' | 'cirrus' | 'cumulonimbus'> = 
      ['cumulus', 'stratus', 'cirrus', 'cumulonimbus']
    
    return Array.from({ length: count }, (_, i) => {
      const cloudType = cloudTypes[Math.floor(Math.random() * cloudTypes.length)]
      
      // Different characteristics based on cloud type
      let particleCount, scaleMultiplier, heightVariation, speedMultiplier
      
      switch (cloudType) {
        case 'cumulus':
          particleCount = 8 + Math.floor(Math.random() * 4)
          scaleMultiplier = 1.2
          heightVariation = 15
          speedMultiplier = 1.0
          break
        case 'stratus':
          particleCount = 12 + Math.floor(Math.random() * 6)
          scaleMultiplier = 1.8
          heightVariation = 5
          speedMultiplier = 0.7
          break
        case 'cirrus':
          particleCount = 6 + Math.floor(Math.random() * 3)
          scaleMultiplier = 0.8
          heightVariation = 25
          speedMultiplier = 1.5
          break
        case 'cumulonimbus':
          particleCount = 15 + Math.floor(Math.random() * 8)
          scaleMultiplier = 2.0
          heightVariation = 30
          speedMultiplier = 0.8
          break
        default:
          particleCount = 8
          scaleMultiplier = 1.0
          heightVariation = 15
          speedMultiplier = 1.0
      }
      
      const cloudGroup: CloudData = {
        position: new THREE.Vector3(
          (Math.random() - 0.5) * spread,
          height + (Math.random() - 0.5) * heightVariation,
          (Math.random() - 0.5) * spread
        ),
        scale: new THREE.Vector3(
          (Math.random() * 25 + 20) * scaleMultiplier,
          (Math.random() * 12 + 8) * (cloudType === 'stratus' ? 0.4 : 1.0),
          (Math.random() * 25 + 20) * scaleMultiplier
        ),
        rotation: new THREE.Euler(
          (Math.random() - 0.5) * 0.3,
          Math.random() * Math.PI * 2,
          (Math.random() - 0.5) * 0.2
        ),
        speed: (Math.random() * 0.003 + 0.001) * speedMultiplier * windStrength,
        opacity: Math.random() * 0.3 + 0.6,
        type: cloudType,
        particles: []
      }

      // Create realistic cloud particle distribution
      for (let j = 0; j < particleCount; j++) {
        const angle = (j / particleCount) * Math.PI * 2 + Math.random() * 0.5
        const distance = Math.random() * 20 + 5
        const heightOffset = (Math.random() - 0.5) * 8
        
        cloudGroup.particles.push({
          position: new THREE.Vector3(
            Math.cos(angle) * distance + (Math.random() - 0.5) * 10,
            heightOffset,
            Math.sin(angle) * distance + (Math.random() - 0.5) * 10
          ),
          scale: Math.random() * 0.8 + 0.4,
          turbulence: Math.random() * 0.5 + 0.5
        })
      }

      return cloudGroup
    })
  }, [count, spread, height, windStrength])

  // Advanced cloud animation with realistic atmospheric physics
  useFrame((state) => {
    const time = state.clock.elapsedTime
    
    // Update all volumetric cloud materials
    volumetricCloudMaterial.forEach((material) => {
      material.uniforms.time.value = time
    })

    // Realistic cloud movement with wind patterns
    cloudMeshes.current.forEach((mesh, index) => {
      if (mesh && cloudData[Math.floor(index / 8)]) { // Assuming 8 particles per cloud on average
        const cloudIndex = Math.floor(index / 8)
        const cloud = cloudData[cloudIndex]
        
        // Wind drift
        mesh.position.x += cloud.speed * windStrength
        
        // Atmospheric turbulence
        const turbulence = Math.sin(time * 0.2 + index * 0.5) * 0.001
        mesh.position.y += turbulence
        mesh.position.z += Math.cos(time * 0.15 + index * 0.3) * 0.0005
        
        // Wrap around world
        if (mesh.position.x > spread / 2) {
          mesh.position.x = -spread / 2
        }
        
        // Subtle rotation for cloud particles
        mesh.rotation.y += 0.0001 * (index % 3 + 1)
        
        // Scale variation for breathing effect
        const breathe = Math.sin(time * 0.1 + index) * 0.02 + 1.0
        mesh.scale.multiplyScalar(breathe / mesh.userData.lastBreathe || 1)
        mesh.userData.lastBreathe = breathe
      }
    })
  })

  return (
    <group ref={cloudsRef}>
      {cloudData.map((cloud, cloudIndex) => {
        // Select material based on cloud type
        const materialIndex = ['cumulus', 'stratus', 'cirrus', 'cumulonimbus'].indexOf(cloud.type)
        const selectedMaterial = volumetricCloudMaterial[materialIndex] || volumetricCloudMaterial[0]
        
        return (
          <group
            key={cloudIndex}
            position={cloud.position}
            rotation={cloud.rotation}
          >
            {cloud.particles.map((particle, particleIndex) => {
              // Create more realistic geometry based on cloud type
              const geometry = cloud.type === 'cirrus' 
                ? [1.5, 0.3, 0.8] // Wispy, stretched
                : cloud.type === 'stratus'
                ? [2.0, 0.4, 2.0] // Flat, spread out  
                : cloud.type === 'cumulonimbus'
                ? [1.2, 2.0, 1.2] // Tall, towering
                : [1.0, 1.0, 1.0] // Cumulus - puffy
              
              return (
                <mesh
                  key={particleIndex}
                  ref={(ref) => {
                    if (ref) {
                      const index = cloudIndex * cloud.particles.length + particleIndex
                      cloudMeshes.current[index] = ref
                      ref.userData.lastBreathe = 1.0
                    }
                  }}
                  position={particle.position}
                  scale={[
                    particle.scale * cloud.scale.x * geometry[0],
                    particle.scale * cloud.scale.y * geometry[1],
                    particle.scale * cloud.scale.z * geometry[2]
                  ]}
                >
                  <sphereGeometry args={[1, 24, 24]} />
                  <primitive object={selectedMaterial} />
                </mesh>
              )
            })}
            
            {/* Add lightning effects for cumulonimbus clouds */}
            {cloud.type === 'cumulonimbus' && storminess > 0.5 && Math.random() < 0.1 && (
              <mesh
                position={[
                  (Math.random() - 0.5) * cloud.scale.x,
                  -cloud.scale.y * 0.8,
                  (Math.random() - 0.5) * cloud.scale.z
                ]}
                scale={[0.1, cloud.scale.y * 1.5, 0.1]}
              >
                <cylinderGeometry args={[0.02, 0.05, 1, 8]} />
                <meshBasicMaterial
                  color="#FFFFFF"
                  transparent
                  opacity={0.8}
                  emissive="#4488FF"
                  emissiveIntensity={2.0}
                />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}
