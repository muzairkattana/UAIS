"use client"

import type React from "react"
import { useGameState } from "@/lib/game-state-context"
import { useSettings } from "@/lib/settings-context"
import { Button } from "@/components/ui/button"

interface PauseMenuProps {
  onResume: () => void
}

const PauseMenu: React.FC<PauseMenuProps> = ({ onResume }) => {
  const { setGameStatus } = useGameState()
  const { settings } = useSettings()

  const handleQuitToTitle = () => {
    setGameStatus("title")
  }

  const handleOptions = () => {
    setGameStatus("settings")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay with low-poly landscape feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95">
        {/* Subtle pattern overlay for depth */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)
            `
          }}
        />
      </div>

      {/* Glass effect container */}
      <div className="relative">
        {/* Glass background */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl" />
        
        {/* Content */}
        <div className="relative px-12 py-16 text-center min-w-[400px]">
          {/* Title */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-wide">
              Game Paused
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-green-400 mx-auto rounded-full" />
          </div>

          {/* Menu buttons */}
          <div className="space-y-4">
            <Button
              onClick={onResume}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-blue-400/30"
            >
              <span className="text-lg">Resume Game</span>
            </Button>

            <Button
              onClick={handleOptions}
              className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-slate-400/30"
            >
              <span className="text-lg">Options</span>
            </Button>

            <Button
              onClick={handleQuitToTitle}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-red-400/30"
            >
              <span className="text-lg">Quit to Title</span>
            </Button>
          </div>

          {/* Subtitle */}
          <p className="text-slate-300 mt-12 text-sm">
            Press <kbd className="bg-slate-700 px-2 py-1 rounded text-xs font-mono mx-1">ESC</kbd> to resume
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-white/30 rounded-tl-lg" />
        <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-white/30 rounded-tr-lg" />
        <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-white/30 rounded-bl-lg" />
        <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-white/30 rounded-br-lg" />
      </div>

      {/* Ambient particles effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default PauseMenu
