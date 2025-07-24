"use client"

import { useEffect, useState } from "react"

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: 'url(/MENU_WALLPAPER.png)',
          backgroundSize: '45% auto',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      {/* Dark overlay with cutout for entire bordered section */}
      <div 
        className="absolute inset-0 bg-black/70"
        style={{
          maskImage: 'radial-gradient(ellipse 286px 107.5px at 686px 573.5px, transparent 50%, black 52%)',
          WebkitMaskImage: 'radial-gradient(ellipse 286px 107.5px at 686px 573.5px, transparent 50%, black 52%)'
        }}
      />
      
      {/* Blur overlay with cutout for entire bordered section */}
      <div 
        className="absolute inset-0 backdrop-blur-sm"
        style={{
          maskImage: 'radial-gradient(ellipse 286px 107.5px at 686px 573.5px, transparent 50%, black 52%)',
          WebkitMaskImage: 'radial-gradient(ellipse 286px 107.5px at 686px 573.5px, transparent 50%, black 52%)'
        }}
      />
      
      {/* Border and section for UZAIR AI STUDIO text */}
      <div 
        className="absolute"
        style={{
          left: '550px',
          top: '526px',
          width: '272px',
          height: '95px',
          border: '2px solid rgba(59, 130, 246, 0.6)',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
          backdropFilter: 'brightness(1.2) contrast(1.1)',
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)',
          zIndex: 6
        }}
      >
        {/* Inner glow effect */}
        <div 
          className="absolute inset-0 rounded-lg"
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.2) 50%, transparent 70%)',
            animation: 'pulse 3s ease-in-out infinite'
          }}
        />
      </div>
      
      <div className="text-center relative z-10">
        <h1 className="text-7xl font-bold mb-12 drop-shadow-2xl">
          <span className="text-game-primary drop-shadow-lg">U⁵AI²</span>
          <span className="text-game-accent drop-shadow-lg">S⁶</span>
        </h1>
        
        <div className="w-80 h-3 bg-black/40 rounded-full overflow-hidden backdrop-blur-md border border-white/20 shadow-2xl">
          <div
            className="h-full bg-gradient-to-r from-game-primary via-game-accent to-game-primary transition-all duration-500 shadow-lg"
            style={{ 
              width: `${Math.min(progress, 100)}%`,
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
            }}
          />
        </div>
        
        <p className="text-white/90 mt-6 text-lg font-medium drop-shadow-lg backdrop-blur-sm bg-black/20 rounded-lg px-4 py-2 inline-block">
          Loading assets... {Math.round(progress)}%
        </p>
      </div>
    </div>
  )
}
