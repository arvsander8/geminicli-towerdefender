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

export function updateEnemies(dt, pathCurve) {
  state.enemies.forEach(enemy => {
    if (enemy.dead) return;

    if (enemy.def.heals) {
      state.enemies.forEach(other => {
        if (other === enemy || other.dead) return;
        if (enemy.mesh.position.distanceTo(other.mesh.position) < 3) {
          other.hp = Math.min(other.hp + 5 * dt, other.maxHp);
        }
      });
    }

    if (enemy.slowTimer > 0) {
      enemy.slowTimer -= dt;
    } else {
      enemy.slowFactor = 1;
    }

    const pathLen = pathCurve.getLength();
    const speed = enemy.speed * enemy.slowFactor / pathLen;
    enemy.t += speed * dt;

    if (enemy.t >= 1) {
      state.hp--;
      enemy.dead = true;
      scene.remove(enemy.mesh);
      spawnParticles(enemy.mesh.position.clone(), 0xff4444, 8);
      updateHUD();
      onEnemyKilledOrLeaked();

      if (state.hp <= 0) {
        state.gameState = 'gameover';
        showOverlay('Game Over', `Score: ${state.score} | Level: ${state.level + 1}`);
      }
      return;
    }

    const pos = pathCurve.getPoint(enemy.t);
    const flyY = enemy.def.flying ? 2 : 0;
    enemy.mesh.position.set(pos.x, pos.y + flyY, pos.z);

    const nextPos = pathCurve.getPoint(Math.min(enemy.t + 0.01, 1));
    enemy.mesh.lookAt(nextPos.x, enemy.mesh.position.y, nextPos.z);

    const hpRatio = enemy.hp / enemy.maxHp;
    const hpBar = enemy.mesh.userData.hpBar;
    if (hpBar) {
      hpBar.scale.x = hpRatio;
      hpBar.position.x = -(1 - hpRatio) * 0.5;
      hpBar.material.color.setHex(hpRatio > 0.5 ? 0x44ff44 : hpRatio > 0.25 ? 0xffaa00 : 0xff4444);
    }
    const hpBg = enemy.mesh.userData.hpBg;
    if (hpBg) {
      hpBg.lookAt(camera.position);
    }
    if (hpBar) {
      hpBar.lookAt(camera.position);
    }
  });

  state.enemies = state.enemies.filter(e => !e.dead || e.mesh.parent);
}
