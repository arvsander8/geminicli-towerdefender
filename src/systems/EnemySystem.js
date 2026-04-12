import * as THREE from 'three';
import { state } from '../core/state.js';
import { scene, camera } from '../core/engine.js';
import { spawnExplosion, spawnParticles } from '../entities/Particle.js';
import { updateHUD, showOverlay, showBanner, updateWaveBtn } from '../ui.js';
import { levels } from '../levels/index.js';

export function damageEnemy(enemy, dmg) {
  enemy.hp -= dmg;
  if (enemy.hp <= 0 && !enemy.dead) {
    enemy.dead = true;
    state.gold += enemy.def.reward;
    state.score += enemy.def.reward * 2;

    const pos = enemy.mesh.position.clone();
    spawnExplosion(pos, enemy.def.color, 1);

    scene.remove(enemy.mesh);
    updateHUD();
    onEnemyKilledOrLeaked();
  }
}

export function onEnemyKilledOrLeaked() {
  state.waveDone++;
  if (state.waveDone >= state.waveTotal && state.waveQueue.length === 0) {
    state.waveActive = false;
    state.wave++;
    state.gold += 15 + state.level * 5;
    state.nextWaveReady = true;
    updateHUD();
    updateWaveBtn();
    if (state.wave >= state.currentWaves.length) {
      if (state.level < levels.length - 1) {
        showBanner('Level Complete! 🎉', 2000);
      } else {
        showBanner('Final Wave Clear! 🏆', 2000);
      }
    } else {
      showBanner('Wave Clear! ⚔️', 1500);
    }
  }
  updateWaveBtn();
}

export function updateEnemies(dt) {
  state.enemies.forEach(enemy => {
    if (enemy.dead) return;

    enemy.update(dt);

    if (enemy.t >= 1 && !enemy.dead) {
      enemy.dead = true;
      state.hp--;
      scene.remove(enemy.mesh);
      spawnParticles(enemy.mesh.position.clone(), 0xff4444, 8);
      updateHUD();
      onEnemyKilledOrLeaked();

      if (state.hp <= 0) {
        state.gameState = 'gameover';
        showOverlay('Game Over', `Score: ${state.score} | Level: ${state.level + 1}`);
      }
    } else if (enemy.dead) {
      // If it became dead through update but not t>=1 (should not happen normally with this flow but for safety)
      scene.remove(enemy.mesh);
    }
  });

  state.enemies = state.enemies.filter(e => !e.dead || e.mesh.parent);
}
