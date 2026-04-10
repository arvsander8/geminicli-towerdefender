import * as THREE from 'three';
import { scene } from '../core/engine.js';
import { state } from '../core/state.js';

export function spawnParticles(pos, color, count, type = 'burst') {
  for (let i = 0; i < count; i++) {
    const size = 0.05 + Math.random() * 0.15;
    const geo = type === 'flame'
      ? new THREE.ConeGeometry(size, size * 2, 4)
      : new THREE.SphereGeometry(size, 4, 4);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    scene.add(mesh);

    const vel = new THREE.Vector3(
      (Math.random() - 0.5) * (type === 'explosion' ? 8 : 4),
      Math.random() * (type === 'flame' ? 6 : 3) + 1,
      (Math.random() - 0.5) * (type === 'explosion' ? 8 : 4)
    );

    state.particles.push({ mesh, vel, life: 0.5 + Math.random() * 0.5, maxLife: 1, type });
  }
}

export function spawnExplosion(pos, color, radius) {
  spawnParticles(pos, color, 20, 'explosion');
  spawnParticles(pos, 0xffaa44, 10, 'flame');

  const flashGeo = new THREE.SphereGeometry(radius * 0.5, 12, 12);
  const flashMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 });
  const flash = new THREE.Mesh(flashGeo, flashMat);
  flash.position.copy(pos);
  scene.add(flash);
  state.particles.push({ mesh: flash, vel: new THREE.Vector3(), life: 0.2, maxLife: 0.2, type: 'flash' });
}

export function spawnFlameEffect(pos) {
  for (let i = 0; i < 8; i++) {
    const geo = new THREE.ConeGeometry(0.08, 0.3, 4);
    const colors = [0xff4400, 0xff6600, 0xff8800, 0xffaa00];
    const mat = new THREE.MeshBasicMaterial({ color: colors[Math.floor(Math.random() * 4)], transparent: true, opacity: 0.9 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    mesh.position.y += 0.5;
    scene.add(mesh);
    state.particles.push({
      mesh,
      vel: new THREE.Vector3((Math.random() - 0.5) * 2, Math.random() * 4 + 2, (Math.random() - 0.5) * 2),
      life: 0.3 + Math.random() * 0.3, maxLife: 0.6, type: 'flame'
    });
  }
}
