import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy.js';

export class Boss extends BaseEnemy {
  createBody() {
    const group = new THREE.Group();
    
    const bodyGeo = new THREE.DodecahedronGeometry(this.def.size, 1);
    const bodyMat = new THREE.MeshStandardMaterial({ 
      color: this.def.color, 
      roughness: 0.4, 
      metalness: 0.3, 
      emissive: this.def.color, 
      emissiveIntensity: 0.15 
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    group.add(body);

    const crownGeo = new THREE.ConeGeometry(this.def.size * 0.5, this.def.size * 0.6, 5);
    const crownMat = new THREE.MeshStandardMaterial({ 
      color: 0xffd700, 
      roughness: 0.2, 
      metalness: 0.8, 
      emissive: 0xffd700, 
      emissiveIntensity: 0.3 
    });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.position.y = this.def.size + 0.3;
    group.add(crown);

    return group;
  }
}
