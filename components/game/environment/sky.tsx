"use client"

import React, { useMemo } from 'react'
import * as THREE from 'three'
import Sun from './sun'
import Clouds from './clouds'

interface SkyProps {
  sunPosition?: [number, number, number]
  cloudCount?: number
  cloudDensity?: number
  timeOfDay?: 'dawn' | 'day' | 'dusk' | 'night'
}

export default function Sky({ 
  sunPosition = [100, 120, 50], 
  cloudCount = 12,
  cloudDensity = 0.6,
  timeOfDay = 'day'
}: SkyProps) {
  
  // Create sky dome with gradient
  const skyMaterial = useMemo(() => {
    const vertexShader = `
      varying vec3 vWorldPosition;
      
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `

    const fragmentShader = `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      uniform vec3 sunDirection;
      uniform vec3 sunColor;
      uniform float sunIntensity;
      
      varying vec3 vWorldPosition;
      
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        
        // Basic sky gradient
        vec3 skyColor = mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0));
        
        // Add sun glow effect
        vec3 viewDirection = normalize(vWorldPosition);
        float sunProximity = dot(viewDirection, normalize(sunDirection));
        float sunGlow = pow(max(sunProximity, 0.0), 15.0) * sunIntensity;
        
        // Mix sun glow with sky
        vec3 finalColor = skyColor + sunColor * sunGlow;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `

    // Sky colors based on time of day
    const skyColors = {
      dawn: {
        top: new THREE.Color(0x87CEEB),    // Light blue
        bottom: new THREE.Color(0xFFB6C1), // Light pink
        sun: new THREE.Color(0xFFA500)     // Orange
      },
      day: {
        top: new THREE.Color(0x4169E1),    // Royal blue
        bottom: new THREE.Color(0x87CEEB), // Sky blue
        sun: new THREE.Color(0xFFD700)     // Gold
      },
      dusk: {
        top: new THREE.Color(0x191970),    // Midnight blue
        bottom: new THREE.Color(0xFF4500), // Orange red
        sun: new THREE.Color(0xFF6347)     // Tomato
      },
      night: {
        top: new THREE.Color(0x000000),    // Black
        bottom: new THREE.Color(0x191970), // Midnight blue
        sun: new THREE.Color(0xC0C0C0)     // Silver (moon)
      }
    }

    const colors = skyColors[timeOfDay]

    return new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: colors.top },
        bottomColor: { value: colors.bottom },
        offset: { value: 33 },
        exponent: { value: 0.6 },
        sunDirection: { value: new THREE.Vector3(...sunPosition).normalize() },
        sunColor: { value: colors.sun },
        sunIntensity: { value: 0.3 }
      },
      vertexShader,
      fragmentShader,
      side: THREE.BackSide,
      depthWrite: false
    })
  }, [sunPosition, timeOfDay])

  // Adjust sun properties based on time of day
  const sunProps = useMemo(() => {
    const props = {
      dawn: { color: "#FFA500", intensity: 0.8, size: 6 },
      day: { color: "#FFD700", intensity: 1.2, size: 8 },
      dusk: { color: "#FF6347", intensity: 0.9, size: 7 },
      night: { color: "#C0C0C0", intensity: 0.3, size: 4 }
    }
    return props[timeOfDay]
  }, [timeOfDay])

  return (
    <>
      {/* Sky dome */}
      <mesh scale={[1000, 1000, 1000]}>
        <sphereGeometry args={[1, 32, 32]} />
        <primitive object={skyMaterial} />
      </mesh>

      {/* Sun */}
      <Sun 
        position={sunPosition}
        color={sunProps.color}
        intensity={sunProps.intensity}
        size={sunProps.size}
      />

      {/* Clouds */}
      <Clouds 
        count={cloudCount}
        density={cloudDensity}
        spread={600}
        height={100}
      />

      {/* Add atmospheric scattering effect */}
      <mesh scale={[800, 800, 800]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={timeOfDay === 'day' ? 0x87CEEB : 0x4169E1}
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
    </>
  )
}
