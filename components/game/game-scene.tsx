"use client"

import type React from "react"

import { useEffect, useState, useRef, useMemo } from "react"
import { useThree } from "@react-three/fiber"
import { PointerLockControls } from "@react-three/drei"
import { Physics } from "@react-three/cannon"
import * as THREE from "three"

import Player from "./player/player"
import Trees from "./environment/trees"
import StoneNodes from "./environment/stone-nodes"
import { useGameState as useGameContext } from "@/lib/game-context"
import { usePlayerStatus } from "@/lib/player-status-context"
import { useSettings } from "@/lib/settings-context"
import { useGameState } from "@/lib/game-state-context"
import { useToolbar } from "@/lib/toolbar-context"
import { useInventory } from "@/lib/inventory-context"
import { useCampfire } from "@/lib/campfire-context"
import { useStorageBox } from "@/lib/storage-box-context"
import { TerrainGenerator, type TerrainParams } from "@/lib/terrain-generator"

// Import weapons and tools
import Weapon from "./weapons/weapon"
import Hatchet from "./tools/hatchet"
import Pickaxe from "./tools/pickaxe"
import BuildingPlan from "./tools/building-plan"

// Import item manager
import { useItemManager } from "@/lib/item-manager-context"

// Import placers
import CampfirePlacer from "./tools/campfire-placer"
import StorageBoxPlacer from "./tools/storage-box-placer"
import DoorPlacer from "./tools/door-placer"

// Import interactions
import CampfireInteraction from "./items/campfire-interaction"
import StorageBoxInteraction from "./items/storage-box-interaction"
import Door from "./items/door"
import House from "./items/house"
import HouseInteraction from "./items/house-interaction"
import AdvancedHouseInteraction from "./items/advanced-house-interaction"
import { findBestHouseLocation } from "./utils/house-placement"

// Import different house types for village
import { CabinHouse } from '../../src/components/CabinHouse';
import { HutHouse } from '../../src/components/HutHouse';
import StoneHouse from '../../src/components/game/StoneHouse';
import TentHouse from '../TentHouse';
import StorageBox from "./items/storage-box"
import Campfire from "./items/campfire"

// Import enemy components
import ForestGoblin from "./enemies/ForestGoblin"
import SwampCrawler from "./enemies/SwampCrawler"
import ShadowBandit from "./enemies/ShadowBandit"
import RockGolem from "./enemies/RockGolem"

export const MAX_RENDER_DISTANCE = 150

interface GameSceneProps {
  isLocked: boolean
  setIsLocked: (locked: boolean) => void
  onTerrainReady: (ready: boolean) => void
  maxRenderDistance: number
  fogDensity: number
  onAmmoChange: (ammo: { current: number; reserve: number }) => void
  onPointerLockError: (error: any) => void
  onCampfirePromptChange: (showPrompt: boolean) => void
  onCampfireInteraction: (campfireId: string | null) => void
  activeCampfire: string | null
  placedCampfires: Array<{
    id: string
    position: [number, number, number]
    isActive?: boolean
  }>
  setPlacedCampfires: React.Dispatch<
    React.SetStateAction<
      Array<{
        id: string
        position: [number, number, number]
        isActive?: boolean
      }>
    >
  >
  onStorageBoxPromptChange: (showPrompt: boolean) => void
  onStorageBoxInteraction: (storageBoxId: string | null) => void
  activeStorageBox: string | null
  placedStorageBoxes: Array<{
    id: string
    position: [number, number, number]
    normal?: [number, number, number]
  }>
  setPlacedStorageBoxes: React.Dispatch<
    React.SetStateAction<
      Array<{
        id: string
        position: [number, number, number]
        normal?: [number, number, number]
      }>
    >
  >
}

export default function GameScene({
  isLocked,
  setIsLocked,
  onTerrainReady,
  maxRenderDistance = MAX_RENDER_DISTANCE,
  fogDensity = 1.0,
  onAmmoChange,
  onPointerLockError,
  onCampfirePromptChange,
  onCampfireInteraction,
  activeCampfire,
  placedCampfires,
  setPlacedCampfires,
  onStorageBoxPromptChange,
  onStorageBoxInteraction,
  activeStorageBox,
  placedStorageBoxes,
  setPlacedStorageBoxes,
}: GameSceneProps) {
  const { scene, camera } = useThree()
  const { bulletTrails, setTerrainHeightData, setTerrainSize, terrainHeightData, terrainSize } = useGameContext()
  const { gameStatus } = useGameState()
  const { settings } = useSettings()
  const { selectedSlot, items } = useToolbar()
  const { isOpen: isInventoryOpen } = useInventory()
  const { campfires } = useCampfire()
  const { storageBoxes } = useStorageBox()
  const [localTerrainHeightData, setLocalTerrainHeightData] = useState<number[][]>([])
  const [spawnPoint, setSpawnPoint] = useState<THREE.Vector3>(new THREE.Vector3(0, 2, 0))
  const [walls, setWalls] = useState<any[]>([])
  const [terrainReady, setTerrainReady] = useState(false)
  const [houseLocation, setHouseLocation] = useState<{ position: THREE.Vector3; rotation: number } | null>(null)
  const [villageHouses, setVillageHouses] = useState<Array<{
    id: string
    type: 'cabin' | 'hut' | 'stone' | 'tent'
    position: THREE.Vector3
    rotation: number
  }>>([])
  const [isDoorOpen, setIsDoorOpen] = useState(false)
  const [keys, setKeys] = useState({
    KeyW: false,
    KeyS: false,
    KeyA: false,
    KeyD: false,
    Space: false,
    ShiftLeft: false,
    KeyC: false, // Changed from ControlLeft to KeyC for crouching
  })
  const { health, hydration, hunger, updateStatus } = usePlayerStatus()
  const controls = useRef<any>()
  const terrainRef = useRef<THREE.Mesh>(null)
  const terrainGenerated = useRef(false)

  // Try to use the ItemManager, but provide a fallback if it's not available
  const itemManager = useItemManager()
  const fallbackItemManager = {
    items: {
      campfire: [],
      storage_box: [],
      door: [],
      wall: [],
      foundation: [],
      ceiling: [],
      window: [],
    },
  }

  const effectiveItemManager = itemManager ? itemManager : fallbackItemManager

  // Log placed items for debugging
  useEffect(() => {
    console.log("Current storage boxes in item manager:", effectiveItemManager.items.storage_box)
  }, [effectiveItemManager.items.storage_box])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInventoryOpen || gameStatus !== "playing") return // Don't handle movement keys when inventory is open or game is not playing

      setKeys((prevKeys) => ({
        ...prevKeys,
        [e.code]: true,
      }))
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys((prevKeys) => ({
        ...prevKeys,
        [e.code]: false,
      }))
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [isInventoryOpen, gameStatus])

  // Handle pointer lock
  useEffect(() => {
    if (controls.current) {
      const handleLockChange = () => {
        setIsLocked(document.pointerLockElement === controls.current.domElement)
      }

      document.addEventListener("pointerlockchange", handleLockChange)

      return () => {
        document.removeEventListener("pointerlockchange", handleLockChange)
      }
    }
  }, [controls])

  // Generate terrain
  const { terrainGeometry, waterGeometry, terrainParams } = useMemo(() => {
    if (terrainGenerated.current) {
      // Return empty values if terrain has already been generated
      return { terrainGeometry: null, waterGeometry: null, terrainParams: null }
    }

    console.log("Generating terrain...")
    terrainGenerated.current = true

    // Set terrain parameters
    const params: TerrainParams = {
      seed: "webgo-fps-12345", // Fixed seed for consistent generation
      width: 400, // Increased from 100 to 400 (4x wider)
      depth: 400, // Increased from 100 to 400 (4x deeper)
      height: 8, // Reduced from 15 to 8 for flatter terrain
      scale: 120, // Increased from 50 to 120 to spread out features on the larger map
      octaves: 4, // Reduced from 5 to 5 for smoother terrain
      persistence: 0.45, // Slightly reduced from 0.5 for less dramatic height changes
      lacunarity: 2.0,
      heightOffset: -4, // Adjusted from -5 to -4
      waterLevel: 0.25, // Lowered from 0.3 to 0.25
    }

    // Create terrain generator
    const generator = new TerrainGenerator(params)

    // Generate terrain geometry
    const terrainGeometry = generator.generateTerrain()

    // Generate water geometry
    const waterGeometry = generator.generateWater()

    // Get height data for collision detection
    const heightData = generator.getTerrainHeightData()
    setLocalTerrainHeightData(heightData)
    console.log("Terrain generated with height data size:", heightData.length)

    return { terrainGeometry, waterGeometry, terrainParams: params }
  }, [])

  // Create materials with solid colors (no textures)
  const terrainMaterial = useMemo(() => {
    // Create a material with a solid color and proper settings
    return new THREE.MeshStandardMaterial({
      color: 0x556b2f, // Olive green
      roughness: 0.8,
      metalness: 0.1,
      side: THREE.DoubleSide, // Render both sides as a temporary fix
      transparent: false, // Make sure it's not transparent
      opacity: 1.0, // Fully opaque
      flatShading: false, // Smooth shading for better appearance
      depthWrite: true, // Ensure depth is written
      depthTest: true, // Ensure depth testing is enabled
    })
  }, [])

  const waterMaterial = useMemo(() => {
    // Create a material with a solid color
    return new THREE.MeshStandardMaterial({
      color: 0x3366ff, // Blue
      transparent: true,
      opacity: 0.7,
      roughness: 0.2,
      metalness: 0.6,
      side: THREE.DoubleSide, // Render both sides for water
    })
  }, [])

  // Find a suitable spawn point on the terrain
  useEffect(() => {
    if (!localTerrainHeightData || localTerrainHeightData.length === 0) {
      console.log("No terrain height data available yet")
      return
    }

    console.log("Finding spawn point on terrain...")

    // Make sure terrainParams is defined
    if (!terrainParams) {
      console.log("Terrain parameters not defined")
      return
    }

    // Try to find a relatively flat area near the center
    const centerX = Math.floor(localTerrainHeightData[0].length / 2)
    const centerZ = Math.floor(localTerrainHeightData.length / 2)
    const searchRadius = 20 // Increased from 10 to 20 for the larger map

    let bestSpawnX = centerX
    let bestSpawnZ = centerZ
    let flatnessScore = Number.MAX_VALUE

    // Search in a spiral pattern from the center
    for (let r = 0; r <= searchRadius; r++) {
      for (let dx = -r; dx <= r; dx++) {
        for (let dz = -r; dz <= r; dz++) {
          // Only check points on the current ring
          if (Math.abs(dx) < r && Math.abs(dz) < r) continue

          const x = centerX + dx
          const z = centerZ + dz

          // Check if coordinates are within bounds
          if (x < 0 || x >= localTerrainHeightData[0].length || z < 0 || z >= localTerrainHeightData.length) {
            continue
          }

          // Check flatness by sampling nearby points
          let maxDiff = 0
          const centerHeight = localTerrainHeightData[z][x]

          // Check surrounding points
          for (let nx = -1; nx <= 1; nx++) {
            for (let nz = -1; nz <= 1; nz++) {
              const neighborX = x + nx
              const neighborZ = z + nz

              if (
                neighborX >= 0 &&
                neighborX < localTerrainHeightData[0].length &&
                neighborZ >= 0 &&
                neighborZ < localTerrainHeightData.length
              ) {
                const neighborHeight = localTerrainHeightData[neighborZ][neighborX]
                const diff = Math.abs(neighborHeight - centerHeight)
                maxDiff = Math.max(maxDiff, diff)
              }
            }
          }

          // Check if this area is above water level
          const waterHeight = terrainParams.waterLevel * terrainParams.height + terrainParams.heightOffset
          if (centerHeight <= waterHeight) {
            continue
          }

          // If this area is flatter than our current best, update
          if (maxDiff < flatnessScore) {
            flatnessScore = maxDiff
            bestSpawnX = x
            bestSpawnZ = z
          }
        }
      }
    }

    // Convert grid coordinates to world coordinates
    const worldX = bestSpawnX - localTerrainHeightData[0].length / 2
    const worldZ = bestSpawnZ - localTerrainHeightData.length / 2

    // Get terrain height at spawn point
    const terrainHeight = localTerrainHeightData[bestSpawnZ][bestSpawnX]

    // Set spawn point just above the ground (player height + small offset)
    const PLAYER_HEIGHT = 1.7
    const SPAWN_OFFSET = 0.5 // Small offset to ensure player is above ground
    const worldY = terrainHeight + PLAYER_HEIGHT + SPAWN_OFFSET

  // Set spawn point
    const newSpawnPoint = new THREE.Vector3(worldX, worldY, worldZ)
    setSpawnPoint(newSpawnPoint)
    setTerrainReady(true)
    
    // Update game context with terrain data
    if (terrainParams) {
      setTerrainHeightData(localTerrainHeightData)
      setTerrainSize({ width: terrainParams.width, depth: terrainParams.depth })
    }

    console.log(`Spawn point set at (${worldX.toFixed(2)}, ${worldY.toFixed(2)}, ${worldZ.toFixed(2)})`)
    console.log(`Terrain height at spawn: ${terrainHeight.toFixed(2)}, spawn height: ${worldY.toFixed(2)}`)
    
    // Find and place village houses after spawn point is set
    if (terrainParams && villageHouses.length === 0) {
      const houseTypes: Array<'cabin' | 'hut' | 'stone' | 'tent'> = ['cabin', 'hut', 'stone', 'tent']
      const placedHouses: Array<{
        id: string
        type: 'cabin' | 'hut' | 'stone' | 'tent'
        position: THREE.Vector3
        rotation: number
      }> = []
      
      // Place multiple houses at different distances and angles from spawn
      const houseDistances = [30, 45, 60, 35] // Different distances from spawn
      const houseAngles = [0, Math.PI / 2, Math.PI, -Math.PI / 2] // Different angles around spawn
      
      for (let i = 0; i < 4; i++) {
        const distance = houseDistances[i]
        const angle = houseAngles[i]
        
        // Calculate preferred position based on angle and distance from spawn
        const preferredX = newSpawnPoint.x + Math.cos(angle) * distance
        const preferredZ = newSpawnPoint.z + Math.sin(angle) * distance
        const preferredPosition = new THREE.Vector3(preferredX, newSpawnPoint.y, preferredZ)
        
        const houseLocationData = findBestHouseLocation(
          {
            heightData: localTerrainHeightData,
            width: terrainParams.width,
            depth: terrainParams.depth
          },
          preferredPosition,
          {
            minFlatness: 1.2,
            minWaterDistance: 15,
            waterLevel: terrainParams.waterLevel * terrainParams.height + terrainParams.heightOffset,
            preferredDistance: 10, // Smaller preferred distance since we have a target location
            searchRadius: 20 // Allow wider search radius to find suitable spots
          }
        )
        
        if (houseLocationData) {
          const houseId = `village-house-${i}`
          placedHouses.push({
            id: houseId,
            type: houseTypes[i],
            position: houseLocationData.position,
            rotation: houseLocationData.rotation
          })
          
          // Initialize house state
          setVillageHouseStates(prev => ({
            ...prev,
            [houseId]: {
              doorOpen: false,
              fireplaceActive: false,
              cabinetOpen: false
            }
          }))
          
          console.log(`${houseTypes[i]} house placed at: (${houseLocationData.position.x.toFixed(2)}, ${houseLocationData.position.y.toFixed(2)}, ${houseLocationData.position.z.toFixed(2)})`)
        } else {
          console.warn(`Could not find suitable location for ${houseTypes[i]} house`)
        }
      }
      
      setVillageHouses(placedHouses)
      console.log(`Village created with ${placedHouses.length} houses`)
    }

    // Spawn enemies after village is set up
    if (enemies.length === 0 && terrainParams) {
      const enemyTypes: Array<'goblin' | 'crawler' | 'bandit' | 'golem'> = ['goblin', 'crawler', 'bandit', 'golem']
      const spawnedEnemies: Array<{
        id: string
        type: 'goblin' | 'crawler' | 'bandit' | 'golem'
        position: THREE.Vector3
        isAlive: boolean
      }> = []
      
      // Spawn enemies at various distances and angles from spawn point
      const enemyDistances = [80, 100, 120, 150] // Further from spawn than houses
      const enemyAngles = [Math.PI / 4, 3 * Math.PI / 4, -Math.PI / 4, -3 * Math.PI / 4] // Diagonal positions
      
      for (let i = 0; i < 4; i++) {
        const distance = enemyDistances[i]
        const angle = enemyAngles[i]
        
        // Calculate enemy spawn position
        const enemyX = newSpawnPoint.x + Math.cos(angle) * distance
        const enemyZ = newSpawnPoint.z + Math.sin(angle) * distance
        
        // Convert world coordinates to grid coordinates to get terrain height
        const gridX = Math.floor(enemyX + localTerrainHeightData[0].length / 2)
        const gridZ = Math.floor(enemyZ + localTerrainHeightData.length / 2)
        
        // Check if coordinates are within bounds
        if (gridX >= 0 && gridX < localTerrainHeightData[0].length && gridZ >= 0 && gridZ < localTerrainHeightData.length) {
          const terrainHeight = localTerrainHeightData[gridZ][gridX]
          const waterHeight = terrainParams.waterLevel * terrainParams.height + terrainParams.heightOffset
          
          // Only spawn if above water level
          if (terrainHeight > waterHeight) {
            const enemyY = terrainHeight + 1 // Place enemy above ground
            
            spawnedEnemies.push({
              id: `enemy-${enemyTypes[i]}-${i}`,
              type: enemyTypes[i],
              position: new THREE.Vector3(enemyX, enemyY, enemyZ),
              isAlive: true
            })
            
            console.log(`Spawned ${enemyTypes[i]} at: (${enemyX.toFixed(2)}, ${enemyY.toFixed(2)}, ${enemyZ.toFixed(2)})`)
          }
        }
      }
      
      setEnemies(spawnedEnemies)
      console.log(`Spawned ${spawnedEnemies.length} enemies`)
    }
  }, [localTerrainHeightData, terrainParams, setTerrainHeightData, setTerrainSize, houseLocation])

  // Create walls for collision (boundary walls)
  const boundaryWalls = useMemo(() => {
    const wallGeometry = new THREE.BoxGeometry(1, 10, 1)
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      visible: false, // Make walls invisible
    })

    // Create boundary walls
    const walls = []
    const size = 200 // Half the terrain size (increased from 50 to 200)

    // Add boundary walls
    for (let i = -size; i <= size; i += 10) {
      // Increased step from 5 to 10 for efficiency
      // North wall
      walls.push({
        position: [i, 5, -size],
        geometry: wallGeometry,
        material: wallMaterial,
      })

      // South wall
      walls.push({
        position: [i, 5, size],
        geometry: wallGeometry,
        material: wallMaterial,
      })

      // East wall
      walls.push({
        position: [size, 5, i],
        geometry: wallGeometry,
        material: wallMaterial,
      })

      // West wall
      walls.push({
        position: [-size, 5, i],
        geometry: wallGeometry,
        material: wallMaterial,
      })
    }

    setWalls(walls)
    return walls
  }, [])

  // Calculate water position
  const waterPosition = useMemo(() => {
    if (!terrainParams) {
      return [0, 0, 0]
    }
    return [0, terrainParams.waterLevel * terrainParams.height + terrainParams.heightOffset, 0]
  }, [terrainParams])

  // Calculate water level for trees
  const waterLevel = useMemo(() => {
    if (!terrainParams) {
      return 0
    }
    return terrainParams.waterLevel * terrainParams.height + terrainParams.heightOffset
  }, [terrainParams])

  // Render the currently equipped item
  const renderEquippedItem = () => {
    if (isInventoryOpen || gameStatus !== "playing") return null

    const currentItem = items[selectedSlot]
    if (!currentItem) return null

    console.log("Rendering equipped item:", currentItem.id, currentItem.type)

    // Match based on item ID prefix
    if (currentItem.id.startsWith("weapon_")) {
      return <Weapon isLocked={isLocked} />
    } else if (currentItem.id === "tool_hatchet") {
      return <Hatchet isLocked={isLocked} />
    } else if (currentItem.id === "tool_pickaxe") {
      return <Pickaxe isLocked={isLocked} />
    } else if (currentItem.id.startsWith("tool_building_plan")) {
      return <BuildingPlan isLocked={isLocked} />
    } else if (currentItem.id.startsWith("item_campfire")) {
      return (
        <CampfirePlacer
          isLocked={isLocked}
          terrainHeightData={terrainHeightData || localTerrainHeightData}
          placedCampfires={effectiveItemManager.items.campfire.map((item) => ({
            id: item.id,
            position: item.position,
            normal: item.normal || ([0, 1, 0] as [number, number, number]),
          }))}
          setPlacedCampfires={() => {}} // This will be handled by the ItemManager
        />
      )
    } else if (currentItem.id.startsWith("item_storage_box")) {
      return (
        <StorageBoxPlacer
          isLocked={isLocked}
          terrainHeightData={terrainHeightData || localTerrainHeightData}
          placedStorageBoxes={effectiveItemManager.items.storage_box.map((item) => ({
            id: item.id,
            position: item.position,
            normal: item.normal || ([0, 1, 0] as [number, number, number]),
          }))}
          setPlacedStorageBoxes={() => {}} // This will be handled by the ItemManager
        />
      )
    } else if (currentItem.id.startsWith("item_door")) {
      return (
        <DoorPlacer
          isLocked={isLocked}
          terrainHeightData={terrainHeightData || localTerrainHeightData}
          placedDoors={placedDoors}
          setPlacedDoors={setPlacedDoors}
        />
      )
    }

    console.warn(`Unknown item type: ${currentItem.id}`)
    return null
  }

  // Define sky color
  const skyColor = useMemo(() => new THREE.Color("#87CEEB"), []) // Sky blue

  // Create fog - matching the sky color for a natural blend
  const fogColor = useMemo(() => skyColor.clone(), [skyColor])
  const fogParams = useMemo(() => {
    // Fog starts at 50 units away and becomes completely opaque at maxRenderDistance
    // Adjust fog density based on settings
    const near = fogDensity === 0 ? maxRenderDistance : 50 / fogDensity
    const far = maxRenderDistance

    return {
      near,
      far,
      color: fogColor,
    }
  }, [fogColor, maxRenderDistance, fogDensity])

  // Determine if player movement should be disabled
  const isPlayerDisabled = gameStatus !== "playing" || isInventoryOpen

  // Handle campfire interaction
  const handleCampfireInteract = (campfireId: string) => {
    console.log(`GameScene: Campfire interaction triggered for ${campfireId}`)
    onCampfireInteraction(campfireId)
  }

  // Handle storage box interaction
  const handleStorageBoxInteract = (storageBoxId: string) => {
    console.log(`GameScene: Storage box interaction for ${storageBoxId}`)
    onStorageBoxInteraction(storageBoxId)
  }

  // Handle house door interaction
  const handleHouseDoorToggle = () => {
    setIsDoorOpen(!isDoorOpen)
    console.log(`House door ${isDoorOpen ? 'closed' : 'opened'}`)
  }

  // Advanced house interaction handlers
  const [fireplaceActive, setFireplaceActive] = useState(false)
  const [cabinetOpen, setCabinetOpen] = useState(false)
  const [wardrobeOpen, setWardrobeOpen] = useState(false)
  
  // Village house interaction handlers
  const [villageHouseStates, setVillageHouseStates] = useState<{
    [houseId: string]: {
      doorOpen: boolean
      fireplaceActive: boolean
      cabinetOpen: boolean
    }
  }>({})

  // Enemy spawning state
  const [enemies, setEnemies] = useState<Array<{
    id: string
    type: 'goblin' | 'crawler' | 'bandit' | 'golem'
    position: THREE.Vector3
    isAlive: boolean
  }>>([])
  const [playerPosition, setPlayerPosition] = useState<THREE.Vector3>(new THREE.Vector3())
  
  // Placed doors state
  const [placedDoors, setPlacedDoors] = useState<Array<{
    id: string
    position: [number, number, number]
    rotation: [number, number, number]
    normal?: [number, number, number]
    isOpen?: boolean
  }>>([])

  const handleFireplaceToggle = () => {
    setFireplaceActive(!fireplaceActive)
    console.log(`Fireplace ${fireplaceActive ? 'extinguished' : 'lit'}`)
  }

  const handleCabinetToggle = () => {
    setCabinetOpen(!cabinetOpen)
    console.log(`Kitchen cabinet ${cabinetOpen ? 'closed' : 'opened'}`)
  }

  const handleWardrobeToggle = () => {
    setWardrobeOpen(!wardrobeOpen)
    console.log(`Wardrobe ${wardrobeOpen ? 'closed' : 'opened'}`)
  }
  
  // Village house interaction handlers
  const handleVillageHouseDoorToggle = (houseId: string) => {
    setVillageHouseStates(prev => ({
      ...prev,
      [houseId]: {
        ...prev[houseId],
        doorOpen: !prev[houseId]?.doorOpen
      }
    }))
    console.log(`Village house ${houseId} door ${villageHouseStates[houseId]?.doorOpen ? 'closed' : 'opened'}`)
  }
  
  const handleVillageHouseFireplaceToggle = (houseId: string) => {
    setVillageHouseStates(prev => ({
      ...prev,
      [houseId]: {
        ...prev[houseId],
        fireplaceActive: !prev[houseId]?.fireplaceActive
      }
    }))
    console.log(`Village house ${houseId} fireplace ${villageHouseStates[houseId]?.fireplaceActive ? 'extinguished' : 'lit'}`)
  }
  
  const handleVillageHouseCabinetToggle = (houseId: string) => {
    setVillageHouseStates(prev => ({
      ...prev,
      [houseId]: {
        ...prev[houseId],
        cabinetOpen: !prev[houseId]?.cabinetOpen
      }
    }))
    console.log(`Village house ${houseId} cabinet ${villageHouseStates[houseId]?.cabinetOpen ? 'closed' : 'opened'}`)
  }

return (
    <>
      <PointerLockControls ref={controls} />

      {/* Improved lighting for better terrain visibility */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[50, 100, 50]} intensity={1.0} castShadow={settings.graphics?.enableShadows} />
      <directionalLight position={[-50, 50, -50]} intensity={0.5} castShadow={settings.graphics?.enableShadows} />

      <Physics>

      {/* Sky color */}
      <color attach="background" args={[skyColor]} />

      {/* Enhanced fog with smooth blending - only if fog density > 0 */}
      {fogDensity > 0 && <fog attach="fog" args={[fogColor, fogParams.near, fogParams.far]} />}

      {/* Terrain */}
      {terrainGeometry && (
        <mesh
          ref={terrainRef}
          receiveShadow={settings.graphics?.enableShadows}
          geometry={terrainGeometry}
          material={terrainMaterial}
          castShadow={settings.graphics?.enableShadows}
        />
      )}

      {/* Water */}
      {waterGeometry && (
        <mesh
          position={waterPosition as [number, number, number]}
          rotation={[-Math.PI / 2, 0, 0]}
          geometry={waterGeometry}
          material={waterMaterial}
        />
      )}

      {/* Trees - only render when terrain is ready */}
      {terrainReady && (terrainHeightData?.length > 0 || localTerrainHeightData.length > 0) && terrainParams && (
        <>
          <Trees
            terrainHeightData={terrainHeightData || localTerrainHeightData}
            terrainSize={{ width: terrainParams.width, depth: terrainParams.depth }}
            waterLevel={waterLevel}
            maxRenderDistance={maxRenderDistance}
          />
          <StoneNodes
            terrainHeightData={terrainHeightData || localTerrainHeightData}
            terrainSize={{ width: terrainParams.width, depth: terrainParams.depth }}
            waterLevel={waterLevel}
            maxRenderDistance={maxRenderDistance}
          />
        </>
      )}

      {/* Boundary walls (invisible) */}
      {boundaryWalls.map((wall, index) => (
        <mesh
          key={index}
          position={wall.position as [number, number, number]}
          geometry={wall.geometry}
          material={wall.material}
          visible={false}
        />
      ))}

      {/* Player - only render when terrain is ready and spawn point is set */}
      {terrainReady && (terrainHeightData?.length > 0 || localTerrainHeightData.length > 0) && (
        <Player
          keys={keys}
          isLocked={isLocked && gameStatus === "playing"}
          walls={walls}
          terrainHeightData={terrainHeightData || localTerrainHeightData}
          spawnPoint={spawnPoint}
          trees={[]} // Trees are handled separately
          stones={[]} // Stones are handled separately
          storageBoxes={effectiveItemManager.items.storage_box.map((item) => ({
            id: item.id,
            position: item.position,
          }))}
          mouseSensitivity={settings.controls?.mouseSensitivity || 1.0}
          invertY={settings.controls?.invertY || false}
          disabled={isPlayerDisabled}
        />
      )}

      {/* Equipped item */}
      {renderEquippedItem()}

      {/* Placed storage boxes - render the actual 3D models */}
      {effectiveItemManager.items.storage_box.map((box) => (
        <StorageBox
          key={box.id}
          id={box.id}
          position={box.position}
          normal={box.normal || [0, 1, 0]}
          isGhost={false}
          scale={1}
        />
      ))}

      {/* Placed campfires - render the actual 3D models */}
      {effectiveItemManager.items.campfire.map((campfire) => {
        // Get the campfire data from the campfire context to check if it's active
        const campfireData = campfires.get(campfire.id)
        const isActive = campfireData?.isActive || false

        return (
          <Campfire
            key={campfire.id}
            id={campfire.id}
            position={campfire.position}
            normal={campfire.normal || [0, 1, 0]}
            isGhost={false}
            scale={1}
            isActive={isActive}
          />
        )
      })}

      {/* Placed campfire interactions */}
      {effectiveItemManager.items.campfire.map((campfire) => (
        <CampfireInteraction
          key={`interaction-${campfire.id}`}
          id={campfire.id}
          position={campfire.position}
          onInteract={handleCampfireInteract}
          disabled={gameStatus !== "playing" || isInventoryOpen}
        />
      ))}

      {/* Placed storage box interactions */}
      {effectiveItemManager.items.storage_box.map((box) => (
        <StorageBoxInteraction
          key={`interaction-${box.id}`}
          id={box.id}
          position={box.position}
          onInteract={handleStorageBoxInteract}
          disabled={gameStatus !== "playing" || isInventoryOpen}
        />
      ))}

      {/* Placed doors */}
      {effectiveItemManager.items.door.map((door) => (
        <Door
          key={door.id}
          id={door.id}
          position={door.position}
          rotation={door.rotation || [0, 0, 0]}
          isOpen={door.isOpen || false}
        />
      ))}

      {/* Main House - placed automatically on terrain */}
      {houseLocation && terrainReady && (
        <>
          <House
            position={[
              houseLocation.position.x,
              houseLocation.position.y,
              houseLocation.position.z
            ]}
            rotation={[0, houseLocation.rotation, 0]}
            id="main-house"
          />
          
          {/* Advanced House Interactions */}
          <AdvancedHouseInteraction
            position={[
              houseLocation.position.x,
              houseLocation.position.y,
              houseLocation.position.z
            ]}
            onDoorToggle={handleHouseDoorToggle}
            onFireplaceToggle={handleFireplaceToggle}
            onCabinetToggle={handleCabinetToggle}
            onWardrobeToggle={handleWardrobeToggle}
            disabled={gameStatus !== "playing" || isInventoryOpen}
            id="main-house"
          />
        </>
      )}
      
      {/* Village Houses - render different house types */}
      {villageHouses.map((house) => {
        const houseState = villageHouseStates[house.id] || {
          doorOpen: false,
          fireplaceActive: false,
          cabinetOpen: false
        }
        
        const commonProps = {
          key: house.id,
          position: [house.position.x, house.position.y, house.position.z] as [number, number, number],
          rotation: [0, house.rotation, 0] as [number, number, number],
          isDoorOpen: houseState.doorOpen,
          isFireplaceActive: houseState.fireplaceActive,
          isCabinetOpen: houseState.cabinetOpen,
          onDoorToggle: () => handleVillageHouseDoorToggle(house.id),
          onFireplaceToggle: () => handleVillageHouseFireplaceToggle(house.id),
          onCabinetToggle: () => handleVillageHouseCabinetToggle(house.id)
        }
        
        switch (house.type) {
          case 'cabin':
            return <CabinHouse {...commonProps} />
          case 'hut':
            return <HutHouse {...commonProps} />
          case 'stone':
            return <StoneHouse {...commonProps} />
          case 'tent':
            return <TentHouse {...commonProps} />
          default:
            return null
        }
      })}
      
      {/* Enemies - render different enemy types */}
      {enemies.map((enemy) => {
        if (!enemy.isAlive) return null
        
        const enemyProps = {
          key: enemy.id,
          position: [enemy.position.x, enemy.position.y, enemy.position.z] as [number, number, number],
          playerPosition: playerPosition,
          terrainHeightData: terrainHeightData || localTerrainHeightData,
          onTakeDamage: (damage: number) => {
            // Handle enemy taking damage
            setEnemies(prev => prev.map(e => {
              if (e.id === enemy.id) {
                console.log(`Enemy ${enemy.id} took ${damage} damage`)
                // For now, just mark as dead if any damage is taken
                // Later this could be more sophisticated with health tracking
                return { ...e, isAlive: false }
              }
              return e
            }))
          }
        }
        
        switch (enemy.type) {
          case 'goblin':
            return <ForestGoblin {...enemyProps} />
          case 'crawler':
            return <SwampCrawler {...enemyProps} />
          case 'bandit':
            return <ShadowBandit {...enemyProps} />
          case 'golem':
            return <RockGolem {...enemyProps} />
          default:
            return null
        }
      })}
      </Physics>
    </>
  )
}
