import * as THREE from "three"

/**
 * Stone instance data structure
 * This is the single source of truth for StoneInstance across all modules
 */
export interface StoneInstance {
  id: number // Unique identifier for the stone
  position: THREE.Vector3
  rotation: THREE.Euler
  scale: number
  radius: number
  type: number // Different stone types (0-2)
  health: number // Current health of the stone
  maxHealth: number // Maximum health of the stone
  isMined: boolean // Whether the stone has been mined
  respawnTime: number | null // When the stone will respawn (timestamp)
}
