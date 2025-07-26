import * as THREE from "three"

/**
 * Tree instance data structure
 * This is the single source of truth for TreeInstance across all modules
 */
export interface TreeInstance {
  id: number // Unique identifier for the tree
  position: THREE.Vector3
  rotation: THREE.Euler
  scale: number
  height: number
  type: number // Different tree types (0-2)
  health: number // Current health of the tree
  maxHealth: number // Maximum health of the tree
  isChopped: boolean // Whether the tree has been chopped
  respawnTime: number | null // When the tree will respawn (timestamp)
  // Collision data (calculated at runtime)
  trunkRadius?: number
  trunkHeight?: number
  foliageRadius?: number
  foliageBottom?: number
  foliageTop?: number
}
