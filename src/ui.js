import { state } from './core/state.js';
import { TOWER_DEFS } from './core/config.js';
import { levels } from './levels/index.js';

export function updateHUD() {
  document.getElementById('gold').textContent = state.gold;
  document.getElementById('score').textContent = state.score;
  document.getElementById('wave-num').textContent = `${state.wave + 1}/${state.currentWaves?.length || '?'}`;
  document.getElementById('hp-text').textContent = `${state.hp}/${state.maxHp}`;
  document.getElementById('health-bar').style.width = `${(state.hp/state.maxHp)*100}%`;

  if (state.hp <= state.maxHp * 0.3) {
    document.getElementById('health-bar').style.background = 'linear-gradient(90deg,#ff2222,#ff4444)';
  } else {
    document.getElementById('health-bar').style.background = 'linear-gradient(90deg,#ff4444,#ff6b6b)';
  }

  document.querySelectorAll('.tower-card').forEach(card => {
    const def = TOWER_DEFS.find(d => d.id === card.dataset.id);
    if (def) {
      card.style.opacity = state.gold >= def.cost ? '1' : '0.4';
    }
  });
}

export function buildTowerPanel(onTowerClick) {
  const panel = document.getElementById('tower-panel');
  panel.innerHTML = '';
  TOWER_DEFS.forEach(def => {
    const card = document.createElement('div');
    card.className = 'tower-card';
    card.dataset.id = def.id;
    card.innerHTML = `<div class="t-icon">${def.icon}</div><div class="t-name">${def.name}</div><div class="t-cost">${def.cost}💎</div>`;
    card.addEventListener('click', () => onTowerClick(def, card));
    panel.appendChild(card);
  });
}

export function buildLevelDisplay() {
  const container = document.getElementById('level-display');
  container.innerHTML = '';
  for (let i = 0; i < levels.length; i++) {
    const pip = document.createElement('div');
    pip.className = 'lvl-pip';
    if (i < state.level) pip.classList.add('done');
    if (i === state.level) pip.classList.add('current');
    container.appendChild(pip);
  }
}

export function showBanner(text, duration = 2000) {
  const el = document.getElementById('wave-banner');
  el.textContent = text;
  el.style.opacity = '1';
  setTimeout(() => { el.style.opacity = '0'; }, duration);
}

export function showOverlay(title, sub) {
  document.getElementById('overlay-title').textContent = title;
  document.getElementById('overlay-sub').textContent = sub;
  document.getElementById('overlay').classList.add('show');
}

export function hideOverlay() {
  document.getElementById('overlay').classList.remove('show');
}

export function updateWaveBtn() {
  const btn = document.getElementById('btn-wave');
  if (state.waveActive) {
    btn.textContent = `⚔️ Wave ${state.wave + 1} (${state.waveDone}/${state.waveTotal})`;
    btn.style.opacity = '0.5';
    btn.style.pointerEvents = 'none';
  } else if (state.nextWaveReady && state.gameState === 'playing') {
    const nextIdx = state.wave;
    const total = state.currentWaves?.length || 0;
    if (nextIdx >= total) {
      if (state.level < levels.length - 1) {
        btn.textContent = '👉 Next Level';
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
      } else {
        btn.textContent = '🏆 All Levels Done!';
        btn.style.opacity = '0.5';
        btn.style.pointerEvents = 'none';
      }
    } else {
      btn.textContent = `⚔️ Send Wave ${nextIdx + 1}/${total}`;
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
    }
  }
}

export let tooltipTower = null;

export function showUpgradeTooltip(tower, x, y, onUpgrade) {
  tooltipTower = tower;
  const tip = document.getElementById('upgrade-tip');
  const def = tower.def;

  let html = `<strong style="color:#${def.color.toString(16).padStart(6,'0')}">${def.name}</strong> (Lv ${tower.level})<br>`;
  html += `DMG: ${def.damage} | Range: ${def.range} | Rate: ${(1/def.rate).toFixed(1)}/s<br>`;

  if (tower.level < def.upgrades.length) {
    const upg = def.upgrades[tower.level];
    html += `<br><span style="color:#ffd700">⬆ ${upg.name} — ${upg.cost}💎</span><br>`;
    html += `<span style="font-size:10px;opacity:.6">Click to upgrade</span>`;
  } else {
    html += `<br><span style="color:#aaa">MAX LEVEL</span>`;
  }

  tip.innerHTML = html;
  tip.style.left = `${Math.min(x + 15, window.innerWidth - 220)}px`;
  tip.style.top = `${Math.min(y + 15, window.innerHeight - 120)}px`;
  tip.classList.add('show');

  tip.onclick = () => {
    if (tooltipTower && tooltipTower.level < tooltipTower.def.upgrades.length) {
      onUpgrade(tooltipTower);
      showUpgradeTooltip(tooltipTower, x, y, onUpgrade);
    }
  };
}

export function hideUpgradeTooltip() {
  document.getElementById('upgrade-tip').classList.remove('show');
  tooltipTower = null;
}
