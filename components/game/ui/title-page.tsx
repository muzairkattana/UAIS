"use client"

import { useEffect } from "react"
import { useGameState } from "@/lib/game-state-context"

export default function TitlePage() {
  const { hasStarted, setGameStatus } = useGameState()

  // Update the handlePlayButtonClick function to go directly to playing state
  const handlePlayButtonClick = () => {
    if (hasStarted) {
      console.log("Resume button clicked, setting game status directly to playing")
      setGameStatus("playing")
    } else {
      console.log("Play button clicked, setting game status directly to playing")
      setGameStatus("playing")
    }
  }

  // Handle ESC key to resume game
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Escape" && hasStarted) {
        console.log("ESC pressed on title screen, going to paused state")
        setGameStatus("sleeping")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [hasStarted, setGameStatus])

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-50">
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
        className="absolute inset-0 bg-black/60"
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
      
      <div className="max-w-2xl w-full px-4 relative z-10">
        <h1 className="text-7xl font-bold text-center text-white mb-8 drop-shadow-2xl">
          <span className="text-game-primary drop-shadow-lg">U⁵AI²</span>
          <span className="text-game-accent drop-shadow-lg">S⁶</span>
        </h1>

        <div className="space-y-4 max-w-md mx-auto">
          <button
            onClick={handlePlayButtonClick}
            className="w-full py-4 px-6 bg-game-primary/90 hover:bg-game-primary text-white font-bold rounded-xl transition-all duration-300 backdrop-blur-md border border-game-primary/30 shadow-xl hover:shadow-2xl hover:scale-105 transform"
          >
            {hasStarted ? "Resume Game" : "Start Game"}
          </button>

          <button
            onClick={() => setGameStatus("settings")}
            className="w-full py-4 px-6 bg-gray-800/80 hover:bg-gray-700/90 text-white font-bold rounded-xl transition-all duration-300 backdrop-blur-md border border-gray-600/30 shadow-lg hover:shadow-xl hover:scale-105 transform"
          >
            Settings
          </button>

          <button
            onClick={() => setGameStatus("howToPlay")}
            className="w-full py-4 px-6 bg-gray-800/80 hover:bg-gray-700/90 text-white font-bold rounded-xl transition-all duration-300 backdrop-blur-md border border-gray-600/30 shadow-lg hover:shadow-xl hover:scale-105 transform"
          >
            How to Play
          </button>
        </div>

        {hasStarted && (
          <div className="mt-6 text-center text-gray-400">
            <p>Press ESC to resume game</p>
          </div>
        )}

        <div className="mt-12 text-gray-300 text-center text-sm backdrop-blur-sm bg-black/20 rounded-lg p-3">
          <p className="drop-shadow-lg">© 2025 UZAIR AI STUDIO. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
