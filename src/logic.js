import * as THREE from 'three';
import { state } from './state.js';
import { ENEMY_DEFS, TOTAL_LEVELS, generateWaves } from './config.js';
import { scene, gridToWorld, buildPathCurve, isOnPath, camera } from './engine.js';
import { updateHUD, buildLevelDisplay, showBanner, showOverlay, updateWaveBtn } from './ui.js';

export function isOccupied(gx, gz) {
  return state.towers.some(t => t.gx === gx && t.gz === gz);
}

export function isValidPlacement(gx, gz, GRID) {
  return gx >= 0 && gx < GRID && gz >= 0 && gz < GRID && !isOnPath(gx, gz) && !isOccupied(gx, gz);
}

export function createTowerMesh(def, level) {
  const group = new THREE.Group();
  const scale = 1 + level * 0.15;

  const baseGeo = new THREE.CylinderGeometry(0.6*scale, 0.7*scale, 0.4*scale, 8);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x333344, roughness: 0.5, metalness: 0.6 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.2*scale;
  base.castShadow = true;
  group.add(base);

  const bodyGeo = new THREE.CylinderGeometry(0.4*scale, 0.5*scale, 1.2*scale, 8);
  const bodyMat = new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.3, metalness: 0.5, emissive: def.color, emissiveIntensity: 0.15 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.8*scale + 0.2*scale;
  body.castShadow = true;
  group.add(body);

  const topGeo = new THREE.SphereGeometry(0.3*scale, 8, 8);
  const topMat = new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.2, metalness: 0.7, emissive: def.color, emissiveIntensity: 0.3 });
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.y = 1.6*scale + 0.2*scale;
  group.add(top);

  for (let i = 0; i < level; i++) {
    const ringGeo = new THREE.TorusGeometry(0.5*scale, 0.04, 8, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.5 + i * 0.3;
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
  }

  return group;
}

export function placeTower(def, gx, gz, GRID) {
  if (state.gold < def.cost) return false;
  if (!isValidPlacement(gx, gz, GRID)) return false;

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

export function createEnemyMesh(def) {
  const group = new THREE.Group();

  if (def.flying) {
    const bodyGeo = new THREE.ConeGeometry(def.size, def.size * 2, 6);
    const bodyMat = new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.3, metalness: 0.4, emissive: def.color, emissiveIntensity: 0.2 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI;
    body.castShadow = true;
    group.add(body);

    for (let side of [-1, 1]) {
      const wingGeo = new THREE.PlaneGeometry(def.size * 2, def.size * 0.8);
      const wingMat = new THREE.MeshStandardMaterial({ color: def.color, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
      const wing = new THREE.Mesh(wingGeo, wingMat);
      wing.position.set(side * def.size * 0.8, 0, 0);
      wing.rotation.z = side * 0.3;
      group.add(wing);
    }
    group.position.y = 2;
  } else {
    const bodyGeo = new THREE.DodecahedronGeometry(def.size, 1);
    const bodyMat = new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.4, metalness: 0.3, emissive: def.color, emissiveIntensity: 0.15 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    group.add(body);

    if (def.id === 'tank') {
      const armorGeo = new THREE.BoxGeometry(def.size * 1.5, def.size * 0.8, def.size * 1.5);
      const armorMat = new THREE.MeshStandardMaterial({ color: 0x335533, roughness: 0.6, metalness: 0.5 });
      const armor = new THREE.Mesh(armorGeo, armorMat);
      armor.position.y = def.size * 0.5;
      group.add(armor);
    }

    if (def.id === 'boss') {
      const crownGeo = new THREE.ConeGeometry(def.size * 0.5, def.size * 0.6, 5);
      const crownMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2, metalness: 0.8, emissive: 0xffd700, emissiveIntensity: 0.3 });
      const crown = new THREE.Mesh(crownGeo, crownMat);
      crown.position.y = def.size + 0.3;
      group.add(crown);
    }

    if (def.heals) {
      const crossMat = new THREE.MeshBasicMaterial({ color: 0x44ff44 });
      const h = new THREE.Mesh(new THREE.BoxGeometry(def.size * 0.8, 0.08, 0.08), crossMat);
      h.position.y = def.size + 0.3;
      group.add(h);
      const v = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, def.size * 0.8), crossMat);
      v.position.y = def.size + 0.3;
      group.add(v);
    }
  }

  const hbBg = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 0.12),
    new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide })
  );
  hbBg.position.y = (def.flying ? 2 : def.size + 0.8);
  group.add(hbBg);

  const hbFill = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 0.12),
    new THREE.MeshBasicMaterial({ color: 0x44ff44, side: THREE.DoubleSide })
  );
  hbFill.position.y = (def.flying ? 2 : def.size + 0.8);
  hbFill.position.z = 0.01;
  group.add(hbFill);

  group.userData.hpBar = hbFill;
  group.userData.hpBg = hbBg;

  return group;
}

export function spawnEnemy(typeId) {
  const def = ENEMY_DEFS.find(e => e.id === typeId);
  if (!def) return;

  const hpMult = 1 + state.level * 0.4;
  const curve = buildPathCurve();
  const mesh = createEnemyMesh(def);
  const startPos = curve.getPoint(0);
  mesh.position.copy(startPos);
  scene.add(mesh);

  state.enemies.push({
    def: { ...def },
    hp: def.hp * hpMult,
    maxHp: def.hp * hpMult,
    speed: def.speed,
    t: 0,
    mesh,
    curve,
    slowTimer: 0,
    slowFactor: 1,
    dead: false,
  });
}

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

export function spawnParticles(pos, color, count, type='burst') {
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
    const mat = new THREE.MeshBasicMaterial({ color: colors[Math.floor(Math.random()*4)], transparent: true, opacity: 0.9 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    mesh.position.y += 0.5;
    scene.add(mesh);
    state.particles.push({
      mesh,
      vel: new THREE.Vector3((Math.random()-0.5)*2, Math.random()*4+2, (Math.random()-0.5)*2),
      life: 0.3+Math.random()*0.3, maxLife: 0.6, type: 'flame'
    });
  }
}

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
      if (state.level < TOTAL_LEVELS - 1) {
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
  const curve = buildPathCurve();

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

    const pathLen = curve.getLength();
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

    const pos = curve.getPoint(enemy.t);
    const flyY = enemy.def.flying ? 2 : 0;
    enemy.mesh.position.set(pos.x, pos.y + flyY, pos.z);

    const nextPos = curve.getPoint(Math.min(enemy.t + 0.01, 1));
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

export function updateWaveSpawner(dt) {
  if (!state.waveActive || state.waveQueue.length === 0) return;

  state.waveTimer += dt;
  while (state.waveQueue.length > 0 && state.waveTimer >= state.waveQueue[0].delay) {
    const e = state.waveQueue.shift();
    spawnEnemy(e.type);
    state.waveSpawned++;
  }
}

export function startWave() {
  if (state.waveActive) return;
  if (state.wave >= state.currentWaves.length) {
    if (state.level < TOTAL_LEVELS - 1) {
      state.level++;
      state.wave = 0;
      state.currentWaves = generateWaves(state.level);
      state.maxHp += 5;
      state.hp = Math.min(state.hp + 5, state.maxHp);
      state.gold += 50 + state.level * 20;
      showBanner(`Level ${state.level + 1}!`, 2500);
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
