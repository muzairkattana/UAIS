import * as THREE from 'three'

export interface Wall {
  geometry: THREE.BoxGeometry;
  position: [number, number, number];
  rotation?: [number, number, number];
}
