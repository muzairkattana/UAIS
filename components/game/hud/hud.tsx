"use client"
import { useEffect } from "react"
import Crosshair from "./crosshair"
import AmmoCounter from "./ammo-counter"
import Toolbar from "./toolbar"
import InventoryGrid from "./inventory-grid"
import CraftingGrid from "./crafting-grid"
import StatusBars from "./status-bars"
import CampfireInventory from "../ui/campfire-inventory"
import InteractionPrompt from "./interaction-prompt"
import AdvancedMinimap from "../ui/AdvancedMinimap"
import TestMinimap from "../ui/TestMinimap"
import { useInventory } from "@/lib/inventory-context"
import { useCrafting } from "@/lib/crafting-context"
import { useInteraction } from "@/lib/interaction-context"
import { useGameState } from "@/lib/game-context"
import * as THREE from "three"

interface HUDProps {
  isLocked: boolean
  terrainReady: boolean
  showCrosshair?: boolean
  ammo?: { current: number; reserve: number }
  pointerLockSupported?: boolean
  pointerLockError?: any
  returningFromTitle?: boolean
  gameStatus?: string
}

export default function HUD({
  isLocked,
  terrainReady,
  showCrosshair = true,
  ammo = { current: 30, reserve: 90 },
  pointerLockSupported = true,
  pointerLockError = null,
  returningFromTitle = false,
  gameStatus = "playing",
}: HUDProps) {
  const { isOpen: isInventoryOpen, activeCampfire, inventoryOpenedBy } = useInventory()
  const { setIsOpen: setCraftingOpen } = useCrafting()
  const { showPrompt, promptMessage } = useInteraction()
  const { playerPosition, playerRotation, terrainHeightData, terrainSize, treeInstances, stoneInstances, placedItems, enemies, placedDoors, villageHouses } = useGameState()

  // Debug minimap conditions
  console.log('HUD Debug:', {
    isLocked,
    isInventoryOpen,
    terrainReady,
    shouldShowMinimap: isLocked && !isInventoryOpen && terrainReady,
    playerPosition,
    terrainHeightData: terrainHeightData ? terrainHeightData.length : 0,
    villageHouses: villageHouses ? villageHouses.length : 0
  })

  // When inventory is opened or closed, also open or close crafting, but only if opened via Tab
  useEffect(() => {
    setCraftingOpen(isInventoryOpen && inventoryOpenedBy === "tab")
  }, [isInventoryOpen, inventoryOpenedBy, setCraftingOpen])

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Crosshair - only show when locked and not in inventory */}
      {isLocked && showCrosshair && !isInventoryOpen && <Crosshair />}

      {/* Ammo counter - only show when locked and not in inventory */}
      {isLocked && !isInventoryOpen && <AmmoCounter current={ammo.current} reserve={ammo.reserve} />}

      {/* Status bars - always show when playing */}
      {isLocked && !isInventoryOpen && <StatusBars />}

      {/* Interaction prompt - show when near interactable items */}
      {isLocked && !isInventoryOpen && showPrompt && <InteractionPrompt />}

      {/* Toolbar - always show, regardless of inventory state */}
      <Toolbar />

      {/* Inventory - always render but control visibility inside component */}
      <InventoryGrid visible={isInventoryOpen} />

      {/* Crafting - only show when inventory opened via Tab */}
      <CraftingGrid visible={isInventoryOpen && inventoryOpenedBy === "tab"} />

      {/* Test Minimap - always show for debugging */}
      <TestMinimap />
      
      {/* AdvancedMinimap - always show for testing (no conditions) */}
      <AdvancedMinimap
        terrainHeightData={terrainHeightData || []}
        terrainSize={terrainSize || { width: 400, depth: 400 }}
        playerPosition={new THREE.Vector3(playerPosition?.x || 0, playerPosition?.y || 0, playerPosition?.z || 0)}
        playerRotation={playerRotation || 0}
        trees={treeInstances || []}
        stones={stoneInstances || []}
        placedItems={placedItems || []}
        villageHouses={villageHouses || []}
        enemies={enemies || []}
        placedDoors={placedDoors || []}
        campfires={[]}
        storageBoxes={[]}
      />

      {/* Campfire inventory - show when active campfire is set */}
      {activeCampfire && (
        <CampfireInventory
          campfireId={activeCampfire}
          onClose={() => {}}
          onIgnite={(campfireId) => console.log(`Igniting campfire ${campfireId}`)}
          isActive={false}
        />
      )}
    </div>
  )
}
