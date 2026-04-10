import { state } from '../core/state.js';
import { spawnEnemy } from '../entities/Enemy.js';
import { levels } from '../levels/index.js';
import { showBanner, showOverlay, updateHUD, updateWaveBtn, buildLevelDisplay } from '../ui.js';
import { buildPathCurve, createPathMesh } from './MapSystem.js';

export function updateWaveSpawner(dt, pathCurve) {
  if (!state.waveActive || state.waveQueue.length === 0) return;

  state.waveTimer += dt;
  while (state.waveQueue.length > 0 && state.waveTimer >= state.waveQueue[0].delay) {
    const e = state.waveQueue.shift();
    spawnEnemy(e.type, pathCurve);
    state.waveSpawned++;
  }
}

export function startWave() {
  if (state.waveActive) return;

  if (state.wave >= state.currentWaves.length) {
    if (state.level < levels.length - 1) {
      state.level++;
      state.wave = 0;

      const levelDef = levels[state.level];
      state.currentWaves = levelDef.waves;
      state.pathCurve = buildPathCurve(levelDef.map.pathNodes);
      createPathMesh(levelDef.map.pathNodes);

      state.maxHp += 5;
      state.hp = Math.min(state.hp + 5, state.maxHp);
      state.gold += 50 + state.level * 20;

      showBanner(`Level ${state.level + 1}: ${levelDef.name}!`, 2500);
      buildLevelDisplay();
      updateHUD();
      state.nextWaveReady = true;
      updateWaveBtn();
    } else {
      state.gameState = 'victory';
      showOverlay('Victory!', `Final Score: ${state.score}`);
    }
    return;
  }

  state.waveActive = true;
  state.nextWaveReady = false;
  state.waveQueue = [...state.currentWaves[state.wave]];
  state.waveTimer = 0;
  state.waveSpawned = 0;
  state.waveTotal = state.waveQueue.length;
  state.waveDone = 0;
  showBanner(`Wave ${state.wave + 1}`, 1500);
  updateHUD();
  updateWaveBtn();
}
