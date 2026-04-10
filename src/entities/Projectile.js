import * as THREE from 'three';
import { scene } from '../core/engine.js';
import { state } from '../core/state.js';
import { spawnParticles, spawnFlameEffect } from './Particle.js';
import { damageEnemy } from '../systems/EnemySystem.js';

export function fireProjectile(tower, target) {
  const def = tower.def;
  const from = tower.mesh.position.clone();
  from.y += 1.5;

  if (def.continuous) {
    const dir = target.mesh.position.clone().sub(from);
    const len = dir.length();
    const geo = new THREE.CylinderGeometry(0.04, 0.04, len, 4);
    const mat = new THREE.MeshBasicMaterial({ color: def.projectileColor, transparent: true, opacity: 0.8 });
    const beam = new THREE.Mesh(geo, mat);
    beam.position.copy(from).add(dir.multiplyScalar(0.5));
    beam.position.y = from.y;
    beam.lookAt(target.mesh.position);
    beam.rotateX(Math.PI / 2);
    scene.add(beam);

    state.projectiles.push({
      mesh: beam, target, from: from.clone(), damage: def.damage,
      speed: 0, life: 0.15, type: 'laser', tower
    });

    damageEnemy(target, def.damage);
    spawnParticles(target.mesh.position.clone(), def.projectileColor, 3);
    return;
  }

  const geo = new THREE.SphereGeometry(0.12, 6, 6);
  const mat = new THREE.MeshBasicMaterial({ color: def.projectileColor });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(from);
  scene.add(mesh);

  const glowGeo = new THREE.SphereGeometry(0.25, 6, 6);
  const glowMat = new THREE.MeshBasicMaterial({ color: def.projectileColor, transparent: true, opacity: 0.3 });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  mesh.add(glow);

  state.projectiles.push({
    mesh, target, from: from.clone(), damage: def.damage,
    speed: def.projectileSpeed, life: 3, type: def.id,
    splash: def.splash, slow: def.slow, slowDur: def.slowDur,
    aoe: def.aoe, tower
  });
}
