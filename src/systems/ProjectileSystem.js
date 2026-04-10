import { state } from '../core/state.js';
import { scene } from '../core/engine.js';
import { damageEnemy } from './EnemySystem.js';
import { spawnExplosion, spawnFlameEffect, spawnParticles } from '../entities/Particle.js';

export function updateProjectiles(dt) {
  state.projectiles.forEach(proj => {
    proj.life -= dt;

    if (proj.type === 'laser') {
      if (proj.life <= 0) {
        scene.remove(proj.mesh);
        proj.dead = true;
      }
      return;
    }

    if (!proj.target || proj.target.dead) {
      scene.remove(proj.mesh);
      proj.dead = true;
      return;
    }

    const dir = proj.target.mesh.position.clone().sub(proj.mesh.position);
    const dist = dir.length();

    if (dist < 0.5) {
      if (proj.splash) {
        state.enemies.forEach(e => {
          if (e.dead) return;
          if (e.mesh.position.distanceTo(proj.mesh.position) < proj.splash) {
            damageEnemy(e, proj.damage);
          }
        });
        spawnExplosion(proj.mesh.position.clone(), proj.tower.def.projectileColor, proj.splash);
      } else if (proj.aoe) {
        state.enemies.forEach(e => {
          if (e.dead) return;
          if (e.mesh.position.distanceTo(proj.mesh.position) < 2) {
            damageEnemy(e, proj.damage);
          }
        });
        spawnFlameEffect(proj.mesh.position.clone());
      } else {
        damageEnemy(proj.target, proj.damage);
        spawnParticles(proj.mesh.position.clone(), proj.tower.def.projectileColor, 5);
      }

      if (proj.slow && !proj.target.dead) {
        proj.target.slowFactor = proj.slow;
        proj.target.slowTimer = proj.slowDur || 2;
      }

      scene.remove(proj.mesh);
      proj.dead = true;
    } else {
      dir.normalize().multiplyScalar(proj.speed * dt);
      proj.mesh.position.add(dir);
    }

    if (proj.life <= 0) {
      scene.remove(proj.mesh);
      proj.dead = true;
    }
  });

  state.projectiles = state.projectiles.filter(p => !p.dead);
}
