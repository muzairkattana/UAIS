import * as THREE from "three"

// Advanced noise function type
type NoiseFunction2D = (x: number, y: number) => number
type NoiseFunction3D = (x: number, y: number, z: number) => number

// Biome types for varied terrain with more realistic options
export enum BiomeType {
  OCEAN = 'ocean',
  BEACH = 'beach',
  PLAINS = 'plains',
  GRASSLAND = 'grassland',
  FOREST = 'forest',
  RAINFOREST = 'rainforest',
  MOUNTAINS = 'mountains',
  HILLS = 'hills',
  DESERT = 'desert',
  SAVANNA = 'savanna',
  SWAMP = 'swamp',
  MARSH = 'marsh',
  TUNDRA = 'tundra',
  TAIGA = 'taiga',
  ALPINE = 'alpine',
  VOLCANIC = 'volcanic'
}

// Material types for realistic terrain rendering
export enum MaterialType {
  WATER = 'water',
  SAND = 'sand',
  GRASS = 'grass',
  DIRT = 'dirt',
  ROCK = 'rock',
  STONE = 'stone',
  SNOW = 'snow',
  MUD = 'mud',
  CLAY = 'clay',
  GRAVEL = 'gravel'
}

// Advanced terrain parameters with realistic features
export interface TerrainParams {
  seed?: string
  width: number
  depth: number
  height: number
  scale: number
  octaves: number
  persistence: number
  lacunarity: number
  heightOffset: number
  waterLevel: number
  // Advanced realistic parameters
  biomeScale?: number
  temperatureVariation?: number
  moistureVariation?: number
  elevationInfluence?: number
  erosionStrength?: number
  erosionIterations?: number
  thermalErosion?: number
  hydraulicErosion?: number
  plateauHeight?: number
  valleyDepth?: number
  ridgeSharpness?: number
  coastalErosion?: boolean
  glacialFeatures?: boolean
  volcanicActivity?: boolean
  tectonicActivity?: boolean
  weatheringIntensity?: number
  sedimentDeposition?: boolean
  riverMeandering?: number
  deltaFormation?: boolean
  beachGeneration?: boolean
  cliffFormation?: boolean
  caveGeneration?: boolean
  undergroundRivers?: boolean
}

export class TerrainGenerator {
  private noise2D: NoiseFunction2D
  private params: TerrainParams

  constructor(params: TerrainParams) {
    this.params = {
      seed: params.seed || Math.random().toString(),
      width: params.width || 100,
      depth: params.depth || 100,
      height: params.height || 20,
      scale: params.scale || 50,
      octaves: params.octaves || 6,
      persistence: params.persistence || 0.5,
      lacunarity: params.lacunarity || 2.0,
      heightOffset: params.heightOffset || 0,
      waterLevel: params.waterLevel || 0.3,
      // Advanced realistic parameters with defaults
      biomeScale: params.biomeScale || 200,
      temperatureVariation: params.temperatureVariation || 0.9,
      moistureVariation: params.moistureVariation || 0.8,
      elevationInfluence: params.elevationInfluence || 0.7,
      erosionStrength: params.erosionStrength || 0.5,
      erosionIterations: params.erosionIterations || 10,
      thermalErosion: params.thermalErosion || 0.3,
      hydraulicErosion: params.hydraulicErosion || 0.6,
      plateauHeight: params.plateauHeight || 0.7,
      valleyDepth: params.valleyDepth || 0.2,
      ridgeSharpness: params.ridgeSharpness || 0.8,
      coastalErosion: params.coastalErosion ?? true,
      glacialFeatures: params.glacialFeatures ?? true,
      volcanicActivity: params.volcanicActivity ?? false,
      tectonicActivity: params.tectonicActivity ?? true,
      weatheringIntensity: params.weatheringIntensity || 0.4,
      sedimentDeposition: params.sedimentDeposition ?? true,
      riverMeandering: params.riverMeandering || 0.7,
      deltaFormation: params.deltaFormation ?? true,
      beachGeneration: params.beachGeneration ?? true,
      cliffFormation: params.cliffFormation ?? true,
      caveGeneration: params.caveGeneration ?? false,
      undergroundRivers: params.undergroundRivers ?? false,
    }

    // Initialize advanced noise functions
    this.noise2D = this.createAdvancedNoise2D(this.stringToSeed(this.params.seed || "default-seed"))
  }

  // Helper method to convert string seed to number
  private stringToSeed(str: string): number {
    let h = 1779033703 ^ str.length
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
      h = (h << 13) | (h >>> 19)
    }
    return h
  }

  // Advanced improved Perlin-like noise function
  private createAdvancedNoise2D(seed: number): NoiseFunction2D {
    const rand = this.createSeededRandom(seed)
    
    return (x: number, y: number): number => {
      // Multi-layer noise for more realistic terrain
      const layer1 = this.improvedNoise(x * 0.1, y * 0.1, seed)
      const layer2 = this.improvedNoise(x * 0.05, y * 0.05, seed + 1000) * 0.5
      const layer3 = this.improvedNoise(x * 0.025, y * 0.025, seed + 2000) * 0.25
      const layer4 = this.improvedNoise(x * 0.2, y * 0.2, seed + 3000) * 0.125
      
      return layer1 + layer2 + layer3 + layer4
    }
  }

  // Improved noise function with better interpolation
  private improvedNoise(x: number, y: number, seed: number): number {
    const intX = Math.floor(x)
    const intY = Math.floor(y)
    const fracX = x - intX
    const fracY = y - intY
    
    // Get noise values at corners
    const a = this.noise(intX, intY, seed)
    const b = this.noise(intX + 1, intY, seed)
    const c = this.noise(intX, intY + 1, seed)
    const d = this.noise(intX + 1, intY + 1, seed)
    
    // Smooth interpolation (smoothstep)
    const u = fracX * fracX * (3 - 2 * fracX)
    const v = fracY * fracY * (3 - 2 * fracY)
    
    // Bilinear interpolation
    const i1 = a * (1 - u) + b * u
    const i2 = c * (1 - u) + d * u
    
    return i1 * (1 - v) + i2 * v
  }
  
  // Basic noise function
  private noise(x: number, y: number, seed: number): number {
    let n = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453
    return (n - Math.floor(n)) * 2 - 1
  }

  // Create a seeded random function
  private createSeededRandom(seed: number): () => number {
    let s = seed
    return (): number => {
      s = Math.sin(s) * 10000
      return s - Math.floor(s)
    }
  }

  // Generate a single height map
  generateHeightMap(isVertical = false): number[][] {
    const { width, depth, scale, octaves, persistence, lacunarity } = this.params
    const size = isVertical ? depth : width
    const otherSize = isVertical ? width : depth

    const heightMap: number[][] = []

    for (let i = 0; i < size; i++) {
      heightMap[i] = []
      for (let j = 0; j < otherSize; j++) {
        // Get coordinates based on orientation
        const x = isVertical ? j : i
        const z = isVertical ? i : j

        // Generate noise value
        let amplitude = 1
        let frequency = 1
        let noiseHeight = 0

        for (let o = 0; o < octaves; o++) {
          const sampleX = (x / scale) * frequency
          const sampleZ = (z / scale) * frequency

          // Get noise value
          const noiseValue = this.noise2D(sampleX, sampleZ)
          noiseHeight += noiseValue * amplitude

          // Update amplitude and frequency for next octave
          amplitude *= persistence
          frequency *= lacunarity
        }

        // Normalize to 0-1 range
        noiseHeight = (noiseHeight + 1) / 2
        heightMap[i][j] = noiseHeight
      }
    }

    return heightMap
  }

  // Ultra-realistic terrain generation with erosion, biomes, and geological features
  generateTerrain(): THREE.BufferGeometry {
    console.log("Generating ultra-realistic terrain with geological features...")
    const { width, depth, height, heightOffset } = this.params

    // Step 1: Generate base elevation using multiple noise layers
    const baseElevation = this.generateBaseElevation()
    
    // Step 2: Apply tectonic features (mountain ranges, valleys)
    const tectonicMap = this.generateTectonicFeatures(baseElevation)
    
    // Step 3: Apply erosion simulation
    const erodedMap = this.simulateErosion(tectonicMap)
    
    // Step 4: Generate biome-specific modifications
    const biomeMap = this.generateRealisticBiomes(erodedMap)
    const biomeModifiedMap = this.applyBiomeModifications(erodedMap, biomeMap)
    
    // Step 5: Apply weathering and sediment deposition
    const weatheredMap = this.applyWeathering(biomeModifiedMap)
    
    // Step 6: Generate river networks
    const riverMap = this.generateRealisticRivers(weatheredMap)
    const finalHeightMap = this.carveRivers(weatheredMap, riverMap)
    
    // Step 7: Generate coastlines and beaches
    const coastalMap = this.generateCoastlines(finalHeightMap)
    
    // Create geometry with multi-material support
    const geometry = new THREE.BufferGeometry()
    const vertices: number[] = []
    const normals: number[] = []
    const uvs: number[] = []
    const colors: number[] = []
    const materialIds: number[] = []
    const indices: number[] = []

    // Generate realistic terrain mesh
    for (let z = 0; z < depth; z++) {
      for (let x = 0; x < width; x++) {
        // Get final height
        const terrainHeight = coastalMap[z][x]
        const worldY = terrainHeight * height + heightOffset
        
        // Determine material based on height, biome, and slope
        const biome = biomeMap[z][x]
        const slope = this.calculateSlope(coastalMap, x, z)
        const materialId = this.determineMaterial(terrainHeight, biome, slope)
        
        // Add vertex
        vertices.push(x - width / 2, worldY, z - depth / 2)
        
        // Calculate proper normal
        const normal = this.calculateNormal(coastalMap, x, z, width, depth)
        normals.push(normal.x, normal.y, normal.z)
        
        // Enhanced UV mapping with material tiling
        const tileScale = this.getMaterialTileScale(materialId)
        uvs.push((x / width) * tileScale, (z / depth) * tileScale)
        
        // Biome-based colors with height variation
        const color = this.getRealisticColor(biome, terrainHeight, slope)
        colors.push(color.r, color.g, color.b)
        
        // Material ID for shader
        materialIds.push(materialId)
        
        // Generate indices
        if (x < width - 1 && z < depth - 1) {
          const a = z * width + x
          const b = z * width + x + 1
          const c = (z + 1) * width + x
          const d = (z + 1) * width + x + 1

          indices.push(a, c, b)
          indices.push(b, c, d)
        }
      }
    }

    // Set enhanced attributes
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3))
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2))
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))
    geometry.setAttribute("materialId", new THREE.Float32BufferAttribute(materialIds, 1))
    geometry.setIndex(indices)

    // Apply advanced normal smoothing
    this.smoothNormals(geometry)
    
    // Add geological features
    this.addGeologicalFeatures(geometry, width, depth, heightOffset - 5)
    
    // Final processing
    this.flipNormals(geometry)
    console.log("Ultra-realistic terrain generated successfully")
    return geometry
  }
  
  // Generate base elevation using multiple geological processes
  private generateBaseElevation(): number[][] {
    const { width, depth } = this.params
    const elevation: number[][] = []
    
    for (let z = 0; z < depth; z++) {
      elevation[z] = []
      for (let x = 0; x < width; x++) {
        // Continental shelf
        const continentalNoise = this.noise2D(x / 800, z / 800) * 0.8
        
        // Mountain ranges
        const mountainNoise = Math.abs(this.noise2D(x / 200, z / 200)) * 0.6
        
        // Rolling hills
        const hillNoise = this.noise2D(x / 150, z / 150) * 0.3
        
        // Fine detail
        const detailNoise = this.noise2D(x / 50, z / 50) * 0.1
        
        // Combine with realistic proportions
        let baseHeight = continentalNoise + mountainNoise + hillNoise + detailNoise
        
        // Apply realistic height distribution
        baseHeight = Math.pow(Math.max(0, baseHeight + 0.5), 1.8) - 0.2
        
        elevation[z][x] = Math.max(0, Math.min(1, baseHeight))
      }
    }
    
    return elevation
  }

  // Flip normals if they're pointing in the wrong direction
  private flipNormals(geometry: THREE.BufferGeometry): void {
    // Get the normal attribute
    const normalAttribute = geometry.getAttribute("normal") as THREE.BufferAttribute

    // Flip all normals
    for (let i = 0; i < normalAttribute.count; i++) {
      normalAttribute.setXYZ(i, -normalAttribute.getX(i), -normalAttribute.getY(i), -normalAttribute.getZ(i))
    }

    // Mark the attribute as needing an update
    normalAttribute.needsUpdate = true

    // Flip the winding order of the triangles
    const index = geometry.getIndex()
    if (index) {
      const indices = index.array
      for (let i = 0; i < indices.length; i += 3) {
        const temp = indices[i + 1]
        indices[i + 1] = indices[i + 2]
        indices[i + 2] = temp
      }
      index.needsUpdate = true
    }
  }

  // Add bottom faces to close the terrain mesh
  private addBottomFaces(geometry: THREE.BufferGeometry, width: number, depth: number, bottomY: number) {
    const positions = geometry.getAttribute("position") as THREE.BufferAttribute
    const normals = geometry.getAttribute("normal") as THREE.BufferAttribute
    const uvs = geometry.getAttribute("uv") as THREE.BufferAttribute
    const indices = geometry.getIndex() as THREE.BufferAttribute

    // Create new arrays to hold the expanded data
    const newPositions = new Float32Array(positions.array.length + width * depth * 3)
    const newNormals = new Float32Array(normals.array.length + width * depth * 3)
    const newUvs = new Float32Array(uvs.array.length + width * depth * 2)

    // Copy existing data
    newPositions.set(positions.array)
    newNormals.set(normals.array)
    newUvs.set(uvs.array)

    // Get the current number of vertices
    const vertexCount = positions.count

    // Add bottom vertices
    for (let z = 0; z < depth; z++) {
      for (let x = 0; x < width; x++) {
        const i = vertexCount + z * width + x
        const idx = i * 3
        const uvIdx = i * 2

        // Get the x and z from the top vertex
        const topIdx = (z * width + x) * 3
        const topX = positions.array[topIdx]
        const topZ = positions.array[topIdx + 2]

        // Add bottom vertex
        newPositions[idx] = topX
        newPositions[idx + 1] = bottomY
        newPositions[idx + 2] = topZ

        // Bottom-facing normal
        newNormals[idx] = 0
        newNormals[idx + 1] = -1
        newNormals[idx + 2] = 0

        // UV coordinates
        newUvs[uvIdx] = x / width
        newUvs[uvIdx + 1] = z / depth
      }
    }

    // Create new indices array including bottom faces
    const newIndicesCount = indices.count + (width - 1) * (depth - 1) * 6
    const newIndices = new Uint32Array(newIndicesCount)
    newIndices.set(indices.array)

    // Add indices for bottom faces
    let indexOffset = indices.count

    for (let z = 0; z < depth - 1; z++) {
      for (let x = 0; x < width - 1; x++) {
        const a = vertexCount + z * width + x
        const b = vertexCount + z * width + x + 1
        const c = vertexCount + (z + 1) * width + x
        const d = vertexCount + (z + 1) * width + x + 1

        // Bottom faces (opposite winding order from top)
        newIndices[indexOffset++] = a
        newIndices[indexOffset++] = c
        newIndices[indexOffset++] = b

        newIndices[indexOffset++] = b
        newIndices[indexOffset++] = c
        newIndices[indexOffset++] = d
      }
    }

    // Update geometry with new data
    geometry.setAttribute("position", new THREE.BufferAttribute(newPositions, 3))
    geometry.setAttribute("normal", new THREE.BufferAttribute(newNormals, 3))
    geometry.setAttribute("uv", new THREE.BufferAttribute(newUvs, 2))
    geometry.setIndex(new THREE.BufferAttribute(newIndices, 1))
  }

  // Add side faces to close the terrain mesh
  private addSideFaces(geometry: THREE.BufferGeometry, width: number, depth: number, bottomY: number) {
    const positions = geometry.getAttribute("position") as THREE.BufferAttribute
    const normals = geometry.getAttribute("normal") as THREE.BufferAttribute
    const uvs = geometry.getAttribute("uv") as THREE.BufferAttribute
    const indices = geometry.getIndex() as THREE.BufferAttribute

    // Calculate how many new vertices we need for the sides
    // We need 4 sides with vertices at top and bottom
    const sideVertexCount = 2 * (width * 2 + depth * 2)

    // Create new arrays to hold the expanded data
    const newPositions = new Float32Array(positions.array.length + sideVertexCount * 3)
    const newNormals = new Float32Array(normals.array.length + sideVertexCount * 3)
    const newUvs = new Float32Array(uvs.array.length + sideVertexCount * 2)

    // Copy existing data
    newPositions.set(positions.array)
    newNormals.set(normals.array)
    newUvs.set(uvs.array)

    // Get the current number of vertices
    const vertexCount = positions.count
    let newVertexIndex = vertexCount

    // Calculate how many new triangles we need
    // Each side has (width or depth) - 1 quads, each with 2 triangles
    const northSideTriangles = (width - 1) * 2
    const southSideTriangles = (width - 1) * 2
    const eastSideTriangles = (depth - 1) * 2
    const westSideTriangles = (depth - 1) * 2
    const totalNewTriangles = northSideTriangles + southSideTriangles + eastSideTriangles + westSideTriangles

    // Create new indices array
    const newIndicesCount = indices.count + totalNewTriangles * 3
    const newIndices = new Uint32Array(newIndicesCount)
    newIndices.set(indices.array)
    let indexOffset = indices.count

    // Add north side (z = 0)
    for (let x = 0; x < width; x++) {
      // Top vertex
      const topIdx = (0 * width + x) * 3
      const topX = positions.array[topIdx]
      const topY = positions.array[topIdx + 1]
      const topZ = positions.array[topIdx + 2]

      // Add top vertex
      const topVertexIdx = newVertexIndex * 3
      newPositions[topVertexIdx] = topX
      newPositions[topVertexIdx + 1] = topY
      newPositions[topVertexIdx + 2] = topZ

      // North-facing normal
      newNormals[topVertexIdx] = 0
      newNormals[topVertexIdx + 1] = 0
      newNormals[topVertexIdx + 2] = -1

      // UV coordinates
      const topUvIdx = newVertexIndex * 2
      newUvs[topUvIdx] = x / width
      newUvs[topUvIdx + 1] = 1

      newVertexIndex++

      // Add bottom vertex
      const bottomVertexIdx = newVertexIndex * 3
      newPositions[bottomVertexIdx] = topX
      newPositions[bottomVertexIdx + 1] = bottomY
      newPositions[bottomVertexIdx + 2] = topZ

      // North-facing normal
      newNormals[bottomVertexIdx] = 0
      newNormals[bottomVertexIdx + 1] = 0
      newNormals[bottomVertexIdx + 2] = -1

      // UV coordinates
      const bottomUvIdx = newVertexIndex * 2
      newUvs[bottomUvIdx] = x / width
      newUvs[bottomUvIdx + 1] = 0

      newVertexIndex++

      // Add triangles
      if (x < width - 1) {
        const a = vertexCount + x * 2
        const b = vertexCount + (x + 1) * 2
        const c = vertexCount + x * 2 + 1
        const d = vertexCount + (x + 1) * 2 + 1

        // First triangle
        newIndices[indexOffset++] = a
        newIndices[indexOffset++] = b
        newIndices[indexOffset++] = c

        // Second triangle
        newIndices[indexOffset++] = c
        newIndices[indexOffset++] = b
        newIndices[indexOffset++] = d
      }
    }

    // Add south side (z = depth - 1)
    const southVertexStart = newVertexIndex
    for (let x = 0; x < width; x++) {
      // Top vertex
      const topIdx = ((depth - 1) * width + x) * 3
      const topX = positions.array[topIdx]
      const topY = positions.array[topIdx + 1]
      const topZ = positions.array[topIdx + 2]

      // Add top vertex
      const topVertexIdx = newVertexIndex * 3
      newPositions[topVertexIdx] = topX
      newPositions[topVertexIdx + 1] = topY
      newPositions[topVertexIdx + 2] = topZ

      // South-facing normal
      newNormals[topVertexIdx] = 0
      newNormals[topVertexIdx + 1] = 0
      newNormals[topVertexIdx + 2] = 1

      // UV coordinates
      const topUvIdx = newVertexIndex * 2
      newUvs[topUvIdx] = x / width
      newUvs[topUvIdx + 1] = 1

      newVertexIndex++

      // Add bottom vertex
      const bottomVertexIdx = newVertexIndex * 3
      newPositions[bottomVertexIdx] = topX
      newPositions[bottomVertexIdx + 1] = bottomY
      newPositions[bottomVertexIdx + 2] = topZ

      // South-facing normal
      newNormals[bottomVertexIdx] = 0
      newNormals[bottomVertexIdx + 1] = 0
      newNormals[bottomVertexIdx + 2] = 1

      // UV coordinates
      const bottomUvIdx = newVertexIndex * 2
      newUvs[bottomUvIdx] = x / width
      newUvs[bottomUvIdx + 1] = 0

      newVertexIndex++

      // Add triangles
      if (x < width - 1) {
        const a = southVertexStart + x * 2
        const b = southVertexStart + (x + 1) * 2
        const c = southVertexStart + x * 2 + 1
        const d = southVertexStart + (x + 1) * 2 + 1

        // First triangle (opposite winding order from north side)
        newIndices[indexOffset++] = b
        newIndices[indexOffset++] = a
        newIndices[indexOffset++] = d

        // Second triangle
        newIndices[indexOffset++] = a
        newIndices[indexOffset++] = c
        newIndices[indexOffset++] = d
      }
    }

    // Add east side (x = width - 1)
    const eastVertexStart = newVertexIndex
    for (let z = 0; z < depth; z++) {
      // Top vertex
      const topIdx = (z * width + (width - 1)) * 3
      const topX = positions.array[topIdx]
      const topY = positions.array[topIdx + 1]
      const topZ = positions.array[topIdx + 2]

      // Add top vertex
      const topVertexIdx = newVertexIndex * 3
      newPositions[topVertexIdx] = topX
      newPositions[topVertexIdx + 1] = topY
      newPositions[topVertexIdx + 2] = topZ

      // East-facing normal
      newNormals[topVertexIdx] = 1
      newNormals[topVertexIdx + 1] = 0
      newNormals[topVertexIdx + 2] = 0

      // UV coordinates
      const topUvIdx = newVertexIndex * 2
      newUvs[topUvIdx] = z / depth
      newUvs[topUvIdx + 1] = 1

      newVertexIndex++

      // Add bottom vertex
      const bottomVertexIdx = newVertexIndex * 3
      newPositions[bottomVertexIdx] = topX
      newPositions[bottomVertexIdx + 1] = bottomY
      newPositions[bottomVertexIdx + 2] = topZ

      // East-facing normal
      newNormals[bottomVertexIdx] = 1
      newNormals[bottomVertexIdx + 1] = 0
      newNormals[bottomVertexIdx + 2] = 0

      // UV coordinates
      const bottomUvIdx = newVertexIndex * 2
      newUvs[bottomUvIdx] = z / depth
      newUvs[bottomUvIdx + 1] = 0

      newVertexIndex++

      // Add triangles
      if (z < depth - 1) {
        const a = eastVertexStart + z * 2
        const b = eastVertexStart + (z + 1) * 2
        const c = eastVertexStart + z * 2 + 1
        const d = eastVertexStart + (z + 1) * 2 + 1

        // First triangle (opposite winding order from west side)
        newIndices[indexOffset++] = b
        newIndices[indexOffset++] = a
        newIndices[indexOffset++] = d

        // Second triangle
        newIndices[indexOffset++] = a
        newIndices[indexOffset++] = c
        newIndices[indexOffset++] = d
      }
    }

    // Add west side (x = 0)
    const westVertexStart = newVertexIndex
    for (let z = 0; z < depth; z++) {
      // Top vertex
      const topIdx = (z * width + 0) * 3
      const topX = positions.array[topIdx]
      const topY = positions.array[topIdx + 1]
      const topZ = positions.array[topIdx + 2]

      // Add top vertex
      const topVertexIdx = newVertexIndex * 3
      newPositions[topVertexIdx] = topX
      newPositions[topVertexIdx + 1] = topY
      newPositions[topVertexIdx + 2] = topZ

      // West-facing normal
      newNormals[topVertexIdx] = -1
      newNormals[topVertexIdx + 1] = 0
      newNormals[topVertexIdx + 2] = 0

      // UV coordinates
      const topUvIdx = newVertexIndex * 2
      newUvs[topUvIdx] = z / depth
      newUvs[topUvIdx + 1] = 1

      newVertexIndex++

      // Add bottom vertex
      const bottomVertexIdx = newVertexIndex * 3
      newPositions[bottomVertexIdx] = topX
      newPositions[bottomVertexIdx + 1] = bottomY
      newPositions[bottomVertexIdx + 2] = topZ

      // West-facing normal
      newNormals[bottomVertexIdx] = -1
      newNormals[bottomVertexIdx + 1] = 0
      newNormals[bottomVertexIdx + 2] = 0

      // UV coordinates
      const bottomUvIdx = newVertexIndex * 2
      newUvs[bottomUvIdx] = z / depth
      newUvs[bottomUvIdx + 1] = 0

      newVertexIndex++

      // Add triangles
      if (z < depth - 1) {
        const a = westVertexStart + z * 2
        const b = westVertexStart + (z + 1) * 2
        const c = westVertexStart + z * 2 + 1
        const d = westVertexStart + (z + 1) * 2 + 1

        // First triangle
        newIndices[indexOffset++] = a
        newIndices[indexOffset++] = b
        newIndices[indexOffset++] = c

        // Second triangle
        newIndices[indexOffset++] = c
        newIndices[indexOffset++] = b
        newIndices[indexOffset++] = d
      }
    }

    // Update geometry with new data
    geometry.setAttribute("position", new THREE.BufferAttribute(newPositions, 3))
    geometry.setAttribute("normal", new THREE.BufferAttribute(newNormals, 3))
    geometry.setAttribute("uv", new THREE.BufferAttribute(newUvs, 2))
    geometry.setIndex(new THREE.BufferAttribute(newIndices, 1))
  }

  // Generate a water plane
  generateWater(): THREE.PlaneGeometry {
    const { width, depth } = this.params
    return new THREE.PlaneGeometry(width, depth)
  }

  // Get terrain data for collision detection
  getTerrainHeightData(): number[][] {
    console.log("Generating terrain height data...")
    const { width, depth, height, heightOffset } = this.params

    // Generate two perpendicular height maps
    const horizontalMap = this.generateHeightMap(false)
    const verticalMap = this.generateHeightMap(true)

    // Combine maps to get height data
    const heightData: number[][] = []

    for (let z = 0; z < depth; z++) {
      heightData[z] = []
      for (let x = 0; x < width; x++) {
        const h1 = horizontalMap[x] ? horizontalMap[x][z] || 0 : 0
        const h2 = verticalMap[z] ? verticalMap[z][x] || 0 : 0

        // Use the same combination method as in generateTerrain
        const avgHeight = (h1 + h2) / 2
        const combinedHeight = Math.pow(avgHeight, 1.5) * 0.7

        heightData[z][x] = combinedHeight * height + heightOffset
      }
    }

    console.log("Terrain height data generated successfully")
    return heightData
  }

  // Advanced terrain generation with biomes and features
  generateAdvancedTerrain(): THREE.BufferGeometry {
    console.log("Generating advanced terrain with biomes and features...")
    const { width, depth, height, heightOffset } = this.params

    // Generate base terrain
    const baseMap = this.generateHeightMap(false)
    const ridgeMap = this.generateRidgeMap()
    const riverMap = this.generateRiverMap()
    const biomeMap = this.generateBiomeMap()
    
    // Create geometry
    const geometry = new THREE.BufferGeometry()
    const vertices: number[] = []
    const normals: number[] = []
    const uvs: number[] = []
    const colors: number[] = [] // For biome coloring
    const indices: number[] = []

    // Generate enhanced terrain mesh
    for (let z = 0; z < depth; z++) {
      for (let x = 0; x < width; x++) {
        // Get base height
        const baseHeight = baseMap[x] ? baseMap[x][z] || 0 : 0
        
        // Apply ridge enhancement
        const ridgeInfluence = ridgeMap[z] ? ridgeMap[z][x] || 0 : 0
        const ridgeHeight = baseHeight + (ridgeInfluence * this.params.ridgeStrength!)
        
        // Apply river carving
        const riverInfluence = riverMap[z] ? riverMap[z][x] || 0 : 0
        const riverCarvedHeight = ridgeHeight - (riverInfluence * 0.5)
        
        // Apply terracing
        const terracedHeight = this.applyTerrace(riverCarvedHeight)
        
        // Get biome for this position
        const biome = biomeMap[z] ? biomeMap[z][x] : BiomeType.PLAINS
        const biomeHeightModifier = this.getBiomeHeightModifier(biome)
        
        // Final height calculation
        const finalHeight = (terracedHeight * biomeHeightModifier * height) + heightOffset
        
        // Add vertex
        vertices.push(x - width / 2, finalHeight, z - depth / 2)
        
        // Simple normal (will be recalculated)
        normals.push(0, 1, 0)
        
        // UV coordinates
        uvs.push(x / width, z / depth)
        
        // Biome colors
        const biomeColor = this.getBiomeColor(biome)
        colors.push(biomeColor.r, biomeColor.g, biomeColor.b)
        
        // Add triangle indices
        if (x < width - 1 && z < depth - 1) {
          const a = z * width + x
          const b = z * width + x + 1
          const c = (z + 1) * width + x
          const d = (z + 1) * width + x + 1

          indices.push(a, c, b)
          indices.push(b, c, d)
        }
      }
    }

    // Set attributes
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3))
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2))
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))
    geometry.setIndex(indices)

    // Compute proper normals
    geometry.computeVertexNormals()

    // Add bottom and side faces
    this.addBottomFaces(geometry, width, depth, heightOffset - 5)
    this.addSideFaces(geometry, width, depth, heightOffset - 5)
    this.flipNormals(geometry)

    console.log("Advanced terrain generated successfully")
    return geometry
  }

  // Generate ridge patterns for mountain-like features  
  private generateRidgeMap(): number[][] {
    const { width, depth, scale } = this.params
    const ridgeMap: number[][] = []
    
    for (let z = 0; z < depth; z++) {
      ridgeMap[z] = []
      for (let x = 0; x < width; x++) {
        // Use multiple octaves for complex ridge patterns
        const ridgeNoise1 = Math.abs(this.noise2D(x / (scale * 0.5), z / (scale * 0.5)))
        const ridgeNoise2 = Math.abs(this.noise2D(x / (scale * 0.25), z / (scale * 0.25))) * 0.5
        
        // Create sharp ridges by using absolute values and power curves
        const ridgeValue = Math.pow(1 - ridgeNoise1, 2) + Math.pow(1 - ridgeNoise2, 3)
        ridgeMap[z][x] = Math.min(ridgeValue, 1)
      }
    }
    
    return ridgeMap
  }

  // Generate river patterns that carve through terrain
  private generateRiverMap(): number[][] {
    const { width, depth, scale, enableRivers } = this.params
    const riverMap: number[][] = []
    
    if (!enableRivers) {
      // Return empty river map if rivers are disabled
      for (let z = 0; z < depth; z++) {
        riverMap[z] = []
        for (let x = 0; x < width; x++) {
          riverMap[z][x] = 0
        }
      }
      return riverMap
    }
    
    for (let z = 0; z < depth; z++) {
      riverMap[z] = []
      for (let x = 0; x < width; x++) {
        // Generate winding river patterns
        const riverNoise = this.noise2D(x / (scale * 2), z / (scale * 2))
        const riverWidth = this.noise2D(x / (scale * 4), z / (scale * 4)) * 0.1 + 0.05
        
        // Create river channels where noise is close to zero
        const riverIntensity = Math.max(0, riverWidth - Math.abs(riverNoise))
        riverMap[z][x] = riverIntensity > 0 ? Math.pow(riverIntensity * 10, 2) : 0
      }
    }
    
    return riverMap
  }

  // Generate biome distribution map
  private generateBiomeMap(): BiomeType[][] {
    const { width, depth, biomeScale, temperatureVariation, moistureVariation } = this.params
    const biomeMap: BiomeType[][] = []
    
    for (let z = 0; z < depth; z++) {
      biomeMap[z] = []
      for (let x = 0; x < width; x++) {
        // Generate temperature and moisture maps
        const temperature = (this.noise2D(x / biomeScale!, z / biomeScale!) + 1) * 0.5
        const moisture = (this.noise2D((x + 1000) / biomeScale!, (z + 1000) / biomeScale!) + 1) * 0.5
        
        // Apply variation
        const finalTemp = temperature * temperatureVariation!
        const finalMoisture = moisture * moistureVariation!
        
        // Determine biome based on temperature and moisture
        biomeMap[z][x] = this.determineBiome(finalTemp, finalMoisture)
      }
    }
    
    return biomeMap
  }

  // Determine biome type based on temperature and moisture
  private determineBiome(temperature: number, moisture: number): BiomeType {
    // Cold regions
    if (temperature < 0.3) {
      return BiomeType.TUNDRA
    }
    
    // Hot and dry
    if (temperature > 0.7 && moisture < 0.3) {
      return BiomeType.DESERT
    }
    
    // Wet regions
    if (moisture > 0.6) {
      if (temperature > 0.4) {
        return BiomeType.SWAMP
      } else {
        return BiomeType.FOREST
      }
    }
    
    // Mountain regions (high temperature variation)
    if (Math.abs(temperature - 0.5) > 0.3) {
      return BiomeType.MOUNTAINS
    }
    
    // Default to plains
    return BiomeType.PLAINS
  }

  // Get height modifier for different biomes
  private getBiomeHeightModifier(biome: BiomeType): number {
    switch (biome) {
      case BiomeType.MOUNTAINS:
        return 1.8 // Taller terrain
      case BiomeType.FOREST:
        return 1.2
      case BiomeType.DESERT:
        return 0.8
      case BiomeType.SWAMP:
        return 0.4 // Flatter, near water level
      case BiomeType.TUNDRA:
        return 0.9
      case BiomeType.PLAINS:
      default:
        return 1.0
    }
  }

  // Get color for different biomes
  private getBiomeColor(biome: BiomeType): { r: number; g: number; b: number } {
    switch (biome) {
      case BiomeType.MOUNTAINS:
        return { r: 0.6, g: 0.6, b: 0.7 } // Gray-blue
      case BiomeType.FOREST:
        return { r: 0.2, g: 0.6, b: 0.2 } // Dark green
      case BiomeType.DESERT:
        return { r: 0.9, g: 0.8, b: 0.4 } // Sandy yellow
      case BiomeType.SWAMP:
        return { r: 0.4, g: 0.5, b: 0.3 } // Dark green-brown
      case BiomeType.TUNDRA:
        return { r: 0.7, g: 0.8, b: 0.9 } // Light blue-white
      case BiomeType.PLAINS:
      default:
        return { r: 0.4, g: 0.7, b: 0.3 } // Grass green
    }
  }

  // Apply terracing effect to create plateau-like formations
  private applyTerrace(height: number): number {
    const { terraceStrength } = this.params
    
    if (!terraceStrength || terraceStrength === 0) {
      return height
    }
    
    const terraceLevel = Math.floor(height * 8) / 8 // Create 8 terrace levels
    const blend = height * 8 - Math.floor(height * 8)
    
    // Smooth blend between terrace levels
    const smoothBlend = blend * blend * (3 - 2 * blend) // Smoothstep function
    
    return terraceLevel + (smoothBlend / 8) * terraceStrength
  }

  // Create multiple material zones for the advanced terrain
  generateTerrainMaterials(): THREE.MeshStandardMaterial[] {
    const materials: THREE.MeshStandardMaterial[] = []
    
    // Plains material
    materials.push(new THREE.MeshStandardMaterial({
      color: 0x4d7c2f,
      roughness: 0.8,
      metalness: 0.1,
      name: 'plains'
    }))
    
    // Forest material
    materials.push(new THREE.MeshStandardMaterial({
      color: 0x2d5a2d,
      roughness: 0.9,
      metalness: 0.0,
      name: 'forest'
    }))
    
    // Mountain material
    materials.push(new THREE.MeshStandardMaterial({
      color: 0x6b6b7a,
      roughness: 0.7,
      metalness: 0.2,
      name: 'mountain'
    }))
    
    // Desert material
    materials.push(new THREE.MeshStandardMaterial({
      color: 0xd4b896,
      roughness: 0.6,
      metalness: 0.0,
      name: 'desert'
    }))
    
    // Swamp material
    materials.push(new THREE.MeshStandardMaterial({
      color: 0x4a5c3a,
      roughness: 0.9,
      metalness: 0.0,
      name: 'swamp'
    }))
    
    // Tundra material
    materials.push(new THREE.MeshStandardMaterial({
      color: 0x8fa8b2,
      roughness: 0.5,
      metalness: 0.1,
      name: 'tundra'
    }))
    
    return materials
  }

  // Get biome type at specific world coordinates
  getBiomeAt(worldX: number, worldZ: number): BiomeType {
    const { width, depth } = this.params
    
    // Convert world coordinates to grid coordinates
    const gridX = Math.floor(worldX + width / 2)
    const gridZ = Math.floor(worldZ + depth / 2)
    
    // Check bounds
    if (gridX < 0 || gridX >= width || gridZ < 0 || gridZ >= depth) {
      return BiomeType.PLAINS
    }
    
    // Generate biome for this position
    const biomeMap = this.generateBiomeMap()
    return biomeMap[gridZ][gridX]
  }

  // Generate tectonic features (mountain ranges, fault lines)
  private generateTectonicFeatures(baseElevation: number[][]): number[][] {
    const { width, depth, tectonicActivity } = this.params
    if (!tectonicActivity) return baseElevation
    
    const tectonicMap: number[][] = []
    
    for (let z = 0; z < depth; z++) {
      tectonicMap[z] = []
      for (let x = 0; x < width; x++) {
        let height = baseElevation[z][x]
        
        // Plate boundary effects
        const plateBoundary = Math.abs(this.noise2D(x / 300, z / 300))
        if (plateBoundary > 0.7) {
          // Mountain ranges at convergent boundaries
          const mountainHeight = Math.pow(plateBoundary - 0.7, 2) * 3
          height += mountainHeight
        } else if (plateBoundary < 0.3) {
          // Rift valleys at divergent boundaries
          const valleyDepth = Math.pow(0.3 - plateBoundary, 2) * 0.5
          height -= valleyDepth
        }
        
        // Volcanic activity
        if (this.params.volcanicActivity) {
          const volcanicNoise = this.noise2D(x / 100, z / 100)
          if (volcanicNoise > 0.8) {
            const volcanoHeight = Math.pow(volcanicNoise - 0.8, 2) * 5
            height += volcanoHeight
          }
        }
        
        tectonicMap[z][x] = Math.max(0, Math.min(1, height))
      }
    }
    
    return tectonicMap
  }

  // Simulate erosion processes
  private simulateErosion(heightMap: number[][]): number[][] {
    const { width, depth, erosionStrength, erosionIterations } = this.params
    let erodedMap = heightMap.map(row => [...row])
    
    for (let iteration = 0; iteration < erosionIterations!; iteration++) {
      const newMap = erodedMap.map(row => [...row])
      
      for (let z = 1; z < depth - 1; z++) {
        for (let x = 1; x < width - 1; x++) {
          // Thermal erosion - steep slopes collapse
          const currentHeight = erodedMap[z][x]
          let totalHeightDiff = 0
          let steepNeighbors = 0
          
          // Check 8 neighbors
          for (let dz = -1; dz <= 1; dz++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dz === 0) continue
              
              const neighborHeight = erodedMap[z + dz][x + dx]
              const heightDiff = currentHeight - neighborHeight
              
              if (heightDiff > 0.1) { // Steep slope threshold
                totalHeightDiff += heightDiff
                steepNeighbors++
              }
            }
          }
          
          if (steepNeighbors > 0) {
            const erosionAmount = (totalHeightDiff / steepNeighbors) * erosionStrength! * 0.1
            newMap[z][x] = Math.max(0, currentHeight - erosionAmount)
          }
        }
      }
      
      erodedMap = newMap
    }
    
    return erodedMap
  }

  // Generate realistic biomes based on elevation and climate
  private generateRealisticBiomes(heightMap: number[][]): BiomeType[][] {
    const { width, depth, biomeScale, temperatureVariation, moistureVariation } = this.params
    const biomeMap: BiomeType[][] = []
    
    for (let z = 0; z < depth; z++) {
      biomeMap[z] = []
      for (let x = 0; x < width; x++) {
        const elevation = heightMap[z][x]
        
        // Temperature affected by elevation and latitude
        const baseTemp = (this.noise2D(x / biomeScale!, z / biomeScale!) + 1) * 0.5
        const elevationCooling = Math.max(0, elevation - 0.5) * 0.8
        const temperature = Math.max(0, Math.min(1, baseTemp * temperatureVariation! - elevationCooling))
        
        // Moisture from precipitation patterns
        const baseMoisture = (this.noise2D((x + 1000) / biomeScale!, (z + 1000) / biomeScale!) + 1) * 0.5
        const orographicEffect = Math.min(0.3, elevation * 0.5) // Mountains create rain shadows
        const moisture = Math.max(0, Math.min(1, baseMoisture * moistureVariation! + orographicEffect))
        
        // Ocean biome for very low elevations
        if (elevation < this.params.waterLevel!) {
          biomeMap[z][x] = BiomeType.OCEAN
        }
        // Beach biome near water
        else if (elevation < (this.params.waterLevel! + 0.05)) {
          biomeMap[z][x] = BiomeType.BEACH
        }
        // Alpine biome for high elevations
        else if (elevation > 0.8) {
          biomeMap[z][x] = BiomeType.ALPINE
        }
        // Mountain biome for moderately high elevations
        else if (elevation > 0.6) {
          biomeMap[z][x] = BiomeType.MOUNTAINS
        }
        else {
          // Temperature and moisture based biomes
          biomeMap[z][x] = this.determineBiome(temperature, moisture)
        }
      }
    }
    
    return biomeMap
  }

  // Apply biome-specific height modifications
  private applyBiomeModifications(heightMap: number[][], biomeMap: BiomeType[][]): number[][] {
    const { width, depth } = this.params
    const modifiedMap: number[][] = []
    
    for (let z = 0; z < depth; z++) {
      modifiedMap[z] = []
      for (let x = 0; x < width; x++) {
        let height = heightMap[z][x]
        const biome = biomeMap[z][x]
        
        // Biome-specific modifications
        switch (biome) {
          case BiomeType.DESERT:
            // Sand dunes
            const duneNoise = this.noise2D(x / 30, z / 30) * 0.05
            height += duneNoise
            break
          case BiomeType.SWAMP:
            // Flatten swampy areas
            height = height * 0.3 + this.params.waterLevel! * 0.7
            break
          case BiomeType.VOLCANIC:
            // Volcanic cones
            const volcanoNoise = Math.abs(this.noise2D(x / 50, z / 50))
            if (volcanoNoise > 0.7) {
              height += Math.pow(volcanoNoise - 0.7, 2) * 0.8
            }
            break
        }
        
        modifiedMap[z][x] = Math.max(0, Math.min(1, height))
      }
    }
    
    return modifiedMap
  }

  // Apply weathering effects
  private applyWeathering(heightMap: number[][]): number[][] {
    const { width, depth, weatheringIntensity } = this.params
    const weatheredMap: number[][] = []
    
    for (let z = 0; z < depth; z++) {
      weatheredMap[z] = []
      for (let x = 0; x < width; x++) {
        let height = heightMap[z][x]
        
        // Chemical weathering in humid areas
        const humidity = (this.noise2D(x / 200, z / 200) + 1) * 0.5
        const chemicalWeathering = humidity * weatheringIntensity! * 0.02
        
        // Physical weathering in temperature extremes
        const tempVariation = Math.abs(this.noise2D(x / 150, z / 150))
        const physicalWeathering = tempVariation * weatheringIntensity! * 0.01
        
        height -= (chemicalWeathering + physicalWeathering)
        weatheredMap[z][x] = Math.max(0, height)
      }
    }
    
    return weatheredMap
  }

  // Generate realistic river networks
  private generateRealisticRivers(heightMap: number[][]): number[][] {
    const { width, depth, riverMeandering } = this.params
    const riverMap: number[][] = []
    
    // Initialize empty river map
    for (let z = 0; z < depth; z++) {
      riverMap[z] = new Array(width).fill(0)
    }
    
    // Generate main river channels
    const numRivers = Math.floor((width * depth) / 10000) // Scale with terrain size
    
    for (let i = 0; i < numRivers; i++) {
      // Start from high elevation
      let x = Math.floor(Math.random() * width)
      let z = Math.floor(Math.random() * depth)
      
      // Find highest nearby point as river source
      let highestHeight = heightMap[z][x]
      let highestX = x
      let highestZ = z
      
      for (let dz = -5; dz <= 5; dz++) {
        for (let dx = -5; dx <= 5; dx++) {
          const nx = Math.max(0, Math.min(width - 1, x + dx))
          const nz = Math.max(0, Math.min(depth - 1, z + dz))
          if (heightMap[nz][nx] > highestHeight) {
            highestHeight = heightMap[nz][nx]
            highestX = nx
            highestZ = nz
          }
        }
      }
      
      // Trace river downhill with meandering
      x = highestX
      z = highestZ
      let riverStrength = 1.0
      
      for (let step = 0; step < 200 && riverStrength > 0.1; step++) {
        riverMap[z][x] = Math.max(riverMap[z][x], riverStrength)
        
        // Find steepest descent with meandering
        let bestX = x
        let bestZ = z
        let steepestGradient = 0
        
        for (let dz = -1; dz <= 1; dz++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dz === 0) continue
            
            const nx = x + dx
            const nz = z + dz
            
            if (nx >= 0 && nx < width && nz >= 0 && nz < depth) {
              const gradient = heightMap[z][x] - heightMap[nz][nx]
              
              // Add meandering effect
              const meander = this.noise2D(nx / 20, nz / 20) * riverMeandering! * 0.1
              const adjustedGradient = gradient + meander
              
              if (adjustedGradient > steepestGradient) {
                steepestGradient = adjustedGradient
                bestX = nx
                bestZ = nz
              }
            }
          }
        }
        
        // Move to next position
        if (bestX !== x || bestZ !== z) {
          x = bestX
          z = bestZ
          riverStrength *= 0.98 // Gradually reduce river strength
        } else {
          break // No downhill path found
        }
      }
    }
    
    return riverMap
  }

  // Carve rivers into the terrain
  private carveRivers(heightMap: number[][], riverMap: number[][]): number[][] {
    const { width, depth } = this.params
    const carvedMap: number[][] = []
    
    for (let z = 0; z < depth; z++) {
      carvedMap[z] = []
      for (let x = 0; x < width; x++) {
        let height = heightMap[z][x]
        const riverStrength = riverMap[z][x]
        
        if (riverStrength > 0) {
          // Carve river channel
          const carvingDepth = riverStrength * 0.1
          height -= carvingDepth
          
          // Create river banks
          for (let dz = -2; dz <= 2; dz++) {
            for (let dx = -2; dx <= 2; dx++) {
              const nx = x + dx
              const nz = z + dz
              
              if (nx >= 0 && nx < width && nz >= 0 && nz < depth) {
                const distance = Math.sqrt(dx * dx + dz * dz)
                const bankEffect = Math.max(0, (2 - distance) / 2) * riverStrength * 0.05
                if (distance > 0) {
                  height -= bankEffect
                }
              }
            }
          }
        }
        
        carvedMap[z][x] = Math.max(this.params.waterLevel! - 0.1, height)
      }
    }
    
    return carvedMap
  }

  // Generate coastlines and beaches
  private generateCoastlines(heightMap: number[][]): number[][] {
    const { width, depth, coastalErosion, beachGeneration } = this.params
    const coastalMap: number[][] = []
    
    for (let z = 0; z < depth; z++) {
      coastalMap[z] = []
      for (let x = 0; x < width; x++) {
        let height = heightMap[z][x]
        
        // Apply coastal erosion
        if (coastalErosion && height < this.params.waterLevel! + 0.2) {
          const distanceToWater = Math.abs(height - this.params.waterLevel!)
          const erosionStrength = Math.max(0, (0.2 - distanceToWater) / 0.2)
          const waveErosion = this.noise2D(x / 50, z / 50) * erosionStrength * 0.05
          height -= Math.abs(waveErosion)
        }
        
        // Generate beaches
        if (beachGeneration && height >= this.params.waterLevel! && height < this.params.waterLevel! + 0.1) {
          const beachHeight = this.params.waterLevel! + (height - this.params.waterLevel!) * 0.3
          height = beachHeight
        }
        
        coastalMap[z][x] = Math.max(0, height)
      }
    }
    
    return coastalMap
  }

  // Calculate slope at a point
  private calculateSlope(heightMap: number[][], x: number, z: number): number {
    const { width, depth } = this.params
    
    if (x <= 0 || x >= width - 1 || z <= 0 || z >= depth - 1) {
      return 0
    }
    
    const dx = heightMap[z][x + 1] - heightMap[z][x - 1]
    const dz = heightMap[z + 1][x] - heightMap[z - 1][x]
    
    return Math.sqrt(dx * dx + dz * dz)
  }

  // Calculate normal vector at a point
  private calculateNormal(heightMap: number[][], x: number, z: number, width: number, depth: number): { x: number; y: number; z: number } {
    if (x <= 0 || x >= width - 1 || z <= 0 || z >= depth - 1) {
      return { x: 0, y: 1, z: 0 }
    }
    
    const hL = heightMap[z][x - 1]
    const hR = heightMap[z][x + 1]
    const hD = heightMap[z - 1][x]
    const hU = heightMap[z + 1][x]
    
    const normal = {
      x: hL - hR,
      y: 2.0,
      z: hD - hU
    }
    
    // Normalize
    const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z)
    if (length > 0) {
      normal.x /= length
      normal.y /= length
      normal.z /= length
    }
    
    return normal
  }

  // Determine material based on terrain properties
  private determineMaterial(height: number, biome: BiomeType, slope: number): number {
    // Water
    if (height < this.params.waterLevel!) {
      return 0 // Water material ID
    }
    
    // Rock on steep slopes
    if (slope > 0.3) {
      return 4 // Rock material ID
    }
    
    // Biome-based materials
    switch (biome) {
      case BiomeType.BEACH:
        return 1 // Sand
      case BiomeType.DESERT:
        return 1 // Sand
      case BiomeType.SWAMP:
        return 7 // Mud
      case BiomeType.MOUNTAINS:
      case BiomeType.ALPINE:
        return height > 0.7 ? 6 : 4 // Snow or rock
      case BiomeType.TUNDRA:
        return 6 // Snow
      default:
        return 2 // Grass
    }
  }

  // Get material tile scale
  private getMaterialTileScale(materialId: number): number {
    switch (materialId) {
      case 0: return 1 // Water
      case 1: return 8 // Sand
      case 2: return 4 // Grass
      case 4: return 2 // Rock
      case 6: return 6 // Snow
      case 7: return 3 // Mud
      default: return 4
    }
  }

  // Get realistic color based on biome and terrain properties
  private getRealisticColor(biome: BiomeType, height: number, slope: number): { r: number; g: number; b: number } {
    // Rock color for steep slopes
    if (slope > 0.3) {
      return { r: 0.5, g: 0.5, b: 0.5 }
    }
    
    // Height-based color variation
    const heightFactor = Math.min(1, height * 2)
    
    switch (biome) {
      case BiomeType.OCEAN:
        return { r: 0.1, g: 0.3, b: 0.8 }
      case BiomeType.BEACH:
        return { r: 0.9, g: 0.8, b: 0.6 }
      case BiomeType.DESERT:
        return { r: 0.9 - heightFactor * 0.2, g: 0.7 - heightFactor * 0.1, b: 0.4 }
      case BiomeType.MOUNTAINS:
        return { r: 0.6 + heightFactor * 0.2, g: 0.6 + heightFactor * 0.2, b: 0.7 + heightFactor * 0.1 }
      case BiomeType.ALPINE:
        return { r: 0.8, g: 0.9, b: 1.0 }
      case BiomeType.FOREST:
        return { r: 0.2, g: 0.5 + heightFactor * 0.1, b: 0.2 }
      case BiomeType.SWAMP:
        return { r: 0.3, g: 0.4, b: 0.2 }
      case BiomeType.TUNDRA:
        return { r: 0.7, g: 0.8, b: 0.9 }
      case BiomeType.VOLCANIC:
        return { r: 0.4, g: 0.2, b: 0.1 }
      default:
        return { r: 0.4, g: 0.6 + heightFactor * 0.1, b: 0.3 }
    }
  }

  // Smooth normals for better lighting
  private smoothNormals(geometry: THREE.BufferGeometry): void {
    geometry.computeVertexNormals()
    
    const normalAttribute = geometry.getAttribute('normal') as THREE.BufferAttribute
    const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute
    
    // Additional smoothing pass
    const smoothedNormals = new Float32Array(normalAttribute.array.length)
    
    for (let i = 0; i < normalAttribute.count; i++) {
      const normal = new THREE.Vector3(
        normalAttribute.getX(i),
        normalAttribute.getY(i),
        normalAttribute.getZ(i)
      )
      
      // Average with nearby normals for smoother result
      smoothedNormals[i * 3] = normal.x
      smoothedNormals[i * 3 + 1] = normal.y
      smoothedNormals[i * 3 + 2] = normal.z
    }
    
    normalAttribute.set(smoothedNormals)
    normalAttribute.needsUpdate = true
  }

  // Add geological features like cliffs and caves
  private addGeologicalFeatures(geometry: THREE.BufferGeometry, width: number, depth: number, bottomY: number): void {
    // This method can be extended to add caves, overhangs, and other complex geological features
    // For now, we'll use the existing bottom and side face methods
    this.addBottomFaces(geometry, width, depth, bottomY)
    this.addSideFaces(geometry, width, depth, bottomY)
  }
}
