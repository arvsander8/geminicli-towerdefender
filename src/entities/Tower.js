import * as THREE from 'three';
import { state } from '../core/state.js';
import { gridToWorld, isValidPlacement } from '../utils/grid.js';
import { scene } from '../core/engine.js';
import { updateHUD } from '../ui.js';

export function createTowerMesh(def, level) {
  const group = new THREE.Group();
  const scale = 1 + level * 0.15;

  const baseGeo = new THREE.CylinderGeometry(0.6 * scale, 0.7 * scale, 0.4 * scale, 8);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x333344, roughness: 0.5, metalness: 0.6 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.2 * scale;
  base.castShadow = true;
  group.add(base);

  const bodyGeo = new THREE.CylinderGeometry(0.4 * scale, 0.5 * scale, 1.2 * scale, 8);
  const bodyMat = new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.3, metalness: 0.5, emissive: def.color, emissiveIntensity: 0.15 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.8 * scale + 0.2 * scale;
  body.castShadow = true;
  group.add(body);

  const topGeo = new THREE.SphereGeometry(0.3 * scale, 8, 8);
  const topMat = new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.2, metalness: 0.7, emissive: def.color, emissiveIntensity: 0.3 });
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.y = 1.6 * scale + 0.2 * scale;
  group.add(top);

  for (let i = 0; i < level; i++) {
    const ringGeo = new THREE.TorusGeometry(0.5 * scale, 0.04, 8, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.5 + i * 0.3;
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
  }

  return group;
}

export function placeTower(def, gx, gz, GRID, pathCurve) {
  if (state.gold < def.cost) return false;
  if (!isValidPlacement(gx, gz, pathCurve)) return false;

  state.gold -= def.cost;
  const pos = gridToWorld(gx, gz);
  const mesh = createTowerMesh(def, 0);
  mesh.position.copy(pos);
  scene.add(mesh);

  const tower = {
    def: { ...def },
    gx, gz,
    mesh,
    level: 0,
    cooldown: 0,
    target: null,
    angle: 0,
  };
  state.towers.push(tower);
  updateHUD();
  return true;
}

export function upgradeTower(tower) {
  if (tower.level >= tower.def.upgrades.length) return false;
  const upg = tower.def.upgrades[tower.level];
  if (state.gold < upg.cost) return false;
  state.gold -= upg.cost;
  tower.level++;
  Object.assign(tower.def, upg);

  scene.remove(tower.mesh);
  tower.mesh = createTowerMesh(tower.def, tower.level);
  tower.mesh.position.copy(gridToWorld(tower.gx, tower.gz));
  scene.add(tower.mesh);
  updateHUD();
  return true;
}
