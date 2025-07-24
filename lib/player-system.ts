import * as THREE from "three"
import { WeaponManager, WeaponType, Weapon } from "./weapon-system"

// Player states
export enum PlayerState {
  IDLE = 'idle',
  WALKING = 'walking',
  RUNNING = 'running',
  CROUCHING = 'crouching',
  PRONE = 'prone',
  JUMPING = 'jumping',
  FALLING = 'falling',
  AIMING = 'aiming',
  RELOADING = 'reloading',
  DEAD = 'dead'
}

// Player configuration
export interface PlayerConfig {
  health: {
    max: number
    current: number
    regenerationRate: number
    regenerationDelay: number
  }
  stamina: {
    max: number
    current: number
    regenerationRate: number
    drainRate: {
      running: number
      jumping: number
      aiming: number
    }
  }
  movement: {
    walkSpeed: number
    runSpeed: number
    crouchSpeed: number
    proneSpeed: number
    jumpHeight: number
    acceleration: number
    deceleration: number
  }
  armor: {
    head: number
    chest: number
    legs: number
    durability: number
  }
  skills: {
    accuracy: number
    recoilControl: number
    reloadSpeed: number
    repairSkill: number
    endurance: number
  }
}

// Default player configuration
export const DEFAULT_PLAYER_CONFIG: PlayerConfig = {
  health: {
    max: 100,
    current: 100,
    regenerationRate: 2, // HP per second
    regenerationDelay: 5000 // milliseconds before regen starts
  },
  stamina: {
    max: 100,
    current: 100,
    regenerationRate: 10, // stamina per second
    drainRate: {
      running: 15, // stamina per second while running
      jumping: 20, // stamina per jump
      aiming: 5 // stamina per second while aiming
    }
  },
  movement: {
    walkSpeed: 3,
    runSpeed: 6,
    crouchSpeed: 1.5,
    proneSpeed: 0.8,
    jumpHeight: 2,
    acceleration: 10,
    deceleration: 8
  },
  armor: {
    head: 0,
    chest: 0,
    legs: 0,
    durability: 100
  },
  skills: {
    accuracy: 1.0,
    recoilControl: 1.0,
    reloadSpeed: 1.0,
    repairSkill: 1.0,
    endurance: 1.0
  }
}

// Damage types
export enum DamageType {
  BULLET = 'bullet',
  EXPLOSION = 'explosion',
  FALL = 'fall',
  FIRE = 'fire',
  POISON = 'poison',
  MELEE = 'melee'
}

// Hit zones with damage multipliers
export enum HitZone {
  HEAD = 'head',
  CHEST = 'chest',
  ARMS = 'arms',
  LEGS = 'legs'
}

export const HIT_ZONE_MULTIPLIERS: Record<HitZone, number> = {
  [HitZone.HEAD]: 2.0,
  [HitZone.CHEST]: 1.0,
  [HitZone.ARMS]: 0.8,
  [HitZone.LEGS]: 0.7
}

// Player class
export class Player {
  public config: PlayerConfig
  public position: THREE.Vector3 = new THREE.Vector3()
  public rotation: THREE.Euler = new THREE.Euler()
  public velocity: THREE.Vector3 = new THREE.Vector3()
  public state: PlayerState = PlayerState.IDLE
  public weaponManager: WeaponManager = new WeaponManager()
  
  // Internal state
  private lastDamageTime: number = 0
  private lastStaminaUse: number = 0
  private isGrounded: boolean = true
  private isAiming: boolean = false
  private aimingStartTime: number = 0
  private cameraShake: THREE.Vector3 = new THREE.Vector3()
  private statusEffects: Map<string, any> = new Map()
  
  // Input tracking
  public input: {
    forward: boolean
    backward: boolean
    left: boolean
    right: boolean
    run: boolean
    crouch: boolean
    prone: boolean
    jump: boolean
    aim: boolean
    fire: boolean
    reload: boolean
  } = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
    crouch: false,
    prone: false,
    jump: false,
    aim: false,
    fire: false,
    reload: false
  }
  
  constructor(config: Partial<PlayerConfig> = {}) {
    this.config = { ...DEFAULT_PLAYER_CONFIG, ...config }
  }
  
  // Update player state
  update(deltaTime: number): void {
    this.updateMovement(deltaTime)
    this.updateHealth(deltaTime)
    this.updateStamina(deltaTime)
    this.updateWeapons(deltaTime)
    this.updateStatusEffects(deltaTime)
    this.updateCameraShake(deltaTime)
  }
  
  // Update movement
  private updateMovement(deltaTime: number): void {
    const moveVector = new THREE.Vector3()
    
    // Calculate movement direction
    if (this.input.forward) moveVector.z -= 1
    if (this.input.backward) moveVector.z += 1
    if (this.input.left) moveVector.x -= 1
    if (this.input.right) moveVector.x += 1
    
    moveVector.normalize()
    
    // Determine movement speed based on state
    let speed = this.config.movement.walkSpeed
    let staminaDrain = 0
    
    if (this.input.run && this.config.stamina.current > 0) {
      speed = this.config.movement.runSpeed
      staminaDrain = this.config.stamina.drainRate.running
      this.setState(PlayerState.RUNNING)
    } else if (this.input.crouch) {
      speed = this.config.movement.crouchSpeed
      this.setState(PlayerState.CROUCHING)
    } else if (this.input.prone) {
      speed = this.config.movement.proneSpeed
      this.setState(PlayerState.PRONE)
    } else if (moveVector.length() > 0) {
      this.setState(PlayerState.WALKING)
    } else {
      this.setState(PlayerState.IDLE)
    }
    
    // Apply movement modifiers
    speed *= this.config.skills.endurance
    
    // Calculate target velocity
    const targetVelocity = moveVector.multiplyScalar(speed)
    
    // Apply acceleration/deceleration
    const acceleration = moveVector.length() > 0 ? 
      this.config.movement.acceleration : this.config.movement.deceleration
    
    this.velocity.x = THREE.MathUtils.lerp(
      this.velocity.x, 
      targetVelocity.x, 
      acceleration * deltaTime
    )
    this.velocity.z = THREE.MathUtils.lerp(
      this.velocity.z, 
      targetVelocity.z, 
      acceleration * deltaTime
    )
    
    // Handle jumping
    if (this.input.jump && this.isGrounded && this.config.stamina.current >= this.config.stamina.drainRate.jumping) {
      this.velocity.y = this.config.movement.jumpHeight
      this.isGrounded = false
      this.setState(PlayerState.JUMPING)
      this.drainStamina(this.config.stamina.drainRate.jumping)
    }
    
    // Apply gravity (simplified)
    if (!this.isGrounded) {
      this.velocity.y -= 9.81 * deltaTime
      if (this.velocity.y < 0) {
        this.setState(PlayerState.FALLING)
      }
    }
    
    // Update position
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime))
    
    // Drain stamina for running
    if (staminaDrain > 0) {
      this.drainStamina(staminaDrain * deltaTime)
    }
    
    // Handle aiming
    if (this.input.aim) {
      if (!this.isAiming) {
        this.isAiming = true
        this.aimingStartTime = Date.now()
      }
      this.setState(PlayerState.AIMING)
      this.drainStamina(this.config.stamina.drainRate.aiming * deltaTime)
    } else {
      this.isAiming = false
    }
  }
  
  // Update health regeneration
  private updateHealth(deltaTime: number): void {
    const timeSinceLastDamage = Date.now() - this.lastDamageTime
    
    if (timeSinceLastDamage >= this.config.health.regenerationDelay && 
        this.config.health.current < this.config.health.max) {
      const healAmount = this.config.health.regenerationRate * deltaTime
      this.config.health.current = Math.min(
        this.config.health.max, 
        this.config.health.current + healAmount
      )
    }
  }
  
  // Update stamina regeneration
  private updateStamina(deltaTime: number): void {
    if (this.config.stamina.current < this.config.stamina.max) {
      const regenAmount = this.config.stamina.regenerationRate * deltaTime * this.config.skills.endurance
      this.config.stamina.current = Math.min(
        this.config.stamina.max,
        this.config.stamina.current + regenAmount
      )
    }
  }
  
  // Update weapons
  private updateWeapons(deltaTime: number): void {
    const currentWeapon = this.weaponManager.getCurrentWeapon()
    if (!currentWeapon) return
    
    // Handle firing
    if (this.input.fire && currentWeapon.canFire()) {
      if (currentWeapon.fire()) {
        // Apply weapon recoil to camera
        this.applyCameraRecoil(currentWeapon)
        // Apply muzzle flash and effects here
      }
    }
    
    // Handle reloading
    if (this.input.reload && !currentWeapon.isReloading) {
      if (currentWeapon.reload()) {
        this.setState(PlayerState.RELOADING)
      }
    }
    
    // Update recoil recovery
    if (currentWeapon.recoilOffset.length() > 0) {
      currentWeapon.recoilOffset.multiplyScalar(Math.max(0, 1 - 5 * deltaTime))
    }
  }
  
  // Update status effects
  private updateStatusEffects(deltaTime: number): void {
    for (const [effectName, effect] of this.statusEffects.entries()) {
      effect.duration -= deltaTime
      
      if (effect.duration <= 0) {
        this.removeStatusEffect(effectName)
      } else {
        // Apply effect
        if (effect.type === 'poison') {
          this.takeDamage(effect.damagePerSecond * deltaTime, DamageType.POISON, HitZone.CHEST)
        } else if (effect.type === 'bleeding') {
          this.takeDamage(effect.damagePerSecond * deltaTime, DamageType.BULLET, HitZone.CHEST)
        }
      }
    }
  }
  
  // Update camera shake
  private updateCameraShake(deltaTime: number): void {
    this.cameraShake.multiplyScalar(Math.max(0, 1 - 10 * deltaTime))
  }
  
  // Apply camera recoil from weapon
  private applyCameraRecoil(weapon: Weapon): void {
    const recoilModifier = 2 - this.config.skills.recoilControl
    const baseRecoil = weapon.recoilOffset.clone()
    
    // Modify recoil based on player state
    if (this.state === PlayerState.CROUCHING) {
      baseRecoil.multiplyScalar(0.8)
    } else if (this.state === PlayerState.PRONE) {
      baseRecoil.multiplyScalar(0.6)
    } else if (this.isAiming) {
      const aimingTime = Math.min((Date.now() - this.aimingStartTime) / 1000, 2)
      const aimingStability = Math.min(1, aimingTime / 2) // Stability improves over 2 seconds
      baseRecoil.multiplyScalar(1 - aimingStability * 0.5)
    }
    
    this.cameraShake.add(new THREE.Vector3(
      baseRecoil.x * recoilModifier,
      baseRecoil.y * recoilModifier,
      0
    ))
  }
  
  // Take damage
  takeDamage(amount: number, damageType: DamageType, hitZone: HitZone): boolean {
    if (this.config.health.current <= 0) return false
    
    // Apply hit zone multiplier
    let finalDamage = amount * HIT_ZONE_MULTIPLIERS[hitZone]
    
    // Apply armor reduction
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
    
    // Armor reduces damage (simple formula)
    finalDamage *= Math.max(0.1, 1 - (armorValue / 100))
    
    // Apply damage type modifiers
    if (damageType === DamageType.EXPLOSION) {
      finalDamage *= 1.2 // Explosions do more damage
    }
    
    this.config.health.current = Math.max(0, this.config.health.current - finalDamage)
    this.lastDamageTime = Date.now()
    
    // Add screen shake for damage
    this.cameraShake.add(new THREE.Vector3(
      (Math.random() - 0.5) * finalDamage * 0.01,
      (Math.random() - 0.5) * finalDamage * 0.01,
      0
    ))
    
    // Check if dead
    if (this.config.health.current <= 0) {
      this.setState(PlayerState.DEAD)
      return true
    }
    
    return false
  }
  
  // Heal player
  heal(amount: number): void {
    this.config.health.current = Math.min(
      this.config.health.max, 
      this.config.health.current + amount
    )
  }
  
  // Drain stamina
  private drainStamina(amount: number): void {
    this.config.stamina.current = Math.max(0, this.config.stamina.current - amount)
    this.lastStaminaUse = Date.now()
  }
  
  // Set player state
  private setState(newState: PlayerState): void {
    if (this.state !== newState) {
      this.state = newState
    }
  }
  
  // Add status effect
  addStatusEffect(name: string, effect: any): void {
    this.statusEffects.set(name, effect)
  }
  
  // Remove status effect
  removeStatusEffect(name: string): void {
    this.statusEffects.delete(name)
  }
  
  // Get camera shake for rendering
  getCameraShake(): THREE.Vector3 {
    return this.cameraShake.clone()
  }
  
  // Check if player can perform action
  canPerformAction(action: string): boolean {
    if (this.state === PlayerState.DEAD) return false
    
    switch (action) {
      case 'run':
        return this.config.stamina.current > 0
      case 'jump':
        return this.isGrounded && this.config.stamina.current >= this.config.stamina.drainRate.jumping
      case 'aim':
        return this.weaponManager.getCurrentWeapon() !== null
      case 'fire':
        const weapon = this.weaponManager.getCurrentWeapon()
        return weapon !== null && weapon.canFire()
      case 'reload':
        const currentWeapon = this.weaponManager.getCurrentWeapon()
        return currentWeapon !== null && !currentWeapon.isReloading && 
               currentWeapon.reserveAmmo > 0 && 
               currentWeapon.currentAmmo < currentWeapon.config.magazineSize
      default:
        return true
    }
  }
  
  // Upgrade skill
  upgradeSkill(skill: keyof PlayerConfig['skills'], amount: number): void {
    this.config.skills[skill] = Math.min(2.0, this.config.skills[skill] + amount)
  }
  
  // Add armor
  addArmor(zone: keyof PlayerConfig['armor'], amount: number): void {
    if (zone === 'durability') {
      this.config.armor.durability = Math.min(100, this.config.armor.durability + amount)
    } else {
      this.config.armor[zone] = Math.min(100, this.config.armor[zone] + amount)
    }
  }
  
  // Get player status
  getStatus(): {
    health: number
    stamina: number
    state: PlayerState
    weapon: string | null
    ammo: string | null
    armor: number
    skills: PlayerConfig['skills']
  } {
    const currentWeapon = this.weaponManager.getCurrentWeapon()
    
    return {
      health: Math.round(this.config.health.current),
      stamina: Math.round(this.config.stamina.current),
      state: this.state,
      weapon: currentWeapon?.config.name || null,
      ammo: currentWeapon ? `${currentWeapon.currentAmmo}/${currentWeapon.reserveAmmo}` : null,
      armor: Math.round((this.config.armor.head + this.config.armor.chest + this.config.armor.legs) / 3),
      skills: { ...this.config.skills }
    }
  }
  
  // Reset player (for respawn)
  reset(): void {
    this.config.health.current = this.config.health.max
    this.config.stamina.current = this.config.stamina.max
    this.state = PlayerState.IDLE
    this.velocity.set(0, 0, 0)
    this.cameraShake.set(0, 0, 0)
    this.statusEffects.clear()
    this.lastDamageTime = 0
    this.isGrounded = true
    this.isAiming = false
  }
}
