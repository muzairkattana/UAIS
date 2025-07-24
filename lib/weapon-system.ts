import * as THREE from "three"

// Weapon types enum
export enum WeaponType {
  ASSAULT_RIFLE = 'assault_rifle',
  SNIPER_RIFLE = 'sniper_rifle',
  SHOTGUN = 'shotgun',
  PISTOL = 'pistol',
  SMG = 'smg',
  LMG = 'lmg',
  ROCKET_LAUNCHER = 'rocket_launcher',
  GRENADE_LAUNCHER = 'grenade_launcher'
}

// Ammunition types
export enum AmmoType {
  RIFLE_AMMO = 'rifle_ammo',
  SNIPER_AMMO = 'sniper_ammo',
  SHOTGUN_SHELLS = 'shotgun_shells',
  PISTOL_AMMO = 'pistol_ammo',
  SMG_AMMO = 'smg_ammo',
  LMG_AMMO = 'lmg_ammo',
  ROCKETS = 'rockets',
  GRENADES = 'grenades'
}

// Weapon configuration interface
export interface WeaponConfig {
  type: WeaponType
  name: string
  damage: number
  fireRate: number // rounds per minute
  accuracy: number // 0-1 scale
  range: number
  reloadTime: number // seconds
  magazineSize: number
  ammoType: AmmoType
  recoil: { x: number; y: number }
  penetration: number
  muzzleVelocity: number
  soundProfile: {
    fire: string
    reload: string
    empty: string
  }
  animations: {
    idle: string
    fire: string
    reload: string
    aim: string
  }
  attachments?: {
    scope?: boolean
    suppressor?: boolean
    foregrip?: boolean
    laser?: boolean
  }
  model?: {
    geometry: THREE.BufferGeometry
    material: THREE.Material
    scale: THREE.Vector3
    position: THREE.Vector3
    rotation: THREE.Vector3
  }
}

// Weapon definitions
export const WEAPON_CONFIGS: Record<WeaponType, WeaponConfig> = {
  [WeaponType.ASSAULT_RIFLE]: {
    type: WeaponType.ASSAULT_RIFLE,
    name: "AK-47 Assault Rifle",
    damage: 35,
    fireRate: 600,
    accuracy: 0.75,
    range: 300,
    reloadTime: 2.5,
    magazineSize: 30,
    ammoType: AmmoType.RIFLE_AMMO,
    recoil: { x: 0.8, y: 1.2 },
    penetration: 0.6,
    muzzleVelocity: 715,
    soundProfile: {
      fire: "assault_rifle_fire",
      reload: "assault_rifle_reload",
      empty: "empty_click"
    },
    animations: {
      idle: "ar_idle",
      fire: "ar_fire",
      reload: "ar_reload",
      aim: "ar_aim"
    },
    attachments: {
      scope: true,
      suppressor: true,
      foregrip: true,
      laser: true
    }
  },
  [WeaponType.SNIPER_RIFLE]: {
    type: WeaponType.SNIPER_RIFLE,
    name: "Barrett M82 Sniper Rifle",
    damage: 150,
    fireRate: 60,
    accuracy: 0.95,
    range: 1000,
    reloadTime: 4.0,
    magazineSize: 10,
    ammoType: AmmoType.SNIPER_AMMO,
    recoil: { x: 2.5, y: 3.0 },
    penetration: 0.9,
    muzzleVelocity: 853,
    soundProfile: {
      fire: "sniper_rifle_fire",
      reload: "sniper_rifle_reload",
      empty: "empty_click"
    },
    animations: {
      idle: "sniper_idle",
      fire: "sniper_fire",
      reload: "sniper_reload",
      aim: "sniper_aim"
    },
    attachments: {
      scope: true,
      suppressor: true,
      foregrip: false,
      laser: false
    }
  },
  [WeaponType.SHOTGUN]: {
    type: WeaponType.SHOTGUN,
    name: "Remington 870 Shotgun",
    damage: 80,
    fireRate: 120,
    accuracy: 0.4,
    range: 50,
    reloadTime: 3.5,
    magazineSize: 8,
    ammoType: AmmoType.SHOTGUN_SHELLS,
    recoil: { x: 1.5, y: 2.0 },
    penetration: 0.3,
    muzzleVelocity: 400,
    soundProfile: {
      fire: "shotgun_fire",
      reload: "shotgun_reload",
      empty: "empty_click"
    },
    animations: {
      idle: "shotgun_idle",
      fire: "shotgun_fire",
      reload: "shotgun_reload",
      aim: "shotgun_aim"
    },
    attachments: {
      scope: false,
      suppressor: false,
      foregrip: true,
      laser: true
    }
  },
  [WeaponType.PISTOL]: {
    type: WeaponType.PISTOL,
    name: "Glock 17 Pistol",
    damage: 25,
    fireRate: 400,
    accuracy: 0.65,
    range: 100,
    reloadTime: 1.8,
    magazineSize: 17,
    ammoType: AmmoType.PISTOL_AMMO,
    recoil: { x: 0.5, y: 0.8 },
    penetration: 0.3,
    muzzleVelocity: 375,
    soundProfile: {
      fire: "pistol_fire",
      reload: "pistol_reload",
      empty: "empty_click"
    },
    animations: {
      idle: "pistol_idle",
      fire: "pistol_fire",
      reload: "pistol_reload",
      aim: "pistol_aim"
    },
    attachments: {
      scope: false,
      suppressor: true,
      foregrip: false,
      laser: true
    }
  },
  [WeaponType.SMG]: {
    type: WeaponType.SMG,
    name: "MP5 Submachine Gun",
    damage: 28,
    fireRate: 800,
    accuracy: 0.7,
    range: 150,
    reloadTime: 2.2,
    magazineSize: 30,
    ammoType: AmmoType.SMG_AMMO,
    recoil: { x: 0.6, y: 0.9 },
    penetration: 0.4,
    muzzleVelocity: 400,
    soundProfile: {
      fire: "smg_fire",
      reload: "smg_reload",
      empty: "empty_click"
    },
    animations: {
      idle: "smg_idle",
      fire: "smg_fire",
      reload: "smg_reload",
      aim: "smg_aim"
    },
    attachments: {
      scope: true,
      suppressor: true,
      foregrip: true,
      laser: true
    }
  },
  [WeaponType.LMG]: {
    type: WeaponType.LMG,
    name: "M249 Light Machine Gun",
    damage: 45,
    fireRate: 750,
    accuracy: 0.6,
    range: 400,
    reloadTime: 5.0,
    magazineSize: 100,
    ammoType: AmmoType.LMG_AMMO,
    recoil: { x: 1.2, y: 1.8 },
    penetration: 0.7,
    muzzleVelocity: 915,
    soundProfile: {
      fire: "lmg_fire",
      reload: "lmg_reload",
      empty: "empty_click"
    },
    animations: {
      idle: "lmg_idle",
      fire: "lmg_fire",
      reload: "lmg_reload",
      aim: "lmg_aim"
    },
    attachments: {
      scope: true,
      suppressor: false,
      foregrip: true,
      laser: false
    }
  },
  [WeaponType.ROCKET_LAUNCHER]: {
    type: WeaponType.ROCKET_LAUNCHER,
    name: "RPG-7 Rocket Launcher",
    damage: 300,
    fireRate: 30,
    accuracy: 0.8,
    range: 500,
    reloadTime: 6.0,
    magazineSize: 1,
    ammoType: AmmoType.ROCKETS,
    recoil: { x: 3.0, y: 4.0 },
    penetration: 1.0,
    muzzleVelocity: 300,
    soundProfile: {
      fire: "rocket_fire",
      reload: "rocket_reload",
      empty: "empty_click"
    },
    animations: {
      idle: "rocket_idle",
      fire: "rocket_fire",
      reload: "rocket_reload",
      aim: "rocket_aim"
    },
    attachments: {
      scope: true,
      suppressor: false,
      foregrip: false,
      laser: false
    }
  },
  [WeaponType.GRENADE_LAUNCHER]: {
    type: WeaponType.GRENADE_LAUNCHER,
    name: "M79 Grenade Launcher",
    damage: 200,
    fireRate: 40,
    accuracy: 0.85,
    range: 350,
    reloadTime: 4.5,
    magazineSize: 1,
    ammoType: AmmoType.GRENADES,
    recoil: { x: 2.0, y: 2.5 },
    penetration: 0.8,
    muzzleVelocity: 76,
    soundProfile: {
      fire: "grenade_fire",
      reload: "grenade_reload",
      empty: "empty_click"
    },
    animations: {
      idle: "grenade_idle",
      fire: "grenade_fire",
      reload: "grenade_reload",
      aim: "grenade_aim"
    },
    attachments: {
      scope: true,
      suppressor: false,
      foregrip: false,
      laser: true
    }
  }
}

// Weapon class
export class Weapon {
  public config: WeaponConfig
  public currentAmmo: number
  public reserveAmmo: number
  public isReloading: boolean = false
  public lastFireTime: number = 0
  public recoilOffset: THREE.Vector2 = new THREE.Vector2()
  public attachments: Record<string, boolean> = {}
  public condition: number = 1.0 // 0-1 scale, affects accuracy and damage
  
  constructor(type: WeaponType, reserveAmmo: number = 0) {
    this.config = WEAPON_CONFIGS[type]
    this.currentAmmo = this.config.magazineSize
    this.reserveAmmo = reserveAmmo
    
    // Initialize attachments
    if (this.config.attachments) {
      Object.keys(this.config.attachments).forEach(attachment => {
        this.attachments[attachment] = false
      })
    }
  }
  
  // Check if weapon can fire
  canFire(): boolean {
    const currentTime = Date.now()
    const timeBetweenShots = 60000 / this.config.fireRate // Convert RPM to milliseconds
    
    return !this.isReloading && 
           this.currentAmmo > 0 && 
           (currentTime - this.lastFireTime) >= timeBetweenShots
  }
  
  // Fire the weapon
  fire(): boolean {
    if (!this.canFire()) {
      return false
    }
    
    this.currentAmmo--
    this.lastFireTime = Date.now()
    
    // Apply recoil
    this.applyRecoil()
    
    // Reduce condition slightly
    this.condition = Math.max(0, this.condition - 0.0001)
    
    return true
  }
  
  // Apply recoil effect
  private applyRecoil(): void {
    const conditionModifier = 2 - this.condition // Worse condition = more recoil
    let recoilX = (this.config.recoil.x * conditionModifier) * (Math.random() - 0.5)
    let recoilY = (this.config.recoil.y * conditionModifier) * Math.random()
    
    // Apply attachment modifiers
    if (this.attachments.foregrip) {
      recoilX *= 0.7
      recoilY *= 0.8
    }
    
    this.recoilOffset.x += recoilX
    this.recoilOffset.y += recoilY
  }
  
  // Start reload
  reload(): boolean {
    if (this.isReloading || this.reserveAmmo <= 0 || this.currentAmmo >= this.config.magazineSize) {
      return false
    }
    
    this.isReloading = true
    
    // Simulate reload time
    setTimeout(() => {
      const ammoNeeded = this.config.magazineSize - this.currentAmmo
      const ammoToReload = Math.min(ammoNeeded, this.reserveAmmo)
      
      this.currentAmmo += ammoToReload
      this.reserveAmmo -= ammoToReload
      this.isReloading = false
    }, this.config.reloadTime * 1000)
    
    return true
  }
  
  // Get effective damage (modified by condition and attachments)
  getEffectiveDamage(): number {
    let damage = this.config.damage * this.condition
    
    // Attachment modifiers
    if (this.attachments.suppressor) {
      damage *= 0.9 // Slight damage reduction for suppressor
    }
    
    return damage
  }
  
  // Get effective accuracy (modified by condition and attachments)
  getEffectiveAccuracy(): number {
    let accuracy = this.config.accuracy * this.condition
    
    // Attachment modifiers
    if (this.attachments.scope) {
      accuracy *= 1.2
    }
    if (this.attachments.foregrip) {
      accuracy *= 1.1
    }
    if (this.attachments.laser) {
      accuracy *= 1.05
    }
    
    return Math.min(1, accuracy)
  }
  
  // Attach/detach attachment
  toggleAttachment(attachmentType: string): boolean {
    if (!this.config.attachments?.[attachmentType as keyof typeof this.config.attachments]) {
      return false
    }
    
    this.attachments[attachmentType] = !this.attachments[attachmentType]
    return true
  }
  
  // Repair weapon
  repair(amount: number = 0.1): void {
    this.condition = Math.min(1, this.condition + amount)
  }
  
  // Get weapon info
  getInfo(): {
    name: string
    ammo: string
    damage: number
    accuracy: number
    condition: number
    attachments: string[]
  } {
    return {
      name: this.config.name,
      ammo: `${this.currentAmmo}/${this.reserveAmmo}`,
      damage: Math.round(this.getEffectiveDamage()),
      accuracy: Math.round(this.getEffectiveAccuracy() * 100),
      condition: Math.round(this.condition * 100),
      attachments: Object.entries(this.attachments)
        .filter(([_, attached]) => attached)
        .map(([type, _]) => type)
    }
  }
}

// Weapon manager class
export class WeaponManager {
  private weapons: Map<WeaponType, Weapon> = new Map()
  private currentWeapon: Weapon | null = null
  
  // Add weapon to inventory
  addWeapon(type: WeaponType, reserveAmmo: number = 0): void {
    if (!this.weapons.has(type)) {
      this.weapons.set(type, new Weapon(type, reserveAmmo))
    } else {
      // Add ammo to existing weapon
      const weapon = this.weapons.get(type)!
      weapon.reserveAmmo += reserveAmmo
    }
  }
  
  // Switch to weapon
  switchWeapon(type: WeaponType): boolean {
    const weapon = this.weapons.get(type)
    if (weapon) {
      this.currentWeapon = weapon
      return true
    }
    return false
  }
  
  // Get current weapon
  getCurrentWeapon(): Weapon | null {
    return this.currentWeapon
  }
  
  // Get all weapons
  getWeapons(): Map<WeaponType, Weapon> {
    return this.weapons
  }
  
  // Remove weapon
  removeWeapon(type: WeaponType): boolean {
    if (this.currentWeapon?.config.type === type) {
      this.currentWeapon = null
    }
    return this.weapons.delete(type)
  }
  
  // Add ammo to weapon
  addAmmo(ammoType: AmmoType, amount: number): void {
    for (const weapon of this.weapons.values()) {
      if (weapon.config.ammoType === ammoType) {
        weapon.reserveAmmo += amount
      }
    }
  }
}
