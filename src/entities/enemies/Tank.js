import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy.js';

export class Tank extends BaseEnemy {
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

    const armorGeo = new THREE.BoxGeometry(this.def.size * 1.5, this.def.size * 0.8, this.def.size * 1.5);
    const armorMat = new THREE.MeshStandardMaterial({ color: 0x335533, roughness: 0.6, metalness: 0.5 });
    const armor = new THREE.Mesh(armorGeo, armorMat);
    armor.position.y = this.def.size * 0.5;
    group.add(armor);

    return group;
  }
}
