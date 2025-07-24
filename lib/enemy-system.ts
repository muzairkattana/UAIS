import * as THREE from "three"
import { Player, PlayerState, DamageType, HitZone } from "./player-system"
import { WeaponType, WEAPON_CONFIGS } from "./weapon-system"

// Enemy types
export enum EnemyType {
  GRUNT = 'grunt',
  SOLDIER = 'soldier',
  SNIPER = 'sniper',
  HEAVY = 'heavy',
  SCOUT = 'scout',
  MEDIC = 'medic',
  COMMANDER = 'commander',
  ZOMBIE = 'zombie',
  MUTANT = 'mutant',
  ROBOT = 'robot'
}

// Enemy states
export enum EnemyState {
  IDLE = 'idle',
  PATROLLING = 'patrolling',
  INVESTIGATING = 'investigating',
  CHASING = 'chasing',
  ATTACKING = 'attacking',
  TAKING_COVER = 'taking_cover',
  RELOADING = 'reloading',
  FLANKING = 'flanking',
  RETREATING = 'retreating',
  DEAD = 'dead'
}

// AI behavior types
export enum AIBehavior {
  AGGRESSIVE = 'aggressive',
  DEFENSIVE = 'defensive',
  TACTICAL = 'tactical',
  COWARD = 'coward',
  BERSERKER = 'berserker',
  SNIPER = 'sniper'
}

// Enemy configuration
export interface EnemyConfig {
  type: EnemyType
  health: {
    max: number
    current: number
    regenerationRate: number
  }
  movement: {
    walkSpeed: number
    runSpeed: number
    rotationSpeed: number
    acceleration: number
  }
  combat: {
    weaponType: WeaponType
    accuracy: number
    reactionTime: number
    burstLength: number
    fireRate: number
    reloadTime: number
    maxRange: number
    optimalRange: number
  }
  ai: {
    behavior: AIBehavior
    alertRadius: number
    hearingRadius: number
    fieldOfView: number
    patrolRadius: number
    investigationTime: number
    memoryDuration: number
    teamwork: number
  }
  armor: {
    head: number
    chest: number
    legs: number
  }
  rewards: {
    experience: number
    loot: string[]
  }
}

// Enemy configurations
export const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  [EnemyType.GRUNT]: {
    type: EnemyType.GRUNT,
    health: { max: 50, current: 50, regenerationRate: 0 },
    movement: { walkSpeed: 2, runSpeed: 4, rotationSpeed: 3, acceleration: 8 },
    combat: {
      weaponType: WeaponType.ASSAULT_RIFLE,
      accuracy: 0.6,
      reactionTime: 0.8,
      burstLength: 3,
      fireRate: 0.2,
      reloadTime: 2.5,
      maxRange: 50,
      optimalRange: 20
    },
    ai: {
      behavior: AIBehavior.AGGRESSIVE,
      alertRadius: 15,
      hearingRadius: 25,
      fieldOfView: 120,
      patrolRadius: 10,
      investigationTime: 3,
      memoryDuration: 10,
      teamwork: 0.3
    },
    armor: { head: 0, chest: 10, legs: 0 },
    rewards: { experience: 10, loot: ['ammo_rifle', 'health_small'] }
  },
  
  [EnemyType.SOLDIER]: {
    type: EnemyType.SOLDIER,
    health: { max: 80, current: 80, regenerationRate: 0 },
    movement: { walkSpeed: 2.5, runSpeed: 5, rotationSpeed: 2.5, acceleration: 10 },
    combat: {
      weaponType: WeaponType.ASSAULT_RIFLE,
      accuracy: 0.75,
      reactionTime: 0.6,
      burstLength: 4,
      fireRate: 0.15,
      reloadTime: 2.0,
      maxRange: 60,
      optimalRange: 30
    },
    ai: {
      behavior: AIBehavior.TACTICAL,
      alertRadius: 20,
      hearingRadius: 30,
      fieldOfView: 140,
      patrolRadius: 15,
      investigationTime: 4,
      memoryDuration: 15,
      teamwork: 0.7
    },
    armor: { head: 20, chest: 30, legs: 10 },
    rewards: { experience: 20, loot: ['ammo_rifle', 'armor_vest', 'health_medium'] }
  },
  
  [EnemyType.SNIPER]: {
    type: EnemyType.SNIPER,
    health: { max: 60, current: 60, regenerationRate: 0 },
    movement: { walkSpeed: 1.5, runSpeed: 3, rotationSpeed: 2, acceleration: 6 },
    combat: {
      weaponType: WeaponType.SNIPER_RIFLE,
      accuracy: 0.95,
      reactionTime: 1.2,
      burstLength: 1,
      fireRate: 1.5,
      reloadTime: 3.0,
      maxRange: 150,
      optimalRange: 80
    },
    ai: {
      behavior: AIBehavior.SNIPER,
      alertRadius: 25,
      hearingRadius: 35,
      fieldOfView: 60,
      patrolRadius: 5,
      investigationTime: 6,
      memoryDuration: 20,
      teamwork: 0.2
    },
    armor: { head: 10, chest: 20, legs: 0 },
    rewards: { experience: 35, loot: ['ammo_sniper', 'scope', 'health_medium'] }
  },
  
  [EnemyType.HEAVY]: {
    type: EnemyType.HEAVY,
    health: { max: 150, current: 150, regenerationRate: 1 },
    movement: { walkSpeed: 1, runSpeed: 2.5, rotationSpeed: 1.5, acceleration: 4 },
    combat: {
      weaponType: WeaponType.LMG,
      accuracy: 0.7,
      reactionTime: 1.0,
      burstLength: 8,
      fireRate: 0.1,
      reloadTime: 4.0,
      maxRange: 80,
      optimalRange: 40
    },
    ai: {
      behavior: AIBehavior.DEFENSIVE,
      alertRadius: 18,
      hearingRadius: 25,
      fieldOfView: 100,
      patrolRadius: 8,
      investigationTime: 2,
      memoryDuration: 12,
      teamwork: 0.5
    },
    armor: { head: 40, chest: 60, legs: 30 },
    rewards: { experience: 50, loot: ['ammo_lmg', 'armor_heavy', 'health_large'] }
  },
  
  [EnemyType.SCOUT]: {
    type: EnemyType.SCOUT,
    health: { max: 40, current: 40, regenerationRate: 0 },
    movement: { walkSpeed: 4, runSpeed: 8, rotationSpeed: 5, acceleration: 15 },
    combat: {
      weaponType: WeaponType.SMG,
      accuracy: 0.65,
      reactionTime: 0.4,
      burstLength: 5,
      fireRate: 0.08,
      reloadTime: 1.5,
      maxRange: 30,
      optimalRange: 15
    },
    ai: {
      behavior: AIBehavior.AGGRESSIVE,
      alertRadius: 12,
      hearingRadius: 20,
      fieldOfView: 160,
      patrolRadius: 20,
      investigationTime: 2,
      memoryDuration: 8,
      teamwork: 0.4
    },
    armor: { head: 0, chest: 5, legs: 0 },
    rewards: { experience: 15, loot: ['ammo_smg', 'speed_boost', 'health_small'] }
  },
  
  [EnemyType.MEDIC]: {
    type: EnemyType.MEDIC,
    health: { max: 70, current: 70, regenerationRate: 2 },
    movement: { walkSpeed: 2, runSpeed: 4, rotationSpeed: 3, acceleration: 8 },
    combat: {
      weaponType: WeaponType.PISTOL,
      accuracy: 0.5,
      reactionTime: 1.0,
      burstLength: 2,
      fireRate: 0.3,
      reloadTime: 1.8,
      maxRange: 25,
      optimalRange: 12
    },
    ai: {
      behavior: AIBehavior.DEFENSIVE,
      alertRadius: 15,
      hearingRadius: 25,
      fieldOfView: 120,
      patrolRadius: 8,
      investigationTime: 3,
      memoryDuration: 10,
      teamwork: 0.9
    },
    armor: { head: 5, chest: 15, legs: 5 },
    rewards: { experience: 25, loot: ['health_kit', 'stim_pack', 'ammo_pistol'] }
  },
  
  [EnemyType.COMMANDER]: {
    type: EnemyType.COMMANDER,
    health: { max: 120, current: 120, regenerationRate: 1 },
    movement: { walkSpeed: 2, runSpeed: 4.5, rotationSpeed: 2.5, acceleration: 8 },
    combat: {
      weaponType: WeaponType.ASSAULT_RIFLE,
      accuracy: 0.85,
      reactionTime: 0.5,
      burstLength: 4,
      fireRate: 0.12,
      reloadTime: 2.0,
      maxRange: 70,
      optimalRange: 35
    },
    ai: {
      behavior: AIBehavior.TACTICAL,
      alertRadius: 30,
      hearingRadius: 40,
      fieldOfView: 150,
      patrolRadius: 12,
      investigationTime: 5,
      memoryDuration: 25,
      teamwork: 1.0
    },
    armor: { head: 30, chest: 40, legs: 20 },
    rewards: { experience: 75, loot: ['weapon_upgrade', 'armor_commander', 'health_large'] }
  },
  
  [EnemyType.ZOMBIE]: {
    type: EnemyType.ZOMBIE,
    health: { max: 30, current: 30, regenerationRate: 0 },
    movement: { walkSpeed: 1, runSpeed: 3, rotationSpeed: 2, acceleration: 6 },
    combat: {
      weaponType: WeaponType.PISTOL, // Represents melee attack
      accuracy: 0.8,
      reactionTime: 0.3,
      burstLength: 1,
      fireRate: 1.0,
      reloadTime: 0,
      maxRange: 2,
      optimalRange: 1
    },
    ai: {
      behavior: AIBehavior.BERSERKER,
      alertRadius: 8,
      hearingRadius: 15,
      fieldOfView: 360,
      patrolRadius: 5,
      investigationTime: 1,
      memoryDuration: 30,
      teamwork: 0.1
    },
    armor: { head: 0, chest: 0, legs: 0 },
    rewards: { experience: 5, loot: ['health_small'] }
  },
  
  [EnemyType.MUTANT]: {
    type: EnemyType.MUTANT,
    health: { max: 200, current: 200, regenerationRate: 3 },
    movement: { walkSpeed: 2, runSpeed: 6, rotationSpeed: 3, acceleration: 12 },
    combat: {
      weaponType: WeaponType.PISTOL, // Represents claw attack
      accuracy: 0.9,
      reactionTime: 0.2,
      burstLength: 1,
      fireRate: 0.5,
      reloadTime: 0,
      maxRange: 3,
      optimalRange: 2
    },
    ai: {
      behavior: AIBehavior.BERSERKER,
      alertRadius: 12,
      hearingRadius: 20,
      fieldOfView: 270,
      patrolRadius: 15,
      investigationTime: 2,
      memoryDuration: 20,
      teamwork: 0.2
    },
    armor: { head: 20, chest: 30, legs: 10 },
    rewards: { experience: 60, loot: ['mutant_claw', 'health_large', 'rare_material'] }
  },
  
  [EnemyType.ROBOT]: {
    type: EnemyType.ROBOT,
    health: { max: 100, current: 100, regenerationRate: 0 },
    movement: { walkSpeed: 2.5, runSpeed: 5, rotationSpeed: 4, acceleration: 10 },
    combat: {
      weaponType: WeaponType.LMG,
      accuracy: 0.9,
      reactionTime: 0.1,
      burstLength:  6,
      fireRate: 0.08,
      reloadTime: 3.0,
      maxRange: 100,
      optimalRange: 50
    },
    ai: {
      behavior: AIBehavior.TACTICAL,
      alertRadius: 40,
      hearingRadius: 50,
      fieldOfView: 180,
      patrolRadius: 20,
      investigationTime: 1,
      memoryDuration: 60,
      teamwork: 0.8
    },
    armor: { head: 50, chest: 70, legs: 40 },
    rewards: { experience: 40, loot: ['scrap_metal', 'energy_cell', 'tech_upgrade'] }
  }
}

// Enemy class
export class Enemy {
  public config: EnemyConfig
  public position: THREE.Vector3 = new THREE.Vector3()
  public rotation: THREE.Euler = new THREE.Euler()
  public velocity: THREE.Vector3 = new THREE.Vector3()
  public state: EnemyState = EnemyState.PATROLLING
  
  // AI state
  private target: Player | null = null
  private lastKnownPlayerPosition: THREE.Vector3 | null = null
  private alertLevel: number = 0 // 0-1, how alert the enemy is
  private patrolPath: THREE.Vector3[] = []
  private currentPatrolIndex: number = 0
  private lastShotTime: number = 0
  private burstShotsRemaining: number = 0
  private reloadStartTime: number = 0
  private investigationStartTime: number = 0
  private lastPlayerSightTime: number = 0
  private coverPosition: THREE.Vector3 | null = null
  private teammates: Enemy[] = []
  
  // Combat state
  private currentAmmo: number
  private isReloading: boolean = false
  private nextShotTime: number = 0
  
  constructor(type: EnemyType, position?: THREE.Vector3) {
    this.config = { ...ENEMY_CONFIGS[type] }
    this.config.health.current = this.config.health.max
    this.currentAmmo = WEAPON_CONFIGS[this.config.combat.weaponType].magazineSize
    
    if (position) {
      this.position.copy(position)
    }
    
    this.generatePatrolPath()
  }
  
  // Update enemy AI and state
  update(deltaTime: number, player: Player, enemies: Enemy[]): void {
    this.teammates = enemies.filter(e => e !== this && e.state !== EnemyState.DEAD)
    
    this.updateAI(deltaTime, player)
    this.updateMovement(deltaTime)
    this.updateCombat(deltaTime, player)
    this.updateHealth(deltaTime)
  }
  
  // Update AI decision making
  private updateAI(deltaTime: number, player: Player): void {
    if (this.state === EnemyState.DEAD) return
    
    // Check if player is visible
    const playerVisible = this.canSeePlayer(player)
    const playerDistance = this.position.distanceTo(player.position)
    
    if (playerVisible) {
      this.target = player
      this.lastKnownPlayerPosition = player.position.clone()
      this.lastPlayerSightTime = Date.now()
      this.alertLevel = Math.min(1, this.alertLevel + deltaTime * 2)
    } else {
      // Decay alert level over time
      this.alertLevel = Math.max(0, this.alertLevel - deltaTime * 0.5)
    }
    
    // Check if player is within hearing range
    if (playerDistance <= this.config.ai.hearingRadius && player.state === PlayerState.RUNNING) {
      this.alertLevel = Math.min(1, this.alertLevel + deltaTime)
      if (!this.lastKnownPlayerPosition) {
        this.lastKnownPlayerPosition = player.position.clone()
      }
    }
    
    // State machine
    switch (this.state) {
      case EnemyState.PATROLLING:
        this.handlePatrolling(playerVisible, playerDistance)
        break
        
      case EnemyState.INVESTIGATING:
        this.handleInvestigating(deltaTime, playerVisible, playerDistance)
        break
        
      case EnemyState.CHASING:
        this.handleChasing(playerVisible, playerDistance)
        break
        
      case EnemyState.ATTACKING:
        this.handleAttacking(playerVisible, playerDistance)
        break
        
      case EnemyState.TAKING_COVER:
        this.handleTakingCover(deltaTime, playerVisible, playerDistance)
        break
        
      case EnemyState.RELOADING:
        this.handleReloading(deltaTime, playerVisible, playerDistance)
        break
        
      case EnemyState.FLANKING:
        this.handleFlanking(playerVisible, playerDistance)
        break
        
      case EnemyState.RETREATING:
        this.handleRetreating(playerVisible, playerDistance)
        break
    }
    
    // Teamwork behaviors
    this.handleTeamwork(player)
  }
  
  private handlePatrolling(playerVisible: boolean, playerDistance: number): void {
    if (playerVisible || this.alertLevel > 0.3) {
      this.setState(EnemyState.INVESTIGATING)
      this.investigationStartTime = Date.now()
      return
    }
    
    // Continue patrol
    if (this.patrolPath.length > 0) {
      const targetPatrolPoint = this.patrolPath[this.currentPatrolIndex]
      const distanceToTarget = this.position.distanceTo(targetPatrolPoint)
      
      if (distanceToTarget < 2) {
        this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPath.length
      }
    }
  }
  
  private handleInvestigating(deltaTime: number, playerVisible: boolean, playerDistance: number): void {
    if (playerVisible) {
      this.setState(EnemyState.CHASING)
      return
    }
    
    const investigationTime = (Date.now() - this.investigationStartTime) / 1000
    if (investigationTime >= this.config.ai.investigationTime) {
      this.setState(EnemyState.PATROLLING)
      this.alertLevel = 0
      return
    }
    
    // Move towards last known position
    if (this.lastKnownPlayerPosition) {
      const distance = this.position.distanceTo(this.lastKnownPlayerPosition)
      if (distance < 3) {
        // Reached investigation point, look around
        this.rotation.y += deltaTime * 2
      }
    }
  }
  
  private handleChasing(playerVisible: boolean, playerDistance: number): void {
    if (!playerVisible) {
      const timeSinceLastSight = (Date.now() - this.lastPlayerSightTime) / 1000
      if (timeSinceLastSight > this.config.ai.memoryDuration) {
        this.setState(EnemyState.INVESTIGATING)
        return
      }
    }
    
    if (playerDistance <= this.config.combat.optimalRange) {
      this.setState(EnemyState.ATTACKING)
      return
    }
    
    // Behavior-specific chasing
    switch (this.config.ai.behavior) {
      case AIBehavior.COWARD:
        if (this.config.health.current < this.config.health.max * 0.3) {
          this.setState(EnemyState.RETREATING)
        }
        break
        
      case AIBehavior.TACTICAL:
        if (Math.random() < 0.3) {
          this.setState(EnemyState.FLANKING)
        }
        break
        
      case AIBehavior.SNIPER:
        if (playerDistance > this.config.combat.optimalRange * 0.8) {
          this.setState(EnemyState.ATTACKING)
        }
        break
    }
  }
  
  private handleAttacking(playerVisible: boolean, playerDistance: number): void {
    if (!playerVisible) {
      this.setState(EnemyState.CHASING)
      return
    }
    
    if (playerDistance > this.config.combat.maxRange) {
      this.setState(EnemyState.CHASING)
      return
    }
    
    // Check if need to reload
    if (this.currentAmmo <= 0) {
      this.setState(EnemyState.RELOADING)
      return
    }
    
    // Check if should take cover
    if (this.config.ai.behavior === AIBehavior.TACTICAL && 
        this.config.health.current < this.config.health.max * 0.5 &&
        Math.random() < 0.4) {
      this.setState(EnemyState.TAKING_COVER)
      return
    }
    
    // Maintain optimal distance
    if (playerDistance < this.config.combat.optimalRange * 0.7) {
      // Too close, back up
      const retreatDirection = this.position.clone().sub(this.target!.position).normalize()
      this.position.add(retreatDirection.multiplyScalar(this.config.movement.walkSpeed * 0.5))
    } else if (playerDistance > this.config.combat.optimalRange * 1.3) {
      // Too far, move closer
      this.setState(EnemyState.CHASING)
    }
  }
  
  private handleTakingCover(deltaTime: number, playerVisible: boolean, playerDistance: number): void {
    if (!this.coverPosition) {
      this.findCoverPosition()
    }
    
    if (this.coverPosition) {
      const distanceToCover = this.position.distanceTo(this.coverPosition)
      if (distanceToCover < 2) {
        // Reached cover, wait a bit then attack again
        setTimeout(() => {
          if (this.state === EnemyState.TAKING_COVER) {
            this.setState(EnemyState.ATTACKING)
          }
        }, 2000 + Math.random() * 2000)
      }
    } else {
      // No cover found, keep attacking
      this.setState(EnemyState.ATTACKING)
    }
  }
  
  private handleReloading(deltaTime: number, playerVisible: boolean, playerDistance: number): void {
    if (!this.isReloading) {
      this.isReloading = true
      this.reloadStartTime = Date.now()
    }
    
    const reloadTime = (Date.now() - this.reloadStartTime) / 1000
    if (reloadTime >= this.config.combat.reloadTime) {
      this.currentAmmo = WEAPON_CONFIGS[this.config.combat.weaponType].magazineSize
      this.isReloading = false
      this.setState(playerVisible ? EnemyState.ATTACKING : EnemyState.CHASING)
    }
  }
  
  private handleFlanking(playerVisible: boolean, playerDistance: number): void {
    if (playerVisible && playerDistance <= this.config.combat.optimalRange) {
      this.setState(EnemyState.ATTACKING)
      return
    }
    
    // Simple flanking: try to approach from the side
    if (this.target) {
      const toPlayer = this.target.position.clone().sub(this.position)
      const perpendicular = new THREE.Vector3(-toPlayer.z, 0, toPlayer.x).normalize()
      const flankDirection = Math.random() < 0.5 ? perpendicular : perpendicular.negate()
      
      // Move in flanking direction for a bit
      setTimeout(() => {
        if (this.state === EnemyState.FLANKING) {
          this.setState(EnemyState.CHASING)
        }
      }, 3000)
    }
  }
  
  private handleRetreating(playerVisible: boolean, playerDistance: number): void {
    if (this.config.health.current > this.config.health.max * 0.6) {
      this.setState(EnemyState.CHASING)
      return
    }
    
    // Move away from player
    if (playerDistance > this.config.combat.maxRange * 1.5) {
      // Far enough, try to heal or regroup
      if (this.config.health.regenerationRate > 0) {
        setTimeout(() => {
          if (this.state === EnemyState.RETREATING) {
            this.setState(EnemyState.CHASING)
          }
        }, 5000)
      }
    }
  }
  
  // Handle teamwork behaviors
  private handleTeamwork(player: Player): void {
    if (this.config.ai.teamwork <= 0 || this.teammates.length === 0) return
    
    // Share player position with teammates
    if (this.target && this.config.ai.teamwork > 0.5) {
      this.teammates.forEach(teammate => {
        if (teammate.position.distanceTo(this.position) <= 30) {
          teammate.lastKnownPlayerPosition = this.lastKnownPlayerPosition
          teammate.alertLevel = Math.max(teammate.alertLevel, this.alertLevel * 0.8)
        }
      })
    }
    
    // Coordinate attacks
    if (this.state === EnemyState.ATTACKING && this.config.ai.teamwork > 0.7) {
      const nearbyTeammates = this.teammates.filter(t => 
        t.position.distanceTo(this.position) <= 20 && 
        (t.state === EnemyState.ATTACKING || t.state === EnemyState.CHASING)
      )
      
      if (nearbyTeammates.length >= 2) {
        // Coordinate flanking
        if (Math.random() < 0.3) {
          nearbyTeammates[0].setState(EnemyState.FLANKING)
        }
      }
    }
  }
  
  // Update movement
  private updateMovement(deltaTime: number): void {
    let targetPosition: THREE.Vector3 | null = null
    let moveSpeed = this.config.movement.walkSpeed
    
    switch (this.state) {
      case EnemyState.PATROLLING:
        if (this.patrolPath.length > 0) {
          targetPosition = this.patrolPath[this.currentPatrolIndex]
        }
        break
        
      case EnemyState.INVESTIGATING:
        targetPosition = this.lastKnownPlayerPosition
        break
        
      case EnemyState.CHASING:
      case EnemyState.FLANKING:
        targetPosition = this.target?.position || this.lastKnownPlayerPosition
        moveSpeed = this.config.movement.runSpeed
        break
        
      case EnemyState.TAKING_COVER:
        targetPosition = this.coverPosition
        moveSpeed = this.config.movement.runSpeed
        break
        
      case EnemyState.RETREATING:
        if (this.target) {
          const retreatDirection = this.position.clone().sub(this.target.position).normalize()
          targetPosition = this.position.clone().add(retreatDirection.multiplyScalar(10))
        }
        moveSpeed = this.config.movement.runSpeed
        break
    }
    
    if (targetPosition) {
      // Calculate movement
      const direction = targetPosition.clone().sub(this.position)
      const distance = direction.length()
      
      if (distance > 0.5) {
        direction.normalize()
        
        // Apply movement
        const targetVelocity = direction.multiplyScalar(moveSpeed)
        this.velocity.lerp(targetVelocity, this.config.movement.acceleration * deltaTime)
        
        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime))
        
        // Update rotation to face movement direction
        const targetRotation = Math.atan2(direction.x, direction.z)
        this.rotation.y = THREE.MathUtils.lerp(
          this.rotation.y,
          targetRotation,
          this.config.movement.rotationSpeed * deltaTime
        )
      }
    }
  }
  
  // Update combat
  private updateCombat(deltaTime: number, player: Player): void {
    if (this.state !== EnemyState.ATTACKING || !this.target || this.isReloading) return
    
    const now = Date.now()
    const playerDistance = this.position.distanceTo(player.position)
    
    // Check if can shoot
    if (now >= this.nextShotTime && this.currentAmmo > 0 && playerDistance <= this.config.combat.maxRange) {
      // Calculate accuracy based on distance and enemy state
      let accuracy = this.config.combat.accuracy
      
      // Distance affects accuracy
      const distanceAccuracyModifier = Math.max(0.3, 1 - (playerDistance / this.config.combat.maxRange))
      accuracy *= distanceAccuracyModifier
      
      // Player state affects accuracy
      if (player.state === PlayerState.RUNNING) {
        accuracy *= 0.7
      } else if (player.state === PlayerState.CROUCHING) {
        accuracy *= 0.9
      }
      
      // Random spread
      const hitChance = Math.random()
      if (hitChance < accuracy) {
        this.shootAtPlayer(player)
      }
      
      this.currentAmmo--
      this.burstShotsRemaining--
      
      // Set next shot time
      this.nextShotTime = now + (this.config.combat.fireRate * 1000)
      
      // Handle burst firing
      if (this.burstShotsRemaining <= 0) {
        this.burstShotsRemaining = this.config.combat.burstLength
        this.nextShotTime = now + (this.config.combat.fireRate * 1000 * 3) // Longer pause between bursts
      }
    }
  }
  
  // Shoot at player
  private shootAtPlayer(player: Player): void {
    // Calculate hit zone based on aim and distance
    let hitZone = HitZone.CHEST
    const rand = Math.random()
    
    if (rand < 0.1) {
      hitZone = HitZone.HEAD
    } else if (rand < 0.3) {
      hitZone = HitZone.ARMS
    } else if (rand < 0.5) {
      hitZone = HitZone.LEGS
    }
    
    // Calculate damage
    const weaponConfig = WEAPON_CONFIGS[this.config.combat.weaponType]
    let damage = weaponConfig.damage
    
    // Modify damage based on enemy type
    if (this.config.type === EnemyType.ZOMBIE || this.config.type === EnemyType.MUTANT) {
      damage = 20 // Melee damage
    }
    
    // Apply damage to player
    const isDead = player.takeDamage(damage, DamageType.BULLET, hitZone)
    
    if (isDead) {
      this.setState(EnemyState.IDLE)
      this.target = null
    }
  }
  
  // Update health
  private updateHealth(deltaTime: number): void {
    if (this.config.health.current < this.config.health.max && this.config.health.regenerationRate > 0) {
      this.config.health.current = Math.min(
        this.config.health.max,
        this.config.health.current + this.config.health.regenerationRate * deltaTime
      )
    }
  }
  
  // Check if enemy can see player
  private canSeePlayer(player: Player): boolean {
    const distance = this.position.distanceTo(player.position)
    if (distance > this.config.ai.alertRadius) return false
    
    // Check field of view
    const toPlayer = player.position.clone().sub(this.position).normalize()
    const forward = new THREE.Vector3(Math.sin(this.rotation.y), 0, Math.cos(this.rotation.y))
    const angle = Math.acos(forward.dot(toPlayer)) * (180 / Math.PI)
    
    return angle <= this.config.ai.fieldOfView / 2
  }
  
  // Generate patrol path
  private generatePatrolPath(): void {
    const numPoints = 3 + Math.floor(Math.random() * 4)
    this.patrolPath = []
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2
      const radius = this.config.ai.patrolRadius * (0.5 + Math.random() * 0.5)
      const point = new THREE.Vector3(
        this.position.x + Math.cos(angle) * radius,
        this.position.y,
        this.position.z + Math.sin(angle) * radius
      )
      this.patrolPath.push(point)
    }
  }
  
  // Find cover position
  private findCoverPosition(): void {
    // Simple cover finding: look for a position that puts distance between enemy and player
    if (!this.target) return
    
    const directions = [
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(1, 0, 1).normalize(),
      new THREE.Vector3(-1, 0, 1).normalize(),
      new THREE.Vector3(1, 0, -1).normalize(),
      new THREE.Vector3(-1, 0, -1).normalize()
    ]
    
    let bestPosition: THREE.Vector3 | null = null
    let bestScore = -1
    
    for (const direction of directions) {
      const testPosition = this.position.clone().add(direction.multiplyScalar(10))
      const distanceToPlayer = testPosition.distanceTo(this.target.position)
      const score = distanceToPlayer
      
      if (score > bestScore) {
        bestScore = score
        bestPosition = testPosition
      }
    }
    
    this.coverPosition = bestPosition
  }
  
  // Take damage
  takeDamage(amount: number, damageType: DamageType, hitZone: HitZone): boolean {
    if (this.state === EnemyState.DEAD) return false
    
    // Apply hit zone multiplier
    let finalDamage = amount * (hitZone === HitZone.HEAD ? 2.0 : 1.0)
    
    // Apply armor
    let armorValue = 0
    switch (hitZone) {
      case HitZone.HEAD:
        armorValue = this.config.armor.head
        break
      case HitZone.CHEST:
        armorValue = this.config.armor.chest
        break
      case HitZone.LEGS:
        armorValue = this.config.armor.legs
        break
    }
    
    finalDamage *= Math.max(0.1, 1 - (armorValue / 100))
    
    this.config.health.current = Math.max(0, this.config.health.current - finalDamage)
    
    // Become alert when hit
    this.alertLevel = 1.0
    this.lastPlayerSightTime = Date.now()
    
    if (this.state === EnemyState.PATROLLING) {
      this.setState(EnemyState.INVESTIGATING)
    }
    
    // Check if dead
    if (this.config.health.current <= 0) {
      this.setState(EnemyState.DEAD)
      return true
    }
    
    return false
  }
  
  // Set enemy state
  private setState(newState: EnemyState): void {
    if (this.state !== newState) {
      this.state = newState
      
      // Reset burst when changing states
      if (newState === EnemyState.ATTACKING) {
        this.burstShotsRemaining = this.config.combat.burstLength
      }
    }
  }
  
  // Get enemy status
  getStatus(): {
    type: EnemyType
    health: number
    state: EnemyState
    alertLevel: number
    weapon: WeaponType
    ammo: number
  } {
    return {
      type: this.config.type,
      health: Math.round(this.config.health.current),
      state: this.state,
      alertLevel: Math.round(this.alertLevel * 100) / 100,
      weapon: this.config.combat.weaponType,
      ammo: this.currentAmmo
    }
  }
}

// Enemy manager
export class EnemyManager {
  private enemies: Enemy[] = []
  
  // Spawn enemy
  spawnEnemy(type: EnemyType, position: THREE.Vector3): Enemy {
    const enemy = new Enemy(type, position)
    this.enemies.push(enemy)
    return enemy
  }
  
  // Update all enemies
  updateEnemies(deltaTime: number, player: Player): void {
    this.enemies.forEach(enemy => {
      if (enemy.state !== EnemyState.DEAD) {
        enemy.update(deltaTime, player, this.enemies)
      }
    })
    
    // Remove dead enemies after some time
    this.enemies = this.enemies.filter(enemy => {
      if (enemy.state === EnemyState.DEAD) {
        // Could add death animation time here
        return false
      }
      return true
    })
  }
  
  // Get all alive enemies
  getAliveEnemies(): Enemy[] {
    return this.enemies.filter(enemy => enemy.state !== EnemyState.DEAD)
  }
  
  // Get enemies in radius
  getEnemiesInRadius(position: THREE.Vector3, radius: number): Enemy[] {
    return this.enemies.filter(enemy => 
      enemy.state !== EnemyState.DEAD && 
      enemy.position.distanceTo(position) <= radius
    )
  }
  
  // Clear all enemies
  clearEnemies(): void {
    this.enemies = []
  }
  
  // Get enemy count
  getEnemyCount(): number {
    return this.getAliveEnemies().length
  }
}
