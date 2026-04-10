import * as THREE from 'three';
import { ENEMY_DEFS } from '../core/config.js';
import { state } from '../core/state.js';
import { scene, camera } from '../core/engine.js';

export function createEnemyMesh(def) {
  const group = new THREE.Group();

  if (def.flying) {
    const bodyGeo = new THREE.ConeGeometry(def.size, def.size * 2, 6);
    const bodyMat = new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.3, metalness: 0.4, emissive: def.color, emissiveIntensity: 0.2 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI;
    body.castShadow = true;
    group.add(body);

    for (let side of [-1, 1]) {
      const wingGeo = new THREE.PlaneGeometry(def.size * 2, def.size * 0.8);
      const wingMat = new THREE.MeshStandardMaterial({ color: def.color, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
      const wing = new THREE.Mesh(wingGeo, wingMat);
      wing.position.set(side * def.size * 0.8, 0, 0);
      wing.rotation.z = side * 0.3;
      group.add(wing);
    }
    group.position.y = 2;
  } else {
    const bodyGeo = new THREE.DodecahedronGeometry(def.size, 1);
    const bodyMat = new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.4, metalness: 0.3, emissive: def.color, emissiveIntensity: 0.15 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    group.add(body);

    if (def.id === 'tank') {
      const armorGeo = new THREE.BoxGeometry(def.size * 1.5, def.size * 0.8, def.size * 1.5);
      const armorMat = new THREE.MeshStandardMaterial({ color: 0x335533, roughness: 0.6, metalness: 0.5 });
      const armor = new THREE.Mesh(armorGeo, armorMat);
      armor.position.y = def.size * 0.5;
      group.add(armor);
    }

    if (def.id === 'boss') {
      const crownGeo = new THREE.ConeGeometry(def.size * 0.5, def.size * 0.6, 5);
      const crownMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2, metalness: 0.8, emissive: 0xffd700, emissiveIntensity: 0.3 });
      const crown = new THREE.Mesh(crownGeo, crownMat);
      crown.position.y = def.size + 0.3;
      group.add(crown);
    }

    if (def.heals) {
      const crossMat = new THREE.MeshBasicMaterial({ color: 0x44ff44 });
      const h = new THREE.Mesh(new THREE.BoxGeometry(def.size * 0.8, 0.08, 0.08), crossMat);
      h.position.y = def.size + 0.3;
      group.add(h);
      const v = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, def.size * 0.8), crossMat);
      v.position.y = def.size + 0.3;
      group.add(v);
    }
  }

  const hbBg = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 0.12),
    new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide })
  );
  hbBg.position.y = (def.flying ? 2 : def.size + 0.8);
  group.add(hbBg);

  const hbFill = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 0.12),
    new THREE.MeshBasicMaterial({ color: 0x44ff44, side: THREE.DoubleSide })
  );
  hbFill.position.y = (def.flying ? 2 : def.size + 0.8);
  hbFill.position.z = 0.01;
  group.add(hbFill);

  group.userData.hpBar = hbFill;
  group.userData.hpBg = hbBg;

  return group;
}

export function spawnEnemy(typeId, pathCurve) {
  const def = ENEMY_DEFS.find(e => e.id === typeId);
  if (!def) return;

  const hpMult = 1 + state.level * 0.4;
  const mesh = createEnemyMesh(def);
  const startPos = pathCurve.getPoint(0);
  mesh.position.copy(startPos);
  scene.add(mesh);

  state.enemies.push({
    def: { ...def },
    hp: def.hp * hpMult,
    maxHp: def.hp * hpMult,
    speed: def.speed,
    t: 0,
    mesh,
    curve: pathCurve,
    slowTimer: 0,
    slowFactor: 1,
    dead: false,
  });
}
