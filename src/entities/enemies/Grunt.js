import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy.js';

export class Grunt extends BaseEnemy {
  createBody() {
    const geo = new THREE.DodecahedronGeometry(this.def.size, 1);
    const mat = new THREE.MeshStandardMaterial({ 
      color: this.def.color, 
      roughness: 0.4, 
      metalness: 0.3, 
      emissive: this.def.color, 
      emissiveIntensity: 0.15 
    });
    const body = new THREE.Mesh(geo, mat);
    body.castShadow = true;
    return body;
  }
}
