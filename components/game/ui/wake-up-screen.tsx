"use client"

import { useEffect, useState } from "react"
import { useGameState } from "@/lib/game-state-context"
import { useInventory } from "@/lib/inventory-context"
import Image from "next/image"

interface WakeUpScreenProps {
  onWakeUp: () => void
}

export default function WakeUpScreen({ onWakeUp }: WakeUpScreenProps) {
  const { setGameStatus } = useGameState()
  const { isOpen, setIsOpen } = useInventory()
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)

  // Handle ESC key to return to title
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        console.log("ESC pressed in wake-up screen, returning to title")
        // Ensure inventory is closed when going to title
        if (isOpen) {
          setIsOpen(false)
        }
        setGameStatus("title")
      } else if (e.code === "Space" || e.code === "Enter") {
        console.log("Space or Enter pressed, waking up")
        // Ensure inventory is closed when waking up
        if (isOpen) {
          setIsOpen(false)
        }
        onWakeUp()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onWakeUp, setGameStatus, isOpen, setIsOpen])

  // Handle resume game
  const handleResumeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Resume button clicked, calling onWakeUp")
    // Ensure inventory is closed when waking up
    if (isOpen) {
      setIsOpen(false)
    }
    onWakeUp()
  }

  // Handle return to main menu
  const handleReturnToMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Return to menu clicked")
    // Ensure inventory is closed when going to title
    if (isOpen) {
      setIsOpen(false)
    }
    setGameStatus("title")
  }

  return (
    <div className="absolute inset-0 z-40">
      {/* Background with blur overlay */}
      <div className="absolute inset-0">
        <Image
          src="/background.png"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      {/* Main content */}
      <div className="relative flex flex-col items-center justify-center min-h-screen p-4">
        {/* Glass panel */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl max-w-md w-full">
          {/* Game title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
              UAIS
            </h1>
            <p className="text-white/80 text-lg drop-shadow-md">Game Paused</p>
          </div>

          {/* Menu buttons */}
          <div className="space-y-4">
            <button
              className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 transform ${
                hoveredButton === 'resume'
                  ? 'bg-white/25 text-white scale-105 shadow-xl backdrop-blur-xl'
                  : 'bg-white/15 text-white/90 hover:bg-white/20 backdrop-blur-lg'
              } border border-white/30 hover:border-white/50`}
              onMouseEnter={() => setHoveredButton('resume')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={handleResumeClick}
            >
              Resume Game
            </button>

            <button
              className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 transform ${
                hoveredButton === 'menu'
                  ? 'bg-white/25 text-white scale-105 shadow-xl backdrop-blur-xl'
                  : 'bg-white/15 text-white/90 hover:bg-white/20 backdrop-blur-lg'
              } border border-white/30 hover:border-white/50`}
              onMouseEnter={() => setHoveredButton('menu')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={handleReturnToMenu}
            >
              Return to Menu
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-white/70 text-sm drop-shadow-sm">
              Press <span className="text-white font-semibold">Space</span> or <span className="text-white font-semibold">Enter</span> to resume
            </p>
            <p className="text-white/70 text-sm drop-shadow-sm">
              Press <span className="text-white font-semibold">ESC</span> to return to main menu
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center">
          <p className="text-white/50 text-sm drop-shadow-sm">
            © 2025 UZAIR AI STUDIO
          </p>
        </div>
      </div>
    </div>
  )
}
