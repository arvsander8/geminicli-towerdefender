import { state } from '../core/state.js';
import { scene } from '../core/engine.js';

export function updateParticles(dt) {
  state.particles.forEach(p => {
    p.life -= dt;
    p.mesh.position.add(p.vel.clone().multiplyScalar(dt));
    p.vel.y -= 9.8 * dt;
    p.mesh.material.opacity = Math.max(0, p.life / p.maxLife);

    if (p.type === 'flame') {
      p.mesh.scale.multiplyScalar(0.97);
    }
    if (p.type === 'flash') {
      p.mesh.scale.multiplyScalar(1.1);
    }

    if (p.life <= 0) {
      scene.remove(p.mesh);
      p.dead = true;
    }
  });

  state.particles = state.particles.filter(p => !p.dead);
}
