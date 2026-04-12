import * as THREE from 'three';
import { scene, camera } from '../../core/engine.js';
import { state } from '../../core/state.js';

export class BaseEnemy {
  constructor(def, pathCurve) {
    this.def = { ...def };
    this.hpMult = 1 + state.level * 0.4;
    this.hp = def.hp * this.hpMult;
    this.maxHp = this.hp;
    this.speed = def.speed;
    this.t = 0;
    this.curve = pathCurve;
    this.slowTimer = 0;
    this.slowFactor = 1;
    this.dead = false;

    this.mesh = this.createMesh();
    const startPos = pathCurve.getPoint(0);
    this.mesh.position.copy(startPos);
    // Raise body slightly to sit on road (road is 0.1 high)
    if (!this.def.flying) {
      this.mesh.position.y = 0.1 + this.def.size;
    } else {
      this.mesh.position.y = 2;
    }
    scene.add(this.mesh);
  }

  createMesh() {
    const group = new THREE.Group();
    const body = this.createBody();
    group.add(body);
    this.addHealthBar(group);
    return group;
  }

  createBody() {
    // Override in subclasses
    const geo = new THREE.DodecahedronGeometry(this.def.size, 1);
    const mat = new THREE.MeshStandardMaterial({ color: this.def.color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    return mesh;
  }

  addHealthBar(group) {
    const hbBg = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 0.12),
      new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide })
    );
    // Relative to the group position (which is at the center of the enemy body)
    hbBg.position.y = this.def.size + 0.5;
    group.add(hbBg);

    const hbFill = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 0.12),
      new THREE.MeshBasicMaterial({ color: 0x44ff44, side: THREE.DoubleSide })
    );
    hbFill.position.y = this.def.size + 0.5;
    hbFill.position.z = 0.01;
    group.add(hbFill);

    group.userData.hpBar = hbFill;
    group.userData.hpBg = hbBg;
  }

  update(dt) {
    if (this.dead) return;

    this.updateSlow(dt);
    this.updateMovement(dt);
    this.updateHealthBar();
    this.onUpdate(dt);
  }

  updateSlow(dt) {
    if (this.slowTimer > 0) {
      this.slowTimer -= dt;
    } else {
      this.slowFactor = 1;
    }
  }

  updateMovement(dt) {
    const pathLen = this.curve.getLength();
    const speed = this.speed * this.slowFactor / pathLen;
    this.t += speed * dt;

    if (this.t >= 1) {
      this.reachEnd();
      return;
    }

    const pos = this.curve.getPoint(this.t);
    const bodyY = this.def.flying ? 2 : 0.1 + this.def.size;
    this.mesh.position.set(pos.x, bodyY, pos.z);

    const nextPos = this.curve.getPoint(Math.min(this.t + 0.01, 1));
    this.mesh.lookAt(nextPos.x, this.mesh.position.y, nextPos.z);
  }

  updateHealthBar() {
    const hpRatio = this.hp / this.maxHp;
    const hpBar = this.mesh.userData.hpBar;
    if (hpBar) {
      hpBar.scale.x = hpRatio;
      hpBar.position.x = -(1 - hpRatio) * 0.5;
      hpBar.material.color.setHex(hpRatio > 0.5 ? 0x44ff44 : hpRatio > 0.25 ? 0xffaa00 : 0xff4444);
      hpBar.lookAt(camera.position);
    }
    const hpBg = this.mesh.userData.hpBg;
    if (hpBg) {
      hpBg.lookAt(camera.position);
    }
  }

  onUpdate(dt) {
    // Additional behavior in subclasses
  }

  reachEnd() {
    // Let the system handle it
  }
}
