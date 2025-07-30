"use client"

import { useState, useEffect, useCallback } from 'react'
import * as THREE from 'three'

// Time constants
const SECONDS_IN_DAY = 86400 // 24 hours * 60 minutes * 60 seconds
const DEFAULT_DAY_DURATION = 1200 // 20 minutes in real time = 1 game day

export type TimeOfDay = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk'

export interface TimeState {
  // Current time (0-1, where 0 is midnight, 0.5 is noon)
  timeOfDay: number
  // Time period name
  period: TimeOfDay
  // Sun position in 3D space
  sunPosition: THREE.Vector3
  // Sun direction (normalized)
  sunDirection: THREE.Vector3
  // Sky colors
  skyColors: {
    top: THREE.Color
    bottom: THREE.Color
    horizon: THREE.Color
  }
  // Sun properties
  sun: {
    color: THREE.Color
    intensity: number
    size: number
  }
  // Lighting properties
  lighting: {
    ambient: {
      color: THREE.Color
      intensity: number
    }
    directional: {
      color: THREE.Color
      intensity: number
    }
  }
}

export interface TimeSystemConfig {
  // Duration of one full day in seconds (real time)
  dayDuration?: number
  // Starting time (0-1, where 0 is midnight)
  startTime?: number
  // Whether time should automatically progress
  autoProgress?: boolean
  // Time speed multiplier
  timeSpeed?: number
}

class TimeSystem {
  private config: Required<TimeSystemConfig>
  private currentTime: number = 0
  private lastUpdateTime: number = 0
  private callbacks: Set<(timeState: TimeState) => void> = new Set()

  constructor(config: TimeSystemConfig = {}) {
    this.config = {
      dayDuration: config.dayDuration ?? DEFAULT_DAY_DURATION,
      startTime: config.startTime ?? 0.25, // Start at dawn
      autoProgress: config.autoProgress ?? true,
      timeSpeed: config.timeSpeed ?? 1
    }
    
    this.currentTime = this.config.startTime
    this.lastUpdateTime = Date.now()
  }

  public subscribe(callback: (timeState: TimeState) => void): () => void {
    this.callbacks.add(callback)
    // Immediately call with current state
    callback(this.getTimeState())
    
    return () => {
      this.callbacks.delete(callback)
    }
  }

  public update(): void {
    if (!this.config.autoProgress) return

    const now = Date.now()
    const deltaTime = (now - this.lastUpdateTime) / 1000 // Convert to seconds
    this.lastUpdateTime = now

    // Progress time
    const timeProgress = (deltaTime * this.config.timeSpeed) / this.config.dayDuration
    this.currentTime = (this.currentTime + timeProgress) % 1

    // Notify subscribers
    const timeState = this.getTimeState()
    this.callbacks.forEach(callback => callback(timeState))
  }

  public setTime(time: number): void {
    this.currentTime = Math.max(0, Math.min(1, time))
    const timeState = this.getTimeState()
    this.callbacks.forEach(callback => callback(timeState))
  }

  public getTime(): number {
    return this.currentTime
  }

  public setConfig(newConfig: Partial<TimeSystemConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  private getTimeState(): TimeState {
    const time = this.currentTime
    const period = this.getTimePeriod(time)
    const sunPosition = this.calculateSunPosition(time)
    const sunDirection = sunPosition.clone().normalize()
    const skyColors = this.calculateSkyColors(time)
    const sunProperties = this.calculateSunProperties(time)
    const lighting = this.calculateLighting(time)

    return {
      timeOfDay: time,
      period,
      sunPosition,
      sunDirection,
      skyColors,
      sun: sunProperties,
      lighting
    }
  }

  private getTimePeriod(time: number): TimeOfDay {
    // Map full day cycle (0-1) to daytime only periods
    // 0.0-0.2 = dawn, 0.2-0.4 = morning, 0.4-0.6 = noon, 0.6-0.8 = afternoon, 0.8-1.0 = dusk
    if (time >= 0.0 && time < 0.2) return 'dawn'
    if (time >= 0.2 && time < 0.4) return 'morning'
    if (time >= 0.4 && time < 0.6) return 'noon'
    if (time >= 0.6 && time < 0.8) return 'afternoon'
    return 'dusk'
  }

  private calculateSunPosition(time: number): THREE.Vector3 {
    // Sun moves in an arc across the sky during daytime only
    // time 0 = dawn (sun at horizon), time 0.5 = noon (sun at zenith), time 1 = dusk (sun at horizon)
    
    // Convert time to angle (0-π) - only the top half of the arc
    const angle = time * Math.PI // 0 to π
    
    // Sun height based on sine wave - always above horizon
    const sunHeight = Math.sin(angle) * 80 + 30 // Height varies from 30 to 110
    
    // Sun moves east to west
    const sunX = Math.cos(angle) * 150 // East-West movement
    const sunZ = Math.sin(angle * 0.3) * 30 // Slight North-South variation
    
    return new THREE.Vector3(sunX, sunHeight, sunZ)
  }

  private calculateSkyColors(time: number): { top: THREE.Color; bottom: THREE.Color; horizon: THREE.Color } {
    // Define key color points throughout the daytime only
    const colorKeys = [
      // Dawn (0.0)
      { time: 0.0, top: new THREE.Color(0x4B0082), bottom: new THREE.Color(0xFF6B35), horizon: new THREE.Color(0xFFB347) },
      // Early morning (0.2)
      { time: 0.2, top: new THREE.Color(0x87CEEB), bottom: new THREE.Color(0xFFA07A), horizon: new THREE.Color(0xFFDAB9) },
      // Morning (0.4)
      { time: 0.4, top: new THREE.Color(0x4169E1), bottom: new THREE.Color(0x87CEEB), horizon: new THREE.Color(0x87CEEB) },
      // Noon (0.5)
      { time: 0.5, top: new THREE.Color(0x4169E1), bottom: new THREE.Color(0x87CEEB), horizon: new THREE.Color(0x87CEEB) },
      // Afternoon (0.6)
      { time: 0.6, top: new THREE.Color(0x4169E1), bottom: new THREE.Color(0x87CEEB), horizon: new THREE.Color(0x87CEEB) },
      // Late afternoon (0.8)
      { time: 0.8, top: new THREE.Color(0x8B008B), bottom: new THREE.Color(0xFF4500), horizon: new THREE.Color(0xFF6347) },
      // Dusk (1.0)
      { time: 1.0, top: new THREE.Color(0x4B0082), bottom: new THREE.Color(0xFF6B35), horizon: new THREE.Color(0xFFB347) },
    ]

    // Find the two closest key points
    let beforeKey = colorKeys[0]
    let afterKey = colorKeys[colorKeys.length - 1]

    for (let i = 0; i < colorKeys.length - 1; i++) {
      if (time >= colorKeys[i].time && time <= colorKeys[i + 1].time) {
        beforeKey = colorKeys[i]
        afterKey = colorKeys[i + 1]
        break
      }
    }

    // Handle wrap-around (midnight to dawn)
    if (time < colorKeys[0].time || time > colorKeys[colorKeys.length - 1].time) {
      beforeKey = colorKeys[colorKeys.length - 1]
      afterKey = colorKeys[0]
    }

    // Interpolate between the two key points
    const timeDiff = afterKey.time - beforeKey.time
    let t = timeDiff === 0 ? 0 : (time - beforeKey.time) / timeDiff

    // Handle wrap-around interpolation
    if (t < 0) t += 1
    if (t > 1) t -= 1

    // Smooth interpolation
    t = t * t * (3 - 2 * t) // Smoothstep function

    return {
      top: beforeKey.top.clone().lerp(afterKey.top, t),
      bottom: beforeKey.bottom.clone().lerp(afterKey.bottom, t),
      horizon: beforeKey.horizon.clone().lerp(afterKey.horizon, t)
    }
  }

  private calculateSunProperties(time: number): { color: THREE.Color; intensity: number; size: number } {
    // Sun properties change throughout the daytime only
    // time 0 = dawn, time 0.5 = noon, time 1 = dusk
    const sunAngle = time * Math.PI // 0 to π
    const sunHeight = Math.sin(sunAngle) // 0 to 1 to 0

    let color: THREE.Color
    let intensity: number
    let size: number

    if (time <= 0.1 || time >= 0.9) {
      // Dawn/Dusk - deep orange/red sun
      color = new THREE.Color(0xFF6B35) // Deep orange-red
      intensity = 0.7
      size = 22
    } else if (time <= 0.3 || time >= 0.7) {
      // Early morning/Late afternoon - warm golden sun
      color = new THREE.Color(0xFFD700) // Bright gold
      intensity = 0.9
      size = 20
    } else {
      // Mid-day - brilliant white sun
      color = new THREE.Color(0xFFFFF0) // Ivory white
      intensity = 1.2
      size = 18
    }

    return { color, intensity, size }
  }

  private calculateLighting(time: number): { ambient: { color: THREE.Color; intensity: number }; directional: { color: THREE.Color; intensity: number } } {
    // Daytime-only lighting system
    // time 0 = dawn, time 0.5 = noon, time 1 = dusk
    const sunAngle = time * Math.PI // 0 to π
    const sunHeight = Math.sin(sunAngle) // 0 to 1 to 0

    let ambientColor: THREE.Color
    let ambientIntensity: number
    let directionalColor: THREE.Color
    let directionalIntensity: number

    if (time <= 0.1 || time >= 0.9) {
      // Dawn/Dusk - warm lighting
      ambientColor = new THREE.Color(0xFFA07A) // Light salmon
      ambientIntensity = 0.5
      directionalColor = new THREE.Color(0xFF4500) // Orange red
      directionalIntensity = 0.7
    } else if (time <= 0.3 || time >= 0.7) {
      // Early morning/Late afternoon - golden lighting
      ambientColor = new THREE.Color(0xFFDAB9) // Peach puff
      ambientIntensity = 0.6
      directionalColor = new THREE.Color(0xFFD700) // Gold
      directionalIntensity = 0.8
    } else {
      // Mid-day - bright white lighting
      ambientColor = new THREE.Color(0xFFFFFF) // White
      ambientIntensity = 0.7
      directionalColor = new THREE.Color(0xFFFFE0) // Light yellow
      directionalIntensity = 1.0
    }

    return {
      ambient: { color: ambientColor, intensity: ambientIntensity },
      directional: { color: directionalColor, intensity: directionalIntensity }
    }
  }
}

// Global time system instance
let globalTimeSystem: TimeSystem | null = null

export function useTimeSystem(config?: TimeSystemConfig) {
  // Initialize global time system if it doesn't exist
  if (!globalTimeSystem) {
    globalTimeSystem = new TimeSystem(config)
  }

  const [timeState, setTimeState] = useState<TimeState>(() => globalTimeSystem!.getTimeState())

  useEffect(() => {
    const unsubscribe = globalTimeSystem!.subscribe(setTimeState)
    return unsubscribe
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      globalTimeSystem!.update()
    }, 100) // Update 10 times per second

    return () => clearInterval(interval)
  }, [])

  const setTime = useCallback((time: number) => {
    globalTimeSystem!.setTime(time)
  }, [])

  const setConfig = useCallback((newConfig: Partial<TimeSystemConfig>) => {
    globalTimeSystem!.setConfig(newConfig)
  }, [])

  return {
    timeState,
    setTime,
    setConfig,
    currentTime: timeState.timeOfDay
  }
}

export default TimeSystem
