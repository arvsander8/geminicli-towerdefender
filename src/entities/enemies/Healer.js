import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy.js';
import { state } from '../../core/state.js';

export class Healer extends BaseEnemy {
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

    const crossMat = new THREE.MeshBasicMaterial({ color: 0x44ff44 });
    const h = new THREE.Mesh(new THREE.BoxGeometry(this.def.size * 0.8, 0.08, 0.08), crossMat);
    h.position.y = this.def.size + 0.3;
    group.add(h);
    const v = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, this.def.size * 0.8), crossMat);
    v.position.y = this.def.size + 0.3;
    group.add(v);

    return group;
  }

  onUpdate(dt) {
    state.enemies.forEach(other => {
      if (other === this || other.dead) return;
      if (this.mesh.position.distanceTo(other.mesh.position) < 3) {
        other.hp = Math.min(other.hp + 5 * dt, other.maxHp);
      }
    });
  }
}
