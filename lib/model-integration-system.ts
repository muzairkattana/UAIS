import { Group, Object3D, Vector3, Quaternion, AnimationMixer, AnimationAction, LoopRepeat } from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

// Model categories and their purposes
export enum ModelCategory {
  CHARACTER = 'character',
  WEAPON = 'weapon', 
  VEHICLE = 'vehicle',
  ENVIRONMENT = 'environment'
}

export enum CharacterType {
  PLAYER = 'player',
  SOLDIER = 'soldier',
  MERCENARY = 'mercenary',
  BASIC_ENEMY = 'basic_enemy'
}

export enum VehicleType {
  FIGHTER_JET = 'fighter_jet',
  HELICOPTER = 'helicopter'
}

export enum WeaponModelType {
  ASSAULT_RIFLE = 'assault_rifle',
  HEAVY_WEAPON = 'heavy_weapon'
}

// Model configuration interface
export interface ModelConfig {
  path: string;
  category: ModelCategory;
  scale: Vector3;
  rotationOffset: Vector3;
  positionOffset: Vector3;
  animations?: string[];
  attachmentPoints?: { [key: string]: Vector3 };
  healthMultiplier?: number;
  speedMultiplier?: number;
  damageMultiplier?: number;
}

// Professional model registry with specific purposes
export const MODEL_REGISTRY: { [key: string]: ModelConfig } = {
  // CHARACTER MODELS
  'player_character': {
    path: '/black_character.glb',
    category: ModelCategory.CHARACTER,
    scale: new Vector3(1, 1, 1),
    rotationOffset: new Vector3(0, 0, 0),
    positionOffset: new Vector3(0, 0, 0),
    animations: ['idle', 'walk', 'run', 'shoot', 'reload', 'death'],
    attachmentPoints: {
      'rightHand': new Vector3(0.3, 0.8, 0.1),
      'leftHand': new Vector3(-0.3, 0.8, 0.1),
      'head': new Vector3(0, 1.8, 0),
      'chest': new Vector3(0, 1.2, 0)
    },
    healthMultiplier: 1.0,
    speedMultiplier: 1.0
  },

  'elite_soldier': {
    path: '/scifi_soldier_character_low-poly.glb',
    category: ModelCategory.CHARACTER,
    scale: new Vector3(1.1, 1.1, 1.1),
    rotationOffset: new Vector3(0, 0, 0),
    positionOffset: new Vector3(0, 0, 0),
    animations: ['patrol', 'combat', 'aim', 'shoot', 'takeCover', 'death'],
    attachmentPoints: {
      'weapon': new Vector3(0.35, 1.0, 0.15),
      'helmet': new Vector3(0, 1.85, 0),
      'backpack': new Vector3(0, 1.3, -0.3)
    },
    healthMultiplier: 1.5,
    speedMultiplier: 0.9,
    damageMultiplier: 1.3
  },

  'mercenary_specialist': {
    path: '/jose_mercenary.glb',
    category: ModelCategory.CHARACTER,
    scale: new Vector3(1.05, 1.05, 1.05),
    rotationOffset: new Vector3(0, 0, 0),
    positionOffset: new Vector3(0, 0, 0),
    animations: ['stealth', 'assault', 'snipe', 'reload', 'dodge', 'death'],
    attachmentPoints: {
      'primaryWeapon': new Vector3(0.3, 0.9, 0.2),
      'secondaryWeapon': new Vector3(-0.25, 0.7, -0.15),
      'grenades': new Vector3(0.2, 0.6, -0.1)
    },
    healthMultiplier: 1.2,
    speedMultiplier: 1.1,
    damageMultiplier: 1.4
  },

  // VEHICLE MODELS
  'fighter_jet': {
    path: '/FIGTER JET.glb',
    category: ModelCategory.VEHICLE,
    scale: new Vector3(2, 2, 2),
    rotationOffset: new Vector3(0, Math.PI, 0),
    positionOffset: new Vector3(0, 10, 0),
    animations: ['fly', 'hover', 'attack', 'takeoff', 'landing'],
    attachmentPoints: {
      'cockpit': new Vector3(0, 1.2, 2),
      'leftWing': new Vector3(-3, 0, 0),
      'rightWing': new Vector3(3, 0, 0),
      'noseCannon': new Vector3(0, -0.5, 4)
    },
    healthMultiplier: 5.0,
    speedMultiplier: 3.0,
    damageMultiplier: 10.0
  },

  'combat_helicopter': {
    path: '/HALICOPTER.glb',
    category: ModelCategory.VEHICLE,
    scale: new Vector3(1.8, 1.8, 1.8),
    rotationOffset: new Vector3(0, 0, 0),
    positionOffset: new Vector3(0, 8, 0),
    animations: ['hover', 'forward', 'strafe', 'attack', 'land'],
    attachmentPoints: {
      'pilot': new Vector3(0.8, 0.5, 1),
      'gunner': new Vector3(-0.8, 0.5, 1),
      'leftRocket': new Vector3(-2, -0.5, 0),
      'rightRocket': new Vector3(2, -0.5, 0),
      'chainGun': new Vector3(0, -1, 2)
    },
    healthMultiplier: 4.0,
    speedMultiplier: 2.5,
    damageMultiplier: 8.0
  },

  // WEAPON MODELS
  'heavy_assault_weapon': {
    path: '/MAINGUN-16.glb',
    category: ModelCategory.WEAPON,
    scale: new Vector3(0.8, 0.8, 0.8),
    rotationOffset: new Vector3(0, Math.PI / 2, 0),
    positionOffset: new Vector3(0, 0, 0),
    animations: ['fire', 'reload', 'aim'],
    attachmentPoints: {
      'scope': new Vector3(0, 0.1, -0.3),
      'barrel': new Vector3(0, 0, 0.6),
      'grip': new Vector3(0, -0.2, 0.2),
      'magazine': new Vector3(0, -0.3, 0.1)
    },
    damageMultiplier: 2.5
  }
};

// Enhanced model instance with professional features
export class ModelInstance {
  public mesh: Group;
  public mixer?: AnimationMixer;
  public animations: Map<string, AnimationAction> = new Map();
  public attachmentPoints: Map<string, Object3D> = new Map();
  public config: ModelConfig;
  public category: ModelCategory;
  
  constructor(gltf: GLTF, config: ModelConfig) {
    this.mesh = gltf.scene.clone();
    this.config = config;
    this.category = config.category;
    
    // Apply transformations
    this.mesh.scale.copy(config.scale);
    this.mesh.rotation.setFromVector3(config.rotationOffset);
    this.mesh.position.copy(config.positionOffset);
    
    // Setup animations if available
    if (gltf.animations && gltf.animations.length > 0) {
      this.mixer = new AnimationMixer(this.mesh);
      
      gltf.animations.forEach((clip) => {
        const action = this.mixer!.createAction(clip);
        this.animations.set(clip.name, action);
      });
    }
    
    // Create attachment points
    if (config.attachmentPoints) {
      Object.entries(config.attachmentPoints).forEach(([name, position]) => {
        const attachmentPoint = new Object3D();
        attachmentPoint.position.copy(position);
        this.mesh.add(attachmentPoint);
        this.attachmentPoints.set(name, attachmentPoint);
      });
    }
    
    // Enable shadows
    this.mesh.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }
  
  // Play specific animation
  playAnimation(animationName: string, loop: boolean = true): boolean {
    const action = this.animations.get(animationName);
    if (!action) return false;
    
    // Stop all current animations
    this.animations.forEach((otherAction) => {
      if (otherAction !== action) {
        otherAction.stop();
      }
    });
    
    // Play the requested animation
    action.reset();
    action.setLoop(loop ? LoopRepeat : 2200, Infinity);
    action.play();
    
    return true;
  }
  
  // Attach object to specific point
  attachObject(object: Object3D, attachmentPointName: string): boolean {
    const attachmentPoint = this.attachmentPoints.get(attachmentPointName);
    if (!attachmentPoint) return false;
    
    attachmentPoint.add(object);
    return true;
  }
  
  // Update animations
  update(deltaTime: number): void {
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }
  }
  
  // Get world position of attachment point
  getAttachmentWorldPosition(pointName: string): Vector3 | null {
    const point = this.attachmentPoints.get(pointName);
    if (!point) return null;
    
    const worldPosition = new Vector3();
    point.getWorldPosition(worldPosition);
    return worldPosition;
  }
}

// Professional model manager with caching and optimization
export class ModelManager {
  private loadedModels: Map<string, GLTF> = new Map();
  private modelInstances: Map<string, ModelInstance> = new Map();
  private loader: any; // GLTFLoader will be injected
  
  constructor(gltfLoader: any) {
    this.loader = gltfLoader;
  }
  
  // Load model with caching
  async loadModel(modelKey: string): Promise<GLTF> {
    if (this.loadedModels.has(modelKey)) {
      return this.loadedModels.get(modelKey)!;
    }
    
    const config = MODEL_REGISTRY[modelKey];
    if (!config) {
      throw new Error(`Model configuration not found for key: ${modelKey}`);
    }
    
    try {
      const gltf = await new Promise<GLTF>((resolve, reject) => {
        this.loader.load(
          config.path,
          resolve,
          undefined,
          reject
        );
      });
      
      this.loadedModels.set(modelKey, gltf);
      return gltf;
    } catch (error) {
      console.error(`Failed to load model ${modelKey}:`, error);
      throw error;
    }
  }
  
  // Create model instance with professional setup
  async createModelInstance(modelKey: string, instanceId: string): Promise<ModelInstance> {
    const gltf = await this.loadModel(modelKey);
    const config = MODEL_REGISTRY[modelKey];
    
    const instance = new ModelInstance(gltf, config);
    this.modelInstances.set(instanceId, instance);
    
    return instance;
  }
  
  // Get existing instance
  getInstance(instanceId: string): ModelInstance | undefined {
    return this.modelInstances.get(instanceId);
  }
  
  // Create character with specific model
  async createCharacter(characterType: CharacterType, instanceId: string): Promise<ModelInstance> {
    let modelKey: string;
    
    switch (characterType) {
      case CharacterType.PLAYER:
        modelKey = 'player_character';
        break;
      case CharacterType.SOLDIER:
        modelKey = 'elite_soldier';
        break;
      case CharacterType.MERCENARY:
        modelKey = 'mercenary_specialist';
        break;
      default:
        modelKey = 'player_character';
    }
    
    return await this.createModelInstance(modelKey, instanceId);
  }
  
  // Create vehicle with specific model
  async createVehicle(vehicleType: VehicleType, instanceId: string): Promise<ModelInstance> {
    let modelKey: string;
    
    switch (vehicleType) {
      case VehicleType.FIGHTER_JET:
        modelKey = 'fighter_jet';
        break;
      case VehicleType.HELICOPTER:
        modelKey = 'combat_helicopter';
        break;
      default:
        modelKey = 'fighter_jet';
    }
    
    return await this.createModelInstance(modelKey, instanceId);
  }
  
  // Create weapon model
  async createWeapon(weaponType: WeaponModelType, instanceId: string): Promise<ModelInstance> {
    const modelKey = 'heavy_assault_weapon'; // For now, we have one weapon model
    return await this.createModelInstance(modelKey, instanceId);
  }
  
  // Update all model instances
  updateAll(deltaTime: number): void {
    this.modelInstances.forEach((instance) => {
      instance.update(deltaTime);
    });
  }
  
  // Remove instance
  removeInstance(instanceId: string): void {
    const instance = this.modelInstances.get(instanceId);
    if (instance) {
      // Clean up
      if (instance.mixer) {
        instance.mixer.stopAllAction();
      }
      this.modelInstances.delete(instanceId);
    }
  }
  
  // Get all instances of a specific category
  getInstancesByCategory(category: ModelCategory): ModelInstance[] {
    return Array.from(this.modelInstances.values()).filter(
      instance => instance.category === category
    );
  }
}

// Integration helpers for connecting models to game systems
export class ModelIntegrationHelper {
  // Connect character model to player system
  static connectToPlayer(playerInstance: any, modelInstance: ModelInstance): void {
    // Attach weapon to character's hand
    if (playerInstance.weaponManager?.currentWeapon) {
      const weaponMesh = playerInstance.weaponManager.currentWeapon.mesh;
      if (weaponMesh) {
        modelInstance.attachObject(weaponMesh, 'rightHand');
      }
    }
    
    // Apply model-specific multipliers to player stats
    if (modelInstance.config.healthMultiplier) {
      playerInstance.maxHealth *= modelInstance.config.healthMultiplier;
      playerInstance.health = playerInstance.maxHealth;
    }
    
    if (modelInstance.config.speedMultiplier) {
      playerInstance.baseSpeed *= modelInstance.config.speedMultiplier;
    }
  }
  
  // Connect character model to enemy system
  static connectToEnemy(enemyInstance: any, modelInstance: ModelInstance): void {
    // Apply model-specific stats
    if (modelInstance.config.healthMultiplier) {
      enemyInstance.maxHealth *= modelInstance.config.healthMultiplier;
      enemyInstance.health = enemyInstance.maxHealth;
    }
    
    if (modelInstance.config.speedMultiplier) {
      enemyInstance.speed *= modelInstance.config.speedMultiplier;
    }
    
    if (modelInstance.config.damageMultiplier) {
      enemyInstance.baseDamage *= modelInstance.config.damageMultiplier;
    }
    
    // Start appropriate idle animation
    modelInstance.playAnimation('patrol', true);
  }
  
  // Connect weapon model to weapon system
  static connectToWeapon(weaponInstance: any, modelInstance: ModelInstance): void {
    weaponInstance.mesh = modelInstance.mesh;
    
    // Apply model-specific damage multiplier
    if (modelInstance.config.damageMultiplier) {
      weaponInstance.baseDamage *= modelInstance.config.damageMultiplier;
    }
    
    // Setup muzzle flash position
    const barrelPoint = modelInstance.getAttachmentWorldPosition('barrel');
    if (barrelPoint) {
      weaponInstance.muzzlePosition = barrelPoint;
    }
  }
  
  // Connect vehicle model for advanced gameplay
  static connectToVehicle(vehicleSystem: any, modelInstance: ModelInstance): void {
    // Vehicle-specific setup would go here
    // This could include pilot seats, weapon mounts, etc.
    
    // Start hovering animation for aircraft
    if (modelInstance.config.animations?.includes('hover')) {
      modelInstance.playAnimation('hover', true);
    }
  }
}

export default ModelManager;
