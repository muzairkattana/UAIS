"use client"

import { useEffect } from "react"
import { useGameState } from "@/lib/game-state-context"

export default function TitlePage() {
  const { hasStarted, setGameStatus } = useGameState()

  // Update the handlePlayButtonClick function to go directly to playing state if already started
  const handlePlayButtonClick = () => {
    if (hasStarted) {
      console.log("Resume button clicked, setting game status directly to playing")
      setGameStatus("playing")
    } else {
      console.log("Play button clicked, setting game status to playing")
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
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/background.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>
      
      {/* Overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Animated floating elements for depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-green-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-blue-300/20 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-emerald-300/20 rounded-full blur-lg animate-pulse delay-2000"></div>
      </div>

      {/* Menu Container with Glass Effect */}
      <div className="relative z-10 w-96 max-w-sm mx-4 bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 space-y-8 text-center border border-white/20">
        {/* Game Title */}
        <h1 className="text-5xl font-bold text-white drop-shadow-2xl select-none" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
          <span className="text-emerald-300 drop-shadow-lg">U⁵</span>
          <span className="text-sky-300 drop-shadow-lg">AI²</span>
          <span className="text-blue-300 drop-shadow-lg">S⁶</span>
        </h1>

        {/* Navigation Buttons */}
        <nav className="flex flex-col space-y-4">
          <button
            onClick={handlePlayButtonClick}
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold py-4 px-6 text-lg shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-300/50"
            type="button"
          >
            <span className="relative z-10">{hasStarted ? "Resume Game" : "Start Game"}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </button>

          <button
            onClick={() => setGameStatus("settings")}
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white font-semibold py-4 px-6 text-lg shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-sky-300/50"
            type="button"
          >
            <span className="relative z-10">Options</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </button>

          <button
            onClick={() => setGameStatus("howToPlay")}
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-4 px-6 text-lg shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300/50"
            type="button"
          >
            <span className="relative z-10">How to Play</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </button>

          <button
            onClick={() => window.close()}
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-semibold py-4 px-6 text-lg shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-slate-300/50"
            type="button"
          >
            <span className="relative z-10">Exit</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </button>
        </nav>

        {/* Resume Game Hint */}
        {hasStarted && (
          <div className="mt-6 text-center">
            <p className="text-white/80 text-sm bg-black/20 rounded-full px-4 py-2 backdrop-blur-sm border border-white/10">
              Press ESC to resume game
            </p>
          </div>
        )}
      </div>

      {/* Copyright Footer */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <p className="text-white/60 text-sm font-medium drop-shadow-md">
          © 2025 UZAIR AI STUDIO
        </p>
      </div>
    </div>
  )
}
