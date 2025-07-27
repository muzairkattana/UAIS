"use client"

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SunProps {
  position?: [number, number, number]
  intensity?: number
  color?: string
  size?: number
}

export default function Sun({ 
  position = [50, 80, 30], 
  intensity = 1.2, 
  color = "#FFD700", 
  size = 8 
}: SunProps) {
  const sunRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const chromosphereRef = useRef<THREE.Mesh>(null)
  const coronaRef = useRef<THREE.Mesh>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)
  const lensFlareRefs = useRef<THREE.Mesh[]>([])
  const solarFlareRefs = useRef<THREE.Mesh[]>([])

  // Advanced Solar Core Material with realistic plasma effects
  const solarCoreMaterial = useMemo(() => {
    const vertexShader = `
      varying vec3 vNormal;
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      
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
      uniform vec3 coreColor;
      uniform vec3 plasmaColor;
      uniform float intensity;
      varying vec3 vNormal;
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      
      // Advanced noise functions for plasma simulation
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }
      
      float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }
      
      float turbulence(vec2 st, int octaves) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 8; i++) {
          if (i >= octaves) break;
          value += amplitude * noise(st);
          st *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }
      
      void main() {
        vec2 st = vUv * 3.0;
        
        // Create solar surface turbulence
        float t = time * 0.1;
        float turb1 = turbulence(st + t, 6);
        float turb2 = turbulence(st * 1.5 - t * 0.7, 4);
        float turb3 = turbulence(st * 2.3 + t * 0.3, 3);
        
        // Combine turbulence for complex plasma effect
        float plasma = (turb1 + turb2 * 0.7 + turb3 * 0.4) / 2.1;
        
        // Create solar granulation effect
        float granulation = noise(st * 15.0 + time * 0.05) * 0.3;
        
        // Mix core and plasma colors based on turbulence
        vec3 finalColor = mix(coreColor, plasmaColor, plasma + granulation);
        
        // Add brightness variation
        float brightness = 0.8 + plasma * 0.4 + granulation;
        finalColor *= brightness * intensity;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `

    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        coreColor: { value: new THREE.Color('#FFFFFF') },
        plasmaColor: { value: new THREE.Color(color) },
        intensity: { value: intensity }
      },
      vertexShader,
      fragmentShader,
      transparent: false
    })
  }, [color, intensity])

  // Chromosphere Material (middle layer)
  const chromosphereMaterial = useMemo(() => {
    const vertexShader = `
      varying vec3 vNormal;
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      
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
      uniform vec3 chromoColor;
      uniform float intensity;
      varying vec3 vNormal;
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      
      float noise(vec3 p) {
        return sin(p.x * 2.1 + time * 0.2) * sin(p.y * 1.7 + time * 0.15) * sin(p.z * 1.3 + time * 0.1);
      }
      
      void main() {
        vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
        float fresnel = 1.0 - abs(dot(viewDirection, vNormal));
        fresnel = pow(fresnel, 3.0);
        
        // Add chromosphere turbulence
        float n = noise(vWorldPosition * 0.01) * 0.5 + 0.5;
        
        // Create spicules effect (solar jets)
        float spicules = sin(vUv.y * 20.0 + time * 0.3) * 0.1 + 0.9;
        
        float alpha = fresnel * intensity * n * spicules;
        
        gl_FragColor = vec4(chromoColor, alpha * 0.7);
      }
    `

    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        chromoColor: { value: new THREE.Color('#FF4500') },
        intensity: { value: 0.8 }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    })
  }, [])

  // Create corona material (outer glow)
  const coronaMaterial = useMemo(() => {
    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `

    const fragmentShader = `
      uniform vec3 glowColor;
      uniform float intensity;
      uniform float time;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      
      void main() {
        float fresnel = dot(vNormal, vec3(0.0, 0.0, 1.0));
        fresnel = pow(1.0 - fresnel, 1.5);
        
        // Add subtle animation
        float pulse = sin(time * 0.5) * 0.1 + 0.9;
        
        float alpha = fresnel * intensity * pulse;
        gl_FragColor = vec4(glowColor, alpha * 0.3);
      }
    `

    return new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color("#FFA500") },
        intensity: { value: 0.6 },
        time: { value: 0 }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    })
  }, [])

  // Create sun flare material
  const flareMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    })
  }, [color])

  // Solar Prominence Material (solar flares)
  const prominenceMaterial = useMemo(() => {
    const vertexShader = `
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      
      void main() {
        vUv = uv;
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `

    const fragmentShader = `
      uniform float time;
      uniform vec3 flareColor;
      uniform float intensity;
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      
      float noise(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }
      
      void main() {
        vec2 st = vUv;
        
        // Create solar prominence effect
        float flare = sin(st.y * 10.0 + time * 2.0) * 0.5 + 0.5;
        float n = noise(st * 5.0 + time * 0.1);
        
        // Create flame-like shape
        float flame = pow(1.0 - st.y, 2.0) * flare * n;
        
        gl_FragColor = vec4(flareColor, flame * intensity);
      }
    `

    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        flareColor: { value: new THREE.Color('#FF6600') },
        intensity: { value: 0.6 }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    })
  }, [])

  // Atmospheric Lens Flare Material
  const lensFlaresMaterial = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const colors = ['#FFFFFF', '#FFD700', '#FF6600', '#FF4444', '#FFAAAA']
      const sizes = [0.3, 0.5, 0.8, 1.2, 1.8]
      
      return new THREE.MeshBasicMaterial({
        color: new THREE.Color(colors[i]),
        transparent: true,
        opacity: 0.1 - i * 0.015,
        blending: THREE.AdditiveBlending
      })
    })
  }, [])

  // Advanced animation loop with solar physics
  useFrame((state) => {
    const time = state.clock.elapsedTime
    
    if (sunRef.current) {
      // Subtle solar rotation (realistic 25-day period scaled)
      sunRef.current.rotation.z += 0.0001
      sunRef.current.rotation.y += 0.00005
    }

    // Update all shader uniforms
    if (solarCoreMaterial) {
      solarCoreMaterial.uniforms.time.value = time
    }
    
    if (chromosphereMaterial) {
      chromosphereMaterial.uniforms.time.value = time
    }
    
    if (coronaMaterial) {
      coronaMaterial.uniforms.time.value = time
    }
    
    if (prominenceMaterial) {
      prominenceMaterial.uniforms.time.value = time
    }

    // Animate solar core with realistic pulsing
    if (coreRef.current) {
      const corePulse = Math.sin(time * 0.3) * 0.02 + 0.98
      coreRef.current.scale.setScalar(corePulse)
    }

    // Animate chromosphere
    if (chromosphereRef.current) {
      const chromoPulse = Math.sin(time * 0.5 + 1) * 0.03 + 1.02
      chromosphereRef.current.scale.setScalar(chromoPulse)
    }

    // Animate corona with solar wind effects
    if (coronaRef.current) {
      const coronaPulse = Math.sin(time * 0.2 + 2) * 0.05 + 1.05
      coronaRef.current.scale.setScalar(coronaPulse)
    }

    // Animate solar flares/prominences
    solarFlareRefs.current.forEach((flare, i) => {
      if (flare) {
        const flarePhase = time * 0.8 + i * 2
        const flareIntensity = Math.sin(flarePhase) * 0.3 + 0.7
        flare.scale.y = flareIntensity
        flare.rotation.z = Math.sin(time * 0.1 + i) * 0.2
      }
    })

    // Animate lens flares with atmospheric distortion
    lensFlareRefs.current.forEach((flare, i) => {
      if (flare) {
        const distortion = Math.sin(time * 1.5 + i * 0.8) * 0.1 + 0.9
        flare.scale.setScalar(distortion)
        flare.rotation.z = time * 0.2 * (i + 1)
      }
    })
  })

  return (
    <group ref={sunRef} position={position}>
      {/* Solar Core - Main sun body with plasma effects */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[size, 64, 64]} />
        <primitive object={solarCoreMaterial} />
      </mesh>

      {/* Chromosphere - Middle atmospheric layer */}
      <mesh ref={chromosphereRef} scale={1.15}>
        <sphereGeometry args={[size, 48, 48]} />
        <primitive object={chromosphereMaterial} />
      </mesh>

      {/* Corona - Outer solar atmosphere */}
      <mesh ref={coronaRef} scale={1.8}>
        <sphereGeometry args={[size, 32, 32]} />
        <primitive object={coronaMaterial} />
      </mesh>

      {/* Solar Prominences/Flares - Realistic solar jets */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 8
        const height = size * (2 + Math.random())
        const width = size * 0.2
        
        return (
          <mesh
            key={`prominence-${i}`}
            ref={(el) => {
              if (el) solarFlareRefs.current[i] = el
            }}
            position={[
              Math.cos(angle) * size * 1.1,
              Math.sin(angle) * size * 1.1,
              (Math.random() - 0.5) * size * 0.5
            ]}
            rotation={[0, 0, angle + Math.PI / 2]}
          >
            <planeGeometry args={[width, height]} />
            <primitive object={prominenceMaterial} />
          </mesh>
        )
      })}

      {/* Advanced Lens Flare System */}
      {lensFlaresMaterial.map((material, i) => {
        const distance = size * (2 + i * 0.5)
        const flareSize = size * (0.3 + i * 0.2)
        
        return (
          <mesh
            key={`lensflare-${i}`}
            ref={(el) => {
              if (el) lensFlareRefs.current[i] = el
            }}
            scale={flareSize}
          >
            <ringGeometry args={[flareSize * 0.8, flareSize * 1.2, 16]} />
            <primitive object={material} />
          </mesh>
        )
      })}

      {/* Atmospheric Scattering Ring */}
      <mesh scale={3.5}>
        <ringGeometry args={[size * 2.8, size * 3.2, 64]} />
        <meshBasicMaterial
          color="#FFE4B5"
          transparent
          opacity={0.05}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Solar Wind Effect - Particle-like appearance */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 12
        const distance = size * (4 + Math.random() * 2)
        
        return (
          <mesh
            key={`solarwind-${i}`}
            position={[
              Math.cos(angle) * distance,
              Math.sin(angle) * distance,
              (Math.random() - 0.5) * size
            ]}
            scale={size * 0.05}
          >
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial
              color="#FFFF88"
              transparent
              opacity={0.1}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )
      })}
    </group>
  )
}
