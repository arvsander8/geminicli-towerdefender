import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy.js';

export class Flyer extends BaseEnemy {
  createBody() {
    const group = new THREE.Group();
    
    const bodyGeo = new THREE.ConeGeometry(this.def.size, this.def.size * 2, 6);
    const bodyMat = new THREE.MeshStandardMaterial({ 
      color: this.def.color, 
      roughness: 0.3, 
      metalness: 0.4, 
      emissive: this.def.color, 
      emissiveIntensity: 0.2 
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI;
    body.castShadow = true;
    group.add(body);

    for (let side of [-1, 1]) {
      const wingGeo = new THREE.PlaneGeometry(this.def.size * 2, this.def.size * 0.8);
      const wingMat = new THREE.MeshStandardMaterial({ 
        color: this.def.color, 
        side: THREE.DoubleSide, 
        transparent: true, 
        opacity: 0.7 
      });
      const wing = new THREE.Mesh(wingGeo, wingMat);
      wing.position.set(side * this.def.size * 0.8, 0, 0);
      wing.rotation.z = side * 0.3;
      group.add(wing);
    }
    
    group.position.y = 2;
    return group;
  }
}
