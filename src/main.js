import * as THREE from 'three';
import { state, resetState } from './state.js';
import { GRID, TOWER_DEFS, generateWaves } from './config.js';
import {
  scene, camera, renderer, controls,
  raycaster, placementPlane, ghost, rangeRing,
  worldToGrid, updateBackground
} from './engine.js';
import {
  buildTowerPanel, buildLevelDisplay, updateHUD, updateWaveBtn,
  showBanner, hideOverlay, showUpgradeTooltip, hideUpgradeTooltip
} from './ui.js';
import {
  placeTower, upgradeTower, startWave,
  updateEnemies, updateTowers, updateProjectiles,
  updateParticles, updateWaveSpawner, isValidPlacement
} from './logic.js';

const mouse = new THREE.Vector2();

function onMouseMove(e) {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  if (state.placingTower) {
    raycaster.setFromCamera(mouse, camera);
    const intersect = new THREE.Vector3();
    raycaster.ray.intersectPlane(placementPlane, intersect);

    if (intersect) {
      const [gx, gz] = worldToGrid(intersect.x, intersect.z);
      if (gx >= 0 && gx < GRID && gz >= 0 && gz < GRID) {
        const pos = new THREE.Vector3((gx - GRID/2)*2 + 1, 0, (gz - GRID/2)*2 + 1);
        ghost.position.copy(pos);
        ghost.visible = true;
        ghost.material.color.set(isValidPlacement(gx, gz, GRID) ? 0x44ff66 : 0xff4444);

        const def = TOWER_DEFS.find(d => d.id === state.placingTower);
        if (def) {
          rangeRing.position.copy(pos);
          rangeRing.position.y = 0.1;
          rangeRing.scale.setScalar(def.range);
          rangeRing.visible = true;
        }
      } else {
        ghost.visible = false;
        rangeRing.visible = false;
      }
    }
  }
}

function onClick(e) {
  if (state.gameState !== 'playing') return;

  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  if (state.placingTower) {
    raycaster.setFromCamera(mouse, camera);
    const intersect = new THREE.Vector3();
    raycaster.ray.intersectPlane(placementPlane, intersect);

    if (intersect) {
      const [gx, gz] = worldToGrid(intersect.x, intersect.z);
      const def = TOWER_DEFS.find(d => d.id === state.placingTower);
      if (def) placeTower(def, gx, gz, GRID);
    }
  } else {
    raycaster.setFromCamera(mouse, camera);
    const meshes = state.towers.map(t => t.mesh);
    const allChildren = [];
    meshes.forEach(m => m.traverse(c => { if (c.isMesh) allChildren.push(c); }));
    const hits = raycaster.intersectObjects(allChildren);

    if (hits.length > 0) {
      let hitObj = hits[0].object;
      while (hitObj.parent && !state.towers.find(t => t.mesh === hitObj)) {
        hitObj = hitObj.parent;
      }
      const tower = state.towers.find(t => t.mesh === hitObj);
      if (tower) {
        showUpgradeTooltip(tower, e.clientX, e.clientY, upgradeTower);
        return;
      }
    }
    hideUpgradeTooltip();
  }
}

document.getElementById('btn-pause').addEventListener('click', () => {
  state.paused = true;
  document.getElementById('btn-pause').classList.add('active');
  document.getElementById('btn-resume').classList.remove('active');
});

document.getElementById('btn-resume').addEventListener('click', () => {
  state.paused = false;
  document.getElementById('btn-resume').classList.add('active');
  document.getElementById('btn-pause').classList.remove('active');
});

document.getElementById('btn-restart').addEventListener('click', restartGame);
document.getElementById('overlay-btn').addEventListener('click', restartGame);

document.getElementById('btn-wave').addEventListener('click', () => {
  if (!state.waveActive && state.nextWaveReady && state.gameState === 'playing') {
    startWave();
  }
});

document.getElementById('btn-speed').addEventListener('click', () => {
  if (state.speed === 1) state.speed = 2;
  else if (state.speed === 2) state.speed = 3;
  else state.speed = 1;
  document.getElementById('btn-speed').textContent = `⏩ ${state.speed}x`;
});

window.addEventListener('mousemove', onMouseMove);
window.addEventListener('click', onClick);
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    state.placingTower = null;
    ghost.visible = false;
    rangeRing.visible = false;
    document.querySelectorAll('.tower-card').forEach(c => c.classList.remove('selected'));
    hideUpgradeTooltip();
  }
  if (e.key === ' ') {
    e.preventDefault();
    state.paused = !state.paused;
  }
  if (e.key === 'n' || e.key === 'N') {
    if (!state.waveActive && state.nextWaveReady && state.gameState === 'playing') {
      startWave();
    }
  }
  const idx = parseInt(e.key) - 1;
  if (idx >= 0 && idx < TOWER_DEFS.length) {
    const cards = document.querySelectorAll('.tower-card');
    cards[idx]?.click();
  }
});

function restartGame() {
  state.towers.forEach(t => scene.remove(t.mesh));
  state.enemies.forEach(e => { if (e.mesh.parent) scene.remove(e.mesh); });
  state.projectiles.forEach(p => scene.remove(p.mesh));
  state.particles.forEach(p => scene.remove(p.mesh));

  resetState();
  state.currentWaves = generateWaves(0);

  hideOverlay();
  ghost.visible = false;
  rangeRing.visible = false;
  document.querySelectorAll('.tower-card').forEach(c => c.classList.remove('selected'));
  buildLevelDisplay();
  updateHUD();
  updateWaveBtn();
  document.getElementById('btn-speed').textContent = '⏩ 1x';
  document.getElementById('btn-pause').classList.remove('active');
  document.getElementById('btn-resume').classList.remove('active');

  showBanner('Level 1', 2000);
  setTimeout(() => startWave(), 2500);
}

const clock = new THREE.Clock();
let elapsed = 0;

function animate() {
  requestAnimationFrame(animate);

  const rawDt = clock.getDelta();
  const dt = state.paused ? 0 : rawDt * state.speed;
  elapsed += rawDt;

  controls.update();
  updateBackground(elapsed, state.level);

  if (!state.paused && state.gameState === 'playing') {
    updateWaveSpawner(dt);
    updateEnemies(dt);
    updateTowers(dt);
    updateProjectiles(dt);
    updateParticles(dt);
  } else {
    updateParticles(rawDt);
  }

  if (ghost.visible) {
    ghost.rotation.y += rawDt * 2;
  }

  renderer.render(scene, camera);
}

function init() {
  buildTowerPanel((def, card) => {
    document.querySelectorAll('.tower-card').forEach(c => c.classList.remove('selected'));
    if (state.placingTower === def.id) {
      state.placingTower = null;
      ghost.visible = false;
      rangeRing.visible = false;
    } else {
      state.placingTower = def.id;
      card.classList.add('selected');
      ghost.material.color.set(def.color);
    }
  });

  buildLevelDisplay();
  state.currentWaves = generateWaves(0);
  updateHUD();
  updateWaveBtn();
  showBanner('Tower Defense', 2000);
  setTimeout(() => showBanner('Place towers, then send waves!', 2500), 2200);

  animate();
}

init();
