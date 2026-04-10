import * as THREE from 'three';
import { state } from '../core/state.js';
import { fireProjectile } from '../entities/Projectile.js';
import { spawnFlameEffect } from '../entities/Particle.js';

export function updateTowers(dt) {
  state.towers.forEach(tower => {
    tower.cooldown -= dt;

    const tPos = tower.mesh.position;
    let best = null;
    let bestDist = tower.def.range;

    state.enemies.forEach(enemy => {
      if (enemy.dead) return;
      const dist = tPos.distanceTo(enemy.mesh.position);
      if (dist < bestDist) {
        bestDist = dist;
        best = enemy;
      }
    });

    tower.target = best;

    if (best) {
      const dir = best.mesh.position.clone().sub(tPos);
      const targetAngle = Math.atan2(dir.x, dir.z);
      tower.angle = THREE.MathUtils.lerp(tower.angle, targetAngle, 5 * dt);
      tower.mesh.rotation.y = tower.angle;

      if (tower.cooldown <= 0) {
        tower.cooldown = tower.def.rate;
        fireProjectile(tower, best);

        if (tower.def.id === 'flame') {
          spawnFlameEffect(tPos.clone());
        }
      }
    }
  });
}
