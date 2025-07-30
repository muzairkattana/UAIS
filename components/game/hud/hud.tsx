"use client"
import { useEffect } from "react"
import AmmoCounter from "./ammo-counter"
import Toolbar from "./toolbar"
import InventoryGrid from "./inventory-grid"
import CraftingGrid from "./crafting-grid"
import StatusBars from "./status-bars"
import CampfireInventory from "../ui/campfire-inventory"
import InteractionPrompt from "./interaction-prompt"
import AdvancedMinimap from "../ui/AdvancedMinimap"
import BuildingHUD from "../ui/BuildingHUD"
import { ConstructionUI } from "../ui/ConstructionInterface"
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

  // When inventory is opened or closed, also open or close crafting, but only if opened via I key
  useEffect(() => {
    setCraftingOpen(isInventoryOpen && inventoryOpenedBy === "tab")
  }, [isInventoryOpen, inventoryOpenedBy, setCraftingOpen])

  return (
    <div className="absolute inset-0 pointer-events-none">

      {/* Ammo counter - always show when not in inventory */}
      {!isInventoryOpen && <AmmoCounter current={ammo.current} reserve={ammo.reserve} />}

      {/* Status bars - always show when playing */}
      {!isInventoryOpen && <StatusBars />}

      {/* Interaction prompt - show when near interactable items */}
      {!isInventoryOpen && showPrompt && <InteractionPrompt />}

      {/* Toolbar - always show, regardless of inventory state */}
      <Toolbar />

      {/* Inventory - always render but control visibility inside component */}
      <InventoryGrid visible={isInventoryOpen} />

      {/* Crafting - only show when inventory opened via Tab */}
      <CraftingGrid visible={isInventoryOpen && inventoryOpenedBy === "tab"} />

      
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

      {/* Building HUD - show when terrain is ready and not in inventory */}
      {/* {isLocked && !isInventoryOpen && terrainReady && <BuildingHUD />} */}

      {/* Campfire inventory - show when active campfire is set */}
      {activeCampfire && (
        <CampfireInventory
          campfireId={activeCampfire}
          onClose={() => {}}
          onIgnite={(campfireId) => console.log(`Igniting campfire ${campfireId}`)}
          isActive={false}
        />
      )}

      {/* Construction UI - render outside R3F context */}
      <ConstructionUI isActive={terrainReady && gameStatus === "playing"} />
    </div>
  )
}
