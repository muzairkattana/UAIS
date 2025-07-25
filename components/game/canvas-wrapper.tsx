"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

// Dynamically import Canvas to avoid SSR issues
const Canvas = dynamic(
  () => import("@react-three/fiber").then((mod) => ({ default: mod.Canvas })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <div className="text-white">Loading 3D Scene...</div>
      </div>
    ),
  }
)

const Stats = dynamic(
  () => import("@react-three/drei").then((mod) => ({ default: mod.Stats })),
  { ssr: false }
)

interface CanvasWrapperProps {
  children: React.ReactNode
  showStats?: boolean
  shadows?: boolean
  camera?: any
  gl?: any
  performance?: any
  dpr?: number
  onClick?: (event: React.MouseEvent) => void
  onWheel?: (event: React.WheelEvent) => void
}

export default function CanvasWrapper({
  children,
  showStats = false,
  shadows = true,
  camera = { fov: 75, near: 0.1, far: 1000 },
  gl = {
    antialias: true,
    powerPreference: "high-performance",
    alpha: false,
    stencil: false,
    depth: true,
    logarithmicDepthBuffer: false,
  },
  performance = { min: 0.5 },
  dpr = 1,
  onClick,
  onWheel,
}: CanvasWrapperProps) {
  return (
    <div className="w-full h-full relative" onClick={onClick} onWheel={onWheel} style={{ width: '100vw', height: '100vh' }}>
      <Suspense
        fallback={
          <div className="w-full h-full bg-black flex items-center justify-center">
            <div className="text-white">Loading 3D Scene...</div>
          </div>
        }
      >
        <Canvas
          shadows={shadows}
          camera={camera}
          gl={{
            ...gl,
            preserveDrawingBuffer: false,
            failIfMajorPerformanceCaveat: false,
          }}
          performance={performance}
          dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1} // Cap DPR to prevent scaling issues
          style={{ display: 'block', width: '100%', height: '100%' }}
          resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
        >
          {children}
          {showStats && <Stats />}
        </Canvas>
      </Suspense>
    </div>
  )
}
